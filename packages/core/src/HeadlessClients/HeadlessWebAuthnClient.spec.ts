import * as webauthnJson from '@github/webauthn-json';
import {
  createTestFixtures,
  IConsumerSubscriptionServiceMock,
  INetworkClientMock,
  MockDFPProtectedAuth,
  MockDFPProtectedAuthDFPOnly,
} from '../testing';
import { StytchProjectConfigurationInput } from '../public/typeConfig';
import {
  MOCK_AUTHENTICATE_PAYLOAD,
  MOCK_AUTHENTICATE_RETURN_VALUE,
  MOCK_CAPTCHA,
  MOCK_DFP_TELEMTRY_ID,
  MOCK_USER,
  MOCK_WEBAUTHN_REGISTRATION,
  updateSessionExpect,
} from '@stytch/internal-mocks';
import { HeadlessWebAuthnClient } from './HeadlessWebAuthnClient';

jest.mock('@github/webauthn-json', () => ({
  get: jest.fn(),
  create: jest.fn(),
}));

describe('HeadlessWebAuthnClient', () => {
  let networkClient: INetworkClientMock;
  let subscriptionService: IConsumerSubscriptionServiceMock;
  let dfpProtectedAuth: MockDFPProtectedAuth;
  let client: HeadlessWebAuthnClient<StytchProjectConfigurationInput>;

  const MOCK_PUBLIC_KEY = { mock: 'keyopts' };
  const MOCK_CREDENTIAL = 'test_public_key_credential';

  beforeEach(() => {
    jest.resetAllMocks();
    ({ networkClient, subscriptionService, dfpProtectedAuth } = createTestFixtures());
    client = new HeadlessWebAuthnClient(networkClient, subscriptionService, dfpProtectedAuth);
  });

  describe('register', () => {
    beforeEach(() => {
      networkClient.fetchSDK
        .mockResolvedValueOnce({
          user_id: MOCK_USER,
          public_key_credential_creation_options: JSON.stringify(MOCK_PUBLIC_KEY),
        })
        .mockResolvedValueOnce({
          ...MOCK_AUTHENTICATE_PAYLOAD,
          webauthn_registration_id: 'test_id',
        });
    });

    const expectRegisterFetchSDKCall = () => {
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/webauthn/register',
        method: 'POST',
        body: {
          session_duration_minutes: 60,
          public_key_credential: JSON.stringify(MOCK_CREDENTIAL),
        },
      });
    };

    it('Automatically passes in the current document location when no options are provided', async () => {
      (webauthnJson.create as jest.Mock).mockResolvedValueOnce(MOCK_CREDENTIAL);
      await expect(client.register({ session_duration_minutes: 60 })).resolves.toEqual({
        ...MOCK_AUTHENTICATE_RETURN_VALUE,
        webauthn_registration_id: 'test_id',
      });
      expect(webauthnJson.create).toHaveBeenCalledWith({
        publicKey: MOCK_PUBLIC_KEY,
      });
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/webauthn/register/start',
        method: 'POST',
        body: {
          domain: window.location.hostname,
          user_agent: navigator.userAgent,
        },
      });
      expectRegisterFetchSDKCall();
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        updateSessionExpect({
          webauthn_registration_id: 'test_id',
        }),
      );
    });

    it('Passes a custom domain name when it is specified', async () => {
      (webauthnJson.create as jest.Mock).mockResolvedValueOnce(MOCK_CREDENTIAL);
      await expect(client.register({ session_duration_minutes: 60, domain: 'subdomain.example.com' })).resolves.toEqual(
        updateSessionExpect({
          webauthn_registration_id: 'test_id',
        }),
      );
      expect(webauthnJson.create).toHaveBeenCalledWith({
        publicKey: MOCK_PUBLIC_KEY,
      });
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/webauthn/register/start',
        method: 'POST',
        body: {
          domain: 'subdomain.example.com',
          user_agent: navigator.userAgent,
        },
      });
      expectRegisterFetchSDKCall();
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        updateSessionExpect({
          webauthn_registration_id: 'test_id',
        }),
      );
    });

    it('Passes a custom authenticator_type when it is specified', async () => {
      (webauthnJson.create as jest.Mock).mockResolvedValueOnce(MOCK_CREDENTIAL);
      await expect(
        client.register({
          session_duration_minutes: 60,
          domain: 'subdomain.example.com',
          authenticator_type: 'platform',
        }),
      ).resolves.toEqual({
        ...MOCK_AUTHENTICATE_RETURN_VALUE,
        webauthn_registration_id: 'test_id',
      });
      expect(webauthnJson.create).toHaveBeenCalledWith({
        publicKey: MOCK_PUBLIC_KEY,
      });
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/webauthn/register/start',
        method: 'POST',
        body: {
          domain: 'subdomain.example.com',
          authenticator_type: 'platform',
          user_agent: navigator.userAgent,
        },
      });
      expectRegisterFetchSDKCall();
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        updateSessionExpect({
          webauthn_registration_id: 'test_id',
        }),
      );
    });

    it('Passes a is_passkey when it is specified', async () => {
      (webauthnJson.create as jest.Mock).mockResolvedValueOnce(MOCK_CREDENTIAL);
      await expect(
        client.register({ session_duration_minutes: 60, domain: 'subdomain.example.com', is_passkey: true }),
      ).resolves.toEqual({
        ...MOCK_AUTHENTICATE_RETURN_VALUE,
        webauthn_registration_id: 'test_id',
      });
      expect(webauthnJson.create).toHaveBeenCalledWith({
        publicKey: MOCK_PUBLIC_KEY,
      });
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/webauthn/register/start',
        method: 'POST',
        body: {
          domain: 'subdomain.example.com',
          return_passkey_credential_options: true,
          user_agent: navigator.userAgent,
        },
      });
      expectRegisterFetchSDKCall();
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        updateSessionExpect({
          webauthn_registration_id: 'test_id',
        }),
      );
    });

    it('Passes override params when specified', async () => {
      (webauthnJson.create as jest.Mock).mockResolvedValueOnce(MOCK_CREDENTIAL);
      await expect(
        client.register({
          session_duration_minutes: 60,
          domain: 'subdomain.example.com',
          override_id: 'id',
          override_name: 'name',
          override_display_name: 'display_name',
        }),
      ).resolves.toEqual({
        ...MOCK_AUTHENTICATE_RETURN_VALUE,
        webauthn_registration_id: 'test_id',
      });
      expect(webauthnJson.create).toHaveBeenCalledWith({
        publicKey: MOCK_PUBLIC_KEY,
      });
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/webauthn/register/start',
        method: 'POST',
        body: {
          domain: 'subdomain.example.com',
          override_id: 'id',
          override_name: 'name',
          override_display_name: 'display_name',
          user_agent: navigator.userAgent,
        },
      });
      expectRegisterFetchSDKCall();
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        updateSessionExpect({
          webauthn_registration_id: 'test_id',
        }),
      );
    });
  });

  describe('authenticate', () => {
    beforeEach(() => {
      networkClient.fetchSDK.mockResolvedValueOnce({
        user_id: MOCK_USER,
        public_key_credential_request_options: JSON.stringify(MOCK_PUBLIC_KEY),
      });
      networkClient.retriableFetchSDK.mockResolvedValueOnce({
        ...MOCK_AUTHENTICATE_PAYLOAD,
        webauthn_registration_id: 'test_id',
      });
    });

    const expectAuthenticateFetchSDKCall = (addDFPTelemetryIDInstead?: boolean) => {
      expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
        url: '/webauthn/authenticate',
        method: 'POST',
        body: {
          session_duration_minutes: 60,
          captcha_token: addDFPTelemetryIDInstead ? undefined : MOCK_CAPTCHA,
          dfp_telemetry_id: addDFPTelemetryIDInstead ? MOCK_DFP_TELEMTRY_ID : undefined,
        },
        retryCallback: expect.any(Function),
      });
    };

    const expectWebAuthnJsonGetCall = () => {
      expect(webauthnJson.get).toHaveBeenCalledWith({
        publicKey: expect.any(Object),
        signal: expect.any(AbortSignal),
      });
      expect(webauthnJson.get).toHaveBeenCalledTimes(1);
    };

    it('Automatically passes in the current document location when no options are provided', async () => {
      await expect(client.authenticate({ session_duration_minutes: 60 })).resolves.toEqual({
        ...MOCK_AUTHENTICATE_RETURN_VALUE,
        webauthn_registration_id: 'test_id',
      });
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/webauthn/authenticate/start/primary',
        method: 'POST',
        body: {
          domain: window.location.hostname,
        },
      });
      expectAuthenticateFetchSDKCall();
      expectWebAuthnJsonGetCall();
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        updateSessionExpect({
          webauthn_registration_id: 'test_id',
        }),
      );
    });

    it('Run with dfp protected auth', async () => {
      client = new HeadlessWebAuthnClient(networkClient, subscriptionService, MockDFPProtectedAuthDFPOnly());
      await expect(client.authenticate({ session_duration_minutes: 60 })).resolves.toEqual({
        ...MOCK_AUTHENTICATE_RETURN_VALUE,
        webauthn_registration_id: 'test_id',
      });
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/webauthn/authenticate/start/primary',
        method: 'POST',
        body: {
          domain: window.location.hostname,
        },
      });
      expectWebAuthnJsonGetCall();
      expectAuthenticateFetchSDKCall(true);
    });

    it('Passes a custom domain name when it is specified', async () => {
      await expect(
        client.authenticate({ session_duration_minutes: 60, domain: 'subdomain.example.com' }),
      ).resolves.toEqual({
        ...MOCK_AUTHENTICATE_RETURN_VALUE,
        webauthn_registration_id: 'test_id',
      });
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/webauthn/authenticate/start/primary',
        method: 'POST',
        body: {
          domain: 'subdomain.example.com',
        },
      });
      expectAuthenticateFetchSDKCall();
      expectWebAuthnJsonGetCall();
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        updateSessionExpect({
          webauthn_registration_id: 'test_id',
        }),
      );
    });

    it('Passes is_passkey when it is specified', async () => {
      await expect(client.authenticate({ session_duration_minutes: 60, is_passkey: true })).resolves.toEqual({
        ...MOCK_AUTHENTICATE_RETURN_VALUE,
        webauthn_registration_id: 'test_id',
      });
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/webauthn/authenticate/start/primary',
        method: 'POST',
        body: {
          domain: window.location.hostname,
          return_passkey_credential_options: true,
        },
      });
      expectAuthenticateFetchSDKCall();
      expectWebAuthnJsonGetCall();
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        updateSessionExpect({
          webauthn_registration_id: 'test_id',
        }),
      );
    });

    it('When the user is logged in', async () => {
      subscriptionService.getSession.mockReturnValue({ mock: 'session' });

      await expect(client.authenticate({ session_duration_minutes: 60, is_passkey: true })).resolves.toEqual({
        ...MOCK_AUTHENTICATE_RETURN_VALUE,
        webauthn_registration_id: 'test_id',
      });
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/webauthn/authenticate/start/secondary',
        method: 'POST',
        body: {
          domain: window.location.hostname,
          return_passkey_credential_options: true,
        },
      });
      expectAuthenticateFetchSDKCall();
      expectWebAuthnJsonGetCall();
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        updateSessionExpect({
          webauthn_registration_id: 'test_id',
        }),
      );
    });

    it('Should call webauthnJson.get with conditional mediation when options.conditional_mediation is true and browser autofill is not supported', async () => {
      const options = {
        session_duration_minutes: 60,
        conditional_mediation: true,
      };
      // Spy on console.error before calling the client.authenticate method
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Mock browser and eligibility checks
      jest.spyOn(client, 'browserSupportsAutofill').mockResolvedValueOnce(true);
      jest.spyOn(client as any, 'checkEligibleInputs').mockReturnValueOnce(true);

      await client.authenticate(options);

      // Add your assertions to check if webauthnJson.get was called with conditional mediation
      expect(webauthnJson.get).toHaveBeenCalledWith({
        publicKey: expect.any(Object),
        signal: expect.any(AbortSignal),
        mediation: 'conditional',
      });

      expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
      // Restore the original console.error function
      consoleErrorSpy.mockRestore();
    });
    it('Passes a signal when provided in options', async () => {
      const mockSignal = new AbortController().signal; // Creating a mock AbortSignal

      await client.authenticate({
        session_duration_minutes: 60,
        signal: mockSignal, // Pass the signal in the options
      });

      expect(webauthnJson.get).toHaveBeenCalledWith(
        expect.objectContaining({
          signal: mockSignal,
        }),
      );
      expect(webauthnJson.get).toHaveBeenCalledTimes(1);
    });
    // TODO: Decide whether console.error is final behavior and if so add a test that
    //  checks if console.error is called when browser autofill is not supported
    // expect(consoleErrorSpy).toHaveBeenCalled('Browser does not support WebAuthn autofill');
    // expect(consoleErrorSpy).toHaveBeenCalledWith(
    //   'No <input> with `"webauthn"` in its `autocomplete` attribute was detected',
    // );
  });

  describe('update', () => {
    beforeEach(() => {
      networkClient.fetchSDK.mockResolvedValueOnce({
        webauthn_registration: MOCK_WEBAUTHN_REGISTRATION,
      });
    });

    const expectUpdateFetchSDKCall = () => {
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/webauthn/update/test_id',
        method: 'PUT',
        body: {
          name: 'name',
        },
      });
    };

    it('Success updating name', async () => {
      await expect(client.update({ webauthn_registration_id: 'test_id', name: 'name' })).resolves.toEqual({
        webauthn_registration: MOCK_WEBAUTHN_REGISTRATION,
      });
      expectUpdateFetchSDKCall();
    });
  });

  describe('browserSupportsAutofill', () => {
    it('should return true when conditional mediation is not supported', async () => {
      (window as any).PublicKeyCredential = {
        isConditionalMediationAvailable: jest.fn().mockResolvedValue(true),
      };

      const result = await client.browserSupportsAutofill();

      expect(result).toBe(true);
    });
    it('should return false when conditional mediation is not supported', async () => {
      (window as any).PublicKeyCredential = {
        isConditionalMediationAvailable: jest.fn().mockResolvedValue(false),
      };

      const result = await client.browserSupportsAutofill();

      expect(result).toBe(false);
    });
    it('should return false when PublicKeyCredential is not available', async () => {
      (window as any).PublicKeyCredential = undefined;
      const result = await client.browserSupportsAutofill();
      expect(result).toBe(false);
    });
    afterAll(() => {
      (window as any).PublicKeyCredential = undefined;
    });
  });
});
