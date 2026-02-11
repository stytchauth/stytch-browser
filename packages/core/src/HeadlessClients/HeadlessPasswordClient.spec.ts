import {
  PasswordResetByEmailOptions,
  PasswordResetByEmailStartOptions,
  StytchProjectConfigurationInput,
} from '../public';
import {
  createTestFixtures,
  IConsumerSubscriptionServiceMock,
  INetworkClientMock,
  MockDFPProtectedAuthCaptchaOnly,
  MockDFPProtectedAuthDFPAndCaptcha,
  MockDFPProtectedAuthDFPOnly,
  MockPKCEManager,
} from '../testing';
import {
  MOCK_AUTHENTICATE_PAYLOAD,
  updateSessionExpect,
  MOCK_AUTHENTICATE_RETURN_VALUE,
  MOCK_CAPTCHA,
  MOCK_CHALLENGE,
  MOCK_CODE,
  MOCK_DFP_TELEMTRY_ID,
  MOCK_EMAIL,
  MOCK_KEYPAIR,
  MOCK_PASSWORD,
  MOCK_REQUEST_ID,
  MOCK_SESSION,
  MOCK_USER,
  MOCK_VERIFIER,
} from '@stytch/internal-mocks';
import { HeadlessPasswordClient } from './HeadlessPasswordClient';

describe('HeadlessPasswordClient', () => {
  let networkClient: INetworkClientMock;
  let subscriptionService: IConsumerSubscriptionServiceMock;
  let pkceManager: MockPKCEManager;
  let client: HeadlessPasswordClient<StytchProjectConfigurationInput>;

  let PKCEEnabledClient: HeadlessPasswordClient<StytchProjectConfigurationInput>;

  beforeEach(() => {
    jest.resetAllMocks();

    ({ networkClient, subscriptionService, pkceManager } = createTestFixtures());

    client = new HeadlessPasswordClient(
      networkClient,
      subscriptionService,
      pkceManager,
      Promise.resolve({
        pkceRequiredForPasswordResets: false,
      }),
      MockDFPProtectedAuthCaptchaOnly(),
    );

    PKCEEnabledClient = new HeadlessPasswordClient(
      networkClient,
      subscriptionService,
      pkceManager,
      Promise.resolve({
        pkceRequiredForPasswordResets: true,
      }),
      MockDFPProtectedAuthCaptchaOnly(),
    );
  });

  describe('create', () => {
    it('Calls the password create API endpoint', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_AUTHENTICATE_PAYLOAD);
      await expect(
        client.create({
          email: MOCK_EMAIL,
          password: MOCK_PASSWORD,
          session_duration_minutes: 10,
        }),
      ).resolves.toEqual(MOCK_AUTHENTICATE_RETURN_VALUE);
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(updateSessionExpect());

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          email: MOCK_EMAIL,
          password: MOCK_PASSWORD,
          session_duration_minutes: 10,
          captcha_token: MOCK_CAPTCHA,
          dfp_telemetry_id: undefined,
        },
        method: 'POST',
        url: '/passwords',
        retryCallback: expect.any(Function),
      });
    });
    it('Calls the password create API endpoint with dfp protectedAuth', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_AUTHENTICATE_PAYLOAD);

      const client = new HeadlessPasswordClient(
        networkClient,
        subscriptionService,
        pkceManager,
        Promise.resolve({
          pkceRequiredForPasswordResets: false,
        }),
        MockDFPProtectedAuthDFPAndCaptcha(),
      );

      await expect(
        client.create({
          email: MOCK_EMAIL,
          password: MOCK_PASSWORD,
          session_duration_minutes: 10,
        }),
      ).resolves.toEqual(MOCK_AUTHENTICATE_RETURN_VALUE);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(updateSessionExpect());

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          email: MOCK_EMAIL,
          password: MOCK_PASSWORD,
          session_duration_minutes: 10,
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
        },
        method: 'POST',
        url: '/passwords',
        retryCallback: expect.any(Function),
      });
    });
  });

  describe('authenticate', () => {
    it('Calls the password authenticate API endpoint', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_AUTHENTICATE_PAYLOAD);

      await expect(
        client.authenticate({
          email: MOCK_EMAIL,
          password: MOCK_PASSWORD,
          session_duration_minutes: 10,
        }),
      ).resolves.toEqual(MOCK_AUTHENTICATE_RETURN_VALUE);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(updateSessionExpect());

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: { email: MOCK_EMAIL, password: MOCK_PASSWORD, session_duration_minutes: 10, captcha_token: MOCK_CAPTCHA },
        method: 'POST',
        url: '/passwords/authenticate',
        retryCallback: expect.any(Function),
      });
    });
    it('Calls the password authenticate API endpoint with dfp protectedAuth', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_AUTHENTICATE_PAYLOAD);

      const client = new HeadlessPasswordClient(
        networkClient,
        subscriptionService,
        pkceManager,
        Promise.resolve({
          pkceRequiredForPasswordResets: false,
        }),
        MockDFPProtectedAuthDFPAndCaptcha(),
      );

      await expect(
        client.authenticate({
          email: MOCK_EMAIL,
          password: MOCK_PASSWORD,
          session_duration_minutes: 10,
        }),
      ).resolves.toEqual(MOCK_AUTHENTICATE_RETURN_VALUE);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(updateSessionExpect());

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          email: MOCK_EMAIL,
          password: MOCK_PASSWORD,
          session_duration_minutes: 10,
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
        },
        method: 'POST',
        url: '/passwords/authenticate',
        retryCallback: expect.any(Function),
      });
    });
  });

  describe('resetByEmailStart', () => {
    const resetByEmailStartPayload: PasswordResetByEmailStartOptions = {
      email: MOCK_EMAIL,
      login_redirect_url: 'login_redirect_url',
      reset_password_redirect_url: 'reset_password_redirect_url',
      reset_password_expiration_minutes: 5,
    };

    it('Calls the email reset API endpoint', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce({
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(client.resetByEmailStart(resetByEmailStartPayload)).resolves.toEqual({
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          ...resetByEmailStartPayload,
          captcha_token: MOCK_CAPTCHA,
        },
        method: 'POST',
        url: '/passwords/email/reset/start',
        retryCallback: expect.any(Function),
      });
    });

    it('Calls the email reset API endpoint with dfp protectedAuth', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce({
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      const client = new HeadlessPasswordClient(
        networkClient,
        subscriptionService,
        pkceManager,
        Promise.resolve({
          pkceRequiredForPasswordResets: false,
        }),
        MockDFPProtectedAuthDFPOnly(),
      );

      await expect(client.resetByEmailStart(resetByEmailStartPayload)).resolves.toEqual({
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          ...resetByEmailStartPayload,
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
        },
        method: 'POST',
        url: '/passwords/email/reset/start',
        retryCallback: expect.any(Function),
      });
    });

    describe('When PKCE is enabled', () => {
      it('Creates a new code challenge when none exist', async () => {
        expect(pkceManager.getPKPair()).toBeUndefined();

        await PKCEEnabledClient.resetByEmailStart(resetByEmailStartPayload);
        expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
          body: {
            ...resetByEmailStartPayload,
            code_challenge: MOCK_CHALLENGE,
            captcha_token: MOCK_CAPTCHA,
          },
          method: 'POST',
          url: '/passwords/email/reset/start',
          retryCallback: expect.any(Function),
        });
        expect(pkceManager.getPKPair()).toEqual(MOCK_KEYPAIR);
      });

      it('Reuses existing challenge when one exists already', async () => {
        pkceManager.setPKPair({
          code_verifier: 'Preeexisting code verifier',
          code_challenge: 'Preeexisting code challenge',
        });
        await PKCEEnabledClient.resetByEmailStart(resetByEmailStartPayload);
        expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
          body: {
            ...resetByEmailStartPayload,
            code_challenge: 'Preeexisting code challenge',
            captcha_token: MOCK_CAPTCHA,
          },
          method: 'POST',
          url: '/passwords/email/reset/start',
          retryCallback: expect.any(Function),
        });
      });
    });
  });

  describe('resetByEmail', () => {
    const resetByEmailPayload: PasswordResetByEmailOptions = {
      token: MOCK_CODE,
      password: MOCK_PASSWORD,
      session_duration_minutes: 5,
    };

    it('Calls the email reset API endpoint', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_AUTHENTICATE_PAYLOAD);
      await expect(client.resetByEmail(resetByEmailPayload)).resolves.toEqual(MOCK_AUTHENTICATE_RETURN_VALUE);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(updateSessionExpect());

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          ...resetByEmailPayload,
          captcha_token: MOCK_CAPTCHA,
        },
        method: 'POST',
        url: '/passwords/email/reset',
        retryCallback: expect.any(Function),
      });
    });

    it('Calls the email reset API endpoint with dfp protectedAuth', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_AUTHENTICATE_PAYLOAD);

      const client = new HeadlessPasswordClient(
        networkClient,
        subscriptionService,
        pkceManager,
        Promise.resolve({
          pkceRequiredForPasswordResets: false,
        }),
        MockDFPProtectedAuthDFPOnly(),
      );

      await expect(client.resetByEmail(resetByEmailPayload)).resolves.toEqual(MOCK_AUTHENTICATE_RETURN_VALUE);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(updateSessionExpect());

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          ...resetByEmailPayload,
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
        },
        method: 'POST',
        url: '/passwords/email/reset',
        retryCallback: expect.any(Function),
      });
    });

    describe('When PKCE is enabled', () => {
      it('When a PKCE transaction is in progress, a code_verifier value is pulled automatically from the manager and consumed', async () => {
        await pkceManager.startPKCETransaction();

        expect(pkceManager.getPKPair()).toEqual(MOCK_KEYPAIR);

        networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_AUTHENTICATE_PAYLOAD);

        await expect(PKCEEnabledClient.resetByEmail(resetByEmailPayload)).resolves.toEqual(
          MOCK_AUTHENTICATE_RETURN_VALUE,
        );

        expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
          body: { code_verifier: MOCK_VERIFIER, ...resetByEmailPayload, captcha_token: MOCK_CAPTCHA },
          method: 'POST',
          url: '/passwords/email/reset',
          retryCallback: expect.any(Function),
        });

        expect(pkceManager.getPKPair()).toBeUndefined();
      });

      it('When the network call to Stytch fails, the transaction is not consumed and can be used again', async () => {
        await pkceManager.startPKCETransaction();

        expect(pkceManager.getPKPair()).toEqual(MOCK_KEYPAIR);

        networkClient.retriableFetchSDK.mockRejectedValueOnce(new Error('The server is gone!'));
        await expect(PKCEEnabledClient.resetByEmail(resetByEmailPayload)).rejects.toThrow();
        expect(pkceManager.getPKPair()).toEqual(MOCK_KEYPAIR);

        // Retry, token is consumed
        networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_AUTHENTICATE_PAYLOAD);
        await PKCEEnabledClient.resetByEmail(resetByEmailPayload);
        expect(pkceManager.getPKPair()).toBeUndefined();
      });
    });
  });

  describe('resetByExistingPassword', () => {
    it('Calls the password reset by existing password API endpoint', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_AUTHENTICATE_RETURN_VALUE);

      await expect(
        client.resetByExistingPassword({
          email: 'mock_email',
          existing_password: 'mock_existing_password',
          new_password: 'mock_new_password',
          session_duration_minutes: 60,
        }),
      ).resolves.toEqual(MOCK_AUTHENTICATE_RETURN_VALUE);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(MOCK_AUTHENTICATE_RETURN_VALUE);

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        url: '/passwords/existing_password/reset',
        method: 'POST',
        body: {
          email: 'mock_email',
          existing_password: 'mock_existing_password',
          new_password: 'mock_new_password',
          session_duration_minutes: 60,
          captcha_token: MOCK_CAPTCHA,
        },
        retryCallback: expect.any(Function),
      });
    });
    it('Calls the password reset by existing password API endpoint with dfp protectedAuth', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce({
        user_id: 'mock_user_id',
        session: MOCK_SESSION,
      });

      const client = new HeadlessPasswordClient(
        networkClient,
        subscriptionService,
        pkceManager,
        Promise.resolve({
          pkceRequiredForPasswordResets: false,
        }),
        MockDFPProtectedAuthDFPAndCaptcha(),
      );

      await expect(
        client.resetByExistingPassword({
          email: 'mock_email',
          existing_password: 'mock_existing_password',
          new_password: 'mock_new_password',
          session_duration_minutes: 60,
        }),
      ).resolves.toEqual({
        user_id: 'mock_user_id',
        session: MOCK_SESSION,
      });

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        url: '/passwords/existing_password/reset',
        method: 'POST',
        body: {
          email: 'mock_email',
          existing_password: 'mock_existing_password',
          new_password: 'mock_new_password',
          session_duration_minutes: 60,
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
        },
        retryCallback: expect.any(Function),
      });
    });
  });

  describe('resetBySession', () => {
    it('Calls the password reset by session API endpoint', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce({
        session: MOCK_SESSION,
        user: MOCK_USER,
        session_token: 'session_token',
        session_jwt: 'session_jwt.xxx.xxx',
        user_id: MOCK_USER.user_id,
      });

      await expect(client.resetBySession({ password: 'mock_password', session_duration_minutes: 60 })).resolves.toEqual(
        MOCK_AUTHENTICATE_RETURN_VALUE,
      );

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        url: '/passwords/session/reset',
        method: 'POST',
        body: {
          password: 'mock_password',
          session_duration_minutes: 60,
          dfp_telemetry_id: undefined,
          captcha_token: MOCK_CAPTCHA,
        },
        retryCallback: expect.any(Function),
      });

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(MOCK_AUTHENTICATE_RETURN_VALUE);
    });
    it('Calls the password reset by session API endpoint with dfp protected auth', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce({
        session: MOCK_SESSION,
        user: MOCK_USER,
        session_token: 'session_token',
        session_jwt: 'session_jwt.xxx.xxx',
        user_id: MOCK_USER.user_id,
      });

      const client = new HeadlessPasswordClient(
        networkClient,
        subscriptionService,
        pkceManager,
        Promise.resolve({
          pkceRequiredForPasswordResets: false,
        }),
        MockDFPProtectedAuthDFPAndCaptcha(),
      );

      await expect(client.resetBySession({ password: 'mock_password', session_duration_minutes: 60 })).resolves.toEqual(
        MOCK_AUTHENTICATE_RETURN_VALUE,
      );

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        url: '/passwords/session/reset',
        method: 'POST',
        body: {
          password: 'mock_password',
          session_duration_minutes: 60,
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
          captcha_token: undefined,
        },
        retryCallback: expect.any(Function),
      });

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(MOCK_AUTHENTICATE_RETURN_VALUE);
    });
  });

  describe('strengthCheck', () => {
    it('Calls the password strength check API endpoint', async () => {
      networkClient.fetchSDK.mockResolvedValueOnce({
        valid_password: true,
        score: 4,
        breached_password: false,
        feedback: {
          suggestions: [],
          warning: '',
        },
      });

      await expect(
        client.strengthCheck({
          email: MOCK_EMAIL,
          password: MOCK_PASSWORD,
        }),
      ).resolves.toEqual({
        valid_password: true,
        score: 4,
        breached_password: false,
        feedback: {
          suggestions: [],
          warning: '',
        },
      });

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        body: { email: MOCK_EMAIL, password: MOCK_PASSWORD },
        method: 'POST',
        url: '/passwords/strength_check',
      });
    });
  });
});
