import { OneTapProvider } from './OneTapProvider';
import * as core from '@stytch/core';
import { MOCK_PUBLIC_TOKEN } from '@stytch/internal-mocks';
import { StytchAPIError } from '@stytch/core/public';

// TODO move to a shared __mocks__ folder when something else wants to use it
const MockClientsideServicesProvider: jest.Mocked<core.RPCManifest> = {
  oneTapStart: jest.fn(),
  oneTapSubmit: jest.fn(),
  parsedPhoneNumber: jest.fn(),
};

describe('OneTapProvider', () => {
  const mockInit = jest.fn();

  jest.spyOn(core, 'loadESModule').mockResolvedValue({ initialize: mockInit });

  describe('Loading One Tap', () => {
    it('When no googleClientId can be loaded from the backend, does not load the client', async () => {
      MockClientsideServicesProvider.oneTapStart.mockResolvedValueOnce({
        googleClientId: '',
      } as core.OneTapStartResponse);
      const provider = new OneTapProvider(MOCK_PUBLIC_TOKEN, MockClientsideServicesProvider);
      const result = await provider.createOneTapClient();
      expect(result).toEqual({
        success: false,
        reason: 'oauth_config_not_found',
      });
    });

    it('When the backend throws an error, does not load the client', async () => {
      MockClientsideServicesProvider.oneTapStart.mockRejectedValueOnce(
        new StytchAPIError({
          error_message: 'No Login redirect URLs are set for this project',
          error_type: 'no_login_redirect_urls_set',
          error_url: '',
          status_code: 404,
        }),
      );
      const provider = new OneTapProvider(MOCK_PUBLIC_TOKEN, MockClientsideServicesProvider);
      const result = await provider.createOneTapClient();
      expect(result).toEqual({
        success: false,
        reason: 'no_login_redirect_urls_set',
      });
    });

    it('When a googleClientId can be loaded from the backend, loads and initializes the client', async () => {
      MockClientsideServicesProvider.oneTapStart.mockResolvedValueOnce({
        googleClientId: 'client-id-123',
      } as core.OneTapStartResponse);
      const provider = new OneTapProvider(MOCK_PUBLIC_TOKEN, MockClientsideServicesProvider);
      const result = await provider.createOneTapClient();
      expect(result).toEqual({
        success: true,
        client: expect.anything(),
      });
    });
  });

  describe(OneTapProvider.willGoogleOneTapShowEmbedded, () => {
    it('Returns the expected result for a variety of useragents', () => {
      // IPhone 8
      expect(
        OneTapProvider.willGoogleOneTapShowEmbedded(
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
        ),
      ).toBe(true);

      // IPad Pro
      expect(
        OneTapProvider.willGoogleOneTapShowEmbedded(
          'Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1',
        ),
      ).toBe(false);

      // Pixel 2
      expect(
        OneTapProvider.willGoogleOneTapShowEmbedded(
          'Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Mobile Safari/537.36',
        ),
      ).toBe(true);

      // Nest Hub
      expect(
        OneTapProvider.willGoogleOneTapShowEmbedded(
          'Mozilla/5.0 (Linux; Android) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.109 Safari/537.36 CrKey/1.54.248666',
        ),
      ).toBe(false);

      // Chrome Desktop
      expect(
        OneTapProvider.willGoogleOneTapShowEmbedded(
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        ),
      ).toBe(false);
    });
  });
});
