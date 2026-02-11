import { StytchProjectConfigurationInput } from '@stytch/core/public';
import {
  createTestFixtures,
  IConsumerSubscriptionServiceMock,
  INetworkClientMock,
  MockDFPProtectedAuthDFPOnly,
} from './testUtils';
import {
  MOCK_AUTHENTICATE_PAYLOAD,
  MOCK_AUTHENTICATE_RETURN_VALUE,
  MOCK_CAPTCHA,
  MOCK_DFP_TELEMETRY_ID,
  MOCK_USER,
  MOCK_WEBAUTHN_REGISTRATION,
  updateSessionExpect,
} from './mocks';
import { HeadlessWebAuthnClient } from './WebAuthnClient';

const registerMock = jest.fn();
const authenticateMock = jest.fn();
const getUserAgentMock = jest.fn();

jest.mock('./native-module', function () {
  return {
    __esModule: true,
    default: class {
      Passkeys = {
        register: registerMock,
        authenticate: authenticateMock,
      };
      DeviceInfo = {
        getUserAgent: getUserAgentMock,
      };
    },
  };
});

describe('HeadlessWebAuthnClient', () => {
  let networkClient: INetworkClientMock;
  let subscriptionService: IConsumerSubscriptionServiceMock;
  let dfpProtectedAuth;
  let client: HeadlessWebAuthnClient<StytchProjectConfigurationInput>;

  const MOCK_USER_AGENT = { userAgent: 'mock_user_agent' };
  const MOCK_PUBLIC_KEY_CREDENTIAL_OPTIONS = { mock: 'keyopts' };
  const MOCK_PUBLIC_KEY_CREDENTIALS = {
    publicKeyCredential:
      '{"type":"public-key","id":"Ab6y28pCs5bVRIzSmrlufidfR57gRlEZ-KSTVGJYdkwAfR_SeaVXvdW6ND_XljM25cXYI-dSwrhjuNsj1L3uC0BHqN3mBQIzSswJneTv08RbDNZOLhjiwOEnQ03uPbL5eA7EcyinClOU_qwPMf5lowW1NSTWtaFvOlY","rawId":"Ab6y28pCs5bVRIzSmrlufidfR57gRlEZ-KSTVGJYdkwAfR_SeaVXvdW6ND_XljM25cXYI-dSwrhjuNsj1L3uC0BHqN3mBQIzSswJneTv08RbDNZOLhjiwOEnQ03uPbL5eA7EcyinClOU_qwPMf5lowW1NSTWtaFvOlY","response":{"clientDataJSON":"eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiaFladExOVDlTSWdacVBuS2ZiblFYM25DSjdOYXZUVF9TNm9DOVhSRVl2MEYiLCJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJjcm9zc09yaWdpbiI6ZmFsc2V9","attestationObject":"o2NmbXRmcGFja2VkZ2F0dFN0bXSiY2FsZyZjc2lnWEYwRAIgLEvyXrb_aMCVOjpYBLpm3cPaaquDN0ouXaL27SF9Lp0CIB2f56tWUDvs6oBl3pMxIIrJqJhZKkK7btJtWVDLsFFbaGF1dGhEYXRhWP5Jlg3liA6MaHQ0Fw9kdmBbj-SuuaKGMseZXPO6gx2XY0VheZqwrc4AAjW8xgpkiwsl8fBVAwB6Ab6y28pCs5bVRIzSmrlufidfR57gRlEZ-KSTVGJYdkwAfR_SeaVXvdW6ND_XljM25cXYI-dSwrhjuNsj1L3uC0BHqN3mBQIzSswJneTv08RbDNZOLhjiwOEnQ03uPbL5eA7EcyinClOU_qwPMf5lowW1NSTWtaFvOlalAQIDJiABIVggFCI-4HODPxlfeBwfFyzQG_btRm_pB6mb9E1E-rANMwoiWCBCr6C2SQOGElh9N9OMzVBcMnOolAcvz3S0STbnNTHOmg"},"clientExtensionResults":{}}',
  };

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
          public_key_credential_creation_options: JSON.stringify(MOCK_PUBLIC_KEY_CREDENTIAL_OPTIONS),
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
          public_key_credential: MOCK_PUBLIC_KEY_CREDENTIALS.publicKeyCredential,
        },
      });
    };

    it('Automatically passes in the current document location and platform authenticator_type when no options are provided', async () => {
      getUserAgentMock.mockResolvedValueOnce(MOCK_USER_AGENT);
      registerMock.mockResolvedValueOnce(MOCK_PUBLIC_KEY_CREDENTIALS);
      await expect(
        client.register({
          session_duration_minutes: 60,
        }),
      ).resolves.toEqual({
        ...MOCK_AUTHENTICATE_RETURN_VALUE,
        webauthn_registration_id: 'test_id',
      });
      expect(getUserAgentMock).toHaveBeenCalled();
      expect(registerMock).toHaveBeenCalledWith({
        publicKeyCredentialOptions: JSON.stringify(MOCK_PUBLIC_KEY_CREDENTIAL_OPTIONS),
      });
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/webauthn/register/start',
        method: 'POST',
        body: {
          domain: window.location.hostname,
          user_agent: MOCK_USER_AGENT.userAgent,
          authenticator_type: 'platform',
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
      getUserAgentMock.mockResolvedValueOnce(MOCK_USER_AGENT);
      registerMock.mockResolvedValueOnce(MOCK_PUBLIC_KEY_CREDENTIALS);
      await expect(
        client.register({
          domain: 'example.com',
          session_duration_minutes: 60,
        }),
      ).resolves.toEqual({
        ...MOCK_AUTHENTICATE_RETURN_VALUE,
        webauthn_registration_id: 'test_id',
      });
      expect(getUserAgentMock).toHaveBeenCalled();
      expect(registerMock).toHaveBeenCalledWith({
        publicKeyCredentialOptions: JSON.stringify(MOCK_PUBLIC_KEY_CREDENTIAL_OPTIONS),
      });
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/webauthn/register/start',
        method: 'POST',
        body: {
          domain: 'example.com',
          user_agent: MOCK_USER_AGENT.userAgent,
          authenticator_type: 'platform',
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
      getUserAgentMock.mockResolvedValueOnce(MOCK_USER_AGENT);
      registerMock.mockResolvedValueOnce(MOCK_PUBLIC_KEY_CREDENTIALS);
      await expect(
        client.register({
          domain: 'example.com',
          session_duration_minutes: 60,
          is_passkey: true,
        }),
      ).resolves.toEqual({
        ...MOCK_AUTHENTICATE_RETURN_VALUE,
        webauthn_registration_id: 'test_id',
      });
      expect(getUserAgentMock).toHaveBeenCalled();
      expect(registerMock).toHaveBeenCalledWith({
        publicKeyCredentialOptions: JSON.stringify(MOCK_PUBLIC_KEY_CREDENTIAL_OPTIONS),
      });
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/webauthn/register/start',
        method: 'POST',
        body: {
          domain: 'example.com',
          user_agent: MOCK_USER_AGENT.userAgent,
          authenticator_type: 'platform',
          return_passkey_credential_options: true,
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
      getUserAgentMock.mockResolvedValueOnce(MOCK_USER_AGENT);
      registerMock.mockResolvedValueOnce(MOCK_PUBLIC_KEY_CREDENTIALS);
      await expect(
        client.register({
          domain: 'example.com',
          session_duration_minutes: 60,
          override_id: 'id',
          override_name: 'name',
          override_display_name: 'display_name',
        }),
      ).resolves.toEqual({
        ...MOCK_AUTHENTICATE_RETURN_VALUE,
        webauthn_registration_id: 'test_id',
      });
      expect(getUserAgentMock).toHaveBeenCalled();
      expect(registerMock).toHaveBeenCalledWith({
        publicKeyCredentialOptions: JSON.stringify(MOCK_PUBLIC_KEY_CREDENTIAL_OPTIONS),
      });
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/webauthn/register/start',
        method: 'POST',
        body: {
          domain: 'example.com',
          user_agent: MOCK_USER_AGENT.userAgent,
          authenticator_type: 'platform',
          override_id: 'id',
          override_name: 'name',
          override_display_name: 'display_name',
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
        public_key_credential_request_options: JSON.stringify(MOCK_PUBLIC_KEY_CREDENTIAL_OPTIONS),
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
          public_key_credential: MOCK_PUBLIC_KEY_CREDENTIALS.publicKeyCredential,
          session_duration_minutes: 60,
          captcha_token: addDFPTelemetryIDInstead ? undefined : MOCK_CAPTCHA,
          dfp_telemetry_id: addDFPTelemetryIDInstead ? MOCK_DFP_TELEMETRY_ID : undefined,
        },
        retryCallback: expect.any(Function),
      });
    };

    it('Automatically passes in the current document location when no options are provided', async () => {
      authenticateMock.mockResolvedValueOnce(MOCK_PUBLIC_KEY_CREDENTIALS);
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
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        updateSessionExpect({
          webauthn_registration_id: 'test_id',
        }),
      );
    });

    it('Run with dfp protected auth', async () => {
      authenticateMock.mockResolvedValueOnce(MOCK_PUBLIC_KEY_CREDENTIALS);
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
      expectAuthenticateFetchSDKCall(true);
    });

    it('Passes a custom domain name when it is specified', async () => {
      authenticateMock.mockResolvedValueOnce(MOCK_PUBLIC_KEY_CREDENTIALS);
      await expect(client.authenticate({ session_duration_minutes: 60, domain: 'example.com' })).resolves.toEqual({
        ...MOCK_AUTHENTICATE_RETURN_VALUE,
        webauthn_registration_id: 'test_id',
      });
      expect(networkClient.fetchSDK).toHaveBeenCalledWith({
        url: '/webauthn/authenticate/start/primary',
        method: 'POST',
        body: {
          domain: 'example.com',
        },
      });
      expectAuthenticateFetchSDKCall();
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        updateSessionExpect({
          webauthn_registration_id: 'test_id',
        }),
      );
    });

    it('Passes is_passkey when it is specified', async () => {
      authenticateMock.mockResolvedValueOnce(MOCK_PUBLIC_KEY_CREDENTIALS);
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
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        updateSessionExpect({
          webauthn_registration_id: 'test_id',
        }),
      );
    });

    it('When the user is logged in', async () => {
      authenticateMock.mockResolvedValueOnce(MOCK_PUBLIC_KEY_CREDENTIALS);
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
      expect(subscriptionService.updateSession).toHaveBeenCalledWith(
        updateSessionExpect({
          webauthn_registration_id: 'test_id',
        }),
      );
    });
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
    it('should return false', async () => {
      const result = await client.browserSupportsAutofill();
      expect(result).toBe(false);
    });
  });
});
