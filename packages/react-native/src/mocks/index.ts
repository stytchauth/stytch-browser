import {
  OAuthAuthenticateResponse,
  OAuthStartResponse,
  PasswordStrengthCheckResponse,
  ResponseCommon,
  Session,
  StytchAPIError,
  StytchProjectConfigurationInput,
  User,
} from '@stytch/core/public';

import { ErrorResponse } from '../ui/shared/types';

export const MOCK_PUBLIC_TOKEN = 'public-token-test-123';
export const MOCK_METHOD_ID = 'method-test-123-xyz';
export const MOCK_PHONE_NUMBER = '123457890';
export const MOCK_EMAIL = 'example@stytch.com';
export const MOCK_PASSWORD = 'correcthorsebatterystaple';
export const MOCK_CAPTCHA = 'mock-captcha-token';
export const MOCK_CODE = '123456';
export const MOCK_REQUEST_ID = 'request-id-live-123-123-123';
export const MOCK_DFP_TELEMTRY_ID = 'dfp-telemetry-id-123';
export const MOCK_ORG_ID = 'org-1234';

export const MOCK_USER: User = {
  user_id: 'mock_user_id',
  created_at: '',
  crypto_wallets: [],
  emails: [],
  name: {
    first_name: '',
    last_name: '',
    middle_name: '',
  },
  trusted_metadata: {},
  untrusted_metadata: {},
  phone_numbers: [],
  providers: [],
  password: null,
  status: 'active',
  totps: [],
  webauthn_registrations: [],
  biometric_registrations: [],
  roles: [],
};
export const MOCK_SESSION: Session = {
  session_id: 'mock_session_id',
  attributes: {
    ip_address: '',
    user_agent: '',
  },
  authentication_factors: [],
  expires_at: '',
  last_accessed_at: '',
  started_at: '',
  user_id: MOCK_USER.user_id,
  custom_claims: null,
  roles: [],
};

// Redefined instead of imported from @stytch/internal-testing because session and user
// are typed differently
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
  state: { session: MOCK_SESSION, user: MOCK_USER },
  session_token: 'session_token',
  session_jwt: 'session_jwt.xxx.xxx',
  intermediate_session_token: null,
};

export const MOCK_AUTHENTICATE_RETURN_VALUE = {
  session: MOCK_SESSION,
  user: MOCK_USER,
  session_token: 'session_token',
  session_jwt: 'session_jwt.xxx.xxx',
  user_id: MOCK_USER.user_id,
};

// jest.setup.js mocks out crypto.getRandomValues to ensure these stay in sync
export const MOCK_VERIFIER = '00000000000000000000000000000000';
export const MOCK_CHALLENGE = 'hODA6vqpWjTCk_J4rFLkXOU3urXnUqAOaVmhOuEDtlo';

export const MOCK_KEYPAIR = {
  code_challenge: MOCK_CHALLENGE,
  code_verifier: MOCK_VERIFIER,
};

export const MOCK_REGISTRATION_ID = 'biometric registration id';
export const MOCK_SIGNED_DATA = 'mock signed data';

export const MOCK_DFP_TELEMETRY_ID = 'dfp-telemetry-id-123';

export const MOCK_WEBAUTHN_REGISTRATION = {
  webauthn_registration_id: 'mock_webauthn_registration-id',
  domain: 'mock_domain',
  user_agent: 'mock_user_agent',
  verified: false,
  authenticator_type: 'mock_authenticator_type',
  name: 'mock_name',
};

export const MOCK_RESPONSE_COMMON: ResponseCommon = {
  request_id: '',
  status_code: 200,
};
export const MOCK_ERROR_RESPONSE: ErrorResponse = {};

export const MOCK_AUTHENTICATE_RETURN_VALUE_WITH_METHOD_ID = {
  request_id: '',
  status_code: 200,
  session: MOCK_SESSION,
  user: MOCK_USER,
  session_token: 'session_token',
  session_jwt: 'session_jwt.xxx.xxx',
  user_id: MOCK_USER.user_id,
  method_id: 'mock-method-id',
};

export const MOCK_AUTHENTICATE_RETURN_VALUE_WITH_EMAIL_ID = {
  request_id: '',
  status_code: 200,
  session: MOCK_SESSION,
  user: MOCK_USER,
  session_token: 'session_token',
  session_jwt: 'session_jwt.xxx.xxx',
  user_id: MOCK_USER.user_id,
  email_id: 'mock-email-id',
};

export const MOCK_OAUTH_AUTHENTICATE_RESPONSE: OAuthAuthenticateResponse<StytchProjectConfigurationInput> = {
  request_id: '',
  status_code: 200,
  session: MOCK_SESSION,
  user: MOCK_USER,
  session_token: 'session_token',
  session_jwt: 'session_jwt.xxx.xxx',
  user_id: MOCK_USER.user_id,
  provider_subject: '',
  provider_type: '',
  profile_picture_url: '',
  locale: '',
  provider_values: {
    access_token: '',
    id_token: '',
    refresh_token: '',
    scopes: [],
    expires_at: '',
  },
};

export const MOCK_STRENGTH_CHECK_RESPONSE: PasswordStrengthCheckResponse = {
  request_id: '',
  status_code: 200,
  valid_password: true,
  score: 3,
  breached_password: false,
  breach_detection_on_create: false,
  strength_policy: 'luds',
  feedback: {
    suggestions: [],
    warning: '',
    luds_requirements: {
      has_digit: true,
      has_lower_case: true,
      has_symbol: true,
      has_upper_case: true,
      missing_characters: 0,
      missing_complexity: 0,
    },
  },
};

export const MOCK_STYTCH_API_ERROR = new StytchAPIError({
  error_message: 'An error message',
  error_type: 'An error type',
  error_url: 'An error url',
  status_code: 400,
});

export const MOCK_OAUTH_START_RESPONSE: OAuthStartResponse = {
  success: true,
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

export const MOCK_B2B_AUTHENTICATE_RETURN_VALUE = {
  member_session: MOCK_MEMBER_SESSION,
  member: MOCK_MEMBER,
  session_token: 'session_token',
  session_jwt: 'session_jwt.xxx.xxx',
  member_id: MOCK_MEMBER.member_id,
  organization: MOCK_ORGANIZATION,
};
