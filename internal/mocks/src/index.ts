export const MOCK_PUBLIC_TOKEN = 'public-token-test-123';
export const MOCK_METHOD_ID = 'method-test-123-xyz';
export const MOCK_PHONE_NUMBER = '123457890';
export const MOCK_EMAIL = 'example@stytch.com';
export const MOCK_PASSWORD = 'correcthorsebatterystaple';
export const MOCK_CAPTCHA = 'mock-captcha-token';
export const MOCK_DFP_TELEMTRY_ID = 'dfp-telemetry-id-123';
export const MOCK_CODE = '123456';
export const MOCK_REQUEST_ID = 'request-id-live-123-123-123';
export const MOCK_ORG_ID = 'org-1234';

export const MOCK_USER = {
  user_id: 'mock_user_id',
};
export const MOCK_SESSION = {
  session_id: 'mock_session_id',
};

export const MOCK_MEMBER = {
  member_id: 'mock_user_id',
  member_password_id: 'mock_member_password_id',
  member_totp_id: 'mock_member_totp_id',
};
export const MOCK_MEMBER_SESSION = {
  member_session_id: 'mock_session_id',
};

export const MOCK_ORGANIZATION = {
  organization_id: MOCK_ORG_ID,
};

export const MOCK_MEMBER_COMMON_RESPONSE = {
  member_id: MOCK_MEMBER.member_id,
  member: MOCK_MEMBER,
  organization: MOCK_ORGANIZATION,
  status_code: 200,
};

export const MOCK_INTERMEDIATE_SESSION_TOKEN = 'mock-intermediate-session-token';

export const MOCK_DISCOVERED_ORGANIZATION = {
  organization: MOCK_ORGANIZATION,
  membership: {
    type: 'active_member',
    member: MOCK_MEMBER,
  },
  member_authenticated: false,
  mfa_required: { member_options: { phone_number: MOCK_PHONE_NUMBER }, secondary_auth_initiated: 'sms_otp' },
  primary_required: { allowed_auth_methods: [] },
};

export const MOCK_WEBAUTHN_REGISTRATIONS = [
  {
    authenticator_type: '',
    domain: 'localhost',
    name: 'Mac OS',
    user_agent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    verified: true,
    webauthn_registration_id: 'webauthn-registration-test-db72fcc0-edae-4bb4-8d52-0b2a765683df',
  },
  {
    authenticator_type: '',
    domain: 'localhost',
    name: 'WebAuthN 76b8d7d5',
    user_agent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    verified: true,
    webauthn_registration_id: 'webauthn-registration-test-e5ebf060-8a36-438b-893b-a20076b8d7d5',
  },
];

export const MOCK_WEBAUTHN_REGISTRATION = MOCK_WEBAUTHN_REGISTRATIONS[0];

export const MOCK_AUTHENTICATE_PAYLOAD = {
  session: MOCK_SESSION,
  __user: MOCK_USER,
  user: MOCK_USER,
  session_token: 'session_token',
  session_jwt: 'session_jwt.xxx.xxx',
  user_id: MOCK_USER.user_id,
};

export const updateSessionExpect = (additionalProperties: Record<string, unknown> = {}) =>
  expect.objectContaining({
    session: MOCK_SESSION,
    // updateSession does not care about this property, but it is returned in authenticate response
    // __user: MOCK_USER,
    user: MOCK_USER,
    session_token: 'session_token',
    session_jwt: 'session_jwt.xxx.xxx',
    user_id: MOCK_USER.user_id,
    ...additionalProperties,
  });

export const MOCK_AUTHENTICATE_STATE_UPDATE = {
  state: {
    session: MOCK_SESSION,
    user: MOCK_USER,
  },
  session_token: 'session_token',
  session_jwt: 'session_jwt.xxx.xxx',
  intermediate_session_token: null,
};

export const MOCK_IST_UPDATE = {
  state: null,
  session_token: null,
  session_jwt: null,
  intermediate_session_token: 'intermediate_session_token',
};

export const MOCK_B2B_AUTHENTICATE_RETURN_VALUE = {
  member_session: MOCK_MEMBER_SESSION,
  member: MOCK_MEMBER,
  session_token: 'session_token',
  session_jwt: 'session_jwt.xxx.xxx',
  member_id: MOCK_MEMBER.member_id,
  organization: MOCK_ORGANIZATION,
};

export const MOCK_B2B_AUTHENTICATE_PAYLOAD = {
  member_session: MOCK_MEMBER_SESSION,
  member: MOCK_MEMBER,
  session_token: 'session_token',
  session_jwt: 'session_jwt.xxx.xxx',
  member_id: MOCK_MEMBER.member_id,
  organization: MOCK_ORGANIZATION,
};

export const MOCK_B2B_AUTHENTICATE_WITH_MFA_REQUIRED_PAYLOAD = {
  member_session: null,
  member: MOCK_MEMBER,
  session_token: '',
  session_jwt: '',
  member_id: MOCK_MEMBER.member_id,
  organization: MOCK_ORGANIZATION,
  member_authenticated: false,
  intermediate_session_token: 'mock-intermediate-session-token',
  mfa_required: { member_options: { phone_number: MOCK_PHONE_NUMBER }, secondary_auth_initiated: 'sms_otp' },
};

export const MOCK_B2B_AUTHENTICATE_WITH_MFA_NOT_REQUIRED_PAYLOAD = {
  member_session: MOCK_MEMBER_SESSION,
  member: MOCK_MEMBER,
  session_token: 'session_token',
  session_jwt: 'session_jwt.xxx.xxx',
  member_id: MOCK_MEMBER.member_id,
  organization: MOCK_ORGANIZATION,
  member_authenticated: true,
  intermediate_session_token: '',
  mfa_required: null,
};

export const MOCK_B2B_AUTHENTICATE_STATE_UPDATE = {
  state: {
    session: MOCK_MEMBER_SESSION,
    member: MOCK_MEMBER,
    organization: MOCK_ORGANIZATION,
  },
  session_token: 'session_token',
  session_jwt: 'session_jwt.xxx.xxx',
  intermediate_session_token: null,
};

export const MOCK_B2B_AUTHENTICATE_IST_UPDATE = {
  state: null,
  session_token: null,
  session_jwt: null,
  intermediate_session_token: 'mock-intermediate-session-token',
};

export const MOCK_AUTHENTICATE_RETURN_VALUE = {
  session: MOCK_SESSION,
  user: MOCK_USER,
  session_token: 'session_token',
  session_jwt: 'session_jwt.xxx.xxx',
  user_id: MOCK_USER.user_id,
};

export const MOCK_B2B_DISCOVERY_AUTHENTICATE_PAYLOAD = {
  intermediate_session_token: 'intermediate_session_token',
  email_address: MOCK_EMAIL,
  discovered_organizations: [MOCK_DISCOVERED_ORGANIZATION],
};

export const MOCK_SSO_CONNECTIONS = [
  {
    connection_id: 'connection-1',
    display_name: 'Google Workspace',
    identity_provider: 'google-workspace',
  },
  {
    connection_id: 'connection-2',
    display_name: 'Microsoft Entra',
    identity_provider: 'microsoft-entra',
  },
  {
    connection_id: 'connection-3',
    display_name: 'Okta',
    identity_provider: 'okta',
  },
];

// jest.setup.js mocks out crypto.getRandomValues to ensure these stay in sync
export const MOCK_VERIFIER = '00000000000000000000000000000000';
export const MOCK_CHALLENGE = 'hODA6vqpWjTCk_J4rFLkXOU3urXnUqAOaVmhOuEDtlo';

export const MOCK_KEYPAIR = {
  code_challenge: MOCK_CHALLENGE,
  code_verifier: MOCK_VERIFIER,
};

export const MOCK_UNRECOVERABLE_ERROR_DATA = {
  error_message: 'Unrecoverable',
  error_type: 'unauthorized_credentials',
  error_url: '',
  status_code: 403,
};

export const MOCK_RECOVERABLE_ERROR_DATA = {
  error_message: 'Recoverable',
  error_type: 'Who knows?',
  error_url: '',
  status_code: 502,
};

export const MOCK_WEBAUTHN_REG_NOT_FOUND_DATA = {
  error_message: 'The WebAuthn registration could not be found.',
  error_type: 'webauthn_registration_not_found',
  error_url: '',
  status_code: 404,
};

export const MOCK_CONNECTED_APP_PUBLIC = {
  client_id: 'client-123',
  client_type: 'web',
  client_name: 'Test Client',
  client_description: 'Test Client Description',
};
