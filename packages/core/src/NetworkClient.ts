import { AnalyticsEvent } from './Events';
import { ResponseCommon, StytchAPIUnreachableError, StytchAPIError, StytchAPISchemaError } from './public';

type SDKRequestMethodAndBody =
  | {
      method: 'GET' | 'DELETE';
      body?: null;
    }
  | {
      method: 'POST' | 'PUT';
      body?: Record<string, unknown>;
    };

export type SDKRequestInfo = SDKRequestMethodAndBody & {
  url: string;
  additionalMetadata?: Record<string, string>;
};

export interface SDKTelemetry {
  event_id: string;
  app_session_id: string;
  persistent_id: string;
  client_sent_at: string;
  timezone: string;

  // Logged in user data
  // Why don't we generate this from the session_token in the auth header?
  // - We don't want to tie analytics ingest to session validation. There's no need to put
  //   that kind of pressure on API, and ingest could be moved to somewhere that doesn't
  //   have the ability to validate tokens
  // - For bulk event batches, we want to keep track of whether or not a user was logged
  //   in at each event. If we have 10 events, the user logs in at event 5, then they'll have
  //   a token when they log the batch, but we want to know that they were not logged in for the
  //   first 4 events

  // Versioning
  app: {
    identifier: string;
    version?: string;
  };
  os?: {
    identifier?: string;
    version?: string;
  };
  device?: {
    model?: string;
    screen_size?: string;
  };
  sdk: {
    identifier: string;
    version: string;
  };
}

export type AdditionalTelemetryData =
  | { stytch_user_id?: string; stytch_session_id?: string }
  | { stytch_member_id?: string; stytch_member_session_id?: string };

export interface INetworkClient {
  createTelemetryBlob(additionalMetadata?: SDKRequestInfo['additionalMetadata']): SDKTelemetry;

  fetchSDK: <T extends ResponseCommon>(info: SDKRequestInfo) => Promise<T>;

  retriableFetchSDK: <T extends ResponseCommon>(info: RetriableSDKRequestInfo) => Promise<T>;

  logEvent<E extends AnalyticsEvent>({
    name,
    details,
    error,
  }: {
    name: E['name'];
    details: E['details'];
    error?: { error_code?: string; error_description?: string; http_status_code?: string };
  }): void;

  // @deprecated Use the new sessions.updateSession() method instead
  updateSessionToken: (sessionToken: string | null) => void;
}

export type RetriableSDKRequestInfo = SDKRequestInfo & {
  retryCallback: (e: RetriableError, info: SDKBaseRequestInfo) => Promise<SDKBaseRequestInfo>;
};

export type RetriableSDKBaseRequestInfo = SDKBaseRequestInfo & {
  retryCallback: (e: RetriableError, info: SDKBaseRequestInfo) => Promise<SDKBaseRequestInfo>;
};

export enum RetriableErrorType {
  RequiredCaptcha = 'CAPTCHA required',
}

export class RetriableError extends Error {
  type: RetriableErrorType;

  constructor(type: RetriableErrorType) {
    super(type);
    this.type = type;
  }
}

export async function retriableFetchSDK<T extends ResponseCommon>({
  method,
  finalURL,
  basicAuthHeader,
  xSDKClientHeader,
  xSDKParentHostHeader,
  body,
  retryCallback,
}: RetriableSDKBaseRequestInfo): Promise<T> {
  let req: SDKBaseRequestInfo = {
    method,
    finalURL,
    basicAuthHeader,
    xSDKClientHeader,
    xSDKParentHostHeader,
    body,
  };

  try {
    return await baseFetchSDK<T>(req);
  } catch (err) {
    if (err instanceof RetriableError) {
      req = await retryCallback(err, req);
      return await baseFetchSDK<T>(req);
    }
    throw err;
  }
}

export type SDKBaseRequestInfo = {
  basicAuthHeader: string;
  xSDKClientHeader: string;
  xSDKParentHostHeader?: string;
  body: SDKRequestInfo['body'];
  method: SDKRequestInfo['method'];
  finalURL: string;
};

export async function baseFetchSDK<T extends ResponseCommon>({
  method,
  finalURL,
  basicAuthHeader,
  xSDKClientHeader,
  xSDKParentHostHeader,
  body,
}: SDKBaseRequestInfo): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: basicAuthHeader,
    'Content-Type': 'application/json',
    'X-SDK-Client': xSDKClientHeader,
  };

  if (xSDKParentHostHeader) {
    headers['X-SDK-Parent-Host'] = xSDKParentHostHeader;
  }

  const fetchOpts: RequestInit = {
    method,
    headers,
    body: body && JSON.stringify(body),
    credentials: 'include',
  };

  let resp;
  try {
    resp = await fetch(finalURL, fetchOpts);
    /* eslint-disable  @typescript-eslint/no-explicit-any */
  } catch (e: any) {
    if (e.message === 'Failed to fetch') {
      throw new StytchAPIUnreachableError('Unable to contact our servers.');
    }
    throw e;
  }

  // We only return 200 from WB endpoints, but just in case let's accept all 2xx errors
  if (resp.status <= 299) {
    try {
      const respData = await resp.json();
      return respData.data;
    } catch {
      throw new StytchAPIUnreachableError('Invalid JSON response from our servers.');
    }
  }

  // 99% of errors will be well-formed JSON errors with an appropriate content-type set
  if (resp.status !== 200 && resp.headers.get('content-type')?.includes('application/json')) {
    let respError;
    try {
      respError = await resp.json();
    } catch {
      // Error was not JSON- but the content type said it was! This means the server lied to us, which it should never do...
      throw new StytchAPIUnreachableError('Invalid or no response from server');
    }
    // If this looks like a JSONSchema validation error, it probably means the caller isn't using
    // typescript and gave us a bad type.
    if ('body' in respError || 'params' in respError || 'query' in respError) {
      throw new StytchAPISchemaError(respError);
    }
    throw new StytchAPIError(respError);
  }

  // Finally handle the other 1% of errors (Captcha errors, network errors, 503s, etc.)
  let respData;
  try {
    respData = await resp.text();
  } catch {
    throw new StytchAPIUnreachableError('Invalid response from our servers.');
  }
  if (respData.includes('Captcha required')) {
    throw new RetriableError(RetriableErrorType.RequiredCaptcha);
  }
  throw new StytchAPIUnreachableError('Invalid response from our servers.');
}

export async function baseSubmitFormSDK({
  method,
  finalURL,
  basicAuthHeader,
  xSDKClientHeader,
  xSDKParentHostHeader,
  body,
}: SDKBaseRequestInfo): Promise<void> {
  const bodyParams = (body || {}) as Record<string, string>;
  const finalBody: Record<string, string> = {
    ...bodyParams,
    __Authorization: basicAuthHeader,
    '__X-SDK-Client': xSDKClientHeader,
  };

  if (xSDKParentHostHeader) {
    finalBody['__X-SDK-Parent-Host'] = xSDKParentHostHeader;
  }

  const children: HTMLInputElement[] = Object.entries(finalBody).map(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value;
    return input;
  });

  const form = document.createElement('form');
  form.method = method;
  form.action = finalURL;
  form.append(...children);

  document.body.appendChild(form);
  form.submit();
}
