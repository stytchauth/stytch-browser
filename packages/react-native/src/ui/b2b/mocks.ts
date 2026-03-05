import { OpaqueTokensNeverConfig } from '@stytch/core';
import {
  B2BAuthenticateResponse,
  B2BAuthenticateResponseWithMFA,
  B2BDiscoveryAuthenticateResponse,
  B2BMagicLinksAuthenticateResponse,
  B2BOAuthAuthenticateResponse,
  B2BOrganizationsGetBySlugResponse,
  B2BPasswordStrengthCheckResponse,
  B2BTOTPCreateResponse,
  DiscoveredOrganization,
  Member,
  MemberSession,
  Organization,
  RecoveryCodeRecoverResponse,
} from '@stytch/core/public';

export const MOCK_ORGANIZATION: Organization = {
  allowed_auth_methods: [],
  auth_methods: 'ALL_ALLOWED',
  email_allowed_domains: ['example.com'],
  email_jit_provisioning: 'RESTRICTED',
  organization_id: 'fake-organization-id',
  organization_logo_url: '',
  organization_name: 'Fake Organization',
  sso_active_connections: [],
  sso_default_connection_id: null,
  mfa_policy: 'OPTIONAL',
  allowed_oauth_tenants: {},
  oauth_tenant_jit_provisioning: 'RESTRICTED',
  organization_slug: 'my-org-slug',
  trusted_metadata: {},
  sso_jit_provisioning: 'ALL_ALLOWED',
  sso_jit_provisioning_allowed_connections: [],
  email_invites: 'ALL_ALLOWED',
  scim_active_connection: null,
  allowed_mfa_methods: ['sms_otp', 'totp'],
};

export const MOCK_MEMBER: Member = {
  organization_id: 'organization-id',
  member_id: 'member-id',
  email_address: 'test@stytch.com',
  email_address_verified: true,
  retired_email_addresses: [],
  status: 'active',
  name: 'Robot',
  trusted_metadata: {},
  untrusted_metadata: {},
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  sso_registrations: [],
  is_breakglass: false,
  member_password_id: 'member-password-id',
  mfa_enrolled: true,
  mfa_phone_number: '',
  mfa_phone_number_verified: true,
  roles: [],
  is_admin: false,
  default_mfa_method: 'sms_otp',
  totp_registration_id: '',
  oauth_registrations: [],
};

export const MOCK_DISCOVERED_ORGANIZATION: DiscoveredOrganization = {
  organization: MOCK_ORGANIZATION,
  membership: {
    type: 'active_member',
    details: null,
    member: MOCK_MEMBER,
  },
  member_authenticated: true,
  primary_required: {
    allowed_auth_methods: ['sso', 'magic_link', 'password', 'google_oauth', 'microsoft_oauth'],
  },
  mfa_required: null,
};

export const MOCK_DISCOVERED_ORGANIZATION_NO_PRIMARY_AUTH: DiscoveredOrganization = {
  organization: MOCK_ORGANIZATION,
  membership: {
    type: 'active_member',
    details: null,
    member: MOCK_MEMBER,
  },
  member_authenticated: true,
  primary_required: {
    allowed_auth_methods: [],
  },
  mfa_required: null,
};

export const MOCK_MEMBER_SESSION: MemberSession = {
  member_session_id: '',
  member_id: '',
  organization_id: '',
  organization_slug: 'my-org-slug',
  started_at: '',
  last_accessed_at: '',
  expires_at: '',
  authentication_factors: [],
  custom_claims: undefined,
  roles: [],
};

export const MOCK_MEMBER_NEEDS_MFA: B2BAuthenticateResponseWithMFA<OpaqueTokensNeverConfig> = {
  request_id: '',
  status_code: 200,
  member_id: '',
  session_jwt: '',
  session_token: '',
  member: MOCK_MEMBER,
  organization: MOCK_ORGANIZATION,
  member_session: null,
  member_authenticated: false,
  intermediate_session_token: '',
  mfa_required: null,
  primary_required: { allowed_auth_methods: [] },
};

export const MOCK_MEMBER_DISCOVERY_AUTH: B2BDiscoveryAuthenticateResponse = {
  request_id: '',
  status_code: 200,
  intermediate_session_token: 'intermediate-session-token',
  email_address: 'robot@stytch.com',
  discovered_organizations: [MOCK_DISCOVERED_ORGANIZATION],
};

export const MOCK_MEMBER_NEEDS_MFA_WITH_SMS_PRIMARY: B2BAuthenticateResponseWithMFA = {
  ...MOCK_MEMBER_NEEDS_MFA,
  primary_required: { allowed_auth_methods: ['sms_otp'] },
};

export const MOCK_MEMBER_NEEDS_MFA_SMS_IMPLICITLY_SENT: B2BAuthenticateResponseWithMFA = {
  ...MOCK_MEMBER_NEEDS_MFA_WITH_SMS_PRIMARY,
  primary_required: null,
  mfa_required: {
    member_options: {
      mfa_phone_number: '',
      totp_registration_id: '',
    },
    secondary_auth_initiated: 'sms_otp',
  },
};

export const MOCK_MEMBER_NEEDS_MFA_TOTP_ENROLLED: B2BAuthenticateResponseWithMFA = {
  ...MOCK_MEMBER_NEEDS_MFA,
  primary_required: null,
  member: {
    ...MOCK_MEMBER,
    default_mfa_method: 'totp',
    totp_registration_id: 'totp-registration-id',
  },
};

export const MOCK_MEMBER_NO_MFA_ENROLLED_TOTP_SUPPORTED: B2BAuthenticateResponseWithMFA = {
  ...MOCK_MEMBER_NEEDS_MFA,
  primary_required: null,
  member: {
    ...MOCK_MEMBER,
    default_mfa_method: 'totp',
    mfa_phone_number_verified: false,
  },
  organization: {
    ...MOCK_ORGANIZATION,
    allowed_mfa_methods: ['totp'],
  },
};

export const MOCK_FULLY_AUTHED_MEMBER_SESSION: B2BAuthenticateResponseWithMFA = {
  ...MOCK_MEMBER_NEEDS_MFA,
  member_session: MOCK_MEMBER_SESSION,
  member_authenticated: true,
  intermediate_session_token: '',
  mfa_required: null,
  primary_required: null,
};

export const MOCK_EMPTY_ORG_BY_SLUG_RESPONSE: B2BOrganizationsGetBySlugResponse = {
  request_id: '',
  status_code: 200,
  organization: null,
};

export const MOCK_FULLY_AUTHED_RESPONSE: B2BAuthenticateResponse<OpaqueTokensNeverConfig> = {
  ...MOCK_MEMBER_NEEDS_MFA,
  member_session: MOCK_MEMBER_SESSION,
};

export const MOCK_AUTHED_WITH_METHOD_ID: B2BMagicLinksAuthenticateResponse = {
  ...MOCK_MEMBER_NEEDS_MFA,
  method_id: 'method-id',
};

export const MOCK_AUTHED_WITH_METHOD_ID_AND_DO: B2BDiscoveryAuthenticateResponse = {
  ...MOCK_AUTHED_WITH_METHOD_ID,
  email_address: 'robot@stytch.com',
  discovered_organizations: [MOCK_DISCOVERED_ORGANIZATION],
};

export const MOCK_OAUTH_AUTH_RESPONSE: B2BOAuthAuthenticateResponse = {
  ...MOCK_MEMBER_NEEDS_MFA,
  provider_values: {
    access_token: '',
    id_token: '',
    refresh_token: '',
    scopes: [],
    expires_at: '',
  },
};

export const MOCK_RECOVERY_CODES_RESPONSE: RecoveryCodeRecoverResponse = {
  ...MOCK_FULLY_AUTHED_RESPONSE,
  recovery_codes_remaining: 1,
};

export const MOCK_TOTP_CREATE_RESPONSE: B2BTOTPCreateResponse = {
  ...MOCK_FULLY_AUTHED_MEMBER_SESSION,
  totp_registration_id: 'totp-registration-id',
  secret: '',
  qr_code: '',
  recovery_codes: [],
};

export const MOCK_STRENGTH_CHECK_RESPONSE: B2BPasswordStrengthCheckResponse = {
  request_id: '',
  status_code: 200,
  member_id: '',
  member: MOCK_MEMBER,
  organization: MOCK_ORGANIZATION,
  valid_password: true,
  score: 3,
  breached_password: false,
  breach_detection_on_create: false,
  strength_policy: 'luds',
  zxcvbn_feedback: {
    suggestions: [],
    warning: '',
  },
  luds_feedback: {
    has_lower_case: false,
    has_upper_case: false,
    has_digit: false,
    has_symbol: false,
    missing_complexity: 0,
    missing_characters: 0,
  },
};
