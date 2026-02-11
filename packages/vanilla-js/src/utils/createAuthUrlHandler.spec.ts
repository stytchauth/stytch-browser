import { createAuthUrlHandler, removeStytchTokenParams } from './createAuthUrlHandler';
import { SessionDurationOptions } from '@stytch/core/public';

describe('createAuthUrlHandler', () => {
  const mockSessionOptions: SessionDurationOptions = {
    session_duration_minutes: 60,
  };

  const mockHandlers = {
    oauth: jest.fn().mockResolvedValue({ success: true }),
    magic_link: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseAuthenticateUrl', () => {
    const { parseAuthenticateUrl } = createAuthUrlHandler(mockHandlers);

    it('should parse valid URL with handled token type', () => {
      const result = parseAuthenticateUrl('https://example.com/callback?token=test-token&stytch_token_type=oauth');

      expect(result).toEqual({
        handled: true,
        token: 'test-token',
        tokenType: 'oauth',
      });
    });

    it('should parse URL with unhandled token type', () => {
      const result = parseAuthenticateUrl(
        'https://example.com/callback?token=test-token&stytch_token_type=unsupported_type',
      );

      expect(result).toEqual({
        handled: false,
        token: 'test-token',
        tokenType: 'unsupported_type',
      });
    });

    it('should return null when token or stytch_token_type is missing', () => {
      expect(parseAuthenticateUrl('https://example.com/callback?stytch_token_type=oauth')).toBeNull();
      expect(parseAuthenticateUrl('https://example.com/callback?token=test-token')).toBeNull();
    });
  });

  describe('authenticateByUrl', () => {
    const { authenticateByUrl } = createAuthUrlHandler(mockHandlers);

    // Simplified handler harness for tests
    const authHandler = (href: string, options: { session_duration_minutes?: number } = {}) =>
      authenticateByUrl(
        {
          session_duration_minutes: 60,
          clearParams: true, // Not testing this since it requires mocking replace state and
          ...options,
        },
        href,
      );

    it('should authenticate successfully with valid token and token type', async () => {
      const result = await authHandler('https://example.com/callback?token=test-token&stytch_token_type=oauth');

      expect(mockHandlers.oauth).toHaveBeenCalledWith('test-token', mockSessionOptions);
      expect(result).toEqual({
        handled: true,
        tokenType: 'oauth',
        data: { success: true },
      });
    });

    it('should handle URLs with additional query parameters', async () => {
      const testUrl =
        'https://example.com/callback?other_param=value&token=test-token&stytch_token_type=oauth&another_param=test';

      const result = await authHandler(testUrl);

      expect(mockHandlers.oauth).toHaveBeenCalledWith('test-token', mockSessionOptions);
      expect(result).toEqual({
        handled: true,
        tokenType: 'oauth',
        data: { success: true },
      });
    });

    it('should return null when token is missing', async () => {
      expect(await authHandler('https://example.com/callback?stytch_token_type=oauth')).toBeNull();
      expect(await authHandler('https://example.com/callback?token=test-token')).toBeNull();

      expect(mockHandlers.oauth).not.toHaveBeenCalled();
    });

    it('should return unhandled result when token type is not supported', async () => {
      const result = await authHandler(
        'https://example.com/callback?token=test-token&stytch_token_type=unsupported_type',
      );

      expect(result).toEqual({
        handled: false,
        tokenType: 'unsupported_type',
        token: 'test-token',
      });
      expect(mockHandlers.oauth).not.toHaveBeenCalled();
      expect(mockHandlers.magic_link).not.toHaveBeenCalled();
    });

    it('should propagate errors from handler', async () => {
      const error = new Error('Authentication failed');
      mockHandlers.oauth.mockRejectedValueOnce(error);

      await expect(
        authHandler('https://example.com/callback?token=test-token&stytch_token_type=oauth'),
      ).rejects.toThrow('Authentication failed');
    });

    it('should call the correct handler based on token type', async () => {
      const oauthUrl = 'https://example.com/callback?token=oauth-token&stytch_token_type=oauth';
      const magicLinkUrl = 'https://example.com/callback?token=magic-token&stytch_token_type=magic_link';

      await authHandler(oauthUrl);
      await authHandler(magicLinkUrl);

      expect(mockHandlers.oauth).toHaveBeenCalledWith('oauth-token', mockSessionOptions);
      expect(mockHandlers.magic_link).toHaveBeenCalledWith('magic-token', mockSessionOptions);
    });
  });
});

describe('removeStytchTokenParams', () => {
  const urlWithCustomQueryParam = 'http://test.com?token=testToken&stytch_token_type=testType&customQueryParam=1234';

  it('should remove token and stytch_token_type parameters from the URL', () => {
    const url = removeStytchTokenParams(urlWithCustomQueryParam).toString();
    expect(url).toBe('http://test.com/?customQueryParam=1234');
  });
});
