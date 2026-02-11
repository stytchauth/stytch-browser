import { MOCK_CONNECTED_APP_PUBLIC } from '@stytch/internal-mocks';

import {
  B2BOAuthAuthorizeStartOptions,
  B2BOAuthAuthorizeStartResponse,
  B2BOAuthAuthorizeSubmitOptions,
  B2BOAuthAuthorizeSubmitResponse,
} from '../../public/b2b/idp';
import { createB2BTestFixtures } from '../../testing';
import { HeadlessB2BIDPClient } from './HeadlessB2BIDPClient';

describe('HeadlessB2BIDPClient', () => {
  const { networkClient } = createB2BTestFixtures();
  let client: HeadlessB2BIDPClient;

  beforeEach(() => {
    jest.resetAllMocks();
    client = new HeadlessB2BIDPClient(networkClient);
  });

  describe('oauthAuthorizeStart', () => {
    it('calls the correct endpoint and passes options through', async () => {
      const options: B2BOAuthAuthorizeStartOptions = {
        client_id: 'client-123',
        redirect_uri: 'https://example.com/cb',
        response_type: 'code',
        scopes: ['openid', 'email'],
        prompt: 'consent',
      };

      const mockResponse: B2BOAuthAuthorizeStartResponse = {
        request_id: 'req-1',
        status_code: 200,
        consent_required: true,
        client: MOCK_CONNECTED_APP_PUBLIC,
        scope_results: [
          { scope: 'openid', is_grantable: true, description: 'OpenID' },
          { scope: 'email', is_grantable: false, description: 'Email access' },
        ],
      };

      networkClient.fetchSDK.mockResolvedValueOnce(mockResponse);

      const resp = await client.oauthAuthorizeStart(options);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/idp/b2b/oauth/authorize/start',
        method: 'POST',
        body: options,
      });
      expect(resp).toEqual(mockResponse);
    });
  });

  describe('oauthAuthorizeSubmit', () => {
    it('calls the correct endpoint and passes options through', async () => {
      const options: B2BOAuthAuthorizeSubmitOptions = {
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

      const mockResponse: B2BOAuthAuthorizeSubmitResponse = {
        request_id: 'req-2',
        status_code: 200,
        redirect_uri: 'https://example.com/cb?code=abc',
        authorization_code: 'abc',
      };

      networkClient.fetchSDK.mockResolvedValueOnce(mockResponse);

      const resp = await client.oauthAuthorizeSubmit(options);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/idp/b2b/oauth/authorize/submit',
        method: 'POST',
        body: options,
      });
      expect(resp).toEqual(mockResponse);
    });
  });
});
