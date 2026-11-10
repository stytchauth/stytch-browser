import { BootstrapData } from '@stytch/core';

import { BootstrapDataManager, DEFAULT_BOOTSTRAP, RawBootstrapData } from './BootstrapDataManager';
import { createTestFixtures } from './testUtils';

const successfulResponse: RawBootstrapData = {
  request_id: 'request-id',
  status_code: 200,
  project_name: 'My Cool Project',
  disable_sdk_watermark: true,
  cname_domain: 'cname.domain.com',
  email_domains: ['test.com'],
  captcha_settings: { enabled: true, siteKey: 'site-key' },
  pkce_required_for_email_magic_links: true,
  pkce_required_for_password_resets: true,
  pkce_required_for_oauth: true,
  pkce_required_for_sso: true,
  slug_pattern: null,
  create_organization_enabled: true,
  password_config: null,
  dfp_protected_auth_enabled: false,
  siwe_required_for_crypto_wallets: true,
  vertical: 'B2B',
};

const successfulResponseMappedToBootstrap: BootstrapData = {
  projectName: 'My Cool Project',
  displayWatermark: false,
  cnameDomain: 'cname.domain.com',
  emailDomains: ['test.com'],
  captchaSettings: { enabled: true, siteKey: 'site-key' },
  pkceRequiredForEmailMagicLinks: true,
  pkceRequiredForPasswordResets: true,
  pkceRequiredForOAuth: true,
  pkceRequiredForSso: true,
  slugPattern: null,
  createOrganizationEnabled: true,
  passwordConfig: null,
  runDFPProtectedAuth: false,
  dfpProtectedAuthMode: undefined,
  rbacPolicy: null,
  siweRequiredForCryptoWallets: true,
  vertical: 'B2B',
};

describe('BootstrapDataManager', () => {
  let manager: BootstrapDataManager;
  const { networkClient } = createTestFixtures();

  describe('constructor', () => {
    describe('when fetchSDK fails', () => {
      it('fallsback to the default config', () => {
        const fetchSdkSpy = jest.spyOn(networkClient, 'fetchSDK').mockRejectedValueOnce('Test Failure');
        manager = new BootstrapDataManager('public-token', networkClient);
        expect(fetchSdkSpy).toHaveBeenCalledWith({
          url: `/projects/bootstrap/public-token`,
          method: 'GET',
        });
        expect(manager.getSync()).toStrictEqual(DEFAULT_BOOTSTRAP());
        fetchSdkSpy.mockRestore();
      });
    });

    describe('when fetchSDK succeeds', () => {
      it('provides the response as the expected config', async () => {
        const fetchSdkSpy = jest.spyOn(networkClient, 'fetchSDK').mockResolvedValueOnce(successfulResponse);
        manager = new BootstrapDataManager('public-token', networkClient);
        expect(await manager.getAsync()).toStrictEqual(successfulResponseMappedToBootstrap);
        fetchSdkSpy.mockRestore();
      });
    });
  });
});
