import {
  BootstrapData,
  DFPProtectedAuthState,
  IDFPProtectedAuthProvider,
  RetriableError,
  RetriableErrorType,
  SDKBaseRequestInfo,
} from '@stytch/core';

import StytchReactNativeModule from './native-module';

export class DFPProtectedAuthProvider implements IDFPProtectedAuthProvider {
  private nativeModule: StytchReactNativeModule;
  private state: Promise<DFPProtectedAuthState>;
  constructor(
    publicToken: string,
    dfpBackendURL: string,
    bootstrapPromise: Promise<BootstrapData>,
    executeRecaptcha: () => Promise<string | undefined> = () => Promise.resolve(undefined),
  ) {
    this.state = bootstrapPromise.then(async (bootstrapData) => {
      if (!bootstrapData.runDFPProtectedAuth) {
        return { publicToken, dfpBackendURL, enabled: false, loaded: false, executeRecaptcha };
      }
      return {
        publicToken,
        dfpBackendURL,
        enabled: true,
        mode: bootstrapData.dfpProtectedAuthMode || 'OBSERVATION',
        loaded: true,
        executeRecaptcha,
      };
    });
    this.nativeModule = new StytchReactNativeModule();
    this.nativeModule.Misc.configureDfp(publicToken, dfpBackendURL);
  }

  isEnabled = async (): Promise<boolean> => {
    return this.state.then((state) => state.enabled);
  };

  getTelemetryID = async (): Promise<string | undefined> => {
    const { enabled } = await this.state;
    if (!enabled) {
      return undefined;
    }
    return this.nativeModule.Misc.getTelemetryId()
      .then((resp) => resp.telemetryId)
      .catch(() => undefined);
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
