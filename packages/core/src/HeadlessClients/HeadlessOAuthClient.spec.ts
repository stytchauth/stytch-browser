import { HeadlessOAuthClient } from '.';
import { LIVE_API_URL, TEST_API_URL } from '..';
import { OAuthGetURLOptions } from '../public';
import { StytchProjectConfigurationInput } from '../public/typeConfig';
import {
  MOCK_AUTHENTICATE_PAYLOAD,
  MOCK_CHALLENGE,
  MOCK_KEYPAIR,
  MOCK_PUBLIC_TOKEN,
  MOCK_VERIFIER,
} from '@stytch/internal-mocks';
import { createTestFixtures } from '../testing';

describe('HeadlessOAuthClient', () => {
  const { networkClient, subscriptionService, pkceManager } = createTestFixtures();
  let client: HeadlessOAuthClient<StytchProjectConfigurationInput>;

  const MockDynamicConfig = Promise.resolve({
    cnameDomain: null,
    pkceRequiredForOAuth: true,
  });

  const MockTestConfig = {
    publicToken: MOCK_PUBLIC_TOKEN,
    liveAPIURL: LIVE_API_URL,
    testAPIURL: TEST_API_URL,
  };

  const MockLiveConfig = {
    publicToken: 'public-token-live-123',
    liveAPIURL: LIVE_API_URL,
    testAPIURL: TEST_API_URL,
  };

  beforeAll(() => {
    client = new HeadlessOAuthClient(
      networkClient,
      subscriptionService,
      pkceManager,
      MockDynamicConfig,
      MockTestConfig,
    );
  });

  describe('oauth.attach', () => {
    it('Gets an oauth_attach_token for a provider', async () => {
      await client.attach('my-provider-name');
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/oauth/attach',
        method: 'POST',
        body: { provider: 'my-provider-name' },
      });
    });
  });

  describe('oauth.authenticate', () => {
    beforeEach(() => {
      networkClient.fetchSDK.mockResolvedValue(MOCK_AUTHENTICATE_PAYLOAD);
    });

    it('When no PKCE transaction is in progress, no code verifier is submitted', async () => {
      await client.authenticate('token', {
        session_duration_minutes: 10,
      });
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/oauth/authenticate',
        method: 'POST',
        body: { code_verifier: undefined, session_duration_minutes: 10, token: 'token' },
      });
    });

    it('When a PKCE transaction is in progress, a code_verifier value is pulled automatically from the manager and consumed', async () => {
      await pkceManager.startPKCETransaction();
      await client.authenticate('token', {
        session_duration_minutes: 10,
      });
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/oauth/authenticate',
        method: 'POST',
        body: { code_verifier: MOCK_VERIFIER, session_duration_minutes: 10, token: 'token' },
      });
      expect(pkceManager.getPKPair()).toBeUndefined();
    });

    it('When the network call to Stytch fails, the transaction is not consumed and can be used again', async () => {
      networkClient.fetchSDK.mockRejectedValueOnce(new Error('The server is gone!'));
      await pkceManager.startPKCETransaction();
      await expect(
        client.authenticate('token', {
          session_duration_minutes: 10,
        }),
      ).rejects.toThrow();
      expect(pkceManager.getPKPair()).toEqual(MOCK_KEYPAIR);

      // Retry, token is consumed
      await client.authenticate('token', {
        session_duration_minutes: 10,
      });
      expect(pkceManager.getPKPair()).toBeUndefined();
    });
  });

  describe('oauth.$provider.start', () => {
    const setHrefSpy = jest.fn();

    const expectLocation = (loc: string) => expect(setHrefSpy).toHaveBeenCalledWith(loc);

    beforeAll(() => {
      Object.defineProperty(window, 'location', {
        value: {},
      });
      Object.defineProperty(window.location, 'href', {
        set: setHrefSpy,
      });
    });

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('Uses the expected base URL for a test public token', async () => {
      await client.google.start();
      expectLocation(
        'https://test.stytch.com/v1/public/oauth/google/start?' +
          'public_token=public-token-test-123' +
          `&code_challenge=${MOCK_CHALLENGE}`,
      );
    });

    it('Encodes signup_redirect_url when passed in', async () => {
      await client.google.start({
        signup_redirect_url: 'https://example.com/foo',
      });
      expectLocation(
        'https://test.stytch.com/v1/public/oauth/google/start?' +
          'public_token=public-token-test-123' +
          `&code_challenge=${MOCK_CHALLENGE}` +
          '&signup_redirect_url=https%3A%2F%2Fexample.com%2Ffoo',
      );
    });
    it('Encodes login_redirect_url when passed in', async () => {
      await client.google.start({
        login_redirect_url: 'https://example.com/foo',
      });
      expectLocation(
        'https://test.stytch.com/v1/public/oauth/google/start?' +
          'public_token=public-token-test-123' +
          `&code_challenge=${MOCK_CHALLENGE}` +
          '&login_redirect_url=https%3A%2F%2Fexample.com%2Ffoo',
      );
    });
    it('Encodes custom scopes when passed in', async () => {
      await client.google.start({ custom_scopes: ['scope_a', 'scope_b'] });
      expectLocation(
        'https://test.stytch.com/v1/public/oauth/google/start?' +
          'public_token=public-token-test-123' +
          `&code_challenge=${MOCK_CHALLENGE}` +
          '&custom_scopes=scope_a+scope_b',
      );
    });
    it('Adds provider parameters when passed in', async () => {
      await client.google.start({ provider_params: { prompt: 'select_account', login_hint: 'example@stytch.com' } });
      expectLocation(
        'https://test.stytch.com/v1/public/oauth/google/start?' +
          'public_token=public-token-test-123' +
          `&code_challenge=${MOCK_CHALLENGE}` +
          '&provider_prompt=select_account&provider_login_hint=example%40stytch.com',
      );
    });
    it('All options passed in passed in', async () => {
      await client.google.start({
        login_redirect_url: 'https://example.com/foo?callback_params=123',
        signup_redirect_url: 'https://example.com/foo?callback_params=456',
        custom_scopes: ['scope_a', 'scope_b'],
        oauth_attach_token: 'example-attach-token',
      });
      expectLocation(
        'https://test.stytch.com/v1/public/oauth/google/start?' +
          'public_token=public-token-test-123' +
          `&code_challenge=${MOCK_CHALLENGE}` +
          '&custom_scopes=scope_a+scope_b' +
          '&login_redirect_url=https%3A%2F%2Fexample.com%2Ffoo%3Fcallback_params%3D123' +
          '&signup_redirect_url=https%3A%2F%2Fexample.com%2Ffoo%3Fcallback_params%3D456' +
          '&oauth_attach_token=example-attach-token',
      );
    });
    it('Uses the expected base URL for a live public token', async () => {
      const liveClient = new HeadlessOAuthClient(
        networkClient,
        subscriptionService,
        pkceManager,
        MockDynamicConfig,
        MockLiveConfig,
      );
      await liveClient.google.start();
      expectLocation(
        'https://api.stytch.com/v1/public/oauth/google/start?' +
          'public_token=public-token-live-123' +
          `&code_challenge=${MOCK_CHALLENGE}`,
      );
    });
    it('Substitutes the hostname with the configured cname domain when provided', async () => {
      const MockDynamicConfigWithCName = Promise.resolve({
        cnameDomain: 'api.stytch.shophellosocks.com',
        pkceRequiredForOAuth: false,
      });
      const liveClient = new HeadlessOAuthClient(
        networkClient,
        subscriptionService,
        pkceManager,
        MockDynamicConfigWithCName,
        MockLiveConfig,
      );
      await liveClient.google.start();
      expectLocation(
        'https://api.stytch.shophellosocks.com/v1/public/oauth/google/start?' + 'public_token=public-token-live-123',
      );
    });
    it('Omits the code challenge when PKCE is not requred', async () => {
      const MockDynamicConfigWithoutPKCE = Promise.resolve({
        cnameDomain: null,
        pkceRequiredForOAuth: false,
      });
      const liveClient = new HeadlessOAuthClient(
        networkClient,
        subscriptionService,
        pkceManager,
        MockDynamicConfigWithoutPKCE,
        MockLiveConfig,
      );
      await liveClient.google.start();
      expectLocation('https://api.stytch.com/v1/public/oauth/google/start?' + 'public_token=public-token-live-123');
    });
    it('Throws a helpful error when scopes are not an array', async () => {
      const opts = {
        custom_scopes: 'not-an-array',
      } as unknown as OAuthGetURLOptions;
      await expect(() => client.google.start(opts)).rejects.toThrow(/custom_scopes must be an array of strings/);
    });
  });
});
