import { getLiveApiURL, getTestApiURL } from './api';
import { LIVE_API_URL, TEST_API_URL } from '../constants';
import { InternalStytchClientOptions } from '../types';
import { logger } from './logger';

jest.mock('./logger', () => ({
  logger: {
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('getLiveApiURL', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockEndpoints = {
    testAPIURL: 'https://test-api-url.example.com',
    dfpBackendURL: 'https://dfp-backend-url.example.com',
    clientsideServicesIframeURL: 'https://clientside-services-iframe-url.example.com',
  } as const;

  it('should return the default LIVE_API_URL when no options are provided', () => {
    expect(getLiveApiURL(undefined)).toBe(LIVE_API_URL);
  });

  it('should use the domain specified in customBaseUrl', () => {
    const options: InternalStytchClientOptions = {
      customBaseUrl: 'api.endpoint.example.com',
    };
    expect(getLiveApiURL(options)).toBe('https://api.endpoint.example.com');
  });

  it('should use the domain specified in endpointOptions when customBaseUrl is not provided', () => {
    const options: InternalStytchClientOptions = {
      endpointOptions: {
        apiDomain: 'api.endpoint.example.com',
      },
    };
    expect(getLiveApiURL(options)).toBe('https://api.endpoint.example.com');
  });

  it('should use domain from valid URL', () => {
    const options: InternalStytchClientOptions = {
      customBaseUrl: 'https://api.endpoint.example.com',
    };
    expect(getLiveApiURL(options)).toBe('https://api.endpoint.example.com');
  });

  it('should use domain from valid URL with non-https scheme', () => {
    const options: InternalStytchClientOptions = {
      customBaseUrl: 'http://api.endpoint.example.com',
    };
    expect(getLiveApiURL(options)).toBe('https://api.endpoint.example.com');
  });

  it('should use domain from valid URL with non-https scheme and other properties', () => {
    const options: InternalStytchClientOptions = {
      customBaseUrl: 'http://api.endpoint.example.com:8080/path?query=value#fragment',
    };
    expect(getLiveApiURL(options)).toBe('https://api.endpoint.example.com');
  });

  it('should warn if invalid customBaseUrl is provided and fallback to default value', () => {
    const options: InternalStytchClientOptions = {
      customBaseUrl: 'invalid api domain',
    };

    expect(getLiveApiURL(options)).toBe(LIVE_API_URL);
    expect(logger.warn).toHaveBeenCalledWith(
      `Unable to use custom API domain \`invalid api domain\`. customBaseUrl should be a valid domain.`,
    );
  });

  it('should use the liveAPIURL specified in endpoints', () => {
    const options: InternalStytchClientOptions = {
      endpoints: { ...mockEndpoints, liveAPIURL: 'https://custom-api-url.example.com' },
    };
    expect(getLiveApiURL(options)).toBe('https://custom-api-url.example.com');
  });

  it('should prioritize customBaseUrl over endpointOptions.apiDomain and endpoints.liveAPIURL when all are provided', () => {
    const options: InternalStytchClientOptions = {
      customBaseUrl: 'api.custom.example.com',
      endpointOptions: {
        apiDomain: 'api.endpoint.example.com',
      },
      endpoints: { ...mockEndpoints, liveAPIURL: 'https://custom-api-url.example.com' },
    };
    expect(getLiveApiURL(options)).toBe('https://api.custom.example.com');
  });

  it('should prioritize endpointOptions.apiDomain over endpoints.liveAPIURL when customBaseUrl is not provided', () => {
    const options: InternalStytchClientOptions = {
      endpointOptions: {
        apiDomain: 'api.endpoint.example.com',
      },
      endpoints: { ...mockEndpoints, liveAPIURL: 'https://custom-api-url.example.com' },
    };
    expect(getLiveApiURL(options)).toBe('https://api.endpoint.example.com');
  });
});

describe('getTestApiURL', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockEndpoints = {
    liveAPIURL: 'https://api.endpoint.example.com',
    dfpBackendURL: 'https://dfp-backend-url.example.com',
    clientsideServicesIframeURL: 'https://clientside-services-iframe-url.example.com',
  } as const;

  it('should return the default TEST_API_URL when no options are provided', () => {
    expect(getTestApiURL(undefined)).toBe(TEST_API_URL);
  });

  it('should use the domain specified in customBaseUrl', () => {
    const options: InternalStytchClientOptions = {
      customBaseUrl: 'test.endpoint.example.com',
    };
    expect(getTestApiURL(options)).toBe('https://test.endpoint.example.com');
  });

  it('should use the domain specified in endpointOptions when customBaseUrl is not provided', () => {
    const options: InternalStytchClientOptions = {
      endpointOptions: {
        testApiDomain: 'test.endpoint.example.com',
      },
    };
    expect(getTestApiURL(options)).toBe('https://test.endpoint.example.com');
  });

  it('should use domain from valid URL', () => {
    const options: InternalStytchClientOptions = {
      customBaseUrl: 'https://test.endpoint.example.com',
    };
    expect(getTestApiURL(options)).toBe('https://test.endpoint.example.com');
  });

  it('should use domain from valid URL with non-https scheme', () => {
    const options: InternalStytchClientOptions = {
      customBaseUrl: 'http://test.endpoint.example.com',
    };
    expect(getTestApiURL(options)).toBe('https://test.endpoint.example.com');
  });

  it('should use domain from valid URL with non-https scheme and other properties', () => {
    const options: InternalStytchClientOptions = {
      customBaseUrl: 'http://test.endpoint.example.com:8080/path?query=value#fragment',
    };
    expect(getTestApiURL(options)).toBe('https://test.endpoint.example.com');
  });

  it('should warn if invalid customBaseUrl is provided and fallback to default value', () => {
    const options: InternalStytchClientOptions = {
      customBaseUrl: 'invalid api domain',
    };

    expect(getTestApiURL(options)).toBe(TEST_API_URL);
    expect(logger.warn).toHaveBeenCalledWith(
      `Unable to use custom API domain \`invalid api domain\`. customBaseUrl should be a valid domain.`,
    );
  });

  it('should use the testAPIURL specified in endpoints', () => {
    const options: InternalStytchClientOptions = {
      endpoints: { ...mockEndpoints, testAPIURL: 'https://custom-api-url.example.com' },
    };
    expect(getTestApiURL(options)).toBe('https://custom-api-url.example.com');
  });

  it('should prioritize customBaseUrl over endpoints.testAPIURL when customBaseUrl is provided', () => {
    const options: InternalStytchClientOptions = {
      customBaseUrl: 'test.example.com',
      endpointOptions: {
        testApiDomain: 'test.endpoint.example.com',
      },
      endpoints: { ...mockEndpoints, testAPIURL: 'https://custom-api-url.example.com' },
    };
    expect(getTestApiURL(options)).toBe('https://test.example.com');
  });
});
