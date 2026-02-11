import { NetworkClient } from './NetworkClient';
import { StytchProjectConfigurationInput } from '@stytch/core/public';
import getVersion from './version';
import { baseFetchSDK } from '@stytch/core';
import { ResponseCommon } from '@stytch/core/public';
import { encode as btoa } from 'base-64';
import { createTestFixtures } from './testUtils';

const publicToken = 'my-test-public-token';
const sessionToken = 'my-session-token';
const now = new Date();
const expectedTelemetryBlob = {
  event_id: 'event-id-test-uuid',
  app_session_id: 'app-session-id-test-uuid',
  persistent_id: 'persistent-id-test-uuid',
  client_sent_at: now.toISOString(),
  timezone: 'UTC',
  app: { identifier: 'test-bundle-id' },
  sdk: { identifier: '@stytch/react-native', version: getVersion() },
  os: {
    identifier: 'test-system-name',
    version: 'test-system-version',
  },
  device: { model: 'test-device-id', screen_size: 'TODO' },
};

jest.mock('react-native-uuid', () => ({
  v4: () => 'test-uuid',
}));

jest.mock('@stytch/core', () => ({
  ...jest.requireActual('@stytch/core'),
  baseFetchSDK: jest.fn(),
}));

jest.mock('./native-module', function () {
  return {
    __esModule: true,
    default: class {
      DeviceInfo = {
        get: () => ({
          systemName: 'test-system-name',
          systemVersion: 'test-system-version',
          deviceId: 'test-device-id',
          bundleId: 'test-bundle-id',
          timezone: 'UTC',
        }),
      };
    },
  };
});

describe('NetworkClient', () => {
  let client: NetworkClient<StytchProjectConfigurationInput>;
  const { subscriptionService } = createTestFixtures();
  beforeAll(() => {
    client = new NetworkClient(publicToken, subscriptionService, 'https://example.com');
    jest.useFakeTimers();
    jest.setSystemTime(now);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('createEventId', () => {
    it('creates the correct event ID', () => {
      const eventId = client.createEventId();
      expect(eventId).toStrictEqual(`event-id-test-uuid`);
    });
  });

  describe('createAppSessionId', () => {
    it('creates the correct app session ID', () => {
      const appSessionId = client.createAppSessionId();
      expect(appSessionId).toStrictEqual(`app-session-id-test-uuid`);
    });
  });

  describe('createPersistentId', () => {
    it('creates the correct persistent ID', () => {
      const persistentId = client.createPersistentId();
      expect(persistentId).toStrictEqual(`persistent-id-test-uuid`);
    });
  });

  describe('createTelemetryBlob', () => {
    it('creates the correct telemetry blob', () => {
      const telemetryBlob = client.createTelemetryBlob();
      expect(telemetryBlob).toStrictEqual(expectedTelemetryBlob);
    });
  });

  describe('fetchSDK', () => {
    describe('When no session token is present', () => {
      it('passes the expected headers to baseFetchSDK', () => {
        jest.spyOn(subscriptionService, 'getTokens').mockReturnValueOnce(null);
        const expectedAuthHeaderNoSessionToken = 'Basic ' + btoa(publicToken + ':' + publicToken);
        const expectedXSDKClientHeader = btoa(JSON.stringify(expectedTelemetryBlob));
        const expectedRequest = {
          basicAuthHeader: expectedAuthHeaderNoSessionToken,
          body: undefined,
          finalURL: 'https://example.com/sdk/v1/test/endpoint',
          method: 'POST',
          xSDKClientHeader: expectedXSDKClientHeader,
        };
        (baseFetchSDK as jest.Mock).mockReturnValueOnce(jest.fn());
        client.fetchSDK<ResponseCommon>({
          url: `/test/endpoint`,
          method: 'POST',
        });
        expect(baseFetchSDK as jest.Mock).toHaveBeenCalledWith(expectedRequest);
      });
    });

    describe('When a session token is present', () => {
      it('passes the expected headers to baseFetchSDK', () => {
        jest.spyOn(subscriptionService, 'getTokens').mockReturnValueOnce({ session_token: sessionToken });
        const expectedAuthHeaderNoSessionToken = 'Basic ' + btoa(publicToken + ':' + sessionToken);
        const expectedXSDKClientHeader = btoa(JSON.stringify(expectedTelemetryBlob));
        const expectedRequest = {
          basicAuthHeader: expectedAuthHeaderNoSessionToken,
          body: undefined,
          finalURL: 'https://example.com/sdk/v1/test/endpoint',
          method: 'POST',
          xSDKClientHeader: expectedXSDKClientHeader,
        };
        (baseFetchSDK as jest.Mock).mockReturnValueOnce(jest.fn());
        client.fetchSDK<ResponseCommon>({
          url: `/test/endpoint`,
          method: 'POST',
        });
        expect(baseFetchSDK as jest.Mock).toHaveBeenCalledWith(expectedRequest);
      });
    });
  });
});
