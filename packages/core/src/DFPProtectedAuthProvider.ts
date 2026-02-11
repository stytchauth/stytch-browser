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

const loadTelemetryJS = (domain: string) => loadESModule(`${domain}/telemetry.js`, () => window.GetTelemetryID);

export type DFPProtectedAuthMode = 'OBSERVATION' | 'DECISIONING';

export type DFPProtectedAuthState = {
  publicToken: string;
  dfpBackendURL: string;
  mode?: DFPProtectedAuthMode;
  enabled: boolean;
  loaded: boolean;
  executeRecaptcha: () => Promise<string | undefined>;
};

export class DFPProtectedAuthProvider {
  private state: Promise<DFPProtectedAuthState>;
  constructor(
    publicToken: string,
    dfpBackendURL: string,
    dfpCdnDomain: string,
    private bootstrapPromise: Promise<BootstrapData>,
    executeRecaptcha: () => Promise<string | undefined> = () => Promise.resolve(undefined),
  ) {
    this.state = bootstrapPromise.then(async (bootstrapData) => {
      if (!bootstrapData.runDFPProtectedAuth) {
        return { publicToken, dfpBackendURL, enabled: false, loaded: false, executeRecaptcha };
      }
      await loadTelemetryJS(dfpCdnDomain);
      return {
        publicToken,
        dfpBackendURL,
        enabled: true,
        mode: bootstrapData.dfpProtectedAuthMode || 'OBSERVATION',
        loaded: true,
        executeRecaptcha,
      };
    });
  }

  isEnabled = async (): Promise<boolean> => {
    return this.state.then((state) => state.enabled);
  };

  getTelemetryID = async (): Promise<string | undefined> => {
    const { publicToken, enabled, dfpBackendURL } = await this.state;
    if (!enabled) {
      return undefined;
    }
    return await window.GetTelemetryID(publicToken, `${dfpBackendURL}/submit`);
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
