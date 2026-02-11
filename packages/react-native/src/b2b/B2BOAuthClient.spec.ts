import { OAuthStartOptions, StytchProjectConfigurationInput } from '@stytch/core/public';
import { InAppBrowser } from '@stytch/react-native-inappbrowser-reborn';
import { Linking } from 'react-native';

import { MOCK_CHALLENGE, MOCK_PUBLIC_TOKEN } from '../mocks';
import { createTestFixtures, MockDFPProtectedAuthDisabled, MockDFPProtectedAuthWithCaptcha } from '../testUtils';
import { B2BOAuthClient } from './B2BOAuthClient';

const TEST_API_URL = 'https://test.stytch.com';
const LIVE_API_URL = 'https://api.stytch.com';

jest.mock('react-native', () => ({
  Linking: {
    openURL: jest.fn().mockResolvedValue(null),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
}));

jest.mock('@stytch/react-native-inappbrowser-reborn', () => ({
  InAppBrowser: {
    isAvailable: jest.fn().mockResolvedValue(true),
    openAuth: jest.fn(),
  },
}));

describe('B2BOAuthClient', () => {
  const { networkClient, b2bSubscriptionService, pkceManager } = createTestFixtures();
  let client: B2BOAuthClient<StytchProjectConfigurationInput>;

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
    client = new B2BOAuthClient(
      networkClient,
      b2bSubscriptionService,
      pkceManager,
      MockDynamicConfig,
      MockTestConfig,
      MockDFPProtectedAuthWithCaptcha(),
    );
  });

  describe('oauth.$provider.start', () => {
    let isAvailableSpy = jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(false);
    let linkingSpy = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(null);

    beforeEach(() => {
      jest.resetAllMocks();
      isAvailableSpy = jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(false);
      linkingSpy = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(null);
    });

    it('Uses the expected base URL for a test public token', async () => {
      const url =
        'https://test.stytch.com/v1/b2b/public/oauth/google/start?' +
        'public_token=public-token-test-123' +
        '&organization_id=organization-123' +
        `&pkce_code_challenge=${MOCK_CHALLENGE}`;

      await client.google.start({ organization_id: 'organization-123' });
      expect(isAvailableSpy).toHaveBeenCalled();
      expect(linkingSpy).toHaveBeenCalledWith(url);
      isAvailableSpy.mockRestore();
      linkingSpy.mockRestore();
    });

    it('Encodes signup_redirect_url when passed in', async () => {
      const url =
        'https://test.stytch.com/v1/b2b/public/oauth/google/start?' +
        'public_token=public-token-test-123' +
        '&signup_redirect_url=https%3A%2F%2Fexample.com%2Ffoo' +
        '&organization_id=organization-123' +
        `&pkce_code_challenge=${MOCK_CHALLENGE}`;

      await client.google.start({
        organization_id: 'organization-123',
        signup_redirect_url: 'https://example.com/foo',
      });
      expect(isAvailableSpy).toHaveBeenCalled();
      expect(linkingSpy).toHaveBeenCalledWith(url);
      isAvailableSpy.mockRestore();
      linkingSpy.mockRestore();
    });

    it('Encodes login_redirect_url when passed in', async () => {
      const url =
        'https://test.stytch.com/v1/b2b/public/oauth/google/start?' +
        'public_token=public-token-test-123' +
        '&login_redirect_url=https%3A%2F%2Fexample.com%2Ffoo' +
        '&organization_id=organization-123' +
        `&pkce_code_challenge=${MOCK_CHALLENGE}`;

      await client.google.start({
        organization_id: 'organization-123',
        login_redirect_url: 'https://example.com/foo',
      });
      expect(isAvailableSpy).toHaveBeenCalled();
      expect(linkingSpy).toHaveBeenCalledWith(url);
      isAvailableSpy.mockRestore();
      linkingSpy.mockRestore();
    });

    it('Encodes custom scopes when passed in', async () => {
      const url =
        'https://test.stytch.com/v1/b2b/public/oauth/google/start?' +
        'public_token=public-token-test-123' +
        '&organization_id=organization-123' +
        '&custom_scopes=scope_a%20scope_b' +
        `&pkce_code_challenge=${MOCK_CHALLENGE}`;

      await client.google.start({ organization_id: 'organization-123', custom_scopes: ['scope_a', 'scope_b'] });
      expect(isAvailableSpy).toHaveBeenCalled();
      expect(linkingSpy).toHaveBeenCalledWith(url);
      isAvailableSpy.mockRestore();
      linkingSpy.mockRestore();
    });

    it('Adds provider parameters when passed in', async () => {
      const url =
        'https://test.stytch.com/v1/b2b/public/oauth/google/start?' +
        'public_token=public-token-test-123' +
        '&organization_id=organization-123' +
        '&provider_prompt=select_account&provider_login_hint=example%40stytch.com' +
        `&pkce_code_challenge=${MOCK_CHALLENGE}`;

      await client.google.start({
        organization_id: 'organization-123',
        provider_params: { prompt: 'select_account', login_hint: 'example@stytch.com' },
      });
      expect(isAvailableSpy).toHaveBeenCalled();
      expect(linkingSpy).toHaveBeenCalledWith(url);
      isAvailableSpy.mockRestore();
      linkingSpy.mockRestore();
    });

    it('All options passed in passed in', async () => {
      const url =
        'https://test.stytch.com/v1/b2b/public/oauth/google/start?' +
        'public_token=public-token-test-123' +
        '&login_redirect_url=https%3A%2F%2Fexample.com%2Ffoo%3Fcallback_params%3D123' +
        '&signup_redirect_url=https%3A%2F%2Fexample.com%2Ffoo%3Fcallback_params%3D456' +
        '&organization_id=organization-123' +
        '&custom_scopes=scope_a%20scope_b' +
        `&pkce_code_challenge=${MOCK_CHALLENGE}`;

      await client.google.start({
        organization_id: 'organization-123',
        login_redirect_url: 'https://example.com/foo?callback_params=123',
        signup_redirect_url: 'https://example.com/foo?callback_params=456',
        custom_scopes: ['scope_a', 'scope_b'],
      });
      expect(isAvailableSpy).toHaveBeenCalled();
      expect(linkingSpy).toHaveBeenCalledWith(url);
      isAvailableSpy.mockRestore();
      linkingSpy.mockRestore();
    });

    it('Uses the expected base URL for a live public token', async () => {
      const liveClient = new B2BOAuthClient(
        networkClient,
        b2bSubscriptionService,
        pkceManager,
        MockDynamicConfig,
        MockLiveConfig,
        MockDFPProtectedAuthDisabled(),
      );

      const url =
        'https://api.stytch.com/v1/b2b/public/oauth/google/start?' +
        'public_token=public-token-live-123' +
        '&organization_id=organization-123' +
        `&pkce_code_challenge=${MOCK_CHALLENGE}`;

      await liveClient.google.start({ organization_id: 'organization-123' });
      expect(isAvailableSpy).toHaveBeenCalled();
      expect(linkingSpy).toHaveBeenCalledWith(url);
      isAvailableSpy.mockRestore();
      linkingSpy.mockRestore();
    });

    it('Substitutes the hostname with the configured cname domain when provided', async () => {
      const MockDynamicConfigWithCName = Promise.resolve({
        cnameDomain: 'api.stytch.shophellosocks.com',
        pkceRequiredForOAuth: false,
      });
      const liveClient = new B2BOAuthClient(
        networkClient,
        b2bSubscriptionService,
        pkceManager,
        MockDynamicConfigWithCName,
        MockLiveConfig,
        MockDFPProtectedAuthDisabled(),
      );

      const url =
        'https://api.stytch.shophellosocks.com/v1/b2b/public/oauth/google/start?' +
        'public_token=public-token-live-123' +
        '&organization_id=organization-123';

      await liveClient.google.start({ organization_id: 'organization-123' });
      expect(isAvailableSpy).toHaveBeenCalled();
      expect(linkingSpy).toHaveBeenCalledWith(url);
      isAvailableSpy.mockRestore();
      linkingSpy.mockRestore();
    });

    it('Omits the code challenge when PKCE is not requred', async () => {
      const MockDynamicConfigWithoutPKCE = Promise.resolve({
        cnameDomain: null,
        pkceRequiredForOAuth: false,
      });
      const liveClient = new B2BOAuthClient(
        networkClient,
        b2bSubscriptionService,
        pkceManager,
        MockDynamicConfigWithoutPKCE,
        MockLiveConfig,
        MockDFPProtectedAuthDisabled(),
      );
      const url =
        'https://api.stytch.com/v1/b2b/public/oauth/google/start?' +
        'public_token=public-token-live-123' +
        '&organization_id=organization-123';

      await liveClient.google.start({ organization_id: 'organization-123' });
      expect(isAvailableSpy).toHaveBeenCalled();
      expect(linkingSpy).toHaveBeenCalledWith(url);
      isAvailableSpy.mockRestore();
      linkingSpy.mockRestore();
    });

    it('Throws a helpful error when scopes are not an array', async () => {
      const opts = {
        custom_scopes: 'not-an-array',
      } as unknown as OAuthStartOptions;
      await expect(() => client.google.start(opts)).rejects.toThrow(/custom_scopes must be an array of strings/);
    });
  });

  describe('oauth.$provider.discovery.start', () => {
    let isAvailableSpy = jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(false);
    let linkingSpy = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(null);

    beforeEach(() => {
      jest.resetAllMocks();
      isAvailableSpy = jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(false);
      linkingSpy = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(null);
    });

    it('Uses the expected base URL for a test public token', async () => {
      const url =
        'https://test.stytch.com/v1/b2b/public/oauth/google/discovery/start?' +
        'public_token=public-token-test-123' +
        `&pkce_code_challenge=${MOCK_CHALLENGE}`;

      await client.google.discovery.start({});
      expect(isAvailableSpy).toHaveBeenCalled();
      expect(linkingSpy).toHaveBeenCalledWith(url);
      isAvailableSpy.mockRestore();
      linkingSpy.mockRestore();
    });

    it('Encodes discovery_redirect_url when passed in', async () => {
      const url =
        'https://test.stytch.com/v1/b2b/public/oauth/google/discovery/start?' +
        'public_token=public-token-test-123' +
        '&discovery_redirect_url=https%3A%2F%2Fexample.com%2Ffoo' +
        `&pkce_code_challenge=${MOCK_CHALLENGE}`;

      await client.google.discovery.start({
        discovery_redirect_url: 'https://example.com/foo',
      });
      expect(isAvailableSpy).toHaveBeenCalled();
      expect(linkingSpy).toHaveBeenCalledWith(url);
      isAvailableSpy.mockRestore();
      linkingSpy.mockRestore();
    });

    it('Encodes custom scopes when passed in', async () => {
      const url =
        'https://test.stytch.com/v1/b2b/public/oauth/google/discovery/start?' +
        'public_token=public-token-test-123' +
        '&custom_scopes=scope_a%20scope_b' +
        `&pkce_code_challenge=${MOCK_CHALLENGE}`;

      await client.google.discovery.start({ custom_scopes: ['scope_a', 'scope_b'] });
      expect(isAvailableSpy).toHaveBeenCalled();
      expect(linkingSpy).toHaveBeenCalledWith(url);
      isAvailableSpy.mockRestore();
      linkingSpy.mockRestore();
    });

    it('Adds provider parameters when passed in', async () => {
      const url =
        'https://test.stytch.com/v1/b2b/public/oauth/google/discovery/start?' +
        'public_token=public-token-test-123' +
        '&provider_prompt=select_account&provider_login_hint=example%40stytch.com' +
        `&pkce_code_challenge=${MOCK_CHALLENGE}`;

      await client.google.discovery.start({
        provider_params: { prompt: 'select_account', login_hint: 'example@stytch.com' },
      });
      expect(isAvailableSpy).toHaveBeenCalled();
      expect(linkingSpy).toHaveBeenCalledWith(url);
      isAvailableSpy.mockRestore();
      linkingSpy.mockRestore();
    });

    it('All options passed in passed in', async () => {
      const url =
        'https://test.stytch.com/v1/b2b/public/oauth/google/discovery/start?' +
        'public_token=public-token-test-123' +
        '&discovery_redirect_url=https%3A%2F%2Fexample.com%2Ffoo%3Fcallback_params%3D123' +
        '&custom_scopes=scope_a%20scope_b' +
        `&pkce_code_challenge=${MOCK_CHALLENGE}`;

      await client.google.discovery.start({
        discovery_redirect_url: 'https://example.com/foo?callback_params=123',
        custom_scopes: ['scope_a', 'scope_b'],
      });
      expect(isAvailableSpy).toHaveBeenCalled();
      expect(linkingSpy).toHaveBeenCalledWith(url);
      isAvailableSpy.mockRestore();
      linkingSpy.mockRestore();
    });

    it('Uses the expected base URL for a live public token', async () => {
      const liveClient = new B2BOAuthClient(
        networkClient,
        b2bSubscriptionService,
        pkceManager,
        MockDynamicConfig,
        MockLiveConfig,
        MockDFPProtectedAuthDisabled(),
      );

      const url =
        'https://api.stytch.com/v1/b2b/public/oauth/google/discovery/start?' +
        'public_token=public-token-live-123' +
        `&pkce_code_challenge=${MOCK_CHALLENGE}`;

      await liveClient.google.discovery.start({});
      expect(isAvailableSpy).toHaveBeenCalled();
      expect(linkingSpy).toHaveBeenCalledWith(url);
      isAvailableSpy.mockRestore();
      linkingSpy.mockRestore();
    });

    it('Substitutes the hostname with the configured cname domain when provided', async () => {
      const MockDynamicConfigWithCName = Promise.resolve({
        cnameDomain: 'api.stytch.shophellosocks.com',
        pkceRequiredForOAuth: false,
      });
      const liveClient = new B2BOAuthClient(
        networkClient,
        b2bSubscriptionService,
        pkceManager,
        MockDynamicConfigWithCName,
        MockLiveConfig,
        MockDFPProtectedAuthDisabled(),
      );

      const url =
        'https://api.stytch.shophellosocks.com/v1/b2b/public/oauth/google/discovery/start?' +
        'public_token=public-token-live-123';

      await liveClient.google.discovery.start({});
      expect(isAvailableSpy).toHaveBeenCalled();
      expect(linkingSpy).toHaveBeenCalledWith(url);
      isAvailableSpy.mockRestore();
      linkingSpy.mockRestore();
    });

    it('Omits the code challenge when PKCE is not requred', async () => {
      const MockDynamicConfigWithoutPKCE = Promise.resolve({
        cnameDomain: null,
        pkceRequiredForOAuth: false,
      });
      const liveClient = new B2BOAuthClient(
        networkClient,
        b2bSubscriptionService,
        pkceManager,
        MockDynamicConfigWithoutPKCE,
        MockLiveConfig,
        MockDFPProtectedAuthDisabled(),
      );

      const url =
        'https://api.stytch.com/v1/b2b/public/oauth/google/discovery/start?' + 'public_token=public-token-live-123';

      await liveClient.google.discovery.start({});
      expect(isAvailableSpy).toHaveBeenCalled();
      expect(linkingSpy).toHaveBeenCalledWith(url);
      isAvailableSpy.mockRestore();
      linkingSpy.mockRestore();
    });

    it('Throws a helpful error when scopes are not an array', async () => {
      const opts = {
        custom_scopes: 'not-an-array',
      } as unknown as OAuthStartOptions;
      await expect(() => client.google.start(opts)).rejects.toThrow(/custom_scopes must be an array of strings/);
    });
  });
});
