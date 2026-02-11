import {
  IHeadlessB2BSSOClient,
  MissingPKCEError,
  SSOStartOptions,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';
import { InAppBrowser } from '@stytch/react-native-inappbrowser-reborn';
import { Linking } from 'react-native';

import { MOCK_DFP_TELEMTRY_ID } from '../mocks';
import { createTestFixtures, MockDFPProtectedAuthWithCaptcha } from '../testUtils';
import { B2BSSOClient } from './B2BSSOClient';
const config = {
  publicToken: '',
  testAPIURL: 'test-api-url',
  liveAPIURL: 'live-api-url',
};

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

describe('B2BSSOClient', () => {
  let client: IHeadlessB2BSSOClient<StytchProjectConfigurationInput>;
  const { networkClient, b2bSubscriptionService, pkceManager } = createTestFixtures();

  beforeAll(() => {
    client = new B2BSSOClient(
      networkClient,
      b2bSubscriptionService,
      pkceManager,
      config,
      MockDFPProtectedAuthWithCaptcha(),
    );
  });

  describe('getBaseApiUrl', () => {
    describe("When it's using a test token", () => {
      it('returns the test URL', async () => {
        const _publicToken = (client as any)['_config']['publicToken'];
        (client as any)['_config']['publicToken'] = 'public-token-test';
        const baseUrl = await (client as any)['getBaseApiUrl']();
        expect(baseUrl).toBe(config.testAPIURL);
        (client as any)['_config']['publicToken'] = _publicToken;
      });
    });

    describe("When it's using a live token", () => {
      it('returns the live URL', async () => {
        const _publicToken = (client as any)['_config']['publicToken'];
        (client as any)['_config']['publicToken'] = 'public-token-live';
        const baseUrl = await (client as any)['getBaseApiUrl']();
        expect(baseUrl).toBe(config.liveAPIURL);
        (client as any)['_config']['publicToken'] = _publicToken;
      });
    });
  });

  describe('createSSOURL', () => {
    describe('When no options are provided', () => {
      it('returns a correct url', async () => {
        const mockBaseUrl = 'https://test.com';
        jest.spyOn(client as any, 'getBaseApiUrl').mockReturnValueOnce(mockBaseUrl);
        const _publicToken = (client as any)['_config']['publicToken'];
        const mockPublicToken = 'my-public-token';
        (client as any)['_config']['publicToken'] = mockPublicToken;
        const ssoUrl = await (client as any)['createSSOURL']({ connection_id: 'connection-id' });
        const pkceCodePair = await pkceManager.getPKPair();
        expect(ssoUrl).toBe(
          `${mockBaseUrl}/v1/public/sso/start?public_token=${mockPublicToken}&connection_id=connection-id&pkce_code_challenge=${pkceCodePair?.code_challenge}`,
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
          connection_id: 'connection-id',
          login_redirect_url: 'login-redirect',
          signup_redirect_url: 'signup-redirect',
        } as SSOStartOptions;
        const ssoUrl = await (client as any)['createSSOURL'](options);
        const pkceCodePair = await pkceManager.getPKPair();
        expect(ssoUrl).toBe(
          `${mockBaseUrl}/v1/public/sso/start?public_token=${mockPublicToken}&connection_id=connection-id&pkce_code_challenge=${pkceCodePair?.code_challenge}&login_redirect_url=${options.login_redirect_url}&signup_redirect_url=${options.signup_redirect_url}`,
        );
        (client as any)['_config']['publicToken'] = _publicToken;
      });
    });
  });

  describe('start', () => {
    describe('When InAppBrowser is unavailable', () => {
      it('Uses Linking', async () => {
        const isAvailableSpy = jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(false);
        const linkingSpy = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(null);
        await client.start({ connection_id: '' });
        expect(isAvailableSpy).toHaveBeenCalled();
        expect(linkingSpy).toHaveBeenCalled();
        isAvailableSpy.mockRestore();
        linkingSpy.mockRestore();
      });
    });
    describe('When InAppBrowser is available', () => {
      it('Uses InAppBrowser.openAuth and calls Linking on success', async () => {
        const isAvailableSpy = jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(true);
        const linkingSpy = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(null);
        const iabSpy = jest.spyOn(InAppBrowser, 'openAuth').mockResolvedValueOnce({ type: 'success', url: '' });
        await client.start({ connection_id: '' });
        expect(isAvailableSpy).toHaveBeenCalled();
        expect(iabSpy).toHaveBeenCalled();
        expect(linkingSpy).toHaveBeenCalled();
        isAvailableSpy.mockRestore();
        linkingSpy.mockRestore();
        iabSpy.mockRestore();
      });
      it('Uses InAppBrowser.openAuth and does NOT call Linking on cancel', async () => {
        const isAvailableSpy = jest.spyOn(InAppBrowser, 'isAvailable').mockResolvedValueOnce(true);
        const linkingSpy = jest.spyOn(Linking, 'openURL').mockResolvedValueOnce(null);
        const iabSpy = jest.spyOn(InAppBrowser, 'openAuth').mockResolvedValueOnce({ type: 'cancel' });
        await client.start({ connection_id: '' });
        expect(isAvailableSpy).toHaveBeenCalled();
        expect(iabSpy).toHaveBeenCalled();
        expect(linkingSpy).not.toHaveBeenCalled();
        isAvailableSpy.mockRestore();
        linkingSpy.mockRestore();
        iabSpy.mockRestore();
      });
    });
  });

  describe('authenticate', () => {
    describe('when no keypair is available', () => {
      it('throws an error', async () => {
        const keyPairSpy = jest.spyOn((client as any)['_pkceManager'], 'getPKPair').mockResolvedValueOnce(undefined);
        await expect(client.authenticate({ sso_token: '', session_duration_minutes: 30 })).rejects.toThrow(
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
          const fetchSdkSpy = jest.spyOn(networkClient, 'retriableFetchSDK').mockRejectedValueOnce('FetchSDK failed');
          await expect(client.authenticate({ sso_token: 'token', session_duration_minutes: 30 })).rejects.toMatch(
            'FetchSDK failed',
          );
          expect(fetchSdkSpy).toHaveBeenCalledWith({
            url: '/b2b/sso/authenticate',
            method: 'POST',
            body: {
              sso_token: 'token',
              pkce_code_verifier: 'code_verifier',
              session_duration_minutes: 30,
              dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
              intermediate_session_token: undefined,
            },
            retryCallback: expect.any(Function),
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
            intermediate_session_token: null,
            member_session: 'member-session',
            member: 'member',
            session_token: 'session-token',
            session_jwt: 'session-jwt',
          };
          const fetchSdkSpy = jest.spyOn(networkClient, 'retriableFetchSDK').mockResolvedValueOnce(mockResponse);
          const updateSessionSpy = jest
            .spyOn(b2bSubscriptionService, 'updateSession')
            .mockImplementationOnce(jest.fn());
          const result = await client.authenticate({ sso_token: 'token', session_duration_minutes: 30 });
          expect(keyPairSpy).toHaveBeenCalled();
          expect(fetchSdkSpy).toHaveBeenCalledWith({
            url: '/b2b/sso/authenticate',
            method: 'POST',
            body: {
              sso_token: 'token',
              pkce_code_verifier: 'code_verifier',
              session_duration_minutes: 30,
              captcha_token: undefined,
              dfp_telemetry_id: MOCK_DFP_TELEMTRY_ID,
              intermediate_session_token: undefined,
            },
            retryCallback: expect.any(Function),
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
