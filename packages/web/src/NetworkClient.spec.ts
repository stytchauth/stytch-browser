import { baseFetchSDK, retriableFetchSDK } from '@stytch/core';
import { MOCK_AUTHENTICATE_STATE_UPDATE, MOCK_PUBLIC_TOKEN } from '@stytch/internal-mocks';

import { NetworkClient } from './NetworkClient';
import { ConsumerSubscriptionDataLayer } from './SubscriptionService';

jest.mock('@stytch/core', () => ({
  ...jest.requireActual('@stytch/core'),
  baseFetchSDK: jest.fn(),
  retriableFetchSDK: jest.fn(),
}));

describe('NetworkClient', () => {
  beforeEach(() => {
    jsdom.reconfigure({
      url: 'https://example.com/',
    });
    (baseFetchSDK as jest.Mock).mockResolvedValueOnce({
      result: 'mock result',
    });
    (retriableFetchSDK as jest.Mock).mockResolvedValueOnce({
      result: 'mock result',
    });
  });

  const dataLayer = new ConsumerSubscriptionDataLayer(MOCK_PUBLIC_TOKEN);

  const mockAdditionalTelemetryDataFn = () => ({
    stytch_user_id: 'mock_user_id',
    stytch_session_id: 'mock_session_id',
  });

  const networkClient = new NetworkClient(
    MOCK_PUBLIC_TOKEN,
    dataLayer,
    'https://live.example.com',
    'https://example.com',
    mockAdditionalTelemetryDataFn,
  );

  describe('createTelemetryBlob', () => {
    it('Returns a blob in the expected format', () => {
      expect(networkClient.createTelemetryBlob()).toEqual({
        app: {
          identifier: 'example.com',
        },
        app_session_id: expect.stringContaining('app-session-id'),
        client_sent_at: expect.any(String),
        event_id: expect.stringContaining('event-id'),
        persistent_id: expect.stringContaining('persistent-id'),
        stytch_user_id: 'mock_user_id',
        stytch_session_id: 'mock_session_id',
        sdk: {
          identifier: 'Stytch.js Javascript SDK',
          version: expect.any(String),
        },
        timezone: expect.any(String),
      });
    });

    it('Does not include ports in the app identifier', () => {
      jsdom.reconfigure({
        url: 'http://localhost:8080',
      });
      expect(networkClient.createTelemetryBlob()).toMatchObject({
        app: {
          identifier: 'localhost',
        },
      });
    });
  });

  describe('retriableSDK', () => {
    it('Calls retriableFetchSDK and returns the result', async () => {
      await expect(
        networkClient.retriableFetchSDK({
          method: 'POST',
          url: '/oauth/authenticate',
          body: { mock: 'token' },
          retryCallback: expect.any(Function),
        }),
      ).resolves.toEqual({
        result: 'mock result',
      });

      expect(retriableFetchSDK).toHaveBeenCalledWith({
        // Base64 encoded MOCK_PUBLIC_TOKEN:MOCK_PUBLIC_TOKEN
        basicAuthHeader: 'Basic cHVibGljLXRva2VuLXRlc3QtMTIzOnB1YmxpYy10b2tlbi10ZXN0LTEyMw==',
        body: {
          mock: 'token',
        },
        finalURL: 'https://example.com/sdk/v1/oauth/authenticate',
        method: 'POST',
        xSDKClientHeader: expect.any(String),
        xSDKParentHostHeader: 'https://example.com',
        retryCallback: expect.any(Function),
      });
    });
  });
  describe('fetchSDK', () => {
    describe('When logged out', () => {
      it('Calls baseFetchSDK and returns the result', async () => {
        await expect(
          networkClient.fetchSDK({
            method: 'POST',
            url: '/oauth/authenticate',
            body: { mock: 'token' },
          }),
        ).resolves.toEqual({
          result: 'mock result',
        });

        expect(baseFetchSDK).toHaveBeenCalledWith({
          // Base64 encoded MOCK_PUBLIC_TOKEN:MOCK_PUBLIC_TOKEN
          basicAuthHeader: 'Basic cHVibGljLXRva2VuLXRlc3QtMTIzOnB1YmxpYy10b2tlbi10ZXN0LTEyMw==',
          body: {
            mock: 'token',
          },
          finalURL: 'https://example.com/sdk/v1/oauth/authenticate',
          method: 'POST',
          xSDKClientHeader: expect.any(String),
          xSDKParentHostHeader: 'https://example.com',
        });
      });

      it('Includes ports in the xSDKParentHostHeader', async () => {
        jsdom.reconfigure({
          url: 'http://localhost:8080',
        });
        await expect(
          networkClient.fetchSDK({
            method: 'POST',
            url: '/oauth/authenticate',
            body: { mock: 'token' },
          }),
        ).resolves.toEqual({
          result: 'mock result',
        });

        expect(baseFetchSDK).toHaveBeenCalledWith(
          expect.objectContaining({
            xSDKParentHostHeader: 'http://localhost:8080',
          }),
        );
      });
    });

    describe('When logged in', () => {
      it('Calls baseFetchSDK and returns the result', async () => {
        dataLayer.writeSessionCookie(MOCK_AUTHENTICATE_STATE_UPDATE as any);

        await expect(
          networkClient.fetchSDK({
            method: 'POST',
            url: '/oauth/authenticate',
            body: { mock: 'token' },
          }),
        ).resolves.toEqual({
          result: 'mock result',
        });

        expect(baseFetchSDK).toHaveBeenCalledWith(
          expect.objectContaining({
            // Base64 encoded MOCK_PUBLIC_TOKEN:session_token
            basicAuthHeader: 'Basic cHVibGljLXRva2VuLXRlc3QtMTIzOnNlc3Npb25fdG9rZW4=',
          }),
        );
      });
    });
  });

  describe('buildSDKUrl', () => {
    it('Creates a sdk-scoped URL from the inputs', () => {
      expect(networkClient.buildSDKUrl('/oauth/authenticate')).toEqual('https://example.com/sdk/v1/oauth/authenticate');
    });
  });
});
