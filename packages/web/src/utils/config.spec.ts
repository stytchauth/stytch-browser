import { hasCustomApiEndpoint, mayHaveHttpOnlySessionCookies } from './config';

describe('hasCustomApiEndpoint', () => {
  const LIVE_TOKEN = 'public-token-live-abc123';
  const TEST_TOKEN = 'public-token-test-abc123';

  describe('with live tokens', () => {
    it('returns false when no custom endpoints are provided', () => {
      expect(hasCustomApiEndpoint(LIVE_TOKEN)).toBe(false);
      expect(hasCustomApiEndpoint(LIVE_TOKEN, {})).toBe(false);
    });

    it('returns true when customBaseUrl is provided', () => {
      expect(hasCustomApiEndpoint(LIVE_TOKEN, { customBaseUrl: 'https://custom.example.com' })).toBe(true);
    });

    it('returns true when endpointOptions.apiDomain is provided', () => {
      expect(
        hasCustomApiEndpoint(LIVE_TOKEN, {
          endpointOptions: { apiDomain: 'custom.stytch.com' },
        }),
      ).toBe(true);
    });
  });

  describe('with test tokens', () => {
    it('returns false when no custom endpoints are provided', () => {
      expect(hasCustomApiEndpoint(TEST_TOKEN)).toBe(false);
      expect(hasCustomApiEndpoint(TEST_TOKEN, {})).toBe(false);
    });

    it('returns true when customBaseUrl is provided', () => {
      expect(hasCustomApiEndpoint(TEST_TOKEN, { customBaseUrl: 'https://custom.example.com' })).toBe(true);
    });

    it('returns true when endpointOptions.testApiDomain is provided', () => {
      expect(
        hasCustomApiEndpoint(TEST_TOKEN, {
          endpointOptions: { testApiDomain: 'test.stytch.com' },
        }),
      ).toBe(true);
    });
  });
});

describe('mayHaveHttpOnlySessionCookies', () => {
  const LIVE_TOKEN = 'public-token-live-123';
  const customBaseUrl = 'https://custom.example.com';

  it('is false without a custom API endpoint', () => {
    expect(mayHaveHttpOnlySessionCookies(LIVE_TOKEN)).toBe(false);
    expect(mayHaveHttpOnlySessionCookies(LIVE_TOKEN, { cookieOptions: { usesHttpOnlyCookies: true } })).toBe(false);
  });

  it('is true with a custom API endpoint by default', () => {
    expect(mayHaveHttpOnlySessionCookies(LIVE_TOKEN, { customBaseUrl })).toBe(true);
    expect(mayHaveHttpOnlySessionCookies(LIVE_TOKEN, { customBaseUrl, cookieOptions: {} })).toBe(true);
    expect(
      mayHaveHttpOnlySessionCookies(LIVE_TOKEN, { customBaseUrl, cookieOptions: { usesHttpOnlyCookies: true } }),
    ).toBe(true);
  });

  it('is false with a custom API endpoint when usesHttpOnlyCookies is false', () => {
    expect(
      mayHaveHttpOnlySessionCookies(LIVE_TOKEN, { customBaseUrl, cookieOptions: { usesHttpOnlyCookies: false } }),
    ).toBe(false);
    expect(
      mayHaveHttpOnlySessionCookies(LIVE_TOKEN, {
        endpointOptions: { apiDomain: 'custom.example.com' },
        cookieOptions: { usesHttpOnlyCookies: false },
      }),
    ).toBe(false);
  });
});
