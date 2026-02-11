import { BootstrapData } from '@stytch/core';
import StytchReactNativeModule from './native-module';

type CaptchaState = { configured: true; siteKey: string } | { configured: false; siteKey: undefined };

export class CaptchaProvider {
  private nativeModule: StytchReactNativeModule;
  private state: Promise<CaptchaState>;
  constructor(private bootstrapPromise: Promise<BootstrapData>) {
    this.nativeModule = new StytchReactNativeModule();
    this.state = bootstrapPromise.then(async (bootstrapData) => {
      if (!bootstrapData.captchaSettings.enabled) {
        return { configured: false };
      }
      await this.nativeModule.Misc.initializeRecaptcha(bootstrapData.captchaSettings.siteKey);
      return {
        configured: true,
        siteKey: bootstrapData.captchaSettings.siteKey,
      };
    });
  }

  isConfigured = async (): Promise<boolean> => {
    return this.state.then((state) => state.configured);
  };

  executeRecaptcha = async () => {
    const { configured } = await this.state;
    if (!configured) {
      return undefined;
    }
    return this.nativeModule.Misc.executeRecaptcha()
      .then((resp) => resp.captchaToken)
      .catch(() => undefined);
  };
}
