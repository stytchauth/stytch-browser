import { STYTCH_DFP_BACKEND_URL, STYTCH_DFP_CDN_URL } from '../constants';
import { InternalStytchClientOptions } from '../types';
import { getDFPBackendURL, getDFPCdnURL } from './dfp';
import { logger } from './logger';

jest.mock('./logger', () => ({
  logger: {
    debug: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('getDFPBackendURL', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockEndpoints = {
    testAPIURL: 'https://test-api-url.example.com',
    liveAPIURL: 'https://live-api-url.example.com',
    clientsideServicesIframeURL: 'https://clientside-services-iframe-url.example.com',
  } as const;

  it('should return the default STYTCH_DFP_BACKEND_URL when no options are provided', () => {
    expect(getDFPBackendURL(undefined)).toBe(STYTCH_DFP_BACKEND_URL);
  });

  it('should use the domain specified in dfppaDomain', () => {
    const options: InternalStytchClientOptions = {
      dfppaUrl: 'dfp.endpoint.example.com',
    };
    expect(getDFPBackendURL(options)).toBe('https://dfp.endpoint.example.com');
  });

  it('should use domain from valid URL', () => {
    const options: InternalStytchClientOptions = {
      dfppaUrl: 'https://dfp.endpoint.example.com',
    };
    expect(getDFPBackendURL(options)).toBe('https://dfp.endpoint.example.com');
  });

  it('should use domain from valid URL with non-https scheme', () => {
    const options: InternalStytchClientOptions = {
      dfppaUrl: 'http://dfp.endpoint.example.com',
    };
    expect(getDFPBackendURL(options)).toBe('https://dfp.endpoint.example.com');
  });

  it('should use domain from valid URL with non-https scheme and other properties', () => {
    const options: InternalStytchClientOptions = {
      dfppaUrl: 'http://dfp.endpoint.example.com:8080/path?query=value#fragment',
    };
    expect(getDFPBackendURL(options)).toBe('https://dfp.endpoint.example.com');
  });

  it('should warn if invalid dfppa domain is provided and fallback to default value', () => {
    const options: InternalStytchClientOptions = {
      dfppaUrl: 'invalid dfppa domain',
    };

    expect(getDFPBackendURL(options)).toBe(STYTCH_DFP_BACKEND_URL);
    expect(logger.warn).toHaveBeenCalledWith(
      'Unable to use custom DFPPA domain `invalid dfppa domain`. dfppaUrl should be a valid domain.',
    );
  });

  it('should use the dfpBackendURL specified in endpoints', () => {
    const options: InternalStytchClientOptions = {
      endpoints: { ...mockEndpoints, dfpBackendURL: 'https://custom-dfp-url.example.com' },
    };
    expect(getDFPBackendURL(options)).toBe('https://custom-dfp-url.example.com');
  });

  it('should prioritize dfppaDomain over endpoints.dfpBackendURL when both are provided', () => {
    const options: InternalStytchClientOptions = {
      dfppaUrl: 'dfp.example.com',
      endpointOptions: {
        dfppaDomain: 'dfp.endpoint.example.com',
      },
      endpoints: { ...mockEndpoints, dfpBackendURL: 'https://custom-dfp-url.example.com' },
    };
    expect(getDFPBackendURL(options)).toBe('https://dfp.example.com');
  });
});

describe('getDFPCdnURL', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the default STYTCH_DFP_CDN_URL when no options are provided', () => {
    expect(getDFPCdnURL(undefined)).toBe(STYTCH_DFP_CDN_URL);
  });

  it('should use the domain specified in dfpCdnDomain', () => {
    const options: InternalStytchClientOptions = {
      dfpCdnUrl: 'dfp.endpoint.example.com',
    };
    expect(getDFPCdnURL(options)).toBe('https://dfp.endpoint.example.com');
  });

  it('should use domain from valid URL', () => {
    const options: InternalStytchClientOptions = {
      dfpCdnUrl: 'https://dfp.endpoint.example.com',
    };
    expect(getDFPCdnURL(options)).toBe('https://dfp.endpoint.example.com');
  });

  it('should use domain from valid URL with non-https scheme', () => {
    const options: InternalStytchClientOptions = {
      dfpCdnUrl: 'http://dfp.endpoint.example.com',
    };
    expect(getDFPCdnURL(options)).toBe('https://dfp.endpoint.example.com');
  });

  it('should use domain from valid URL with non-https scheme and other properties', () => {
    const options: InternalStytchClientOptions = {
      dfpCdnUrl: 'http://dfp.endpoint.example.com:8080/path?query=value#fragment',
    };
    expect(getDFPCdnURL(options)).toBe('https://dfp.endpoint.example.com');
  });

  it('should prioritize dfpCdnDomain over endpoints.dfpCdnDomain when both are provided', () => {
    const options: InternalStytchClientOptions = {
      dfpCdnUrl: 'dfp.example.com',
      endpointOptions: {
        dfpCdnDomain: 'dfp.endpoint.example.com',
      },
    };
    expect(getDFPCdnURL(options)).toBe('https://dfp.example.com');
  });

  it('should warn if invalid dfpCdnDomain is provided and fallback to default value', () => {
    const options: InternalStytchClientOptions = {
      dfpCdnUrl: 'invalid dfpCdnUrl',
    };

    expect(getDFPCdnURL(options)).toBe(STYTCH_DFP_CDN_URL);
    expect(logger.warn).toHaveBeenCalledWith(
      'Unable to use custom DFP CDN domain `invalid dfpCdnUrl`. dfpCdnUrl should be a valid domain.',
    );
  });
});
