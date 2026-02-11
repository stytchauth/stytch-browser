import {
  AdditionalTelemetryData,
  baseFetchSDK,
  baseSubmitFormSDK,
  createAppSessionId,
  createEventId,
  createPersistentId,
  DEFAULT_INTERVAL_DURATION_MS,
  DEFAULT_MAX_BATCH_SIZE,
  EventLogger,
  INetworkClient,
  isTestPublicToken,
  retriableFetchSDK,
  RetriableSDKRequestInfo,
  SDKRequestInfo,
  SDKTelemetry,
} from '@stytch/core';
import { ResponseCommon } from '@stytch/core/public';

import { version as PACKAGE_VERSION } from '../package.json';
import { B2BSubscriptionDataLayer, ConsumerSubscriptionDataLayer } from './SubscriptionService';

export class NetworkClient implements INetworkClient {
  private eventLogger: EventLogger;
  private readonly baseURL: string;

  constructor(
    private _publicToken: string,
    private _subscriptionDataLayer: ConsumerSubscriptionDataLayer | B2BSubscriptionDataLayer,
    _liveAPIURL: string,
    _testAPIURL: string,
    private additionalTelemetryDataFn: () => AdditionalTelemetryData,
  ) {
    this.baseURL = _liveAPIURL;
    if (isTestPublicToken(_publicToken)) {
      this.baseURL = _testAPIURL;
    }
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

  logEvent({
    name,
    details,
    error = {},
  }: {
    name: string;
    details: Record<string, unknown>;
    error?: { error_code?: string; error_description?: string; http_status_code?: string };
  }): void {
    this.eventLogger.logEvent(this.createTelemetryBlob(), {
      public_token: this._publicToken,
      event_name: name,
      details: details,

      // Error fields
      error_code: error.error_code,
      error_description: error.error_description,
      http_status_code: error.http_status_code,
    });
  }

  createTelemetryBlob(): SDKTelemetry {
    return {
      event_id: createEventId(),
      // TODO: These should be persisted somewhere, not generated per request
      app_session_id: createAppSessionId(),
      persistent_id: createPersistentId(),

      client_sent_at: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

      // Logged in data
      // This gets passed into the constructor from StytchClient or StytchB2BClient
      // We pass in the user & session id when the Consumer SDK is being used and member & session id
      // when the B2B SDK is being used.

      // Why don't we generate this from the session_token in the auth header?
      // - We don't want to tie analytics ingest to session validation. There's no need to put
      //   that kind of pressure on API, and ingest could be moved to somewhere that doesn't
      //   have the ability to validate tokens
      // - For bulk event batches, we want to keep track of whether or not a user was logged
      //   in at each event. If we have 10 events, the user logs in at event 5, then they'll have
      //   a token when they log the batch, but we want to know that they were not logged in for the
      //   first 4 events
      ...this.additionalTelemetryDataFn(),

      // Versioning
      app: {
        identifier: window.location.hostname,
      },
      sdk: {
        // TODO: Pull these from package.json when there is a package
        // eslint-disable-next-line lingui/no-unlocalized-strings
        identifier: 'Stytch.js Javascript SDK',
        version: PACKAGE_VERSION,
      },
    };
  }

  async fetchSDK<T extends ResponseCommon>({ url, body, method }: SDKRequestInfo): Promise<T> {
    const sessionToken = this._subscriptionDataLayer.readSessionCookie().session_token;
    const basicAuthHeader = 'Basic ' + window.btoa(this._publicToken + ':' + (sessionToken || this._publicToken));
    const xSDKClientHeader = window.btoa(JSON.stringify(this.createTelemetryBlob()));
    const xSDKParentHostHeader = window.location.origin;

    return baseFetchSDK<T>({
      basicAuthHeader,
      body,
      finalURL: this.buildSDKUrl(url),
      method,
      xSDKClientHeader,
      xSDKParentHostHeader,
    });
  }

  async submitFormSDK({ url, body, method }: SDKRequestInfo): Promise<void> {
    const sessionToken = this._subscriptionDataLayer.readSessionCookie().session_token;
    const basicAuthHeader = 'Basic ' + window.btoa(this._publicToken + ':' + (sessionToken || this._publicToken));
    const xSDKClientHeader = window.btoa(JSON.stringify(this.createTelemetryBlob()));
    const xSDKParentHostHeader = window.location.origin;

    return baseSubmitFormSDK({
      basicAuthHeader,
      body,
      finalURL: this.buildSDKUrl(url),
      method,
      xSDKClientHeader,
      xSDKParentHostHeader,
    });
  }

  async retriableFetchSDK<T extends ResponseCommon>({
    url,
    body,
    method,
    retryCallback,
  }: RetriableSDKRequestInfo): Promise<T> {
    const sessionToken = this._subscriptionDataLayer.readSessionCookie().session_token;
    const basicAuthHeader = 'Basic ' + window.btoa(this._publicToken + ':' + (sessionToken || this._publicToken));
    const xSDKClientHeader = window.btoa(JSON.stringify(this.createTelemetryBlob()));
    const xSDKParentHostHeader = window.location.origin;

    return retriableFetchSDK<T>({
      basicAuthHeader,
      body,
      finalURL: this.buildSDKUrl(url),
      method,
      xSDKClientHeader,
      xSDKParentHostHeader,
      retryCallback,
    });
  }

  buildSDKUrl(url: string): string {
    // eslint-disable-next-line lingui/no-unlocalized-strings
    return `${this.baseURL}/sdk/v1${url}`;
  }
}
