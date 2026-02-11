import {
  MOCK_B2B_AUTHENTICATE_PAYLOAD,
  MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD,
  MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD,
  MOCK_CAPTCHA,
  MOCK_CHALLENGE,
  MOCK_DFP_TELEMTRY_ID,
  MOCK_KEYPAIR,
  MOCK_PUBLIC_TOKEN,
  MOCK_REQUEST_ID,
  MOCK_VERIFIER,
} from '@stytch/internal-mocks';

import { LIVE_API_URL, TEST_API_URL } from '../..';
import { StytchProjectConfigurationInput } from '../../public/typeConfig';
import {
  createB2BTestFixtures,
  IB2BSubscriptionServiceMock,
  INetworkClientMock,
  MockDFPProtectedAuthCaptchaOnly,
  MockDFPProtectedAuthDFPAndCaptcha,
  MockPKCEManager,
} from '../../testing';
import { HeadlessB2BSSOClient } from './HeadlessB2BSSOClient';

const noop = () => {
  // noop
};

describe('HeadlessB2BSSOClient', () => {
  let networkClient: INetworkClientMock;
  let subscriptionService: IB2BSubscriptionServiceMock;
  let pkceManager: MockPKCEManager;
  let client: HeadlessB2BSSOClient<StytchProjectConfigurationInput>;
  let navigateSpy: jest.SpyInstance;

  const expectLocation = (loc: string) => {
    expect(navigateSpy).toHaveBeenCalledWith(expect.any(URL));
    const callArg = navigateSpy.mock.calls.at(-1)![0] as URL;
    expect(callArg.toString()).toBe(loc);
  };

  const MockDynamicConfig = Promise.resolve({
    pkceRequiredForSso: true,
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

  beforeEach(() => {
    jest.resetAllMocks();

    ({ networkClient, subscriptionService, pkceManager } = createB2BTestFixtures());

    client = new HeadlessB2BSSOClient(
      networkClient,
      subscriptionService,
      pkceManager,
      MockDynamicConfig,
      MockTestConfig,
      MockDFPProtectedAuthCaptchaOnly(),
    );
    navigateSpy = jest.spyOn(client, 'navigate').mockImplementation(noop);
  });

  describe('sso.authenticate', () => {
    beforeEach(() => {
      networkClient.retriableFetchSDK.mockResolvedValue(MOCK_B2B_AUTHENTICATE_PAYLOAD);
    });

    it('run with dfp protected auth', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);
      const clientWithDFP = new HeadlessB2BSSOClient(
        networkClient,
        subscriptionService,
        pkceManager,
        MockDynamicConfig,
        MockTestConfig,
        MockDFPProtectedAuthDFPAndCaptcha(),
      );
      const res = await clientWithDFP.authenticate({
        sso_token: 'token',
        session_duration_minutes: 10,
        locale: 'en',
      });

      expect(res).toEqual(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD,
      );

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        url: '/b2b/sso/authenticate',
        method: 'POST',
        body: {
          session_duration_minutes: 10,
          sso_token: 'token',
          locale: 'en',
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
        },
        retryCallback: expect.any(Function),
      });
    });

    it('When no PKCE transaction is in progress, no code verifier is submitted', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);
      const res = await client.authenticate({
        sso_token: 'token',
        session_duration_minutes: 10,
        locale: 'en',
      });

      expect(res).toEqual(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD,
      );

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        url: '/b2b/sso/authenticate',
        method: 'POST',
        body: { session_duration_minutes: 10, sso_token: 'token', locale: 'en', captcha_token: MOCK_CAPTCHA },
        retryCallback: expect.any(Function),
      });
    });

    it('When a PKCE transaction is in progress, a code_verifier value is pulled automatically from the manager and consumed', async () => {
      await pkceManager.startPKCETransaction();
      await client.authenticate({
        sso_token: 'token',
        session_duration_minutes: 10,
      });
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        url: '/b2b/sso/authenticate',
        method: 'POST',
        body: {
          pkce_code_verifier: MOCK_VERIFIER,
          session_duration_minutes: 10,
          sso_token: 'token',
          captcha_token: MOCK_CAPTCHA,
        },
        retryCallback: expect.any(Function),
      });
      expect(pkceManager.getPKPair()).toBeUndefined();
    });

    it('Updates the IST is an IST is returned', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD);
      const res = await client.authenticate({
        sso_token: 'token',
        session_duration_minutes: 10,
        locale: 'en',
      });

      expect(res).toEqual(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD);

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        url: '/b2b/sso/authenticate',
        method: 'POST',
        body: { session_duration_minutes: 10, sso_token: 'token', locale: 'en', captcha_token: MOCK_CAPTCHA },
        retryCallback: expect.any(Function),
      });
    });

    it('When the network call to Stytch fails, the transaction is not consumed and can be used again', async () => {
      networkClient.retriableFetchSDK.mockRejectedValueOnce(new Error('The server is gone!'));
      await pkceManager.startPKCETransaction();
      await expect(
        client.authenticate({
          sso_token: 'token',
          session_duration_minutes: 10,
        }),
      ).rejects.toThrow();
      expect(pkceManager.getPKPair()).toEqual(MOCK_KEYPAIR);

      // Retry, token is consumed
      await client.authenticate({
        sso_token: 'token',
        session_duration_minutes: 10,
      });
      expect(pkceManager.getPKPair()).toBeUndefined();
    });
  });

  describe('sso.start', () => {
    const connection_id = 'connection-test-456';

    beforeEach(() => {
      jest.resetAllMocks();
      navigateSpy = jest.spyOn(client, 'navigate').mockImplementation(noop);
    });

    it('Uses the expected base URL for a test public token', async () => {
      await client.start({ connection_id });
      expectLocation(
        'https://test.stytch.com/v1/public/sso/start?' +
          'public_token=public-token-test-123' +
          `&connection_id=${connection_id}` +
          `&pkce_code_challenge=${MOCK_CHALLENGE}`,
      );
    });

    it('Encodes signup_redirect_url when passed in', async () => {
      await client.start({
        connection_id,
        signup_redirect_url: 'https://example.com/foo',
      });
      expectLocation(
        'https://test.stytch.com/v1/public/sso/start?' +
          'public_token=public-token-test-123' +
          `&connection_id=${connection_id}` +
          `&pkce_code_challenge=${MOCK_CHALLENGE}` +
          '&signup_redirect_url=https%3A%2F%2Fexample.com%2Ffoo',
      );
    });
    it('Encodes login_redirect_url when passed in', async () => {
      await client.start({
        connection_id,
        login_redirect_url: 'https://example.com/foo',
      });
      expectLocation(
        'https://test.stytch.com/v1/public/sso/start?' +
          'public_token=public-token-test-123' +
          `&connection_id=${connection_id}` +
          `&pkce_code_challenge=${MOCK_CHALLENGE}` +
          '&login_redirect_url=https%3A%2F%2Fexample.com%2Ffoo',
      );
    });
    it('All options passed in passed in', async () => {
      await client.start({
        connection_id,
        login_redirect_url: 'https://example.com/foo?callback_params=123',
        signup_redirect_url: 'https://example.com/foo?callback_params=456',
      });
      expectLocation(
        'https://test.stytch.com/v1/public/sso/start?' +
          'public_token=public-token-test-123' +
          `&connection_id=${connection_id}` +
          `&pkce_code_challenge=${MOCK_CHALLENGE}` +
          '&login_redirect_url=https%3A%2F%2Fexample.com%2Ffoo%3Fcallback_params%3D123' +
          '&signup_redirect_url=https%3A%2F%2Fexample.com%2Ffoo%3Fcallback_params%3D456',
      );
    });
    it('Uses the expected base URL for a live public token', async () => {
      const liveClient = new HeadlessB2BSSOClient(
        networkClient,
        subscriptionService,
        pkceManager,
        MockDynamicConfig,
        MockLiveConfig,
        MockDFPProtectedAuthCaptchaOnly(),
      );
      navigateSpy = jest.spyOn(liveClient, 'navigate').mockImplementation(noop);
      await liveClient.start({ connection_id });
      expectLocation(
        'https://api.stytch.com/v1/public/sso/start?' +
          'public_token=public-token-live-123' +
          `&connection_id=${connection_id}` +
          `&pkce_code_challenge=${MOCK_CHALLENGE}`,
      );
    });
    it('Omits the code challenge when PKCE is not requred', async () => {
      const MockDynamicConfigWithoutPKCE = Promise.resolve({
        pkceRequiredForSso: false,
      });
      const liveClient = new HeadlessB2BSSOClient(
        networkClient,
        subscriptionService,
        pkceManager,
        MockDynamicConfigWithoutPKCE,
        MockLiveConfig,
        MockDFPProtectedAuthCaptchaOnly(),
      );
      navigateSpy = jest.spyOn(liveClient, 'navigate').mockImplementation(noop);
      await liveClient.start({ connection_id });
      expectLocation(
        'https://api.stytch.com/v1/public/sso/start?' +
          'public_token=public-token-live-123' +
          `&connection_id=${connection_id}`,
      );
    });
  });

  describe('sso.getConnections', () => {
    it('Calls the backend API and returns the response', async () => {
      networkClient.fetchSDK.mockReturnValue({
        saml_connections: ['mock-connection'],
        oidc_connections: ['mock-connection'],
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(client.getConnections()).resolves.toEqual({
        saml_connections: ['mock-connection'],
        oidc_connections: ['mock-connection'],
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'GET',
        url: '/b2b/sso',
      });
    });
  });

  describe('sso.deleteConnection', () => {
    it('Calls the backend API and returns the response', async () => {
      networkClient.fetchSDK.mockReturnValue({
        connection_id: 'mock-connection',
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(client.deleteConnection('mock-connection')).resolves.toEqual({
        connection_id: 'mock-connection',
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'DELETE',
        url: '/b2b/sso/mock-connection',
      });
    });
  });

  describe('sso.saml.create', () => {
    it('Calls the backend API and returns the response', async () => {
      networkClient.fetchSDK.mockReturnValue({
        connection: 'mock-connection',
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(client.saml.createConnection({ display_name: 'My Connection' })).resolves.toEqual({
        connection: 'mock-connection',
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'POST',
        url: '/b2b/sso/saml',
        body: {
          display_name: 'My Connection',
        },
      });
    });
  });

  describe('sso.saml.updateConnection', () => {
    it('Calls the backend API and returns the response', async () => {
      networkClient.fetchSDK.mockReturnValue({
        connection: 'mock-connection',
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(
        client.saml.updateConnection({
          connection_id: 'mock-connection',
          x509_certificate: 'My Certificate',
          signing_private_key: '-----BEGIN PRIVATE KEY-----\n...base64 blob...\n-----END PRIVATE KEY-----',
        }),
      ).resolves.toEqual({
        connection: 'mock-connection',
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'PUT',
        url: '/b2b/sso/saml/mock-connection',
        body: {
          connection_id: 'mock-connection',
          x509_certificate: 'My Certificate',
          signing_private_key: '-----BEGIN PRIVATE KEY-----\n...base64 blob...\n-----END PRIVATE KEY-----',
        },
      });
    });
  });

  describe('sso.saml.updateConnectionByURL', () => {
    it('Calls the backend API and returns the response', async () => {
      networkClient.fetchSDK.mockReturnValue({
        connection: 'mock-connection',
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(
        client.saml.updateConnectionByURL({ connection_id: 'mock-connection', metadata_url: 'https://example.com' }),
      ).resolves.toEqual({
        connection: 'mock-connection',
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'PUT',
        url: '/b2b/sso/saml/mock-connection/url',
        body: { connection_id: 'mock-connection', metadata_url: 'https://example.com' },
      });
    });
  });

  describe('sso.saml.deleteVerificationCertificate', () => {
    it('Calls the backend API and returns the response', async () => {
      networkClient.fetchSDK.mockReturnValue({
        certificate_id: 'mock-cert',
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(
        client.saml.deleteVerificationCertificate({ connection_id: 'mock-connection', certificate_id: 'mock-cert' }),
      ).resolves.toEqual({
        certificate_id: 'mock-cert',
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'DELETE',
        url: '/b2b/sso/saml/mock-connection/verification_certificates/mock-cert',
      });
    });
  });

  describe('sso.oidc.create', () => {
    it('Calls the backend API and returns the response', async () => {
      networkClient.fetchSDK.mockReturnValue({
        connection: 'mock-connection',
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(client.oidc.createConnection({ display_name: 'My Connection' })).resolves.toEqual({
        connection: 'mock-connection',
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'POST',
        url: '/b2b/sso/oidc',
        body: {
          display_name: 'My Connection',
        },
      });
    });
  });

  describe('sso.oidc.updateConnection', () => {
    it('Calls the backend API and returns the response', async () => {
      networkClient.fetchSDK.mockReturnValue({
        connection: 'mock-connection',
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(
        client.oidc.updateConnection({ connection_id: 'mock-connection', jwks_url: 'https://example.com/jwks.json' }),
      ).resolves.toEqual({
        connection: 'mock-connection',
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        method: 'PUT',
        url: '/b2b/sso/oidc/mock-connection',
        body: { connection_id: 'mock-connection', jwks_url: 'https://example.com/jwks.json' },
      });
    });
  });
});
