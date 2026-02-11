import { StytchAPIError } from '@stytch/core/public';

import { createTestFixtures } from '../../testUtils';
import { B2BOneTapProvider } from './B2BOneTapProvider';

jest.mock('@stytch/core', () => ({
  ...jest.requireActual('@stytch/core'),
  loadESModule: jest.fn().mockResolvedValue({ initialize: jest.fn() }),
}));

describe('B2BOneTapProvider', () => {
  const { networkClient, pkceManager } = createTestFixtures();
  const MockDynamicConfig = Promise.resolve({
    pkceRequiredForOAuth: true,
  });

  describe('Loading One Tap', () => {
    it('When no googleClientId can be loaded from the backend, does not load the client', async () => {
      networkClient.fetchSDK.mockResolvedValueOnce({
        google_client_id: '',
      });
      const provider = new B2BOneTapProvider(networkClient, pkceManager, MockDynamicConfig);
      const result = await provider.createOneTapClient();
      expect(result).toEqual({
        success: false,
        reason: 'oauth_config_not_found',
      });
    });
    it('When the backend throws an error, does not load the client', async () => {
      networkClient.fetchSDK.mockRejectedValueOnce(
        new StytchAPIError({
          error_message:
            'The Stytch Default OAuth Provider is not compatible with this feature, which requires additional configuration for your project. Please configure your own OAuth provider in the dashboard at https://stytch.com/dashboard/oauth.',
          error_type: 'default_provider_not_allowed',
          error_url: '',
          status_code: 404,
        }),
      );
      const provider = new B2BOneTapProvider(networkClient, pkceManager, MockDynamicConfig);
      const result = await provider.createOneTapClient();
      expect(result).toEqual({
        success: false,
        reason: 'default_provider_not_allowed',
      });
    });
    it('When a googleClientId can be loaded from the backend, loads and initializes the client', async () => {
      networkClient.fetchSDK.mockResolvedValueOnce({
        google_client_id: 'client-id-123',
      });
      const provider = new B2BOneTapProvider(networkClient, pkceManager, MockDynamicConfig);
      const result = await provider.createOneTapClient();
      expect(result).toEqual({
        success: true,
        client: expect.anything(),
      });
    });
  });
});
