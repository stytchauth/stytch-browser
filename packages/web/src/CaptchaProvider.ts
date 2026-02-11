import { BootstrapData, loadESModule } from '@stytch/core';

const loadRecaptchaClient = (siteKey: string) =>
  loadESModule(`https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`, () => window.grecaptcha.enterprise);

type CaptchaState =
  | { configured: true; captchaClient: ReCaptchaV2.ReCaptcha; siteKey: string }
  | { configured: false; captchaClient: undefined; siteKey: undefined };

export class CaptchaProvider {
  private state: Promise<CaptchaState>;
  constructor(private bootstrapPromise: Promise<BootstrapData>) {
    this.state = bootstrapPromise.then(async (bootstrapData) => {
      if (!bootstrapData.captchaSettings.enabled) {
        return { configured: false };
      }
      return {
        configured: true,
        captchaClient: await loadRecaptchaClient(bootstrapData.captchaSettings.siteKey),
        siteKey: bootstrapData.captchaSettings.siteKey,
      };
    });
  }

  executeRecaptcha = async () => {
    const { captchaClient, configured, siteKey } = await this.state;
    if (!configured) {
      return undefined;
    }
    await new Promise<void>((resolve) => captchaClient.ready(resolve));
    return captchaClient.execute(siteKey, {
      action: 'LOGIN',
    });
  };
}
