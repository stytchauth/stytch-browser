import { OAuthStartOptions } from '../../public';
import { LIVE_API_URL, TEST_API_URL } from '../..';
import { createB2BTestFixtures, MockDFPProtectedAuthCaptchaOnly, MockDFPProtectedAuthDisabled } from '../../testing';
import { StytchProjectConfigurationInput } from '../../public/typeConfig';
import {
  MOCK_B2B_AUTHENTICATE_PAYLOAD,
  MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD,
  MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD,
  MOCK_CAPTCHA,
  MOCK_CHALLENGE,
  MOCK_KEYPAIR,
  MOCK_PUBLIC_TOKEN,
  MOCK_VERIFIER,
} from '@stytch/internal-mocks';
import { HeadlessB2BOAuthClient } from './HeadlessB2BOAuthClient';

const setHrefSpy = jest.fn();

const expectLocation = (loc: string) => expect(setHrefSpy).toHaveBeenCalledWith(loc);

describe('HeadlessB2BOAuthClient', () => {
  const { networkClient, subscriptionService, pkceManager } = createB2BTestFixtures();
  let client: HeadlessB2BOAuthClient<StytchProjectConfigurationInput>;

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
    client = new HeadlessB2BOAuthClient(
      networkClient,
      subscriptionService,
      pkceManager,
      MockDynamicConfig,
      MockTestConfig,
      MockDFPProtectedAuthCaptchaOnly(),
    );
  });

  describe('oauth.authenticate', () => {
    beforeEach(() => {
      networkClient.retriableFetchSDK.mockResolvedValue(MOCK_B2B_AUTHENTICATE_PAYLOAD);
    });

    it('When no PKCE transaction is in progress, no code verifier is submitted', async () => {
      await client.authenticate({
        oauth_token: 'token',
        session_duration_minutes: 10,
        locale: 'pt-br',
      });
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        url: '/b2b/oauth/authenticate',
        method: 'POST',
        body: { session_duration_minutes: 10, oauth_token: 'token', locale: 'pt-br', captcha_token: MOCK_CAPTCHA },
        retryCallback: expect.any(Function),
      });
    });

    it('When a PKCE transaction is in progress, a code_verifier value is pulled automatically from the manager and consumed', async () => {
      await pkceManager.startPKCETransaction();
      await client.authenticate({
        oauth_token: 'token',
        session_duration_minutes: 10,
      });
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        url: '/b2b/oauth/authenticate',
        method: 'POST',
        body: {
          pkce_code_verifier: MOCK_VERIFIER,
          session_duration_minutes: 10,
          oauth_token: 'token',
          captcha_token: MOCK_CAPTCHA,
        },
        retryCallback: expect.any(Function),
      });
      expect(pkceManager.getPKPair()).toBeUndefined();
    });

    it('Calls the backend API and updates the state when a session is returned', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);
      const res = await client.authenticate({
        oauth_token: 'token',
        session_duration_minutes: 10,
        locale: 'pt-br',
      });
      expect(res).toEqual(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD,
      );

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        url: '/b2b/oauth/authenticate',
        method: 'POST',
        body: { session_duration_minutes: 10, oauth_token: 'token', locale: 'pt-br', captcha_token: MOCK_CAPTCHA },
        retryCallback: expect.any(Function),
      });
    });

    it('Calls the backend API and updates the IST when an IST is returned', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD);
      const res = await client.authenticate({
        oauth_token: 'token',
        session_duration_minutes: 10,
        locale: 'pt-br',
      });
      expect(res).toEqual(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD);

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        url: '/b2b/oauth/authenticate',
        method: 'POST',
        body: { session_duration_minutes: 10, oauth_token: 'token', locale: 'pt-br', captcha_token: MOCK_CAPTCHA },
        retryCallback: expect.any(Function),
      });
    });

    it('When the network call to Stytch fails, the transaction is not consumed and can be used again', async () => {
      networkClient.retriableFetchSDK.mockRejectedValueOnce(new Error('The server is gone!'));
      await pkceManager.startPKCETransaction();
      await expect(
        client.authenticate({
          oauth_token: 'token',
          session_duration_minutes: 10,
        }),
      ).rejects.toThrow();
      expect(pkceManager.getPKPair()).toEqual(MOCK_KEYPAIR);

      // Retry, token is consumed
      await client.authenticate({
        oauth_token: 'token',
        session_duration_minutes: 10,
      });
      expect(pkceManager.getPKPair()).toBeUndefined();
    });
  });

  describe('oauth.$provider.start', () => {
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
      await client.google.start({ organization_id: 'organization-123' });
      expectLocation(
        'https://test.stytch.com/v1/b2b/public/oauth/google/start?' +
          'public_token=public-token-test-123' +
          '&organization_id=organization-123' +
          `&pkce_code_challenge=${MOCK_CHALLENGE}`,
      );
    });

    it('Encodes signup_redirect_url when passed in', async () => {
      await client.google.start({
        organization_id: 'organization-123',
        signup_redirect_url: 'https://example.com/foo',
      });
      expectLocation(
        'https://test.stytch.com/v1/b2b/public/oauth/google/start?' +
          'public_token=public-token-test-123' +
          '&organization_id=organization-123' +
          `&pkce_code_challenge=${MOCK_CHALLENGE}` +
          '&signup_redirect_url=https%3A%2F%2Fexample.com%2Ffoo',
      );
    });
    it('Encodes login_redirect_url when passed in', async () => {
      await client.google.start({
        organization_id: 'organization-123',
        login_redirect_url: 'https://example.com/foo',
      });
      expectLocation(
        'https://test.stytch.com/v1/b2b/public/oauth/google/start?' +
          'public_token=public-token-test-123' +
          '&organization_id=organization-123' +
          `&pkce_code_challenge=${MOCK_CHALLENGE}` +
          '&login_redirect_url=https%3A%2F%2Fexample.com%2Ffoo',
      );
    });
    it('Encodes custom scopes when passed in', async () => {
      await client.google.start({ organization_id: 'organization-123', custom_scopes: ['scope_a', 'scope_b'] });
      expectLocation(
        'https://test.stytch.com/v1/b2b/public/oauth/google/start?' +
          'public_token=public-token-test-123' +
          '&organization_id=organization-123' +
          '&custom_scopes=scope_a+scope_b' +
          `&pkce_code_challenge=${MOCK_CHALLENGE}`,
      );
    });
    it('Adds provider parameters when passed in', async () => {
      await client.google.start({
        organization_id: 'organization-123',
        provider_params: { prompt: 'select_account', login_hint: 'example@stytch.com' },
      });
      expectLocation(
        'https://test.stytch.com/v1/b2b/public/oauth/google/start?' +
          'public_token=public-token-test-123' +
          '&organization_id=organization-123' +
          '&provider_prompt=select_account&provider_login_hint=example%40stytch.com' +
          `&pkce_code_challenge=${MOCK_CHALLENGE}`,
      );
    });
    it('All options passed in passed in', async () => {
      await client.google.start({
        organization_id: 'organization-123',
        login_redirect_url: 'https://example.com/foo?callback_params=123',
        signup_redirect_url: 'https://example.com/foo?callback_params=456',
        custom_scopes: ['scope_a', 'scope_b'],
      });
      expectLocation(
        'https://test.stytch.com/v1/b2b/public/oauth/google/start?' +
          'public_token=public-token-test-123' +
          '&organization_id=organization-123' +
          '&custom_scopes=scope_a+scope_b' +
          `&pkce_code_challenge=${MOCK_CHALLENGE}` +
          '&login_redirect_url=https%3A%2F%2Fexample.com%2Ffoo%3Fcallback_params%3D123' +
          '&signup_redirect_url=https%3A%2F%2Fexample.com%2Ffoo%3Fcallback_params%3D456',
      );
    });
    it('Uses the expected base URL for a live public token', async () => {
      const liveClient = new HeadlessB2BOAuthClient(
        networkClient,
        subscriptionService,
        pkceManager,
        MockDynamicConfig,
        MockLiveConfig,
        MockDFPProtectedAuthDisabled(),
      );
      await liveClient.google.start({ organization_id: 'organization-123' });
      expectLocation(
        'https://api.stytch.com/v1/b2b/public/oauth/google/start?' +
          'public_token=public-token-live-123' +
          '&organization_id=organization-123' +
          `&pkce_code_challenge=${MOCK_CHALLENGE}`,
      );
    });
    it('Substitutes the hostname with the configured cname domain when provided', async () => {
      const MockDynamicConfigWithCName = Promise.resolve({
        cnameDomain: 'api.stytch.shophellosocks.com',
        pkceRequiredForOAuth: false,
      });
      const liveClient = new HeadlessB2BOAuthClient(
        networkClient,
        subscriptionService,
        pkceManager,
        MockDynamicConfigWithCName,
        MockLiveConfig,
        MockDFPProtectedAuthDisabled(),
      );
      await liveClient.google.start({ organization_id: 'organization-123' });
      expectLocation(
        'https://api.stytch.shophellosocks.com/v1/b2b/public/oauth/google/start?' +
          'public_token=public-token-live-123' +
          '&organization_id=organization-123',
      );
    });
    it('Omits the code challenge when PKCE is not requred', async () => {
      const MockDynamicConfigWithoutPKCE = Promise.resolve({
        cnameDomain: null,
        pkceRequiredForOAuth: false,
      });
      const liveClient = new HeadlessB2BOAuthClient(
        networkClient,
        subscriptionService,
        pkceManager,
        MockDynamicConfigWithoutPKCE,
        MockLiveConfig,
        MockDFPProtectedAuthDisabled(),
      );
      await liveClient.google.start({ organization_id: 'organization-123' });
      expectLocation(
        'https://api.stytch.com/v1/b2b/public/oauth/google/start?' +
          'public_token=public-token-live-123' +
          '&organization_id=organization-123',
      );
    });
    it('Throws a helpful error when scopes are not an array', async () => {
      const opts = {
        custom_scopes: 'not-an-array',
      } as unknown as OAuthStartOptions;
      await expect(() => client.google.start(opts)).rejects.toThrow(/custom_scopes must be an array of strings/);
    });
  });

  describe('oauth.$provider.discovery.start', () => {
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
      await client.google.discovery.start({});
      expectLocation(
        'https://test.stytch.com/v1/b2b/public/oauth/google/discovery/start?' +
          'public_token=public-token-test-123' +
          `&pkce_code_challenge=${MOCK_CHALLENGE}`,
      );
    });

    it('Encodes discovery_redirect_url when passed in', async () => {
      await client.google.discovery.start({
        discovery_redirect_url: 'https://example.com/foo',
      });
      expectLocation(
        'https://test.stytch.com/v1/b2b/public/oauth/google/discovery/start?' +
          'public_token=public-token-test-123' +
          `&pkce_code_challenge=${MOCK_CHALLENGE}` +
          '&discovery_redirect_url=https%3A%2F%2Fexample.com%2Ffoo',
      );
    });
    it('Encodes custom scopes when passed in', async () => {
      await client.google.discovery.start({ custom_scopes: ['scope_a', 'scope_b'] });
      expectLocation(
        'https://test.stytch.com/v1/b2b/public/oauth/google/discovery/start?' +
          'public_token=public-token-test-123' +
          '&custom_scopes=scope_a+scope_b' +
          `&pkce_code_challenge=${MOCK_CHALLENGE}`,
      );
    });
    it('Adds provider parameters when passed in', async () => {
      await client.google.discovery.start({
        provider_params: { prompt: 'select_account', login_hint: 'example@stytch.com' },
      });
      expectLocation(
        'https://test.stytch.com/v1/b2b/public/oauth/google/discovery/start?' +
          'public_token=public-token-test-123' +
          '&provider_prompt=select_account&provider_login_hint=example%40stytch.com' +
          `&pkce_code_challenge=${MOCK_CHALLENGE}`,
      );
    });
    it('All options passed in passed in', async () => {
      await client.google.discovery.start({
        discovery_redirect_url: 'https://example.com/foo?callback_params=123',
        custom_scopes: ['scope_a', 'scope_b'],
      });
      expectLocation(
        'https://test.stytch.com/v1/b2b/public/oauth/google/discovery/start?' +
          'public_token=public-token-test-123' +
          '&custom_scopes=scope_a+scope_b' +
          `&pkce_code_challenge=${MOCK_CHALLENGE}` +
          '&discovery_redirect_url=https%3A%2F%2Fexample.com%2Ffoo%3Fcallback_params%3D123',
      );
    });
    it('Uses the expected base URL for a live public token', async () => {
      const liveClient = new HeadlessB2BOAuthClient(
        networkClient,
        subscriptionService,
        pkceManager,
        MockDynamicConfig,
        MockLiveConfig,
        MockDFPProtectedAuthDisabled(),
      );
      await liveClient.google.discovery.start({});
      expectLocation(
        'https://api.stytch.com/v1/b2b/public/oauth/google/discovery/start?' +
          'public_token=public-token-live-123' +
          `&pkce_code_challenge=${MOCK_CHALLENGE}`,
      );
    });
    it('Substitutes the hostname with the configured cname domain when provided', async () => {
      const MockDynamicConfigWithCName = Promise.resolve({
        cnameDomain: 'api.stytch.shophellosocks.com',
        pkceRequiredForOAuth: false,
      });
      const liveClient = new HeadlessB2BOAuthClient(
        networkClient,
        subscriptionService,
        pkceManager,
        MockDynamicConfigWithCName,
        MockLiveConfig,
        MockDFPProtectedAuthDisabled(),
      );
      await liveClient.google.discovery.start({});
      expectLocation(
        'https://api.stytch.shophellosocks.com/v1/b2b/public/oauth/google/discovery/start?' +
          'public_token=public-token-live-123',
      );
    });
    it('Omits the code challenge when PKCE is not requred', async () => {
      const MockDynamicConfigWithoutPKCE = Promise.resolve({
        cnameDomain: null,
        pkceRequiredForOAuth: false,
      });
      const liveClient = new HeadlessB2BOAuthClient(
        networkClient,
        subscriptionService,
        pkceManager,
        MockDynamicConfigWithoutPKCE,
        MockLiveConfig,
        MockDFPProtectedAuthDisabled(),
      );
      await liveClient.google.discovery.start({});
      expectLocation(
        'https://api.stytch.com/v1/b2b/public/oauth/google/discovery/start?' + 'public_token=public-token-live-123',
      );
    });
    it('Throws a helpful error when scopes are not an array', async () => {
      const opts = {
        custom_scopes: 'not-an-array',
      } as unknown as OAuthStartOptions;
      await expect(() => client.google.start(opts)).rejects.toThrow(/custom_scopes must be an array of strings/);
    });
  });
});
