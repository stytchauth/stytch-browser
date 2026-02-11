import { createB2BTestFixtures, MockDFPProtectedAuthCaptchaOnly } from '../../testing';
import { StytchProjectConfigurationInput } from '../../public/typeConfig';
import {
  MOCK_B2B_AUTHENTICATE_PAYLOAD,
  MOCK_B2B_AUTHENTICATE_RETURN_VALUE,
  MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD,
  MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD,
  MOCK_B2B_DISCOVERY_AUTHENTICATE_PAYLOAD,
  MOCK_CAPTCHA,
  MOCK_CHALLENGE,
  MOCK_EMAIL,
  MOCK_KEYPAIR,
  MOCK_MEMBER_COMMON_RESPONSE,
  MOCK_ORG_ID,
  MOCK_VERIFIER,
} from '@stytch/internal-mocks';
import { HeadlessB2BMagicLinksClient } from './HeadlessB2BMagicLinkClient';

describe('HeadlessB2BMagicLinksClient', () => {
  const {
    networkClient,
    subscriptionService,
    pkceManager,
    secondPKCEManager: passwordsPKCEManager,
  } = createB2BTestFixtures();
  let client: HeadlessB2BMagicLinksClient<StytchProjectConfigurationInput>;

  beforeAll(() => {
    client = new HeadlessB2BMagicLinksClient(
      networkClient,
      subscriptionService,
      pkceManager,
      passwordsPKCEManager,
      Promise.resolve({
        pkceRequiredForEmailMagicLinks: true,
      }),
      MockDFPProtectedAuthCaptchaOnly(),
    );
  });

  beforeEach(() => {
    jest.resetAllMocks();
    pkceManager.clearPKPair();
    passwordsPKCEManager.clearPKPair();
  });

  describe('magicLinks.email.invite', () => {
    it('calls the backend API', async () => {
      networkClient.fetchSDK.mockResolvedValue(MOCK_MEMBER_COMMON_RESPONSE);

      await expect(client.email.invite({ email_address: MOCK_EMAIL, locale: 'pt-br' })).resolves.toEqual(
        MOCK_MEMBER_COMMON_RESPONSE,
      );
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        body: {
          email_address: MOCK_EMAIL,
          locale: 'pt-br',
        },
        method: 'POST',
        url: '/b2b/magic_links/email/invite',
      });
    });
  });

  describe('magicLinks.email.loginOrSignup', () => {
    beforeEach(() => {
      networkClient.fetchSDK.mockResolvedValue({
        status_code: 200,
      });
    });

    it('Creates a new code challenge when none exist', async () => {
      expect(pkceManager.getPKPair()).toBeUndefined();

      await client.email.loginOrSignup({ email_address: MOCK_EMAIL, organization_id: MOCK_ORG_ID });
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        body: {
          pkce_code_challenge: MOCK_CHALLENGE,
          email_address: MOCK_EMAIL,
          organization_id: MOCK_ORG_ID,
        },
        method: 'POST',
        url: '/b2b/magic_links/email/login_or_signup',
      });
      expect(pkceManager.getPKPair()).toEqual(MOCK_KEYPAIR);
    });

    it('Reuses existing challenge when one exists already', async () => {
      pkceManager.setPKPair({
        code_verifier: 'Preexisting code verifier',
        code_challenge: 'Preexisting code challenge',
      });

      await client.email.loginOrSignup({ email_address: MOCK_EMAIL, organization_id: MOCK_ORG_ID });
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        body: {
          pkce_code_challenge: 'Preexisting code challenge',
          email_address: MOCK_EMAIL,
          organization_id: MOCK_ORG_ID,
        },
        method: 'POST',
        url: '/b2b/magic_links/email/login_or_signup',
      });
    });

    it('Succeeds with a locale argument', async () => {
      expect(pkceManager.getPKPair()).toBeUndefined();

      await client.email.loginOrSignup({ email_address: MOCK_EMAIL, organization_id: MOCK_ORG_ID, locale: 'pt-br' });
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        body: {
          pkce_code_challenge: MOCK_CHALLENGE,
          email_address: MOCK_EMAIL,
          organization_id: MOCK_ORG_ID,
          locale: 'pt-br',
        },
        method: 'POST',
        url: '/b2b/magic_links/email/login_or_signup',
      });
      expect(pkceManager.getPKPair()).toEqual(MOCK_KEYPAIR);
    });
  });

  describe('magicLinks.authenticate', () => {
    beforeEach(() => {
      networkClient.retriableFetchSDK.mockResolvedValue(MOCK_B2B_AUTHENTICATE_PAYLOAD);
    });

    it('When no PKCE transaction is in progress, no code verifier is submitted', async () => {
      await client.authenticate({
        magic_links_token: 'token',
        session_duration_minutes: 10,
        locale: 'es',
      });
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: { session_duration_minutes: 10, magic_links_token: 'token', locale: 'es', captcha_token: MOCK_CAPTCHA },
        method: 'POST',
        url: '/b2b/magic_links/authenticate',
        retryCallback: expect.any(Function),
      });
    });

    it('When a PKCE transaction is in progress, a code_verifier value is pulled automatically from the manager and consumed', async () => {
      await client.email.loginOrSignup({ email_address: MOCK_EMAIL, organization_id: MOCK_ORG_ID });

      expect(pkceManager.getPKPair()).toEqual(MOCK_KEYPAIR);

      const res = await client.authenticate({
        magic_links_token: 'token',
        session_duration_minutes: 10,
      });

      expect(res).toEqual(MOCK_B2B_AUTHENTICATE_RETURN_VALUE);

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          pkce_code_verifier: MOCK_VERIFIER,
          session_duration_minutes: 10,
          magic_links_token: 'token',
          captcha_token: MOCK_CAPTCHA,
        },
        method: 'POST',
        url: '/b2b/magic_links/authenticate',
        retryCallback: expect.any(Function),
      });

      expect(pkceManager.getPKPair()).toBeUndefined();
    });

    it('tries both pkce namespaces when authenticating', async () => {
      await client.email.loginOrSignup({ email_address: MOCK_EMAIL, organization_id: MOCK_ORG_ID });
      passwordsPKCEManager.startPKCETransaction();

      expect(pkceManager.getPKPair()).toEqual(MOCK_KEYPAIR);
      expect(passwordsPKCEManager.getPKPair()).toEqual(MOCK_KEYPAIR);

      await client.authenticate({
        magic_links_token: 'token',
        session_duration_minutes: 10,
      });

      expect(pkceManager.getPKPair()).toEqual(MOCK_KEYPAIR);
      expect(passwordsPKCEManager.getPKPair()).toBeUndefined();

      await client.authenticate({
        magic_links_token: 'token',
        session_duration_minutes: 10,
      });

      expect(pkceManager.getPKPair()).toBeUndefined();
      expect(passwordsPKCEManager.getPKPair()).toBeUndefined();
    });

    it('If the first authenticate call fails with a PKCE error, attempt to authenticate again with magic_links namespace', async () => {
      await client.email.loginOrSignup({ email_address: MOCK_EMAIL, organization_id: MOCK_ORG_ID });
      passwordsPKCEManager.startPKCETransaction();

      expect(pkceManager.getPKPair()).toEqual(MOCK_KEYPAIR);
      expect(passwordsPKCEManager.getPKPair()).toEqual(MOCK_KEYPAIR);

      networkClient.retriableFetchSDK.mockRejectedValueOnce(new Error('pkce_error'));

      await client.authenticate({
        magic_links_token: 'token',
        session_duration_minutes: 10,
      });

      expect(passwordsPKCEManager.getPKPair()).toEqual(MOCK_KEYPAIR);
      expect(pkceManager.getPKPair()).toBeUndefined();
    });

    it('Calls the backend API and updates the state when a session is returned', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);
      const res = await client.authenticate({
        magic_links_token: 'token',
        session_duration_minutes: 10,
        locale: 'es',
      });
      expect(res).toEqual(MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD,
      );

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: { session_duration_minutes: 10, magic_links_token: 'token', locale: 'es', captcha_token: MOCK_CAPTCHA },
        method: 'POST',
        url: '/b2b/magic_links/authenticate',
        retryCallback: expect.any(Function),
      });
    });

    it('Calls the backend API and updates the IST when an IST is returned', async () => {
      networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD);
      const res = await client.authenticate({
        magic_links_token: 'token',
        session_duration_minutes: 10,
        locale: 'es',
      });
      expect(res).toEqual(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD);

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD);

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: { session_duration_minutes: 10, magic_links_token: 'token', locale: 'es', captcha_token: MOCK_CAPTCHA },
        method: 'POST',
        url: '/b2b/magic_links/authenticate',
        retryCallback: expect.any(Function),
      });
    });
  });

  describe('magicLinks.email.discovery.send', () => {
    beforeEach(() => {
      networkClient.fetchSDK.mockResolvedValue({
        status_code: 200,
      });
    });

    it('Creates a new code challenge when none exist', async () => {
      expect(pkceManager.getPKPair()).toBeUndefined();

      await client.email.discovery.send({ email_address: MOCK_EMAIL });
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          captcha_token: MOCK_CAPTCHA,
          pkce_code_challenge: MOCK_CHALLENGE,
          email_address: MOCK_EMAIL,
        },
        method: 'POST',
        url: '/b2b/magic_links/email/discovery/send',
        retryCallback: expect.any(Function),
      });
      expect(pkceManager.getPKPair()).toEqual(MOCK_KEYPAIR);
    });

    it('Reuses existing challenge when one exists already', async () => {
      pkceManager.setPKPair({
        code_verifier: 'Preexisting code verifier',
        code_challenge: 'Preexisting code challenge',
      });

      await client.email.discovery.send({ email_address: MOCK_EMAIL });
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          captcha_token: MOCK_CAPTCHA,
          pkce_code_challenge: 'Preexisting code challenge',
          email_address: MOCK_EMAIL,
        },
        method: 'POST',
        url: '/b2b/magic_links/email/discovery/send',
        retryCallback: expect.any(Function),
      });
    });

    it('Succeeds with a locale argument', async () => {
      expect(pkceManager.getPKPair()).toBeUndefined();

      await client.email.discovery.send({ email_address: MOCK_EMAIL, locale: 'es' });
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: {
          captcha_token: MOCK_CAPTCHA,
          pkce_code_challenge: MOCK_CHALLENGE,
          email_address: MOCK_EMAIL,
          locale: 'es',
        },
        method: 'POST',
        url: '/b2b/magic_links/email/discovery/send',
        retryCallback: expect.any(Function),
      });
      expect(pkceManager.getPKPair()).toEqual(MOCK_KEYPAIR);
    });
  });

  describe('magicLinks.discovery.authenticate', () => {
    beforeEach(() => {
      networkClient.retriableFetchSDK.mockResolvedValue(MOCK_B2B_DISCOVERY_AUTHENTICATE_PAYLOAD);
    });

    it('When no PKCE transaction is in progress, no code verifier is submitted', async () => {
      await client.discovery.authenticate({
        discovery_magic_links_token: 'token',
      });
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: { discovery_magic_links_token: 'token', captcha_token: MOCK_CAPTCHA },
        method: 'POST',
        url: '/b2b/magic_links/discovery/authenticate',
        retryCallback: expect.any(Function),
      });
    });

    it('When a PKCE transaction is in progress, a code_verifier value is pulled automatically from the manager and consumed', async () => {
      await client.email.discovery.send({ email_address: MOCK_EMAIL });

      expect(pkceManager.getPKPair()).toEqual(MOCK_KEYPAIR);

      const res = await client.discovery.authenticate({
        discovery_magic_links_token: 'token',
      });

      expect(res).toEqual(MOCK_B2B_DISCOVERY_AUTHENTICATE_PAYLOAD);

      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        body: { pkce_code_verifier: MOCK_VERIFIER, discovery_magic_links_token: 'token', captcha_token: MOCK_CAPTCHA },
        method: 'POST',
        url: '/b2b/magic_links/discovery/authenticate',
        retryCallback: expect.any(Function),
      });

      expect(subscriptionService.updateSession).toHaveBeenCalledWith(MOCK_B2B_DISCOVERY_AUTHENTICATE_PAYLOAD);

      expect(pkceManager.getPKPair()).toBeUndefined();
    });
  });
});
