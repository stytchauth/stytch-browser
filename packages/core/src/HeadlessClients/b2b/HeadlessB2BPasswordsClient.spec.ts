import {
  MOCK_B2B_AUTHENTICATE_PAYLOAD,
  MOCK_B2B_AUTHENTICATE_RETURN_VALUE,
  MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD,
  MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD,
  MOCK_CAPTCHA,
  MOCK_CHALLENGE,
  MOCK_CODE,
  MOCK_DFP_TELEMTRY_ID,
  MOCK_EMAIL,
  MOCK_KEYPAIR,
  MOCK_ORG_ID,
  MOCK_PASSWORD,
  MOCK_REQUEST_ID,
  MOCK_VERIFIER,
} from '@stytch/internal-mocks';

import { DisabledDFPProtectedAuthProvider } from '../../DFPProtectedAuthProvider';
import {
  B2BPasswordResetByEmailOptions,
  B2BPasswordResetByEmailStartOptions,
  StytchProjectConfigurationInput,
} from '../../public';
import {
  createB2BTestFixtures,
  IB2BSubscriptionServiceMock,
  INetworkClientMock,
  MockDFPProtectedAuthCaptchaOnly,
  MockDFPProtectedAuthDFPOnly,
  MockPKCEManager,
} from '../../testing';
import { HeadlessB2BPasswordsClient } from './HeadlessB2BPasswordsClient';

describe('HeadlessB2BPasswordsClient', () => {
  let networkClient: INetworkClientMock;
  let subscriptionService: IB2BSubscriptionServiceMock;
  let pkceManager: MockPKCEManager;
  let client: HeadlessB2BPasswordsClient<StytchProjectConfigurationInput>;
  let PKCEEnabledClient: HeadlessB2BPasswordsClient<StytchProjectConfigurationInput>;

  beforeEach(() => {
    jest.resetAllMocks();

    ({ networkClient, subscriptionService, pkceManager } = createB2BTestFixtures());
    client = new HeadlessB2BPasswordsClient(
      networkClient,
      subscriptionService,
      pkceManager,
      Promise.resolve({
        pkceRequiredForPasswordResets: false,
      }),
      MockDFPProtectedAuthCaptchaOnly(),
    );

    PKCEEnabledClient = new HeadlessB2BPasswordsClient(
      networkClient,
      subscriptionService,
      pkceManager,
      Promise.resolve({
        pkceRequiredForPasswordResets: true,
      }),
      DisabledDFPProtectedAuthProvider(),
    );
  });

  describe('authenticate', () => {
    it('Calls the password create API endpoint', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);

      await expect(
        client.authenticate({
          organization_id: MOCK_ORG_ID,
          email_address: MOCK_EMAIL,
          password: MOCK_PASSWORD,
          session_duration_minutes: 10,
          locale: 'es',
        }),
      ).resolves.toEqual(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD,
      );

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          email_address: MOCK_EMAIL,
          organization_id: MOCK_ORG_ID,
          password: MOCK_PASSWORD,
          session_duration_minutes: 10,
          captcha_token: MOCK_CAPTCHA,
          locale: 'es',
        },
        method: 'POST',
        url: '/b2b/passwords/authenticate',
        retryCallback: expect.any(Function),
      });
    });

    it('Calls the password create API endpoint with dfp protected auth', async () => {
      const dfpClient = new HeadlessB2BPasswordsClient(
        networkClient,
        subscriptionService,
        pkceManager,
        Promise.resolve({
          pkceRequiredForPasswordResets: false,
        }),
        MockDFPProtectedAuthDFPOnly(),
      );

      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);

      await expect(
        dfpClient.authenticate({
          organization_id: MOCK_ORG_ID,
          email_address: MOCK_EMAIL,
          password: MOCK_PASSWORD,
          session_duration_minutes: 10,
          locale: 'es',
        }),
      ).resolves.toEqual(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD,
      );

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          email_address: MOCK_EMAIL,
          organization_id: MOCK_ORG_ID,
          password: MOCK_PASSWORD,
          session_duration_minutes: 10,
          dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
          locale: 'es',
        },
        method: 'POST',
        url: '/b2b/passwords/authenticate',
        retryCallback: expect.any(Function),
      });
    });

    it('Updates the IST when an IST is returned', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD);

      await expect(
        client.authenticate({
          organization_id: MOCK_ORG_ID,
          email_address: MOCK_EMAIL,
          password: MOCK_PASSWORD,
          session_duration_minutes: 10,
          locale: 'es',
        }),
      ).resolves.toEqual(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD);

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          email_address: MOCK_EMAIL,
          organization_id: MOCK_ORG_ID,
          password: MOCK_PASSWORD,
          session_duration_minutes: 10,
          captcha_token: MOCK_CAPTCHA,
          locale: 'es',
        },
        method: 'POST',
        url: '/b2b/passwords/authenticate',
        retryCallback: expect.any(Function),
      });
    });
  });

  describe('resetByEmailStart', () => {
    const resetByEmailStartPayload: B2BPasswordResetByEmailStartOptions = {
      organization_id: MOCK_ORG_ID,
      email_address: MOCK_EMAIL,
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
        url: '/b2b/passwords/email/reset/start',
        retryCallback: expect.any(Function),
      });
    });

    it('Calls the email reset API endpoint with dfp protected auth', async () => {
      const dfpClient = new HeadlessB2BPasswordsClient(
        networkClient,
        subscriptionService,
        pkceManager,
        Promise.resolve({
          pkceRequiredForPasswordResets: false,
        }),
        MockDFPProtectedAuthCaptchaOnly(),
      );
      networkClient.retriableFetchSDK.mockResolvedValueOnce({
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      await expect(dfpClient.resetByEmailStart(resetByEmailStartPayload)).resolves.toEqual({
        request_id: MOCK_REQUEST_ID,
        status_code: 200,
      });

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          ...resetByEmailStartPayload,
          captcha_token: MOCK_CAPTCHA,
        },
        method: 'POST',
        url: '/b2b/passwords/email/reset/start',
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
          },
          method: 'POST',
          url: '/b2b/passwords/email/reset/start',
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
          },
          method: 'POST',
          url: '/b2b/passwords/email/reset/start',
          retryCallback: expect.any(Function),
        });
      });
    });
  });

  describe('resetByEmail', () => {
    const resetByEmailPayload: B2BPasswordResetByEmailOptions = {
      password_reset_token: MOCK_CODE,
      password: MOCK_PASSWORD,
      session_duration_minutes: 5,
      locale: 'en',
    };

    it('Calls the email reset API endpoint', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);

      await expect(client.resetByEmail(resetByEmailPayload)).resolves.toEqual(
        MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD,
      );

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD,
      );

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          ...resetByEmailPayload,
          captcha_token: MOCK_CAPTCHA,
        },
        method: 'POST',
        url: '/b2b/passwords/email/reset',
        retryCallback: expect.any(Function),
      });
    });

    it('Calls the email reset API endpoint with dfp protected auth', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);

      await expect(client.resetByEmail(resetByEmailPayload)).resolves.toEqual(
        MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD,
      );

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD,
      );

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          ...resetByEmailPayload,
          captcha_token: MOCK_CAPTCHA,
        },
        method: 'POST',
        url: '/b2b/passwords/email/reset',
        retryCallback: expect.any(Function),
      });
    });

    it('Updates the IST when an IST is returned', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD);

      await expect(client.resetByEmail(resetByEmailPayload)).resolves.toEqual(
        MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD,
      );

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD);

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          ...resetByEmailPayload,
          captcha_token: MOCK_CAPTCHA,
        },
        method: 'POST',
        url: '/b2b/passwords/email/reset',
        retryCallback: expect.any(Function),
      });
    });

    describe('When PKCE is enabled', () => {
      it('When a PKCE transaction is in progress, a code_verifier value is pulled automatically from the manager and consumed', async () => {
        await pkceManager.startPKCETransaction();

        expect(pkceManager.getPKPair()).toEqual(MOCK_KEYPAIR);

        networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_PAYLOAD);

        await expect(PKCEEnabledClient.resetByEmail(resetByEmailPayload)).resolves.toEqual(
          MOCK_B2B_AUTHENTICATE_RETURN_VALUE,
        );

        expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
          body: { code_verifier: MOCK_VERIFIER, ...resetByEmailPayload },
          method: 'POST',
          url: '/b2b/passwords/email/reset',
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
        networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_PAYLOAD);
        await PKCEEnabledClient.resetByEmail(resetByEmailPayload);
        expect(pkceManager.getPKPair()).toBeUndefined();
      });
    });
  });

  describe('resetByExistingPassword', () => {
    it('Calls the password reset by existing password API endpoint', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);

      await expect(
        client.resetByExistingPassword({
          organization_id: MOCK_ORG_ID,
          email_address: 'mock_email',
          existing_password: 'mock_existing_password',
          new_password: 'mock_new_password',
          session_duration_minutes: 60,
          locale: 'pt-br',
        }),
      ).resolves.toEqual(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD,
      );

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        url: '/b2b/passwords/existing_password/reset',
        method: 'POST',
        body: {
          organization_id: MOCK_ORG_ID,
          email_address: 'mock_email',
          existing_password: 'mock_existing_password',
          new_password: 'mock_new_password',
          session_duration_minutes: 60,
          locale: 'pt-br',
          captcha_token: MOCK_CAPTCHA,
        },
        retryCallback: expect.any(Function),
      });
    });

    it('Updates the IST is an IST is returned', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD);

      await expect(
        client.resetByExistingPassword({
          organization_id: MOCK_ORG_ID,
          email_address: 'mock_email',
          existing_password: 'mock_existing_password',
          new_password: 'mock_new_password',
          session_duration_minutes: 60,
          locale: 'pt-br',
        }),
      ).resolves.toEqual(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD);

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        url: '/b2b/passwords/existing_password/reset',
        method: 'POST',
        body: {
          organization_id: MOCK_ORG_ID,
          email_address: 'mock_email',
          existing_password: 'mock_existing_password',
          new_password: 'mock_new_password',
          session_duration_minutes: 60,
          locale: 'pt-br',
          captcha_token: MOCK_CAPTCHA,
        },
        retryCallback: expect.any(Function),
      });
    });
  });

  describe('resetBySession', () => {
    it('Calls the password reset by session API endpoint', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_PAYLOAD);

      await expect(client.resetBySession({ password: 'mock_password' })).resolves.toEqual(
        MOCK_B2B_AUTHENTICATE_RETURN_VALUE,
      );

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        url: '/b2b/passwords/session/reset',
        method: 'POST',
        body: {
          password: 'mock_password',
          captcha_token: MOCK_CAPTCHA,
        },
        retryCallback: expect.any(Function),
      });

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(MOCK_B2B_AUTHENTICATE_PAYLOAD);
    });
  });

  describe('strengthCheck', () => {
    it('Calls the password strength check API endpoint', async () => {
      networkClient.fetchSDK.mockResolvedValueOnce({
        valid_password: true,
        score: 4,
        breached_password: false,
        zxcvbn_feedback: {
          suggestions: [],
          warning: '',
        },
      });

      await expect(
        client.strengthCheck({
          email_address: MOCK_EMAIL,
          password: MOCK_PASSWORD,
        }),
      ).resolves.toEqual({
        valid_password: true,
        score: 4,
        breached_password: false,
        zxcvbn_feedback: {
          suggestions: [],
          warning: '',
        },
      });

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        body: { email_address: MOCK_EMAIL, password: MOCK_PASSWORD },
        method: 'POST',
        url: '/b2b/passwords/strength_check',
      });
    });
  });
});
