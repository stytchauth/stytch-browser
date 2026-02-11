import { logger } from '@stytch/core';
import {
  OAuthProviders,
  OAuthGetURLOptions,
  StytchAPIError,
  MissingPKCEError,
  MissingGoogleClientIDError,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';
import { HeadlessOAuthClient } from './OAuthClient';
import { createTestFixtures } from './testUtils';
import { Linking } from 'react-native';
import { InAppBrowser } from '@stytch/react-native-inappbrowser-reborn';
import { Platform } from './native-module/types';

const dynamicConfig = Promise.resolve({ cnameDomain: null });
const config = {
  publicToken: '',
  testAPIURL: 'test-api-url',
  liveAPIURL: 'live-api-url',
};

const deviceInfoMock = jest.fn();

jest.mock('./native-module', function () {
  return {
    __esModule: true,
    default: class {
      OAuth = {
        googleOneTapStart: jest.fn(),
        signInWithAppleStart: jest.fn(),
      };
      DeviceInfo = {
        get: deviceInfoMock,
      };
    },
  };
});

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
    closeAuth: jest.fn(),
  },
}));

const setupFetchStub = (ok: boolean, json: Record<any, any>) =>
  new Promise((resolve) => {
    resolve({
      ok: ok,
      json: () => Promise.resolve(json),
    } as Response);
  });

const mockStytchAPIError: StytchAPIError = {
  status_code: 500,
  request_id: 'request-id',
  error_type: 'test-error',
  error_message: 'test-error-message',
  error_url: 'error-url',
  name: 'test-error-name',
  message: 'test-error-message',
};

describe('OAuthClient', () => {
  let client: HeadlessOAuthClient<StytchProjectConfigurationInput>;
  const { networkClient, subscriptionService, pkceManager } = createTestFixtures();

  beforeAll(() => {
    client = new HeadlessOAuthClient(networkClient, subscriptionService, pkceManager, dynamicConfig, config);
  });

  it('contains all supported providers', () => {
    expect(client.amazon != undefined).toBeTruthy();
    expect(client.apple != undefined).toBeTruthy();
    expect(client.bitbucket != undefined).toBeTruthy();
    expect(client.coinbase != undefined).toBeTruthy();
    expect(client.discord != undefined).toBeTruthy();
    expect(client.facebook != undefined).toBeTruthy();
    expect(client.github != undefined).toBeTruthy();
    expect(client.gitlab != undefined).toBeTruthy();
    expect(client.google != undefined).toBeTruthy();
    expect(client.linkedin != undefined).toBeTruthy();
    expect(client.microsoft != undefined).toBeTruthy();
    expect(client.salesforce != undefined).toBeTruthy();
    expect(client.slack != undefined).toBeTruthy();
    expect(client.twitch != undefined).toBeTruthy();
    expect(client.yahoo != undefined).toBeTruthy();
    expect(client.googleOneTap != undefined).toBeTruthy();
    expect(client.signInWithApple != undefined).toBeTruthy();
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

  describe('getBaseApiUrl', () => {
    describe('When a custom cnameDomain is provided', () => {
      it('returns the https:// prepended domain', async () => {
        const _dynamicConfig = (client as any)['_dynamicConfig'];
        (client as any)['_dynamicConfig'] = { cnameDomain: 'test.domain.com' };
        const baseUrl = await (client as any)['getBaseApiUrl']();
        expect(baseUrl).toBe('https://test.domain.com');
        (client as any)['_dynamicConfig'] = _dynamicConfig;
      });
    });

    describe("When no custom cnamDomain is provided, and it's using a test token", () => {
      it('returns the test URL', async () => {
        const _dynamicConfig = (client as any)['_dynamicConfig'];
        const _publicToken = (client as any)['_config']['publicToken'];
        (client as any)['_dynamicConfig'] = { cnameDomain: null };
        (client as any)['_config']['publicToken'] = 'public-token-test';
        const baseUrl = await (client as any)['getBaseApiUrl']();
        expect(baseUrl).toBe(config.testAPIURL);
        (client as any)['_dynamicConfig'] = _dynamicConfig;
        (client as any)['_config']['publicToken'] = _publicToken;
      });
    });

    describe("When no custom cnamDomain is provided, and it's using a live token", () => {
      it('returns the live URL', async () => {
        const _dynamicConfig = (client as any)['_dynamicConfig'];
        const _publicToken = (client as any)['_config']['publicToken'];
        (client as any)['_dynamicConfig'] = { cnameDomain: null };
        (client as any)['_config']['publicToken'] = 'public-token-live';
        const baseUrl = await (client as any)['getBaseApiUrl']();
        expect(baseUrl).toBe(config.liveAPIURL);
        (client as any)['_dynamicConfig'] = _dynamicConfig;
        (client as any)['_config']['publicToken'] = _publicToken;
      });
    });
  });

  describe('createOAuthURL', () => {
    describe('When no options are provided', () => {
      it('returns a correct url', async () => {
        const mockBaseUrl = 'https://test.com';
        jest.spyOn(client as any, 'getBaseApiUrl').mockReturnValueOnce(mockBaseUrl);
        const _publicToken = (client as any)['_config']['publicToken'];
        const mockPublicToken = 'my-public-token';
        (client as any)['_config']['publicToken'] = mockPublicToken;
        const oauthUrl = await (client as any)['createOAuthURL'](OAuthProviders.Amazon, {});
        const pkceCodePair = await pkceManager.getPKPair();
        expect(oauthUrl).toBe(
          `${mockBaseUrl}/v1/public/oauth/${OAuthProviders.Amazon}/start?public_token=${mockPublicToken}&code_challenge=${pkceCodePair?.code_challenge}`,
        );
        (client as any)['_config']['publicToken'] = _publicToken;
      });
    });
    describe('When options are provided', () => {
      it('returns a correct url', async () => {
        const mockBaseUrl = 'https://test.com';
        jest.spyOn(client as any, 'getBaseApiUrl').mockReturnValueOnce(mockBaseUrl);
        const _publicToken = (client as any)['_config']['publicToken'];
        const mockPublicToken = 'my-public-token';
        (client as any)['_config']['publicToken'] = mockPublicToken;
        const options = {
          login_redirect_url: 'login-redirect',
          signup_redirect_url: 'signup-redirect',
          custom_scopes: ['scope 1', 'scope 2'],
          oauth_attach_token: 'test_oauth_attach_token',
        } as OAuthGetURLOptions;
        const oauthUrl = await (client as any)['createOAuthURL'](OAuthProviders.Amazon, options);
        const pkceCodePair = await pkceManager.getPKPair();
        expect(oauthUrl).toBe(
          `${mockBaseUrl}/v1/public/oauth/${
            OAuthProviders.Amazon
          }/start?public_token=${mockPublicToken}&code_challenge=${
            pkceCodePair?.code_challenge
          }&custom_scopes=${options.custom_scopes?.join(' ')}&login_redirect_url=${
            options.login_redirect_url
          }&signup_redirect_url=${options.signup_redirect_url}&oauth_attach_token=${options.oauth_attach_token}`,
        );
        (client as any)['_config']['publicToken'] = _publicToken;
      });
    });
  });

  describe('startOAuthFlow', () => {
    describe('When attempting anything', () => {
      it('logs the event', async () => {
        jest.spyOn(InAppBrowser, 'openAuth').mockResolvedValueOnce({ type: 'dismiss' });
        const spy = jest.spyOn(networkClient, 'logEvent').mockImplementation(jest.fn());
        await client.amazon.start();
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
      });
    });

    describe('When InAppBrowser is unavailable', () => {
      it('Uses Linking', async () => {
        const isAvailableSpy = jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(false);
        const linkingSpy = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(null);
        await client.amazon.start();
        expect(isAvailableSpy).toHaveBeenCalled();
        expect(linkingSpy).toHaveBeenCalled();
        isAvailableSpy.mockRestore();
        linkingSpy.mockRestore();
      });
    });

    describe('when attempting Amazon', () => {
      it('launches redirect flow', async () => {
        jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(true);
        const spy = jest.spyOn(InAppBrowser, 'openAuth').mockResolvedValueOnce({ type: 'success', url: 'string' });
        await client.amazon.start();
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
      });
    });

    describe('when attempting Apple', () => {
      describe('on iOS', () => {
        it('launches native flow', async () => {
          const spy = jest.spyOn(client as any, 'startNativeAppleOAuthFlow').mockResolvedValueOnce({ success: true });
          await client.apple.start({ oauth_attach_token: 'dummy_token' });
          expect(spy).toHaveBeenCalledWith(undefined, undefined, 'dummy_token');
          spy.mockRestore();
        });
      });
      describe('on Android', () => {
        it('launches redirect flow', async () => {
          jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(true);
          const spy = jest.spyOn(InAppBrowser, 'openAuth').mockResolvedValueOnce({ type: 'success', url: 'string' });
          deviceInfoMock.mockReturnValueOnce({ platform: Platform.Android });
          await client.apple.start();
          expect(spy).toHaveBeenCalled();
          spy.mockRestore();
        });
      });
    });

    describe('when attempting BitBucket', () => {
      it('launches redirect flow', async () => {
        jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(true);
        const spy = jest.spyOn(InAppBrowser, 'openAuth').mockResolvedValueOnce({ type: 'success', url: 'string' });
        await client.bitbucket.start();
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
      });
    });

    describe('when attempting Coinbase', () => {
      it('launches redirect flow', async () => {
        jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(true);
        const spy = jest.spyOn(InAppBrowser, 'openAuth').mockResolvedValueOnce({ type: 'success', url: 'string' });
        await client.coinbase.start();
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
      });
    });

    describe('when attempting Discord', () => {
      it('launches redirect flow', async () => {
        jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(true);
        const spy = jest.spyOn(InAppBrowser, 'openAuth').mockResolvedValueOnce({ type: 'success', url: 'string' });
        await client.discord.start();
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
      });
    });

    describe('when attempting Facebook', () => {
      it('launches redirect flow', async () => {
        jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(true);
        const spy = jest.spyOn(InAppBrowser, 'openAuth').mockResolvedValueOnce({ type: 'success', url: 'string' });
        await client.facebook.start();
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
      });
    });

    describe('when attempting GitHub', () => {
      it('launches redirect flow', async () => {
        jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(true);
        const spy = jest.spyOn(InAppBrowser, 'openAuth').mockResolvedValueOnce({ type: 'success', url: 'string' });
        await client.github.start();
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
      });
    });

    describe('when attempting GitLab', () => {
      it('launches redirect flow', async () => {
        jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(true);
        const spy = jest.spyOn(InAppBrowser, 'openAuth').mockResolvedValueOnce({ type: 'success', url: 'string' });
        await client.gitlab.start();
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
      });
    });

    describe('when attempting Google', () => {
      describe('on Android', () => {
        it('launches native flow', async () => {
          const spy = jest.spyOn(client as any, 'startNativeGoogleOAuthFlow').mockResolvedValueOnce({ success: true });
          await client.google.start({ oauth_attach_token: 'dummy_token' });
          expect(spy).toHaveBeenCalledWith(undefined, undefined, 'dummy_token');
          spy.mockRestore();
        });
      });
      describe('on iOS', () => {
        it('launches redirect flow', async () => {
          jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(true);
          const spy = jest.spyOn(InAppBrowser, 'openAuth').mockResolvedValueOnce({ type: 'success', url: 'string' });
          deviceInfoMock.mockReturnValueOnce({ platform: Platform.iOS });
          await client.google.start();
          expect(spy).toHaveBeenCalled();
          spy.mockRestore();
        });
      });
    });

    describe('when attempting LinkedIn', () => {
      it('launches redirect flow', async () => {
        jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(true);
        const spy = jest.spyOn(InAppBrowser, 'openAuth').mockResolvedValueOnce({ type: 'success', url: 'string' });
        await client.linkedin.start();
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
      });
    });

    describe('when attempting Microsoft', () => {
      it('launches redirect flow', async () => {
        jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(true);
        const spy = jest.spyOn(InAppBrowser, 'openAuth').mockResolvedValueOnce({ type: 'success', url: 'string' });
        await client.microsoft.start();
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
      });
    });

    describe('when attempting Salesforce', () => {
      it('launches redirect flow', async () => {
        jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(true);
        const spy = jest.spyOn(InAppBrowser, 'openAuth').mockResolvedValueOnce({ type: 'success', url: 'string' });
        await client.salesforce.start();
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
      });
    });

    describe('when attempting Slack', () => {
      it('launches redirect flow', async () => {
        jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(true);
        const spy = jest.spyOn(InAppBrowser, 'openAuth').mockResolvedValueOnce({ type: 'success', url: 'string' });
        await client.slack.start();
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
      });
    });

    describe('when attempting Twitch', () => {
      it('launches redirect flow', async () => {
        jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(true);
        const spy = jest.spyOn(InAppBrowser, 'openAuth').mockResolvedValueOnce({ type: 'success', url: 'string' });
        await client.twitch.start();
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
      });
    });

    describe('when attempting Yahoo', () => {
      it('launches redirect flow', async () => {
        jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(true);
        const spy = jest.spyOn(InAppBrowser, 'openAuth').mockResolvedValueOnce({ type: 'success', url: 'string' });
        await client.yahoo.start();
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
      });
    });
  });

  describe('fetchGoogleClientId', () => {
    describe('when fetch fails', () => {
      it('throws StytchAPIError', async () => {
        const baseApiSpy = jest.spyOn(client as any, 'getBaseApiUrl').mockReturnValueOnce('base-url');
        global.fetch = jest.fn().mockImplementationOnce(() => setupFetchStub(false, mockStytchAPIError));
        const fetchSpy = jest.spyOn(global, 'fetch');
        await expect(async () => await (client as any)['fetchGoogleClientId']('public-token')).rejects.toThrow(
          StytchAPIError,
        );
        expect(fetchSpy).toHaveBeenCalledWith(
          `base-url/v1/public/oauth/google/onetap/start?public_token=public-token`,
          {
            method: 'GET',
            credentials: 'include',
          },
        );
        baseApiSpy.mockRestore();
        fetchSpy.mockRestore();
      });
    });

    describe('when no google_client_id is returned', () => {
      it('throws StytchSDKNativeError', async () => {
        const baseApiSpy = jest.spyOn(client as any, 'getBaseApiUrl').mockReturnValueOnce('base-url');
        global.fetch = jest.fn().mockImplementationOnce(() => setupFetchStub(true, {}));
        const fetchSpy = jest.spyOn(global, 'fetch');
        await expect(async () => await (client as any)['fetchGoogleClientId']('public-token')).rejects.toThrow(
          MissingGoogleClientIDError,
        );
        baseApiSpy.mockRestore();
        fetchSpy.mockRestore();
      });
    });

    describe('when google_client_id is returned', () => {
      it('returns google_client_id', async () => {
        const baseApiSpy = jest.spyOn(client as any, 'getBaseApiUrl').mockReturnValueOnce('base-url');
        global.fetch = jest.fn().mockImplementationOnce(() =>
          setupFetchStub(true, {
            request_id: 'request-id',
            google_client_id: 'test-google_client_id',
          }),
        );
        const fetchSpy = jest.spyOn(global, 'fetch');
        const response = await (client as any)['fetchGoogleClientId']('public-token');
        expect(response).toStrictEqual({
          requestId: 'request-id',
          googleClientId: 'test-google_client_id',
        });
        baseApiSpy.mockRestore();
        fetchSpy.mockRestore();
      });
    });
  });

  describe('startNativeGoogleOAuthFlow', () => {
    it('returns invalid platform on iOS', async () => {
      deviceInfoMock.mockReturnValueOnce({ platform: Platform.iOS });
      const resp = await (client as any)['startNativeGoogleOAuthFlow']();
      expect(resp).toEqual({ success: false, reason: 'Invalid Platform' });
    });
    describe('when calls googleOneTapStart', () => {
      beforeEach(() => {
        deviceInfoMock.mockReturnValueOnce({ platform: Platform.Android });
      });
      afterEach(() => {
        deviceInfoMock.mockRestore();
      });
      describe('and call fails', () => {
        it('does not call oncomplete and logs the error', async () => {
          const onComplete = jest.fn();
          const fetchGoogleClientIdSpy = jest
            .spyOn(client as any, 'fetchGoogleClientId')
            .mockReturnValueOnce({ googleClientId: 'test' });
          const googleOneTapStartSpy = jest
            .spyOn((client as any)['nativeModule']['OAuth'], 'googleOneTapStart')
            .mockRejectedValueOnce('');
          const loggerSpy = jest.spyOn(logger, 'warn').mockImplementation(jest.fn());
          await (client as any)['startNativeGoogleOAuthFlow'](30, onComplete);
          expect(onComplete).not.toHaveBeenCalled();
          expect(loggerSpy).toHaveBeenCalledWith('Google OneTap is unavailable', expect.anything());
          fetchGoogleClientIdSpy.mockRestore();
          googleOneTapStartSpy.mockRestore();
          loggerSpy.mockRestore();
        });
      });
      describe('and call succeeds', () => {
        describe('when fetchSDK fails', () => {
          it('does not call oncomplete and logs the error', async () => {
            const onComplete = jest.fn().mockImplementation(jest.fn());
            const fetchGoogleClientIdSpy = jest
              .spyOn(client as any, 'fetchGoogleClientId')
              .mockReturnValueOnce({ googleClientId: 'test' });
            const googleOneTapStartSpy = jest
              .spyOn((client as any)['nativeModule']['OAuth'], 'googleOneTapStart')
              .mockResolvedValueOnce({ idToken: 'idToken', nonce: 'nonce' });
            const fetchSdkSpy = jest.spyOn(networkClient, 'fetchSDK').mockRejectedValueOnce('');
            const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(jest.fn());
            await (client as any)['startNativeGoogleOAuthFlow'](30, onComplete, 'dummy_token');
            expect(fetchSdkSpy).toHaveBeenCalledWith({
              url: '/oauth/google/id_token/authenticate',
              method: 'POST',
              body: {
                id_token: 'idToken',
                nonce: 'nonce',
                session_duration_minutes: 30,
                oauth_attach_token: 'dummy_token',
              },
            });
            expect(onComplete).not.toHaveBeenCalled();
            expect(loggerSpy).toHaveBeenCalledWith('Unable to authenticate OAuth ID token', expect.anything());
            fetchGoogleClientIdSpy.mockRestore();
            googleOneTapStartSpy.mockRestore();
            fetchSdkSpy.mockRestore();
            loggerSpy.mockRestore();
          });
        });
        describe('when fetchSDK succeeds', () => {
          it('calls updateSession and onComplete', async () => {
            const onComplete = jest.fn().mockImplementation(jest.fn());
            const fetchGoogleClientIdSpy = jest
              .spyOn(client as any, 'fetchGoogleClientId')
              .mockReturnValueOnce({ googleClientId: 'test' });
            const googleOneTapStartSpy = jest
              .spyOn((client as any)['nativeModule']['OAuth'], 'googleOneTapStart')
              .mockResolvedValueOnce({ idToken: 'idToken', nonce: 'nonce' });
            const mockResponse = {
              session: 'session',
              user: 'user',
              session_token: 'session-token',
              session_jwt: 'session-jwt',
            };
            const fetchSdkSpy = jest.spyOn(networkClient, 'fetchSDK').mockResolvedValueOnce(mockResponse);
            const updateSessionSpy = jest.spyOn(subscriptionService, 'updateSession').mockImplementationOnce(jest.fn());
            const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(jest.fn());
            await (client as any)['startNativeGoogleOAuthFlow'](30, onComplete, 'dummy_token');
            expect(fetchSdkSpy).toHaveBeenCalledWith({
              url: '/oauth/google/id_token/authenticate',
              method: 'POST',
              body: {
                id_token: 'idToken',
                nonce: 'nonce',
                session_duration_minutes: 30,
                oauth_attach_token: 'dummy_token',
              },
            });
            expect(onComplete).toHaveBeenCalledWith(mockResponse);
            expect(updateSessionSpy).toHaveBeenCalledWith(mockResponse, { sessionDurationMinutes: 30 });
            expect(loggerSpy).not.toHaveBeenCalled();
            fetchGoogleClientIdSpy.mockRestore();
            googleOneTapStartSpy.mockRestore();
            fetchSdkSpy.mockRestore();
            updateSessionSpy.mockRestore();
            loggerSpy.mockRestore();
          });
        });
      });
    });
  });

  describe('startNativeAppleOAuthFlow', () => {
    it('returns invalid platform on Android', async () => {
      deviceInfoMock.mockReturnValueOnce({ platform: Platform.Android });
      const resp = await (client as any)['startNativeAppleOAuthFlow']();
      expect(resp).toEqual({ success: false, reason: 'Invalid Platform' });
    });
    describe('when calls signInWithAppleStart', () => {
      beforeEach(() => {
        deviceInfoMock.mockReturnValueOnce({ platform: Platform.iOS });
      });
      describe('and call fails', () => {
        it('does not call oncomplete and logs the error', async () => {
          const onComplete = jest.fn();
          const signInWithAppleStartSpy = jest
            .spyOn((client as any)['nativeModule']['OAuth'], 'signInWithAppleStart')
            .mockRejectedValueOnce('');
          const loggerSpy = jest.spyOn(logger, 'warn').mockImplementation(jest.fn());
          await (client as any)['startNativeAppleOAuthFlow'](30, onComplete);
          expect(onComplete).not.toHaveBeenCalled();
          expect(loggerSpy).toHaveBeenCalledWith('Sign In With Apple is unavailable', expect.anything());
          signInWithAppleStartSpy.mockRestore();
          loggerSpy.mockRestore();
        });
      });

      describe('and call succeeds', () => {
        describe('when fetchSDK fails', () => {
          it('does not call oncomplete and logs the error', async () => {
            const onComplete = jest.fn();
            const signInWithAppleStartSpy = jest
              .spyOn((client as any)['nativeModule']['OAuth'], 'signInWithAppleStart')
              .mockResolvedValueOnce({ idToken: 'idToken', nonce: 'nonce', name: {} });
            const fetchSdkSpy = jest.spyOn(networkClient, 'fetchSDK').mockRejectedValueOnce('');
            const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(jest.fn());
            await (client as any)['startNativeAppleOAuthFlow'](30, onComplete, 'dummy_token');
            expect(fetchSdkSpy).toHaveBeenCalledWith({
              url: '/oauth/apple/id_token/authenticate',
              method: 'POST',
              body: {
                id_token: 'idToken',
                nonce: 'nonce',
                session_duration_minutes: 30,
                oauth_attach_token: 'dummy_token',
              },
            });
            expect(onComplete).not.toHaveBeenCalled();
            expect(loggerSpy).toHaveBeenCalledWith('Unable to authenticate OAuth ID token', expect.anything());
            signInWithAppleStartSpy.mockRestore();
            fetchSdkSpy.mockRestore();
            loggerSpy.mockRestore();
          });
        });

        describe('when fetchSDK succeeds', () => {
          it('calls updateSession and onComplete', async () => {
            const onComplete = jest.fn();
            const signInWithAppleStartSpy = jest
              .spyOn((client as any)['nativeModule']['OAuth'], 'signInWithAppleStart')
              .mockResolvedValueOnce({
                idToken: 'idToken',
                nonce: 'nonce',
                name: { firstName: 'mock-first-name', lastName: 'mock-last-name' },
              });
            const mockSessionResponse = {
              session: 'session',
              user: 'user',
              session_token: 'session-token',
              session_jwt: 'session-jwt',
            };
            const mockUserResponse = {
              __user: {
                user_id: 'user-id',
              },
            };
            const fetchSdkSpy = jest
              .spyOn(networkClient, 'fetchSDK')
              .mockResolvedValueOnce(mockSessionResponse)
              .mockResolvedValueOnce(mockUserResponse);
            const updateSessionSpy = jest.spyOn(subscriptionService, 'updateSession').mockImplementationOnce(jest.fn());
            const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(jest.fn());
            await (client as any)['startNativeAppleOAuthFlow'](30, onComplete, 'dummy_token');
            expect(fetchSdkSpy).toHaveBeenCalledWith({
              url: '/oauth/apple/id_token/authenticate',
              method: 'POST',
              body: {
                id_token: 'idToken',
                nonce: 'nonce',
                session_duration_minutes: 30,
                oauth_attach_token: 'dummy_token',
              },
            });
            expect(updateSessionSpy).toHaveBeenCalledWith(mockSessionResponse, { sessionDurationMinutes: 30 });
            expect(fetchSdkSpy).toHaveBeenCalledWith({
              url: '/users/me',
              method: 'PUT',
              body: {
                name: { first_name: 'mock-first-name', last_name: 'mock-last-name' },
              },
            });
            expect(onComplete).toHaveBeenCalledWith(mockSessionResponse);
            expect(loggerSpy).not.toHaveBeenCalled();
            signInWithAppleStartSpy.mockRestore();
            fetchSdkSpy.mockRestore();
            updateSessionSpy.mockRestore();
            loggerSpy.mockRestore();
          });
        });
      });
    });
  });

  describe('startGoogleOAuthFlowWithFallback', () => {
    it('fallback to redirect OAuth if native OAuth fails', async () => {
      jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(true);
      const spy = jest.spyOn(InAppBrowser, 'openAuth').mockResolvedValueOnce({ type: 'success', url: 'string' });
      jest.spyOn(client as any, 'startNativeGoogleOAuthFlow').mockResolvedValueOnce(undefined);
      await (client as any)['startGoogleOAuthFlowWithFallback']()();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('startAppleOAuthFlowWithFallback', () => {
    it('fallback to redirect OAuth if native OAuth fails', async () => {
      jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(true);
      const spy = jest.spyOn(InAppBrowser, 'openAuth').mockResolvedValueOnce({ type: 'success', url: 'string' });
      jest.spyOn(client as any, 'startNativeAppleOAuthFlow').mockResolvedValueOnce(undefined);
      await (client as any)['startAppleOAuthFlowWithFallback']()();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('when attempting Google One Tap', () => {
    it('launches native flow', async () => {
      const spy = jest.spyOn(client as any, 'startNativeGoogleOAuthFlow').mockImplementation(jest.fn());
      deviceInfoMock.mockReturnValueOnce({ platform: Platform.Android });
      await client.googleOneTap();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('when attempting Sign in with Apple', () => {
    it('launches native flow', async () => {
      const spy = jest.spyOn(client as any, 'startNativeAppleOAuthFlow').mockImplementation(jest.fn());
      deviceInfoMock.mockReturnValueOnce({ platform: Platform.iOS });
      await client.signInWithApple();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('authenticate', () => {
    describe('when no keypair is available', () => {
      it('throws an error', async () => {
        const keyPairSpy = jest.spyOn((client as any)['_pkceManager'], 'getPKPair').mockResolvedValueOnce(undefined);
        await expect(client.authenticate('token', { session_duration_minutes: 30 })).rejects.toThrow(
          new MissingPKCEError(),
        );
        expect(keyPairSpy).toHaveBeenCalled();
        keyPairSpy.mockRestore();
      });
    });

    describe('when a keypair is available', () => {
      describe('when fetchSDK fails', () => {
        it('throws an error', async () => {
          const keyPairSpy = jest
            .spyOn(pkceManager, 'getPKPair')
            .mockResolvedValueOnce({ code_challenge: 'code_challenge', code_verifier: 'code_verifier' });
          const fetchSdkSpy = jest.spyOn(networkClient, 'fetchSDK').mockRejectedValueOnce('FetchSDK failed');
          await expect(client.authenticate('token', { session_duration_minutes: 30 })).rejects.toMatch(
            'FetchSDK failed',
          );
          expect(fetchSdkSpy).toHaveBeenCalledWith({
            url: '/oauth/authenticate',
            method: 'POST',
            body: {
              token: 'token',
              code_verifier: 'code_verifier',
              session_duration_minutes: 30,
            },
          });
          keyPairSpy.mockRestore();
          fetchSdkSpy.mockRestore();
        });
      });

      describe('when fetchSDK succeeds', () => {
        it('clears PKPair, updates state, and returns the response minus the user', async () => {
          const keyPairSpy = jest
            .spyOn(pkceManager, 'getPKPair')
            .mockResolvedValueOnce({ code_challenge: 'code_challenge', code_verifier: 'code_verifier' });
          const clearKeysSpy = jest.spyOn(pkceManager, 'clearPKPair').mockResolvedValueOnce();
          const mockResponse = {
            session: 'session',
            user: 'user',
            session_token: 'session-token',
            session_jwt: 'session-jwt',
          };
          const fetchSdkSpy = jest.spyOn(networkClient, 'fetchSDK').mockResolvedValueOnce(mockResponse);
          const updateSessionSpy = jest.spyOn(subscriptionService, 'updateSession').mockImplementationOnce(jest.fn());
          const result = await client.authenticate('token', { session_duration_minutes: 30 });
          expect(keyPairSpy).toHaveBeenCalled();
          expect(fetchSdkSpy).toHaveBeenCalledWith({
            url: '/oauth/authenticate',
            method: 'POST',
            body: {
              token: 'token',
              code_verifier: 'code_verifier',
              session_duration_minutes: 30,
            },
          });
          expect(clearKeysSpy).toHaveBeenCalled();
          expect(updateSessionSpy).toHaveBeenCalledWith(mockResponse);
          expect(result).toStrictEqual(mockResponse);
          keyPairSpy.mockRestore();
          clearKeysSpy.mockRestore();
          fetchSdkSpy.mockRestore();
          updateSessionSpy.mockRestore();
        });
      });
    });
  });
});
