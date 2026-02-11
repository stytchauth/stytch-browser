import {
  baseFetchSDK,
  EventLogger,
  IB2BSubscriptionService,
  IConsumerSubscriptionService,
  INetworkClient,
  retriableFetchSDK,
  RetriableSDKRequestInfo,
  SDKRequestInfo,
  SDKTelemetry,
  DEFAULT_INTERVAL_DURATION_MS,
  DEFAULT_MAX_BATCH_SIZE,
} from '@stytch/core';
import { ResponseCommon, StytchProjectConfigurationInput } from '@stytch/core/public';
import { encode as btoa } from 'base-64';
import uuid from 'react-native-uuid';
import StytchReactNativeModule, { DeviceInfoResponse } from './native-module';
import getVersion from './version';

export class NetworkClient<TProjectConfiguration extends StytchProjectConfigurationInput> implements INetworkClient {
  private deviceInfo: DeviceInfoResponse;
  private eventLogger: EventLogger;
  constructor(
    private _publicToken: string,
    private _subscriptionService:
      | IConsumerSubscriptionService<TProjectConfiguration>
      | IB2BSubscriptionService<TProjectConfiguration>,
    private baseURL: string,
  ) {
    const nativeModule = new StytchReactNativeModule();
    this.deviceInfo = nativeModule.DeviceInfo.get();
    this.eventLogger = new EventLogger({
      maxBatchSize: DEFAULT_MAX_BATCH_SIZE,
      intervalDurationMs: DEFAULT_INTERVAL_DURATION_MS,
      logEventURL: this.buildSDKUrl('/events'),
    });
  }

  // @deprecated Use the new sessions.updateSession() method instead
  updateSessionToken = () => {
    return null;
  };

  // logEvent = (event: Record<string, unknown>) => {
  logEvent = ({
    name,
    details,
    error = {},
  }: {
    name: string;
    details: Record<string, unknown>;
    error?: { error_code?: string; error_description?: string; http_status_code?: string };
  }): void => {
    this.eventLogger.logEvent(this.createTelemetryBlob(), {
      public_token: this._publicToken,
      event_name: name,
      details: details,

      // Error fields
      error_code: error?.error_code,
      error_description: error?.error_description,
      http_status_code: error?.http_status_code,
    });
  };

  createEventId = () => {
    return `event-id-${uuid.v4()}`;
  };

  createAppSessionId = () => {
    return `app-session-id-${uuid.v4()}`;
  };

  createPersistentId = () => {
    return `persistent-id-${uuid.v4()}`;
  };

  createTelemetryBlob = (): SDKTelemetry => {
    return {
      event_id: this.createEventId(),
      // TODO: These should be persisted somewhere, not generated per request
      app_session_id: this.createAppSessionId(),
      persistent_id: this.createPersistentId(),

      client_sent_at: new Date().toISOString(),
      timezone: this.deviceInfo.timezone,
      app: { identifier: this.deviceInfo.bundleId },
      sdk: { identifier: '@stytch/react-native', version: getVersion() },
      os: {
        identifier: this.deviceInfo.systemName,
        version: this.deviceInfo.systemVersion,
      },
      device: { model: this.deviceInfo.deviceId, screen_size: 'TODO' },
    };
  };

  fetchSDK = async <T extends ResponseCommon>({ url, body, method }: SDKRequestInfo): Promise<T> => {
    const sessionToken = this._subscriptionService.getTokens()?.session_token;
    const basicAuthHeader = 'Basic ' + btoa(this._publicToken + ':' + (sessionToken || this._publicToken));
    const xSDKClientHeader = btoa(JSON.stringify(this.createTelemetryBlob()));
    return baseFetchSDK<T>({
      basicAuthHeader,
      body,
      finalURL: this.buildSDKUrl(url),
      method,
      xSDKClientHeader,
    });
  };

  retriableFetchSDK = async <T extends ResponseCommon>({
    url,
    body,
    method,
    retryCallback,
  }: RetriableSDKRequestInfo): Promise<T> => {
    const sessionToken = this._subscriptionService.getTokens()?.session_token;
    const basicAuthHeader = 'Basic ' + btoa(this._publicToken + ':' + (sessionToken || this._publicToken));
    const xSDKClientHeader = btoa(JSON.stringify(this.createTelemetryBlob()));
    return retriableFetchSDK<T>({
      basicAuthHeader,
      body,
      finalURL: this.buildSDKUrl(url),
      method,
      xSDKClientHeader,
      retryCallback,
    });
  };

  buildSDKUrl(url: string): string {
    return `${this.baseURL}/sdk/v1${url}`;
  }
}
