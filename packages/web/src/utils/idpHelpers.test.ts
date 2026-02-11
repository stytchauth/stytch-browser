import {
  createBuiltinScopeDescriptions,
  OAuthLogoutParams,
  parseOAuthAuthorizeParams,
  parseOAuthLogoutParams,
} from './idpHelpers';

describe('parseOAuthAuthorizeParams', () => {
  const baseParams = new URLSearchParams({
    client_id: 'testClient',
    redirect_uri: 'https://example.com',
    response_type: 'code',
    nonce: 'randomNonce',
  });

  it('succeeds if "response_type" is missing', () => {
    const testParams = new URLSearchParams(baseParams);
    testParams.delete('response_type');
    const { error } = parseOAuthAuthorizeParams(testParams);
    expect(error).toBeNull();
  });

  test.each(['client_id', 'redirect_uri'])('returns an error if "%s" is missing', (missingField) => {
    const testParams = new URLSearchParams(baseParams);
    testParams.delete(missingField); // Remove the field for this test case
    const { error } = parseOAuthAuthorizeParams(testParams);

    expect(error).toBe(
      `Required parameter is missing: ${missingField}. Please reach out to the application developer.`,
    );
  });

  test.each(['client_id', 'redirect_uri'])('returns an error if "%s" is empty', (emptyField) => {
    const testParams = new URLSearchParams(baseParams);
    testParams.set(emptyField, '');
    const { error } = parseOAuthAuthorizeParams(testParams);

    expect(error).toBe(`Required parameter is missing: ${emptyField}. Please reach out to the application developer.`);
  });

  it('returns parsed params and default fields when all required fields are present', () => {
    const { error, result } = parseOAuthAuthorizeParams(baseParams);

    expect(error).toBeNull();
    expect(result).toEqual({
      ...Object.fromEntries(baseParams),
      scopes: ['openid', 'email', 'profile'],
    });
  });

  it('includes optional fields when provided', () => {
    const testParams = new URLSearchParams(baseParams);
    testParams.set('scope', 'phone full_access');
    testParams.set('code_challenge', 'someChallenge');
    testParams.set('state', 'someState');
    testParams.set('nonce', 'someNonce');
    testParams.set('prompt', 'consent');
    const { error, result } = parseOAuthAuthorizeParams(testParams);

    expect(error).toBeNull();
    expect(result).toEqual({
      ...Object.fromEntries(baseParams),
      scopes: ['phone', 'full_access'],
      code_challenge: 'someChallenge',
      state: 'someState',
      nonce: 'someNonce',
      prompt: 'consent',
    });
  });

  describe('resource parameter', () => {
    it('includes resource parameter when provided with single value', () => {
      const testParams = new URLSearchParams(baseParams);
      testParams.set('resource', 'https://api.example.com');
      const { error, result } = parseOAuthAuthorizeParams(testParams);

      expect(error).toBeNull();
      expect(result.resources).toEqual(['https://api.example.com']);
    });

    it('includes resource parameter when provided with multiple values', () => {
      const testParams = new URLSearchParams(baseParams);
      testParams.append('resource', 'https://api.example.com');
      testParams.append('resource', 'https://api2.example.com');
      testParams.append('resource', 'https://api3.example.com');
      const { error, result } = parseOAuthAuthorizeParams(testParams);

      expect(error).toBeNull();
      expect(result.resources).toEqual([
        'https://api.example.com',
        'https://api2.example.com',
        'https://api3.example.com',
      ]);
    });

    it('does not include resource parameter when not provided', () => {
      const { error, result } = parseOAuthAuthorizeParams(baseParams);

      expect(error).toBeNull();
      expect(result.resources).toBeUndefined();
    });
  });

  it('ignores optional fields when empty', () => {
    const testParams = new URLSearchParams(baseParams);
    testParams.set('scope', '');
    testParams.set('code_challenge', '');
    testParams.set('state', '');
    const { error, result } = parseOAuthAuthorizeParams(testParams);

    expect(error).toBeNull();
    expect(result['scopes']).toEqual(['openid', 'email', 'profile']); // Fallback scopes used
    expect(result['code_challenge']).toBeUndefined();
    expect(result['state']).toBeUndefined();
  });

  it('ignores unexpected parameters', () => {
    const testParams = new URLSearchParams(baseParams);
    testParams.set('unexpected_param', 'unexpectedValue');
    const { error, result } = parseOAuthAuthorizeParams(testParams);

    expect(error).toBeNull();
    expect(result).toEqual({
      ...Object.fromEntries(baseParams),
      scopes: ['openid', 'email', 'profile'],
    });
  });

  it('returns an error for empty input', () => {
    const { error, result } = parseOAuthAuthorizeParams(new URLSearchParams());
    expect(error).toBe('Required parameter is missing: client_id. Please reach out to the application developer.');
    expect(result).toEqual({
      client_id: '',
      redirect_uri: '',
      response_type: 'code',
      scopes: ['openid', 'email', 'profile'],
    });
  });
});

describe('createBuiltinScopeDescriptions', () => {
  test.each([
    [['openid'], [{ text: 'Verify your identity', details: ['View information stored within your account'] }]],
    [
      ['profile'],
      [
        {
          text: 'View your personal profile information',
          details: ['Your name, profile picture, and language preferences'],
        },
      ],
    ],
    [
      ['email'],
      [
        {
          text: 'View your personal profile information',
          details: ['Your email address'],
        },
      ],
    ],
    [
      ['phone'],
      [
        {
          text: 'View your personal profile information',
          details: ['Your phone number'],
        },
      ],
    ],
    [
      ['profile', 'email'],
      [
        {
          text: 'View your personal profile information',
          details: ['Your name, profile picture, and language preferences', 'Your email address'],
        },
      ],
    ],
    [
      ['profile', 'phone'],
      [
        {
          text: 'View your personal profile information',
          details: ['Your name, profile picture, and language preferences', 'Your phone number'],
        },
      ],
    ],
    [
      ['profile', 'email', 'phone'],
      [
        {
          text: 'View your personal profile information',
          details: ['Your name, profile picture, and language preferences', 'Your email address', 'Your phone number'],
        },
      ],
    ],
    [
      ['openid', 'profile', 'email', 'phone', 'offline_access'],
      [
        { text: 'Verify your identity', details: ['View information stored within your account'] },
        {
          text: 'View your personal profile information',
          details: ['Your name, profile picture, and language preferences', 'Your email address', 'Your phone number'],
        },
        {
          text: "Maintain access to your data even when you're not actively using the app",
          details: [
            'Access your data even when you are offline.',
            'Synchronize data and process background tasks on your behalf.',
          ],
        },
      ],
    ],
  ])('creates scope descriptions for %s', (scopes, expected) => {
    expect(createBuiltinScopeDescriptions(scopes)).toEqual(expected);
  });
});

describe('parseOAuthLogoutParams', () => {
  const baseParams = new URLSearchParams({
    client_id: 'testClient',
    post_logout_redirect_uri: 'https://example.com/logout',
  });

  test.each(['client_id', 'post_logout_redirect_uri'])('returns an error if "%s" is missing', (missingField) => {
    const testParams = new URLSearchParams(baseParams);
    testParams.delete(missingField);
    const { error } = parseOAuthLogoutParams(testParams);

    expect(error).toBe(
      `Required parameter is missing: ${missingField}. Please reach out to the application developer.`,
    );
  });

  test.each(['client_id', 'post_logout_redirect_uri'])('returns an error if "%s" is empty', (emptyField) => {
    const testParams = new URLSearchParams(baseParams);
    testParams.set(emptyField, '');
    const { error } = parseOAuthLogoutParams(testParams);

    expect(error).toBe(`Required parameter is missing: ${emptyField}. Please reach out to the application developer.`);
  });

  it('returns parsed params when all required fields are present', () => {
    const { error, result } = parseOAuthLogoutParams(baseParams);

    expect(error).toBeNull();
    expect(result).toEqual(Object.fromEntries(baseParams));
  });

  it('includes optional fields when provided', () => {
    const testParams = new URLSearchParams(baseParams);
    testParams.set('id_token_hint', 'someIdToken');
    testParams.set('state', 'someState');
    const { error, result } = parseOAuthLogoutParams(testParams);

    expect(error).toBeNull();
    expect(result).toEqual({
      ...Object.fromEntries(baseParams),
      id_token_hint: 'someIdToken',
      state: 'someState',
    });
  });

  test.each(['id_token_hint', 'state'] as (keyof OAuthLogoutParams)[])(
    'ignores optional field "%s" when empty',
    (optionalField) => {
      const testParams = new URLSearchParams(baseParams);
      testParams.set(optionalField, '');
      const { error, result } = parseOAuthLogoutParams(testParams);

      expect(error).toBeNull();
      expect(result[optionalField]).toBeUndefined();
    },
  );

  it('ignores unexpected parameters', () => {
    const testParams = new URLSearchParams(baseParams);
    testParams.set('unexpected_param', 'unexpectedValue');
    const { error, result } = parseOAuthLogoutParams(testParams);

    expect(error).toBeNull();
    expect(result).toEqual(Object.fromEntries(baseParams));
  });
});
