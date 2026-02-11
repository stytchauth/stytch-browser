import { createTestFixtures } from '../testing';
import { HeadlessIDPClient } from './HeadlessIDPClient';
import { MOCK_CONNECTED_APP_PUBLIC } from '@stytch/internal-mocks';
import {
  OAuthAuthorizeStartOptions,
  OAuthAuthorizeStartResponse,
  OAuthAuthorizeSubmitOptions,
  OAuthAuthorizeSubmitResponse,
} from '../public/idp';

describe('HeadlessIDPClient', () => {
  const { networkClient } = createTestFixtures();
  let client: HeadlessIDPClient;

  beforeEach(() => {
    jest.resetAllMocks();
    client = new HeadlessIDPClient(networkClient);
  });

  describe('oauthAuthorizeStart', () => {
    it('calls the correct endpoint and passes options through', async () => {
      const options: OAuthAuthorizeStartOptions = {
        client_id: 'client-123',
        redirect_uri: 'https://example.com/cb',
        response_type: 'code',
        scopes: ['openid', 'email'],
        prompt: 'consent',
      };

      const mockResponse: OAuthAuthorizeStartResponse = {
        request_id: 'req-1',
        status_code: 200,
        user_id: 'user-1',
        user: {
          created_at: '2020-01-01T00:00:00Z',
          crypto_wallets: [],
          emails: [],
          name: { first_name: '', last_name: '', middle_name: '' },
          trusted_metadata: {},
          untrusted_metadata: {},
          phone_numbers: [],
          providers: [],
          password: null,
          status: 'active',
          totps: [],
          user_id: 'user-1',
          webauthn_registrations: [],
          biometric_registrations: [],
          roles: [],
        },
        client: MOCK_CONNECTED_APP_PUBLIC,
        consent_required: true,
        scope_results: [
          { scope: 'openid', is_grantable: true, description: 'OpenID' },
          { scope: 'email', is_grantable: false, description: 'Email access' },
        ],
      };

      networkClient.fetchSDK.mockResolvedValueOnce(mockResponse);

      const resp = await client.oauthAuthorizeStart(options);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/idp/oauth/authorize/start',
        method: 'POST',
        body: options,
      });
      expect(resp).toEqual(mockResponse);
    });
  });

  describe('oauthAuthorizeSubmit', () => {
    it('calls the correct endpoint and passes options through', async () => {
      const options: OAuthAuthorizeSubmitOptions = {
        client_id: 'client-123',
        redirect_uri: 'https://example.com/cb',
        response_type: 'code',
        scopes: ['openid', 'email'],
        state: 'state-xyz',
        nonce: 'nonce-xyz',
        code_challenge: 'challenge-xyz',
        consent_granted: true,
        prompt: 'consent',
      };

      const mockResponse: OAuthAuthorizeSubmitResponse = {
        request_id: 'req-2',
        status_code: 200,
        redirect_uri: 'https://example.com/cb?code=abc',
        authorization_code: 'abc',
      };

      networkClient.fetchSDK.mockResolvedValueOnce(mockResponse);

      const resp = await client.oauthAuthorizeSubmit(options);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/idp/oauth/authorize/submit',
        method: 'POST',
        body: options,
      });
      expect(resp).toEqual(mockResponse);
    });
  });
});
