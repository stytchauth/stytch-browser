import { BootstrapDataManager } from './BootstrapDataManager';
import { ConsumerSubscriptionDataLayer, SubscriptionDataLayer } from './SubscriptionService';
import { createTestFixtures } from './testUtils';

const MOCK_PUBLIC_TOKEN = 'public-token-test-123';
const MOCK_RAW_BOOTSTRAP_DATA = {
  project_name: 'My Cool Project',
  disable_sdk_watermark: false,
  email_domains: ['example.com'],
  cname_domain: null,
  captcha_settings: { enabled: false },
  pkce_required_for_email_magic_links: true,
  pkce_required_for_oauth: true,
  pkce_required_for_password_resets: true,
  password_config: null,
  dfp_protected_auth_enabled: false,
  dfp_protected_auth_mode: undefined,
  siwe_required_for_crypto_wallets: true,
  vertical: 'B2B',
};

const MOCK_PARSED_BOOTSTRAP_DATA = {
  projectName: 'My Cool Project',
  cnameDomain: null,
  displayWatermark: true,
  emailDomains: ['example.com'],
  captchaSettings: {
    enabled: false,
  },
  pkceRequiredForEmailMagicLinks: true,
  pkceRequiredForOAuth: true,
  pkceRequiredForPasswordResets: true,
  passwordConfig: null,
  runDFPProtectedAuth: false,
  dfpProtectedAuthMode: undefined,
  rbacPolicy: null,
  siweRequiredForCryptoWallets: true,
  vertical: 'B2B',
};

describe('BootstrapDataManager', () => {
  const dataLayer: ConsumerSubscriptionDataLayer = new SubscriptionDataLayer(MOCK_PUBLIC_TOKEN);
  const { networkClient } = createTestFixtures();
  beforeEach(() => {
    localStorage.clear();
    networkClient.fetchSDK.mockResolvedValue(MOCK_RAW_BOOTSTRAP_DATA);
  });

  it('Has a default value for bootstrap data upon first initialization', async () => {
    const bootstrapDataManager = new BootstrapDataManager(MOCK_PUBLIC_TOKEN, networkClient, dataLayer);
    expect(bootstrapDataManager.getSync()).toEqual({
      projectName: null,
      captchaSettings: {
        enabled: false,
      },
      createOrganizationEnabled: false,
      cnameDomain: null,
      displayWatermark: false,
      emailDomains: ['stytch.com'],
      pkceRequiredForEmailMagicLinks: false,
      pkceRequiredForOAuth: false,
      pkceRequiredForPasswordResets: false,
      pkceRequiredForSso: false,
      slugPattern: null,
      passwordConfig: null,
      runDFPProtectedAuth: false,
      dfpProtectedAuthMode: undefined,
      rbacPolicy: null,
      siweRequiredForCryptoWallets: false,
      vertical: null,
    });
  });

  it('Loads bootstrap data in the background', async () => {
    const bootstrapDataManager = new BootstrapDataManager(MOCK_PUBLIC_TOKEN, networkClient, dataLayer);
    await expect(bootstrapDataManager.getAsync()).resolves.toEqual(MOCK_PARSED_BOOTSTRAP_DATA);

    expect(networkClient.fetchSDK).toHaveBeenCalledWith({
      url: `/projects/bootstrap/${MOCK_PUBLIC_TOKEN}`,
      method: 'GET',
    });
  });

  it('Preserves bootstrap data in localstorage for future client instances', async () => {
    const bootstrapDataManager = new BootstrapDataManager(MOCK_PUBLIC_TOKEN, networkClient, dataLayer);
    await expect(bootstrapDataManager.getAsync()).resolves.toEqual(MOCK_PARSED_BOOTSTRAP_DATA);

    const bootstrapDataManager2 = new BootstrapDataManager(MOCK_PUBLIC_TOKEN, networkClient, dataLayer);
    expect(bootstrapDataManager2.getSync()).toEqual(MOCK_PARSED_BOOTSTRAP_DATA);
  });
});
