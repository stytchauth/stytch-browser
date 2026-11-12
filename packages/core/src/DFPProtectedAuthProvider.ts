import { RetriableError, RetriableErrorType, SDKBaseRequestInfo } from './NetworkClient';
import { BootstrapData } from './types';
import { loadESModule } from './utils';

declare global {
  // The telemetry.js script will set a global function called GetTelemetryID on the window
  // object. This interface is allows us to call that function while pleasing the TypeScript
  // compiler.
  interface Window {
    GetTelemetryID: (publicToken: string, submitURL: string) => Promise<string>;
  }
}

type GetTelemetryID = Window['GetTelemetryID'];

// Both the DFP and FRE scripts are named telemetry.js and both set window.GetTelemetryID. The loader returns the
// function that is on the window right after that script loads, so the scripts must be loaded one at a time
// and each function kept, otherwise the second script would overwrite the first.
const loadTelemetryJS = (domain: string): Promise<GetTelemetryID> =>
  loadESModule(`${domain}/telemetry.js`, () => window.GetTelemetryID);

export type DFPProtectedAuthMode = 'OBSERVATION' | 'DECISIONING';

export type DFPProtectedAuthState = {
  publicToken: string;
  dfpBackendURL: string;
  mode?: DFPProtectedAuthMode;
  enabled: boolean;
  loaded: boolean;
  executeRecaptcha: () => Promise<string | undefined>;
  getDFPTelemetryID?: GetTelemetryID;
  getFRETelemetryID?: GetTelemetryID;
};

export class DFPProtectedAuthProvider {
  private state: Promise<DFPProtectedAuthState>;
  constructor(
    publicToken: string,
    dfpBackendURL: string,
    dfpCdnDomain: string,
    private bootstrapPromise: Promise<BootstrapData>,
    executeRecaptcha: () => Promise<string | undefined> = () => Promise.resolve(undefined),
    freDomainURL?: string,
  ) {
    this.state = bootstrapPromise.then(async (bootstrapData) => {
      if (!bootstrapData.runDFPProtectedAuth) {
        return { publicToken, dfpBackendURL, enabled: false, loaded: false, executeRecaptcha };
      }
      const getDFPTelemetryID = await loadTelemetryJS(dfpCdnDomain);
      // Must wait for the DFP script to finish loading before loading FRE's, see loadTelemetryJS
      const getFRETelemetryID =
        bootstrapData.runFREProtectedAuth && freDomainURL ? await loadTelemetryJS(freDomainURL) : undefined;
      return {
        publicToken,
        dfpBackendURL,
        enabled: true,
        mode: bootstrapData.dfpProtectedAuthMode || 'OBSERVATION',
        loaded: true,
        executeRecaptcha,
        getDFPTelemetryID,
        getFRETelemetryID,
      };
    });
  }

  isEnabled = async (): Promise<boolean> => {
    return this.state.then((state) => state.enabled);
  };

  getTelemetryID = async (): Promise<string | undefined> => {
    const { publicToken, enabled, dfpBackendURL, getDFPTelemetryID } = await this.state;
    if (!enabled || !getDFPTelemetryID) {
      return undefined;
    }
    return await getDFPTelemetryID(publicToken, `${dfpBackendURL}/submit`);
  };

  getDFPTelemetryIDAndCaptcha = async (): Promise<{ dfp_telemetry_id?: string; captcha_token?: string }> => {
    const { enabled, executeRecaptcha, mode } = await this.state;

    let dfp_telemetry_id: string | undefined = undefined;
    let captcha_token: string | undefined = undefined;
    if (!enabled) {
      captcha_token = await executeRecaptcha();
    }
    if (mode === 'DECISIONING') {
      dfp_telemetry_id = await this.getTelemetryID();
    } else if (mode === 'OBSERVATION') {
      dfp_telemetry_id = await this.getTelemetryID();
      captcha_token = await executeRecaptcha();
    }
    return { dfp_telemetry_id, captcha_token };
  };

  retryWithCaptchaAndDFP = async (e: RetriableError, req: SDKBaseRequestInfo): Promise<SDKBaseRequestInfo> => {
    const { enabled, executeRecaptcha } = await this.state;
    if (e.type === RetriableErrorType.RequiredCaptcha && enabled) {
      if (req.body) {
        req.body.dfp_telemetry_id = await this.getTelemetryID();
        req.body.captcha_token = await executeRecaptcha();
      }
      return req;
    }
    throw new Error('Unable to query captcha and/or dfp telemetry ID');
  };
}

export const DisabledDFPProtectedAuthProvider = () => ({
  isEnabled: async () => false,
  getTelemetryID: async () => undefined,
  getDFPTelemetryIDAndCaptcha: async () => ({
    dfp_telemetry_id: undefined,
    captcha_token: undefined,
  }),
  retryWithCaptchaAndDFP: async () => {
    throw new Error('DFP protected auth is disabled');
  },
});

export interface IDFPProtectedAuthProvider {
  isEnabled(): Promise<boolean>;
  getTelemetryID(): Promise<string | undefined>;
  retryWithCaptchaAndDFP(e: RetriableError, req: SDKBaseRequestInfo): Promise<SDKBaseRequestInfo>;
  getDFPTelemetryIDAndCaptcha(): Promise<{ dfp_telemetry_id?: string; captcha_token?: string }>;
}
