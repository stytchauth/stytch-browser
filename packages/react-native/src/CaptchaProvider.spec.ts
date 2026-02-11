import { CaptchaProvider } from './CaptchaProvider';

const initializeRecaptchaMock = jest.fn();
const executeRecaptchaMock = jest.fn();

jest.mock('./native-module', function () {
  return {
    __esModule: true,
    default: class {
      Misc = {
        initializeRecaptcha: initializeRecaptchaMock,
        executeRecaptcha: executeRecaptchaMock,
      };
    },
  };
});

describe('CaptchaProvider', () => {
  const bootstrapManager = (captchaEnabled: boolean) => {
    const bootstrapData = {
      projectName: 'Test Project',
      displayWatermark: false,
      cnameDomain: 'cname.domain.com',
      emailDomains: ['test.com'],
      captchaSettings: { enabled: captchaEnabled, siteKey: 'site-key' },
      pkceRequiredForEmailMagicLinks: true,
      pkceRequiredForPasswordResets: true,
      pkceRequiredForOAuth: true,
      pkceRequiredForSso: false,
      slugPattern: null,
      createOrganizationEnabled: false,
      passwordConfig: null,
      runDFPProtectedAuth: true,
      rbacPolicy: null,
      siweRequiredForCryptoWallets: false,
      vertical: null,
    };
    return {
      getAsync: () => Promise.resolve(bootstrapData),
      getSync: () => bootstrapData,
    };
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('If Captcha is enabled, client should be initialized', async () => {
    initializeRecaptchaMock.mockResolvedValueOnce({ success: true });
    const captchaProvider = new CaptchaProvider(bootstrapManager(true).getAsync());
    expect(await captchaProvider.isConfigured()).toBe(true);
    expect(initializeRecaptchaMock).toHaveBeenCalledWith('site-key');
  });

  it(`If Captcha is not enabled, client shouldn't be initialized`, async () => {
    const captchaProvider = new CaptchaProvider(bootstrapManager(false).getAsync());
    expect(await captchaProvider.isConfigured()).toBe(false);
    expect(initializeRecaptchaMock).toHaveBeenCalledTimes(0);
  });

  it('should return the use the correct public token and dfp backend url for submit', async () => {
    executeRecaptchaMock.mockResolvedValueOnce({ captchaToken: 'captcha-token-123' });
    const captchaProvider = new CaptchaProvider(bootstrapManager(true).getAsync());
    expect(await captchaProvider.executeRecaptcha()).toBe('captcha-token-123');
    expect(executeRecaptchaMock).toHaveBeenCalledTimes(1);
  });
});
