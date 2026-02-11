import {
  MOCK_AUTHENTICATE_PAYLOAD,
  MOCK_AUTHENTICATE_RETURN_VALUE,
  MOCK_CAPTCHA,
  MOCK_CHALLENGE,
  MOCK_DFP_TELEMTRY_ID,
  MOCK_EMAIL,
  MOCK_KEYPAIR,
  MOCK_VERIFIER,
} from '@stytch/internal-mocks';

import { StytchProjectConfigurationInput } from '../public/typeConfig';
import {
  createTestFixtures,
  MockDFPProtectedAuthCaptchaOnly,
  MockDFPProtectedAuthDFPAndCaptcha,
  MockDFPProtectedAuthDisabled,
} from '../testing';
import { HeadlessMagicLinksClient } from './HeadlessMagicLinkClient';

describe('HeadlessMagicLinksClient', () => {
  const {
    networkClient,
    subscriptionService,
    pkceManager,
    secondPKCEManager: passwordsPKCEManager,
  } = createTestFixtures();
  let client: HeadlessMagicLinksClient<StytchProjectConfigurationInput>;

  beforeAll(() => {
    client = new HeadlessMagicLinksClient(
      networkClient,
      subscriptionService,
      pkceManager,
      passwordsPKCEManager,
      Promise.resolve({
        pkceRequiredForEmailMagicLinks: true,
      }),
      MockDFPProtectedAuthDisabled(),
    );
  });

  beforeEach(() => {
    jest.resetAllMocks();
    pkceManager.clearPKPair();
    passwordsPKCEManager.clearPKPair();
  });

  describe('magicLinks.email.loginOrCreate', () => {
    beforeEach(() => {
      networkClient.fetchSDK.mockResolvedValue({
        status_code: 200,
      });
    });

    it('Passes through all options', async () => {
      await client.email.loginOrCreate(MOCK_EMAIL, {
        locale: 'en',
        signup_expiration_minutes: 60,
        login_expiration_minutes: 60,
        signup_magic_link_url: 'https://example.com/signup',
        login_magic_link_url: 'https://example.com/login',
        signup_template_id: 'signup-template',
        login_template_id: 'login-template',
      });
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          code_challenge: MOCK_CHALLENGE,
          email: MOCK_EMAIL,
          locale: 'en',
          signup_expiration_minutes: 60,
          login_expiration_minutes: 60,
          signup_magic_link_url: 'https://example.com/signup',
          login_magic_link_url: 'https://example.com/login',
          signup_template_id: 'signup-template',
          login_template_id: 'login-template',
        },
        method: 'POST',
        url: '/magic_links/email/login_or_create',
        retryCallback: expect.any(Function),
      });
    });

    it('Creates a new code challenge when none exist', async () => {
      expect(pkceManager.getPKPair()).toBeUndefined();

      await client.email.loginOrCreate(MOCK_EMAIL);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          code_challenge: MOCK_CHALLENGE,
          email: MOCK_EMAIL,
        },
        method: 'POST',
        url: '/magic_links/email/login_or_create',
        retryCallback: expect.any(Function),
      });
      expect(pkceManager.getPKPair()).toEqual(MOCK_KEYPAIR);
    });

    it('Reuses existing challenge when one exists already', async () => {
      pkceManager.setPKPair({
        code_verifier: 'Preeexisting code verifier',
        code_challenge: 'Preeexisting code challenge',
      });

      await client.email.loginOrCreate(MOCK_EMAIL);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          code_challenge: 'Preeexisting code challenge',
          email: MOCK_EMAIL,
        },
        method: 'POST',
        url: '/magic_links/email/login_or_create',
        retryCallback: expect.any(Function),
      });
    });

    it('When recaptcha is enabled, the recaptcha token is passed into the request', async () => {
      // client with recaptcha
      const clientWithCaptcha = new HeadlessMagicLinksClient(
        networkClient,
        subscriptionService,
        pkceManager,
        pkceManager,
        Promise.resolve({
          pkceRequiredForEmailMagicLinks: false,
        }),
        MockDFPProtectedAuthCaptchaOnly(),
      );

      await clientWithCaptcha.email.loginOrCreate(MOCK_EMAIL);

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: { captcha_token: MOCK_CAPTCHA, email: MOCK_EMAIL },
        method: 'POST',
        url: '/magic_links/email/login_or_create',
        retryCallback: expect.any(Function),
      });
    });

    it('when dfpProtectedAUth is enabled, the dfp_telemetry_id is passed into the request', async () => {
      // client with dfpProtectedAuth enabled
      const clientWithDFPProtectedAUth = new HeadlessMagicLinksClient(
        networkClient,
        subscriptionService,
        pkceManager,
        pkceManager,
        Promise.resolve({
          pkceRequiredForEmailMagicLinks: false,
        }),
        MockDFPProtectedAuthDFPAndCaptcha(),
      );

      await clientWithDFPProtectedAUth.email.loginOrCreate(MOCK_EMAIL);

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: { dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID, email: MOCK_EMAIL },
        method: 'POST',
        url: '/magic_links/email/login_or_create',
        retryCallback: expect.any(Function),
      });
    });
  });

  describe('send', () => {
    it('Passes through all options', async () => {
      await client.email.send(MOCK_EMAIL, {
        locale: 'en',
        signup_expiration_minutes: 60,
        login_expiration_minutes: 60,
        signup_magic_link_url: 'https://example.com/signup',
        login_magic_link_url: 'https://example.com/login',
        signup_template_id: 'signup-template',
        login_template_id: 'login-template',
      });
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          email: MOCK_EMAIL,
          code_challenge: MOCK_CHALLENGE,
          locale: 'en',
          signup_expiration_minutes: 60,
          login_expiration_minutes: 60,
          signup_magic_link_url: 'https://example.com/signup',
          login_magic_link_url: 'https://example.com/login',
          signup_template_id: 'signup-template',
          login_template_id: 'login-template',
        },
        method: 'POST',
        url: '/magic_links/email/send/primary',
        retryCallback: expect.any(Function),
      });
    });
    it('Calls the email magic links send method as a primary factor', async () => {
      await client.email.send(MOCK_EMAIL);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: { email: MOCK_EMAIL, code_challenge: MOCK_CHALLENGE },
        method: 'POST',
        url: '/magic_links/email/send/primary',
        retryCallback: expect.any(Function),
      });
    });
    it('Calls the email magic links send method as a secondary factor', async () => {
      subscriptionService.getSession.mockReturnValue({ mock: 'session' });

      await client.email.send(MOCK_EMAIL);
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: { email: MOCK_EMAIL, code_challenge: MOCK_CHALLENGE },
        method: 'POST',
        url: '/magic_links/email/send/secondary',
        retryCallback: expect.any(Function),
      });
    });
    it('when dfpProtectedAUth is enabled, the dfp_telemetry_id is passed into the request', async () => {
      // client with dfpProtectedAuth enabled
      const clientWithDFPProtectedAUth = new HeadlessMagicLinksClient(
        networkClient,
        subscriptionService,
        pkceManager,
        pkceManager,
        Promise.resolve({
          pkceRequiredForEmailMagicLinks: false,
        }),
        MockDFPProtectedAuthDFPAndCaptcha(),
      );

      await clientWithDFPProtectedAUth.email.send(MOCK_EMAIL);

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: { dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID, email: MOCK_EMAIL },
        method: 'POST',
        url: '/magic_links/email/send/primary',
        retryCallback: expect.any(Function),
      });
    });
  });

  describe('magicLinks.authenticate', () => {
    beforeEach(() => {
      networkClient.fetchSDK.mockResolvedValue(MOCK_AUTHENTICATE_PAYLOAD);
    });

    it('When no PKCE transaction is in progress, no code verifier is submitted', async () => {
      await client.authenticate('token', {
        session_duration_minutes: 10,
      });
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        body: { session_duration_minutes: 10, token: 'token' },
        method: 'POST',
        url: '/magic_links/authenticate',
      });
    });

    it('When a PKCE transaction is in progress, a code_verifier value is pulled automatically from the manager and consumed', async () => {
      await client.email.loginOrCreate('email@stytch.com');

      expect(pkceManager.getPKPair()).toEqual(MOCK_KEYPAIR);

      const res = await client.authenticate('token', {
        session_duration_minutes: 10,
      });

      expect(res).toEqual(MOCK_AUTHENTICATE_RETURN_VALUE);

      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        body: { code_verifier: MOCK_VERIFIER, session_duration_minutes: 10, token: 'token' },
        method: 'POST',
        url: '/magic_links/authenticate',
      });

      expect(pkceManager.getPKPair()).toBeUndefined();
    });

    it('When the network call to Stytch fails, the transaction is not consumed and can be used again', async () => {
      await client.email.loginOrCreate('email@stytch.com');

      expect(pkceManager.getPKPair()).toEqual(MOCK_KEYPAIR);

      networkClient.fetchSDK.mockRejectedValueOnce(new Error('The server is gone!'));
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

    it('tries both pkce namespaces when authenticating', async () => {
      await client.email.loginOrCreate('email@stytch.com');
      passwordsPKCEManager.startPKCETransaction();

      expect(pkceManager.getPKPair()).toEqual(MOCK_KEYPAIR);
      expect(passwordsPKCEManager.getPKPair()).toEqual(MOCK_KEYPAIR);

      await client.authenticate('token', {
        session_duration_minutes: 10,
      });

      expect(pkceManager.getPKPair()).toEqual(MOCK_KEYPAIR);
      expect(passwordsPKCEManager.getPKPair()).toBeUndefined();

      await client.authenticate('token', {
        session_duration_minutes: 10,
      });

      expect(pkceManager.getPKPair()).toBeUndefined();
      expect(passwordsPKCEManager.getPKPair()).toBeUndefined();
    });

    it('If the first authenticate call fails with a PKCE error, attempt to authenticate again with magic_links namespace', async () => {
      await client.email.loginOrCreate('email@stytch.com');
      passwordsPKCEManager.startPKCETransaction();

      expect(pkceManager.getPKPair()).toEqual(MOCK_KEYPAIR);
      expect(passwordsPKCEManager.getPKPair()).toEqual(MOCK_KEYPAIR);

      networkClient.fetchSDK.mockRejectedValueOnce(new Error('pkce_error'));

      await client.authenticate('token', {
        session_duration_minutes: 10,
      });

      expect(passwordsPKCEManager.getPKPair()).toEqual(MOCK_KEYPAIR);
      expect(pkceManager.getPKPair()).toBeUndefined();
    });
  });
});
