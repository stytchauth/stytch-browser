import {
  baseFetchSDK,
  baseSubmitFormSDK,
  RetriableError,
  RetriableErrorType,
  retriableFetchSDK,
} from './NetworkClient';
import { StytchAPIUnreachableError, StytchAPIError, StytchAPISchemaError } from './public';
import { MOCK_REQUEST_ID } from '@stytch/internal-mocks';

const EXPECTED_DATA = { ['I AM']: 'THE DATA' };
const MOCK_API_ERROR = {
  status_code: 400,
  request_id: MOCK_REQUEST_ID,
  error_type: 'mock-error-type',
  error_message: 'mock-error-message',
  error_url: 'mock-error-url',
};
const MOCK_INVALID_SCHEMA_ERROR = {
  body: [
    {
      keyword: 'type',
      dataPath: '.session_duration_minutes',
      schemaPath: '#/properties/session_duration_minutes/type',
      params: { type: 'number' },
      message: 'should be number',
    },
  ],
};

const FETCH_MOCK = jest.fn();
(global as any).fetch = FETCH_MOCK;

const mockRequestInfo = ({
  method = 'GET',
  finalURL = 'https://example.com/v1/endpoint',
  basicAuthHeader = 'mock-basic-auth-header',
  xSDKClientHeader = 'mock-x-sdk-client-header',
  xSDKParentHostHeader = undefined,
  body = null,
}: Partial<Parameters<typeof baseFetchSDK>[0]> = {}) => ({
  method,
  finalURL,
  basicAuthHeader,
  xSDKClientHeader,
  xSDKParentHostHeader,
  body,
});

describe('baseFetchSDK', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    FETCH_MOCK.mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({ data: EXPECTED_DATA }),
    });
  });
  it('Calls fetch and returns the JSON parsed result', async () => {
    const requestInfo = mockRequestInfo();
    await expect(baseFetchSDK(requestInfo)).resolves.toEqual(EXPECTED_DATA);
    expect(global.fetch).toHaveBeenCalledWith('https://example.com/v1/endpoint', {
      body: null,
      headers: {
        Authorization: 'mock-basic-auth-header',
        'Content-Type': 'application/json',
        'X-SDK-Client': 'mock-x-sdk-client-header',
      },
      method: 'GET',
      credentials: 'include',
    });
  });
  it('Passes in the X-SDK-Parent-Host header when specified', async () => {
    const requestInfo = mockRequestInfo({
      xSDKParentHostHeader: 'mock-x-sdk-parent-host-header',
    });
    await expect(baseFetchSDK(requestInfo)).resolves.toEqual(EXPECTED_DATA);
    expect(global.fetch).toHaveBeenCalledWith('https://example.com/v1/endpoint', {
      body: null,
      headers: {
        Authorization: 'mock-basic-auth-header',
        'Content-Type': 'application/json',
        'X-SDK-Client': 'mock-x-sdk-client-header',
        'X-SDK-Parent-Host': 'mock-x-sdk-parent-host-header',
      },
      method: 'GET',
      credentials: 'include',
    });
  });
  it('Passes in the stringified body when specified', async () => {
    const requestInfo = mockRequestInfo({
      method: 'POST',
      body: { some: 'json body' },
    });
    await expect(baseFetchSDK(requestInfo)).resolves.toEqual(EXPECTED_DATA);
    expect(global.fetch).toHaveBeenCalledWith('https://example.com/v1/endpoint', {
      body: '{"some":"json body"}',
      headers: {
        Authorization: 'mock-basic-auth-header',
        'Content-Type': 'application/json',
        'X-SDK-Client': 'mock-x-sdk-client-header',
      },
      method: 'POST',
      credentials: 'include',
    });
  });
  it('Throws an SDKAPIUnreachableError error on a Failed To Fetch', async () => {
    const requestInfo = mockRequestInfo();
    FETCH_MOCK.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(baseFetchSDK(requestInfo)).rejects.toEqual(
      new StytchAPIUnreachableError('Unable to contact our servers.'),
    );
  });
  it('Bubbles up other fetch errors', async () => {
    const requestInfo = mockRequestInfo();
    FETCH_MOCK.mockRejectedValue(new TypeError('Invalid header'));
    await expect(baseFetchSDK(requestInfo)).rejects.toEqual(new TypeError('Invalid header'));
  });
  it('Throws an StytchAPIError error if the request does not return a 200', async () => {
    const requestInfo = mockRequestInfo();
    for (const status of [400, 401, 403, 404]) {
      FETCH_MOCK.mockResolvedValue({
        status: status,
        headers: new Headers({ 'content-type': 'application/json; utf8' }),
        json: () => Promise.resolve(MOCK_API_ERROR),
      });
      await expect(baseFetchSDK(requestInfo)).rejects.toEqual(new StytchAPIError(MOCK_API_ERROR));
    }
  });
  it('Throws an StytchSDKSchemaError error if the request does not return a 200 and the body looks like a JSONSchema validation error', async () => {
    const requestInfo = mockRequestInfo();
    FETCH_MOCK.mockResolvedValue({
      status: 400,
      headers: new Headers({ 'content-type': 'application/json; utf8' }),
      json: () => Promise.resolve(MOCK_INVALID_SCHEMA_ERROR),
    });
    await expect(baseFetchSDK(requestInfo)).rejects.toEqual(new StytchAPISchemaError(MOCK_INVALID_SCHEMA_ERROR));
  });
  it('Throws an SDKAPIUnreachableError error if the request does not return a 200 and the response cannot be parsed as JSON', async () => {
    const requestInfo = mockRequestInfo();
    FETCH_MOCK.mockResolvedValue({
      status: 400,
      headers: new Headers({ 'content-type': 'application/json; utf8' }),
      json: () => Promise.reject(new Error('I am not JSON')),
    });
    await expect(baseFetchSDK(requestInfo)).rejects.toEqual(
      new StytchAPIUnreachableError('Invalid or no response from server'),
    );
  });
  it('Throws an SDKAPIUnreachableError error if the request returns a 200 and the response cannot be parsed as JSON', async () => {
    const requestInfo = mockRequestInfo();
    FETCH_MOCK.mockResolvedValue({
      status: 200,
      headers: new Headers({ 'content-type': 'application/json; utf8' }),
      json: () => Promise.reject(new Error('I am not JSON')),
    });
    await expect(baseFetchSDK(requestInfo)).rejects.toEqual(
      new StytchAPIUnreachableError('Invalid JSON response from our servers.'),
    );
  });
  it('throws an Error if a error with a `Captcha required` message and 403 status code is returned', async () => {
    const requestInfo = mockRequestInfo();
    FETCH_MOCK.mockResolvedValue({
      status: 403,
      headers: new Headers({ 'content-type': 'application/html; utf8' }),
      text: () => Promise.resolve('Captcha required'),
    });
    await expect(baseFetchSDK(requestInfo)).rejects.toEqual(new RetriableError(RetriableErrorType.RequiredCaptcha));
  });
});

describe('retriableFetchSDK', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    FETCH_MOCK.mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({ data: EXPECTED_DATA }),
    });
  });
  it('Calls fetch and returns the JSON parsed result', async () => {
    const requestInfo = mockRequestInfo();
    const retryCallback = jest.fn();
    expect(retryCallback).not.toHaveBeenCalled();
    await expect(retriableFetchSDK({ retryCallback, ...requestInfo })).resolves.toEqual(EXPECTED_DATA);
    expect(global.fetch).toHaveBeenCalledWith('https://example.com/v1/endpoint', {
      body: null,
      headers: {
        Authorization: 'mock-basic-auth-header',
        'Content-Type': 'application/json',
        'X-SDK-Client': 'mock-x-sdk-client-header',
      },
      method: 'GET',
      credentials: 'include',
    });
  });
  it('Retries the fetch if the request returns the correct error', async () => {
    const requestInfo = mockRequestInfo();
    const retryCallback = jest.fn();
    retryCallback.mockResolvedValueOnce(requestInfo);
    const retriableError = new RetriableError(RetriableErrorType.RequiredCaptcha);
    FETCH_MOCK.mockResolvedValueOnce({
      status: 403,
      headers: new Headers({ 'content-type': 'application/html; utf8' }),
      text: () => Promise.resolve('Captcha required'),
    });
    FETCH_MOCK.mockResolvedValue({
      status: 200,
      json: () => Promise.resolve({ data: EXPECTED_DATA }),
    });

    await expect(retriableFetchSDK({ retryCallback, ...requestInfo })).resolves.toEqual(EXPECTED_DATA);
    expect(FETCH_MOCK).toHaveBeenCalledTimes(2);
    expect(retryCallback).toHaveBeenCalledWith(retriableError, requestInfo);
  });
  it('Throws an error if the first fetch returns the wrong error', async () => {
    const requestInfo = mockRequestInfo();
    const retryCallback = jest.fn();
    FETCH_MOCK.mockResolvedValue({
      status: 200,
      json: () => Promise.reject(new Error('I am not JSON')),
    });
    await expect(retriableFetchSDK({ retryCallback, ...requestInfo })).rejects.toEqual(
      new StytchAPIUnreachableError('Invalid JSON response from our servers.'),
    );
    expect(retryCallback).toHaveBeenCalledTimes(0);
    expect(FETCH_MOCK).toHaveBeenCalledTimes(1);
  });
});

describe('baseSubmitFormSDK', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });
  it('Creates a form with all attached fields', async () => {
    const requestInfo = mockRequestInfo({
      method: 'POST',
      body: { stringKey: 'someValue', numberKey: 1234 },
    });
    await baseSubmitFormSDK(requestInfo);
    const form = document.forms[0];
    expect(form.method).toEqual(requestInfo.method?.toLowerCase());
    expect(form.action).toEqual(requestInfo.finalURL);
    const data = new FormData(form);
    expect(data.get('__Authorization')).toEqual(requestInfo.basicAuthHeader);
    expect(data.get('__X-SDK-Client')).toEqual(requestInfo.xSDKClientHeader);
    expect(data.get('stringKey')).toEqual('someValue');
    expect(data.get('numberKey')).toEqual('1234');
  });
  it('With xSDKParentHostHeader', async () => {
    const requestInfo = mockRequestInfo({
      xSDKParentHostHeader: 'mock-x-sdk-parent-host-header',
    });
    await baseSubmitFormSDK(requestInfo);
    const form = document.forms[0];
    const data = new FormData(form);
    expect(data.get('__X-SDK-Parent-Host')).toEqual(requestInfo.xSDKParentHostHeader);
  });
});
