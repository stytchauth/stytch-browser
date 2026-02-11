import { MemberSearchData } from '@stytch/core';
import {
  B2BAuthenticateResponseWithMFA,
  B2BDiscoveryIntermediateSessionsExchangeOptions,
  B2BDiscoveryIntermediateSessionsExchangeResponse,
  B2BDiscoveryOrganizationsCreateOptions,
  B2BDiscoveryOrganizationsCreateResponse,
  B2BDiscoveryOTPEmailAuthenticateOptions,
  B2BDiscoveryOTPEmailAuthenticateResponse,
  B2BDiscoveryOTPEmailSendOptions,
  B2BDiscoveryOTPEmailSendResponse,
  B2BMagicLinkLoginOrSignupOptions,
  B2BMagicLinkLoginOrSignupResponse,
  B2BMagicLinksDiscoveryAuthenticateOptions,
  B2BMagicLinksDiscoveryAuthenticateResponse,
  B2BMagicLinksEmailDiscoverySendOptions,
  B2BMagicLinksEmailDiscoverySendResponse,
  B2BMagicLinksInviteOptions,
  B2BMagicLinksInviteResponse,
  B2BOAuthAuthorizeStartResponse,
  B2BOAuthAuthorizeSubmitResponse,
  B2BOrganizationsGetBySlugOptions,
  B2BOrganizationsGetBySlugResponse,
  B2BOrganizationsMemberDeleteMFAPhoneNumberResponse,
  B2BOrganizationsMemberDeleteMFATOTPResponse,
  B2BOrganizationsMembersSearchOptions,
  B2BOrganizationsMembersSearchResponse,
  B2BOrganizationsUpdateOptions,
  B2BOrganizationsUpdateResponse,
  B2BOTPsEmailAuthenticateOptions,
  B2BOTPsEmailAuthenticateResponse,
  B2BOTPsEmailLoginOrSignupOptions,
  B2BOTPsEmailLoginOrSignupResponse,
  B2BPasswordAuthenticateOptions,
  B2BPasswordAuthenticateResponse,
  B2BPasswordDiscoveryAuthenticateOptions,
  B2BPasswordDiscoveryAuthenticateResponse,
  B2BPasswordResetByEmailStartOptions,
  B2BPasswordResetByEmailStartResponse,
  B2BSCIMCreateConnectionOptions,
  B2BSCIMCreateConnectionResponse,
  B2BSCIMGetConnectionGroupsOptions,
  B2BSCIMGetConnectionGroupsResponse,
  B2BSCIMGetConnectionResponse,
  B2BSCIMRotateCancelResponse,
  B2BSCIMRotateCompleteResponse,
  B2BSCIMRotateStartResponse,
  B2BSCIMUpdateConnectionOptions,
  B2BSCIMUpdateConnectionResponse,
  B2BSessionAuthenticateResponse,
  B2BSMSAuthenticateOptions,
  B2BSMSAuthenticateResponse,
  B2BSMSSendOptions,
  B2BSMSSendResponse,
  B2BSSOCreateExternalConnectionOptions,
  B2BSSOCreateExternalConnectionResponse,
  B2BSSOGetConnectionsResponse,
  B2BSSOOIDCCreateConnectionOptions,
  B2BSSOOIDCCreateConnectionResponse,
  B2BSSOSAMLCreateConnectionOptions,
  B2BSSOSAMLCreateConnectionResponse,
  B2BTOTPAuthenticateOptions,
  B2BTOTPAuthenticateResponse,
  B2BTOTPCreateOptions,
  B2BTOTPCreateResponse,
  Member,
  MemberSession,
  OAuthRegistration,
  Organization,
  RecoveryCodeRecoverOptions,
  RecoveryCodeRecoverResponse,
  ResponseCommon,
  SCIMConnection,
  SSOActiveConnection,
} from '@stytch/core/public';
import {
  MOCK_EMAIL,
  MOCK_INTERMEDIATE_SESSION_TOKEN,
  MOCK_MEMBER,
  MOCK_MEMBER_SESSION,
  MOCK_ORGANIZATION,
  MOCK_REQUEST_ID,
  MOCK_SESSION,
  MOCK_USER,
  MOCK_WEBAUTHN_REGISTRATION,
} from '@stytch/internal-mocks';
import { delay, http, HttpHandler, HttpResponse, HttpResponseResolver, passthrough } from 'msw';

import { makeFakeExternalConnection } from '../src/adminPortal/testUtils/makeFakeExternalConnection';
import { makeFakeOidcConnection } from '../src/adminPortal/testUtils/makeFakeOidcConnection';
import { makeFakeSamlConnection } from '../src/adminPortal/testUtils/makeFakeSamlConnection';
import {
  makeFakeScimConnection,
  makeFakeScimConnectionWithBearerToken,
  makeFakeScimConnectionWithNextBearerToken,
} from '../src/adminPortal/testUtils/makeFakeScimConnection';
import { MOCK_QR_CODE_PNG_DATA, MOCK_TOTP_RECOVERY_CODES, MOCK_TOTP_SECRET } from '../src/testUtils';
import { isTruthy } from '../src/utils/isTruthy';

export interface DataResponse<T> {
  data: T;
}

export interface ErrorResponse {
  status_code: number;
  request_id: string;
  error_type: string;
  error_message: string;
  error_url: string;
}

export const authenticateResponseSuccess = {
  user_id: MOCK_USER.user_id,
  user: MOCK_USER,
  __user: MOCK_USER,
  session: MOCK_SESSION,
};

export const b2bAuthenticateResponseSuccess = {
  member: MOCK_MEMBER as unknown as Member,
  organization: MOCK_ORGANIZATION as Organization,
  request_id: 'fake-request-id',
  session_jwt: 'fake-session-jwt',
  session_token: 'fake-session-token',
  intermediate_session_token: '',
  member_authenticated: true,
  member_id: MOCK_MEMBER.member_id,
  member_session: MOCK_MEMBER_SESSION as MemberSession,
  mfa_required: null,
  primary_required: null,
  status_code: 200,
} satisfies B2BAuthenticateResponseWithMFA;
export const b2bDiscoveryAuthenticateResponseSuccess = {
  intermediate_session_token: 'fake-session-token',
  email_address: 'fake_email@stytch.com',
  discovered_organizations: [],
  request_id: 'fake-request-id',
  status_code: 200,
  organization_id_hint: null,
} satisfies B2BPasswordDiscoveryAuthenticateResponse;
export const invalidOrganizationSlugMessage =
  "The organization_slug must be at least 2 characters long and may only contain alphanumerics and the reserved characters '-', '.', '_', or '~'. At least one character must be alphanumeric.";

export const makeB2BSessionAuthenticateHandler = ({
  roles,
  memberId,
  oauthRegistrations,
}: {
  roles?: string[];
  memberId?: string;
  oauthRegistrations?: OAuthRegistration[];
}) => {
  return http.post<never, never, DataResponse<B2BSessionAuthenticateResponse>>(
    'https://api.stytch.com/sdk/v1/b2b/sessions/authenticate',
    async () => {
      await delay(300);
      return HttpResponse.json({
        data: {
          ...b2bAuthenticateResponseSuccess,
          member: {
            ...b2bAuthenticateResponseSuccess.member,
            member_id: memberId ?? b2bAuthenticateResponseSuccess.member.member_id,
            oauth_registrations: oauthRegistrations ?? [],
          },
          member_session: {
            ...b2bAuthenticateResponseSuccess.member_session,
            roles: roles ?? b2bAuthenticateResponseSuccess.member_session.roles,
          },
          organization: {
            ...b2bAuthenticateResponseSuccess.organization,
            email_invites: 'ALL_ALLOWED',
            email_allowed_domains: [],
            email_jit_provisioning: 'RESTRICTED',
            scim_active_connection: {
              connection_id: 'scim-connection-test-cdd5415a-c470-42be-8369-5c90cf7762dc',
              display_name: 'SCIM test connection with IdP',
            },
          },
        },
      });
    },
  );
};

export const infiniteResolver = async () => {
  await delay('infinite');
};

export const makeB2BPasswordsAuthenticateHandler = (
  resolver: HttpResponseResolver<
    never,
    B2BPasswordAuthenticateOptions,
    DataResponse<B2BPasswordAuthenticateResponse> | ErrorResponse
  >,
) => {
  return http.post<
    never,
    B2BPasswordAuthenticateOptions,
    DataResponse<B2BPasswordAuthenticateResponse> | ErrorResponse
  >('https://api.stytch.com/sdk/v1/b2b/passwords/authenticate', async (info) => {
    await delay(300);
    return resolver(info);
  });
};
export const makeB2BPasswordsDiscoveryAuthenticateHandler = (
  resolver: HttpResponseResolver<
    never,
    B2BPasswordDiscoveryAuthenticateOptions,
    DataResponse<B2BPasswordDiscoveryAuthenticateResponse> | ErrorResponse
  >,
) => {
  return http.post<
    never,
    B2BPasswordDiscoveryAuthenticateOptions,
    DataResponse<B2BPasswordDiscoveryAuthenticateResponse> | ErrorResponse
  >('https://api.stytch.com/sdk/v1/b2b/passwords/discovery/authenticate', async (info) => {
    await delay(300);
    return resolver(info);
  });
};
export const makeB2BOrganizationMePutHandler = (
  _resolver: HttpResponseResolver<
    never,
    B2BPasswordAuthenticateOptions,
    DataResponse<B2BPasswordAuthenticateResponse> | ErrorResponse
  >,
) => {
  return http.put<never, B2BOrganizationsUpdateOptions, DataResponse<B2BOrganizationsUpdateResponse> | ErrorResponse>(
    'https://api.stytch.com/sdk/v1/b2b/organizations/me',
    async (info) => {
      await delay(300);
      const body = (await info.request.json()) as B2BOrganizationsUpdateOptions & Organization;

      if (body.sso_default_connection_id === 'oidc-connection-test-fake-2') {
        return makeErrorResponse({
          errorType: 'invalid_request',
          statusCode: 400,
          message: 'Invalid request',
        });
      }

      if (body.organization_slug === 'stytch 1') {
        return makeErrorResponse({
          errorType: 'invalid_organization_slug',
          statusCode: 400,
          message: invalidOrganizationSlugMessage,
        });
      }

      return HttpResponse.json({
        data: {
          organization: {
            ...organizationMeResponse,
            ...body,
            sso_default_connection_id:
              body.sso_default_connection_id ?? organizationMeResponse.sso_default_connection_id,
          },
          request_id: 'request-id-test-896c625f-89a6-4a0d-8615-3dcbdf00314d',
          status_code: 200,
        },
      });
    },
  );
};

export const makeErrorResponse = ({
  errorType,
  statusCode,
  message = errorType,
}: {
  errorType: string;
  statusCode: number;
  message?: string;
}) =>
  HttpResponse.json<ErrorResponse>(
    {
      status_code: statusCode,
      request_id: 'fake-request-id',
      error_type: errorType,
      error_message: message,
      error_url: `https://stytch.com/docs/api/errors/${statusCode}#${errorType}`,
    },
    { status: statusCode },
  );

export const organizationMeResponse = {
  ...MOCK_ORGANIZATION,
  organization_name: 'Example Org Inc.',
  organization_slug: 'example-org',
  organization_logo_url: '',
  email_allowed_domains: ['stytch.com', 'example.com'],
  email_invites: 'ALL_ALLOWED',
  email_jit_provisioning: 'RESTRICTED',
  mfa_policy: 'OPTIONAL',
  rbac_email_implicit_role_assignments: [
    {
      domain: 'stytch.com',
      role_id: 'stytch_admin',
    },
  ],
  sso_default_connection_id: 'oidc-connection-test-fake-0',
  sso_jit_provisioning: 'ALL_ALLOWED',
  sso_jit_provisioning_allowed_connections: ['oidc-connection-test-fake-0'],
  sso_active_connections: [
    {
      connection_id: 'oidc-connection-test-fake-0',
      display_name: 'SSO test connection with IdP',
      identity_provider: 'okta',
    },
  ],
  scim_active_connection: {
    connection_id: 'scim-connection-test-cdd5415a-c470-42be-8369-5c90cf7762dc',
    display_name: 'SCIM test connection with IdP',
  },
  mfa_methods: 'ALL_ALLOWED',
  auth_methods: 'ALL_ALLOWED',
  allowed_auth_methods: [],
  allowed_mfa_methods: [],
  trusted_metadata: {
    address: {
      street: '1 Telegraph Hill Blvd',
      city: 'San Francisco',
      state: 'CA',
      zip_code: '94133',
    },
    billing_tier: 'free',
  },
  oauth_tenant_jit_provisioning: 'RESTRICTED',
  allowed_oauth_tenants: {
    slack: ['T39102'],
    hubspot: ['123456', '789101'],
    github: ['109876', '543210', 'ABCDEF'],
  },
} satisfies Organization;

const fakeMembers = Array.from({ length: 1000 }, (_, i) => {
  const status = i % 11 === 0 ? 'deleted' : i % 7 === 0 ? 'pending' : i % 4 === 0 ? 'invited' : 'active';
  return {
    email_address: `member${i}@example.com`,
    email_address_verified: status !== 'invited' && status !== 'pending' && i % 17 !== 0,
    is_breakglass: i < 3,
    member_id: `member-id-${i}`,
    mfa_phone_number: i % 4 === 1 ? '+15555555555' : '',
    mfa_phone_number_verified: i % 8 === 1,
    name: `Member ${i}`,
    organization_id: MOCK_ORGANIZATION.organization_id,
    roles: [
      { role_id: 'stytch_member', sources: [{ type: 'direct_assignment' }] },
      i < 5 && { role_id: 'stytch_admin', sources: [{ type: 'direct_assignment' }] },
    ].filter(isTruthy),
    status,
    totp_registration_id: i % 11 === 1 ? 'fake-totp-id' : '',
    member_password_id: i % 3 === 2 ? 'fake-password-id' : '',
  } as Member;
});

export const MOCK_STORYBOOK_BOOTSTRAP_DATA = {
  project_name: 'Mock Project',
  disable_sdk_watermark: false,
  email_domains: ['test.stytch.com'],
  cname_domain: null,
  captcha_settings: { enabled: false },
  pkce_required_for_email_magic_links: false,
  pkce_required_for_oauth: false,
  pkce_required_for_password_resets: false,
  pkce_required_for_sso: false,
  slug_pattern: 'http://localhost:3000/org/{{slug}}',
  create_organization_enabled: true,
  password_config: { luds_complexity: 3, luds_minimum_count: 8 },
  dfp_protected_auth_enabled: false,
  dfp_protected_auth_mode: null,
  rbac_policy: {
    roles: [
      {
        role_id: 'stytch_member',
        description:
          'Granted to all Members upon creation; grants permissions already implicitly granted to logged in Members via the SDK. Cannot be deleted.',
        permissions: [{ resource_id: 'stytch.self', actions: ['*'] }],
      },
      {
        role_id: 'stytch_admin',
        description:
          'Granted to Members who create an organization through the Stytch discovery flow. Admins will also have the stytch_member role. Cannot be deleted.',
        permissions: [
          { resource_id: 'stytch.organization', actions: ['*'] },
          { resource_id: 'stytch.member', actions: ['*'] },
          { resource_id: 'stytch.sso', actions: ['*'] },
          { resource_id: 'stytch.scim', actions: ['*'] },
        ],
      },
      {
        role_id: 'sso_get',
        description: '',
        permissions: [{ resource_id: 'stytch.sso', actions: ['get'] }],
      },
      {
        role_id: 'sso_create',
        description: '',
        permissions: [{ resource_id: 'stytch.sso', actions: ['create'] }],
      },
      {
        role_id: 'sso_update',
        description: '',
        permissions: [{ resource_id: 'stytch.sso', actions: ['update'] }],
      },
      {
        role_id: 'sso_delete',
        description: '',
        permissions: [{ resource_id: 'stytch.sso', actions: ['delete'] }],
      },
      {
        role_id: 'organization_update.settings.default-sso-connection',
        description: '',
        permissions: [{ resource_id: 'stytch.organization', actions: ['update.settings.default-sso-connection'] }],
      },
      {
        role_id: 'self',
        description: '',
        permissions: [
          {
            resource_id: 'stytch.self',
            actions: [
              'update.info.name',
              'update.settings.mfa-enrolled',
              'update.info.delete.mfa-phone',
              'update.info.delete.mfa-totp',
              'update.info.delete.password',
              'revoke-sessions',
              'delete',
            ],
          },
          {
            resource_id: 'stytch.member',
            actions: ['search'],
          },
        ],
      },
    ],
    resources: [
      {
        resource_id: 'stytch.organization',
        description: 'Builtin resource for Stytch organization objects',
        actions: [
          'update.info.name',
          'update.info.slug',
          'update.info.logo-url',
          'update.settings.allowed-auth-methods',
          'update.settings.allowed-mfa-methods',
          'update.settings.email-jit-provisioning',
          'update.settings.email-invites',
          'update.settings.allowed-domains',
          'update.settings.default-sso-connection',
          'update.settings.sso-jit-provisioning',
          'update.settings.mfa-policy',
          'update.settings.implicit-roles',
          'delete',
        ],
      },
      {
        resource_id: 'stytch.member',
        description: 'Builtin resource for Stytch member objects',
        actions: [
          'create',
          'update.info.name',
          'update.info.untrusted-metadata',
          'update.info.mfa-phone',
          'update.info.delete.mfa-phone',
          'update.info.delete.mfa-totp',
          'update.info.delete.password',
          'update.settings.is-breakglass',
          'update.settings.mfa-enrolled',
          'update.settings.default-mfa-method',
          'update.settings.roles',
          'search',
          'delete',
        ],
      },
      {
        resource_id: 'stytch.sso',
        description: 'Builtin resource for Stytch SSO Connection objects',
        actions: ['create', 'get', 'update', 'delete'],
      },
      {
        resource_id: 'stytch.self',
        description: 'Builtin resource for the logged-in Stytch member object',
        actions: [
          'update.info.name',
          'update.info.untrusted-metadata',
          'update.info.mfa-phone',
          'update.info.delete.mfa-phone',
          'update.info.delete.password',
          'update.info.delete.mfa-totp',
          'update.settings.mfa-enrolled',
          'update.settings.default-mfa-method',
          'delete',
        ],
      },
      {
        resource_id: 'stytch.scim',
        description: 'Builtin resource for Stytch SCIM Connection objects',
        actions: ['create', 'get', 'update', 'delete'],
      },
    ],
    scopes: ['openid', 'email', 'profile'],
  },
};

export const MOCK_SSO_ACTIVE_CONNECTIONS = [
  {
    connection_id: 'sso-conn-test123',
    display_name: 'Test Okta Provider',
    identity_provider: 'okta',
  },
  {
    connection_id: 'sso-conn-test1234',
    display_name: 'Test Google Workspace Provider',
    identity_provider: 'google-workspace',
  },
  {
    connection_id: 'sso-conn-test12345',
    display_name: 'Test Microsoft Entra Provider',
    identity_provider: 'microsoft-entra',
  },
  {
    connection_id: 'sso-conn-test123456',
    display_name: 'Test Generic Provider',
    identity_provider: 'generic',
  },
  {
    connection_id: 'sso-conn-test1234567',
    display_name: 'Test Unknown Provider',
    identity_provider: 'unknown',
  },
] satisfies SSOActiveConnection[];

export const MOCK_CONNECTED_APP = {
  client_id: 'connected-app-test-d731954d-dab3-4a2b-bdee-07f3ad1be888',
  client_type: 'third_party',
  client_name: 'Sample Application',
  client_description: 'A sample connected app for testing OAuth consent flows',
  client_logo_url: 'https://example.com/app-logo.png',
};

export const MOCK_OAUTH_SCOPE_RESULTS = [
  {
    scope: 'openid',
    description: 'Request basic profile information',
    is_grantable: true,
  },
  {
    scope: 'email',
    description: 'Request email address',
    is_grantable: true,
  },
  {
    scope: 'profile',
    description: 'Request basic profile information',
    is_grantable: true,
  },
];

export const MOCK_OAUTH_CUSTOM_SCOPE_RESULTS = [
  ...MOCK_OAUTH_SCOPE_RESULTS,
  {
    scope: 'admin',
    description: 'Administrative access to organization data',
    is_grantable: true,
  },
  {
    scope: 'custom_scope',
    description: 'Use the custom_scope scope',
    is_grantable: false,
  },
];

export const MOCK_OAUTH_AUTHORIZE_START_RESPONSE: B2BOAuthAuthorizeStartResponse = {
  request_id: 'request-id-test-b05c992f-ebdc-489d-a754-c7e70ba13141',
  status_code: 200,
  client: MOCK_CONNECTED_APP,
  consent_required: true,
  scope_results: MOCK_OAUTH_SCOPE_RESULTS,
};

export const MOCK_OAUTH_AUTHORIZE_START_CUSTOM_SCOPES_RESPONSE: B2BOAuthAuthorizeStartResponse = {
  request_id: 'request-id-test-b05c992f-ebdc-489d-a754-c7e70ba13141',
  status_code: 200,
  client: MOCK_CONNECTED_APP,
  consent_required: true,
  scope_results: MOCK_OAUTH_CUSTOM_SCOPE_RESULTS,
};

export const MOCK_OAUTH_AUTHORIZE_SUBMIT_RESPONSE: B2BOAuthAuthorizeSubmitResponse = {
  request_id: 'request-id-test-b05c992f-ebdc-489d-a754-c7e70ba13141',
  status_code: 200,
  redirect_uri: 'https://oauthdebugger.com/debug?code=test-auth-code-123&state=931g8tkpvgv',
  authorization_code: 'test-auth-code-123',
};

const inactiveEmails = new Set<string>(['inactive-email@stytch.com']);

export const handlers = ({ networkDelay = 300 }: { networkDelay?: number } = {}) =>
  ({
    localhost: http.all('http://localhost:6006/*', () => passthrough()),

    events: http.post('https://api.stytch.com/sdk/v1/events', () => {
      // no-op
    }),
    bootstrap: http.get('https://api.stytch.com/sdk/v1/projects/bootstrap/:token', () => {
      return HttpResponse.json({ data: MOCK_STORYBOOK_BOOTSTRAP_DATA }, { status: 200 });
    }),
    getUser: http.get('https://api.stytch.com/sdk/v1/users/me', async () => {
      await delay(networkDelay);
      return HttpResponse.json({
        data: MOCK_USER, // Should be type User, the mock is incomplete
      });
    }),

    sessionAuthenticate: http.post('https://api.stytch.com/sdk/v1/sessions/authenticate', async () => {
      await delay(networkDelay);
      return HttpResponse.json({ data: authenticateResponseSuccess });
    }),

    webAuthnUpdate: http.put<{ id: string }, { name: string }>(
      'https://api.stytch.com/sdk/v1/webauthn/update/:id',
      async ({ request, params }) => {
        await delay(networkDelay);
        const body = await request.json();
        return HttpResponse.json({
          data: {
            ...MOCK_WEBAUTHN_REGISTRATION,
            id: params.id,
            name: body.name,
          },
        });
      },
    ),

    webAuthnDelete: http.delete('https://api.stytch.com/sdk/v1/users/webauthn_registrations/:id', async () => {
      await delay(networkDelay);
      return HttpResponse.json({
        data: {
          __user: MOCK_USER,
          user_id: MOCK_USER.user_id,
        },
      });
    }),

    b2bSessionAuthenticate: http.post<never, never, DataResponse<B2BSessionAuthenticateResponse>>(
      'https://api.stytch.com/sdk/v1/b2b/sessions/authenticate',
      async () => {
        await delay(networkDelay);
        return HttpResponse.json({
          data: b2bAuthenticateResponseSuccess,
        });
      },
    ),
    b2bSessionRevoke: http.post('https://api.stytch.com/sdk/v1/b2b/sessions/revoke', () => {
      return HttpResponse.json({
        data: {
          status_code: 200,
        },
      });
    }),
    b2bPasswordsAuthenticate: makeB2BPasswordsAuthenticateHandler(() =>
      HttpResponse.json({
        data: b2bAuthenticateResponseSuccess,
      }),
    ),
    b2bPasswordsDiscoveryAuthenticate: makeB2BPasswordsDiscoveryAuthenticateHandler(() =>
      HttpResponse.json({
        data: b2bDiscoveryAuthenticateResponseSuccess,
      }),
    ),
    b2bRecoveryCodesRecover: http.post<
      never,
      RecoveryCodeRecoverOptions,
      DataResponse<RecoveryCodeRecoverResponse> | ErrorResponse
    >('https://api.stytch.com/sdk/v1/b2b/recovery_codes/recover', async ({ request }) => {
      await delay(networkDelay);
      if ((await request.json()).recovery_code === '1234-abcd-5678') {
        return HttpResponse.json({
          data: { ...b2bAuthenticateResponseSuccess, recovery_codes_remaining: 5 },
        });
      }

      return makeErrorResponse({
        errorType: 'unauthorized_credentials',
        statusCode: 401,
        message: 'Unauthorized credentials',
      });
    }),
    b2bTotpCreate: http.post<never, B2BTOTPCreateOptions, DataResponse<B2BTOTPCreateResponse>>(
      'https://api.stytch.com/sdk/v1/b2b/totp',
      async () => {
        await delay(networkDelay);
        return HttpResponse.json({
          data: {
            qr_code: MOCK_QR_CODE_PNG_DATA,
            recovery_codes: MOCK_TOTP_RECOVERY_CODES,
            request_id: 'fake-request-id',
            secret: MOCK_TOTP_SECRET,
            status_code: 200,
            totp_registration_id: 'fake-totp-id',
            member_id: 'fake-member-id',
            member: MOCK_MEMBER as unknown as Member,
            organization: MOCK_ORGANIZATION as Organization,
          },
        });
      },
    ),
    b2bTotpAuthenticate: http.post<
      never,
      B2BTOTPAuthenticateOptions,
      { data: B2BTOTPAuthenticateResponse } | ErrorResponse
    >('https://api.stytch.com/sdk/v1/b2b/totp/authenticate', async ({ request }) => {
      await delay(networkDelay);
      if ((await request.json()).code === '654321') {
        return HttpResponse.json({
          data: {
            member: MOCK_MEMBER as unknown as Member,
            member_id: 'fake-member-id',
            member_session: MOCK_MEMBER_SESSION as MemberSession,
            organization: MOCK_ORGANIZATION as Organization,
            request_id: 'fake-request-id',
            session_jwt: 'fake-session-jwt',
            session_token: 'fake-session-token',
            status_code: 200,
          },
        });
      }

      return makeErrorResponse({
        errorType: 'unauthorized_credentials',
        statusCode: 401,
        message: 'Unauthorized credentials',
      });
    }),
    b2bSmsOtpSend: http.post<never, B2BSMSSendOptions, DataResponse<B2BSMSSendResponse>>(
      'https://api.stytch.com/sdk/v1/b2b/otps/sms/send',
      async () => {
        await delay(networkDelay);
        return HttpResponse.json({
          data: {
            request_id: 'fake-request-id',
            status_code: 200,
          },
        });
      },
    ),
    b2bOtpsSmsAuthenticate: http.post<
      never,
      B2BSMSAuthenticateOptions,
      { data: B2BSMSAuthenticateResponse } | ErrorResponse
    >('https://api.stytch.com/sdk/v1/b2b/otps/sms/authenticate', async ({ request }) => {
      await delay(networkDelay);
      if ((await request.json()).code === '123456') {
        return HttpResponse.json({
          data: {
            member: MOCK_MEMBER as unknown as Member,
            member_id: 'fake-member-id',
            member_session: MOCK_MEMBER_SESSION as MemberSession,
            organization: MOCK_ORGANIZATION as Organization,
            request_id: 'fake-request-id',
            session_jwt: 'fake-session-jwt',
            session_token: 'fake-session-token',
            status_code: 200,
          },
        });
      }

      return makeErrorResponse({
        errorType: 'unauthorized_credentials',
        statusCode: 401,
        message: 'Unauthorized credentials',
      });
    }),
    b2bAdminPortalConfig: http.get('https://api.stytch.com/sdk/v1/b2b/admin_portal_config', () => {
      return HttpResponse.json({
        data: {
          sso_config: {
            can_create_oidc_connection: true,
            can_create_saml_connection: true,
            sso_enabled: true,
          },
          organization_config: {
            mfa_controls_enabled: true,
          },
          scim_config: {
            scim_enabled: true,
          },
        },
      });
    }),
    b2bSso: http.get<never, never, DataResponse<B2BSSOGetConnectionsResponse>>(
      'https://api.stytch.com/sdk/v1/b2b/sso',
      () => {
        return HttpResponse.json({
          data: {
            oidc_connections: [...Array(5).keys()]
              .map((i) =>
                makeFakeOidcConnection({
                  connection_id: `oidc-connection-test-fake-${i}`,
                  display_name: `Fake OIDC Connection ${i + 1}`,
                }),
              )
              .concat(
                {
                  ...makeFakeOidcConnection({
                    connection_id: `oidc-connection-test-fake-okta`,
                    display_name: `Fake okta OIDC connection`,
                    identity_provider: 'okta',
                  }),
                },
                {
                  ...makeFakeOidcConnection({
                    connection_id: `oidc-connection-test-fake-microsoft-entra`,
                    display_name: `Fake microsoft-entra OIDC connection`,
                    identity_provider: 'microsoft-entra',
                    issuer: 'https://login.microsoftonline.com/fake-tenant-id/v2.0',
                  }),
                },
                {
                  ...makeFakeOidcConnection({
                    connection_id: `oidc-connection-test-fake-unicorn`,
                    display_name: `Fake unknown new provider OIDC connection`,
                    identity_provider: 'unicorn',
                  }),
                },
              ),
            saml_connections: [...Array(5).keys()]
              .map((i) =>
                makeFakeSamlConnection({
                  connection_id: `saml-connection-test-fake-${i}`,
                  display_name: `Fake SAML Connection ${i + 1}`,
                }),
              )
              .concat(
                {
                  ...makeFakeSamlConnection({
                    connection_id: `saml-connection-test-fake-google-workspace`,
                    display_name: `Fake google-workspace SAML connection`,
                    identity_provider: 'google-workspace',
                  }),
                },
                {
                  ...makeFakeSamlConnection({
                    connection_id: `saml-connection-test-fake-okta`,
                    display_name: `Fake okta SAML connection`,
                    identity_provider: 'okta',
                    attribute_mapping: {
                      email: 'email',
                      full_name: 'name',
                      groups: 'groups',
                    },
                  }),
                },
                {
                  ...makeFakeSamlConnection({
                    connection_id: `saml-connection-test-fake-microsoft-entra`,
                    display_name: `Fake microsoft-entra SAML connection`,
                    identity_provider: 'microsoft-entra',
                  }),
                },
                {
                  ...makeFakeSamlConnection({
                    connection_id: `saml-connection-test-fake-unicorn`,
                    display_name: `Fake unknown new provider SAML connection`,
                    identity_provider: 'unicorn',
                  }),
                },
              ),
            external_connections: [makeFakeExternalConnection({ connection_id: 'external-connection-test-fake-0' })],
            request_id: 'request-id-test-602dffcd-603a-471d-b3ca-60f01f7215da',
            status_code: 200,
          },
        });
      },
    ),
    b2bSsoSamlCreate: http.post<
      never,
      B2BSSOSAMLCreateConnectionOptions,
      DataResponse<B2BSSOSAMLCreateConnectionResponse>
    >('https://api.stytch.com/sdk/v1/b2b/sso/saml', async ({ request }) => {
      await delay(networkDelay);
      const body = await request.json();
      return HttpResponse.json({
        data: {
          connection: makeFakeSamlConnection({
            connection_id: 'saml-connection-test-fake-0',
            display_name: body.display_name,
          }),
          request_id: 'request-id-test-602dffcd-603a-471d-b3ca-60f01f7215da',
          status_code: 200,
        },
      });
    }),
    b2bSsoOidcCreate: http.post<
      never,
      B2BSSOOIDCCreateConnectionOptions,
      DataResponse<B2BSSOOIDCCreateConnectionResponse>
    >('https://api.stytch.com/sdk/v1/b2b/sso/oidc', async ({ request }) => {
      await delay(networkDelay);
      const body = await request.json();
      return HttpResponse.json({
        data: {
          connection: makeFakeOidcConnection({
            connection_id: 'oidc-connection-test-fake-0',
            display_name: body.display_name,
          }),
          request_id: 'request-id-test-602dffcd-603a-471d-b3ca-60f01f7215da',
          status_code: 200,
        },
      });
    }),
    b2bSsoExternalCreate: http.post<
      never,
      B2BSSOCreateExternalConnectionOptions,
      DataResponse<B2BSSOCreateExternalConnectionResponse>
    >('https://api.stytch.com/sdk/v1/b2b/sso/external', async ({ request }) => {
      await delay(networkDelay);
      const body = await request.json();
      return HttpResponse.json({
        data: {
          connection: makeFakeExternalConnection({
            connection_id: 'external-connection-test-fake-0',
            display_name: body.display_name,
          }),
          request_id: 'request-id-test-602dffcd-603a-471d-b3ca-60f01f7215da',
          status_code: 200,
        },
      });
    }),
    b2bOrganizationMe: http.get<never, never, DataResponse<{ organization: Organization } & ResponseCommon>>(
      'https://api.stytch.com/sdk/v1/b2b/organizations/me',
      () => {
        return HttpResponse.json({
          data: {
            organization: organizationMeResponse,
            request_id: 'request-id-test-896c625f-89a6-4a0d-8615-3dcbdf00314d',
            status_code: 200,
          },
        });
      },
    ),
    b2bOrganizationMePut: makeB2BOrganizationMePutHandler(
      {} as HttpResponseResolver<
        never,
        B2BPasswordAuthenticateOptions,
        DataResponse<B2BAuthenticateResponseWithMFA> | ErrorResponse
      >,
    ),
    b2bMembersSearch: http.post<
      never,
      B2BOrganizationsMembersSearchOptions,
      DataResponse<B2BOrganizationsMembersSearchResponse>
    >('https://api.stytch.com/sdk/v1/b2b/organizations/me/members/search', async ({ request }) => {
      await delay(networkDelay);

      const { cursor, limit, query } = await request.json();

      const limitNum = limit || 100;

      const startIndex = cursor ? parseInt(cursor, 10) : 0;
      const endIndex = startIndex + limitNum;

      const filteredMembers = fakeMembers.filter((member) => {
        return (
          !query ||
          query.operands.every((operand) => {
            if (operand.filter_name === 'member_email_fuzzy') {
              return member.email_address.includes(operand.filter_value as string);
            }
            if (operand.filter_name === 'statuses') {
              return (operand.filter_value as string[]).includes(member.status);
            }
            if (operand.filter_name === 'member_roles') {
              return (operand.filter_value as string[]).some((role) =>
                member.roles.some((memberRole) => memberRole.role_id === role),
              );
            }
            if (operand.filter_name === 'member_ids') {
              return (operand.filter_value as string[]).includes(member.member_id);
            }

            return true;
          })
        );
      });

      const pageMembers = filteredMembers.slice(startIndex, endIndex);

      return HttpResponse.json({
        data: {
          organizations: {
            [MOCK_ORGANIZATION.organization_id]: MOCK_ORGANIZATION as Organization,
          },
          results_metadata: {
            total: filteredMembers.length,
            next_cursor: endIndex < filteredMembers.length ? endIndex.toString() : undefined,
          },
          members: pageMembers,
          request_id: 'fake-request-id',
          status_code: 200,
        },
      });
    }),
    b2bMembersTotpDelete: http.delete<
      { member_id: string },
      never,
      DataResponse<B2BOrganizationsMemberDeleteMFATOTPResponse> | ErrorResponse
    >('https://api.stytch.com/sdk/v1/b2b/organizations/members/totp/:member_id', async ({ params: { member_id } }) => {
      await delay(networkDelay);

      const matchingMember = fakeMembers.find((m) => m.member_id === member_id);

      if (!matchingMember) {
        return makeErrorResponse({
          errorType: 'not_found',
          statusCode: 404,
          message: 'Member not found',
        });
      }

      const { totp_registration_id, ...member } = matchingMember;

      return HttpResponse.json({
        data: {
          request_id: 'fake-request-id',
          status_code: 200,
          member_id,
          organization: MOCK_ORGANIZATION as Organization,
          member: member as Member,
        },
      });
    }),
    b2bMembersMfaPhoneNumberDelete: http.delete<
      { member_id: string },
      never,
      DataResponse<B2BOrganizationsMemberDeleteMFAPhoneNumberResponse> | ErrorResponse
    >(
      'https://api.stytch.com/sdk/v1/b2b/organizations/members/mfa_phone_numbers/:member_id',
      async ({ params: { member_id } }) => {
        await delay(networkDelay);

        const matchingMember = fakeMembers.find((m) => m.member_id === member_id);

        if (!matchingMember) {
          return makeErrorResponse({
            errorType: 'not_found',
            statusCode: 404,
            message: 'Member not found',
          });
        }

        const { mfa_phone_number, mfa_phone_number_verified, ...member } = matchingMember;

        return HttpResponse.json({
          data: {
            request_id: 'fake-request-id',
            status_code: 200,
            member_id,
            organization: MOCK_ORGANIZATION as Organization,
            member: member as Member,
          },
        });
      },
    ),
    b2bScim: http.get<never, never, DataResponse<B2BSCIMGetConnectionResponse>>(
      'https://api.stytch.com/sdk/v1/b2b/scim',
      () => {
        return HttpResponse.json({
          data: {
            connection: makeFakeScimConnection(),
            request_id: 'request-id-test-602dffcd-603a-471d-b3ca-60f01f7215da',
            status_code: 200,
          },
        });
      },
    ),
    b2bScimGroups: http.post<
      never,
      B2BSCIMGetConnectionGroupsOptions,
      DataResponse<B2BSCIMGetConnectionGroupsResponse>
    >('https://api.stytch.com/sdk/v1/b2b/scim/groups', async () => {
      const connectionId = 'scim-connection-test-cdd5415a-c470-42be-8369-5c90cf7762dc';
      return HttpResponse.json({
        data: {
          next_cursor: null,
          scim_groups: [
            {
              group_id: 'scim_group_id0',
              group_name: 'Engineering',
              organization_id: MOCK_ORGANIZATION.organization_id,
              connection_id: connectionId,
            },
            {
              group_id: 'scim_group_id1',
              group_name: 'readers',
              organization_id: MOCK_ORGANIZATION.organization_id,
              connection_id: connectionId,
            },
            {
              group_id: 'scim_group_id2',
              group_name: 'writers',
              organization_id: MOCK_ORGANIZATION.organization_id,
              connection_id: connectionId,
            },
            {
              group_id: 'scim_group_id3',
              group_name: 'Design',
              organization_id: MOCK_ORGANIZATION.organization_id,
              connection_id: connectionId,
            },
          ],
          request_id: 'request-id-test-b05c992f-ebdc-489d-a754-c7e70ba13141',
          status_code: 200,
        },
      });
    }),
    b2bScimUpdateConnection: http.put<
      never,
      B2BSCIMUpdateConnectionOptions,
      DataResponse<B2BSCIMUpdateConnectionResponse>
    >('https://api.stytch.com/sdk/v1/b2b/scim/me', async (info) => {
      await delay(networkDelay);
      const body = (await info.request.json()) as B2BSCIMUpdateConnectionOptions & SCIMConnection;

      const response: DataResponse<B2BSCIMUpdateConnectionResponse> = {
        data: {
          connection: {
            ...makeFakeScimConnection(),
            ...body,
          },
          request_id: 'request-id-test-b05c992f-ebdc-489d-a754-c7e70ba13141',
          status_code: 200,
        },
      };

      return HttpResponse.json(response);
    }),
    b2bScimCreateConnection: http.post<
      never,
      B2BSCIMCreateConnectionOptions,
      DataResponse<B2BSCIMCreateConnectionResponse>
    >('https://api.stytch.com/sdk/v1/b2b/scim', async ({ request }) => {
      await delay(networkDelay);

      const body = await request.json();

      const response: DataResponse<B2BSCIMCreateConnectionResponse> = {
        data: {
          connection: makeFakeScimConnectionWithBearerToken({
            display_name: body.display_name,
            identity_provider: body.identity_provider,
          }),
          request_id: 'request-id-test-b05c992f-ebdc-489d-a754-c7e70ba13141',
          status_code: 200,
        },
      };

      return HttpResponse.json(response);
    }),
    b2bScimRotateStart: http.post<{ connectionId: string }, never, DataResponse<B2BSCIMRotateStartResponse>>(
      'https://api.stytch.com/sdk/v1/b2b/scim/rotate/start',
      async () => {
        await delay(networkDelay);

        const response: DataResponse<B2BSCIMRotateStartResponse> = {
          data: {
            connection: makeFakeScimConnectionWithNextBearerToken(),
            request_id: 'request-id-test-b05c992f-ebdc-489d-a754-c7e70ba13141',
            status_code: 200,
          },
        };

        return HttpResponse.json(response);
      },
    ),
    b2bScimRotateCancel: http.post<{ connectionId: string }, never, DataResponse<B2BSCIMRotateCancelResponse>>(
      'https://api.stytch.com/sdk/v1/b2b/scim/rotate/cancel',
      async () => {
        await delay(networkDelay);

        const response: DataResponse<B2BSCIMRotateCancelResponse> = {
          data: {
            connection: makeFakeScimConnection(),
            request_id: 'request-id-test-b05c992f-ebdc-489d-a754-c7e70ba13141',
            status_code: 200,
          },
        };

        return HttpResponse.json(response);
      },
    ),
    b2bScimRotateComplete: http.post<{ connectionId: string }, never, DataResponse<B2BSCIMRotateCompleteResponse>>(
      'https://api.stytch.com/sdk/v1/b2b/scim/rotate/complete',
      async () => {
        await delay(networkDelay);

        const response: DataResponse<B2BSCIMRotateCompleteResponse> = {
          data: {
            connection: makeFakeScimConnection(),
            request_id: 'request-id-test-b05c992f-ebdc-489d-a754-c7e70ba13141',
            status_code: 200,
          },
        };

        return HttpResponse.json(response);
      },
    ),
    b2bMagicLinkEmailLoginOrSignup: http.post<
      never,
      B2BMagicLinkLoginOrSignupOptions,
      DataResponse<B2BMagicLinkLoginOrSignupResponse>
    >('https://api.stytch.com/sdk/v1/b2b/magic_links/email/login_or_signup', async () => {
      await delay(networkDelay);

      return HttpResponse.json({
        data: {
          request_id: MOCK_REQUEST_ID,
          status_code: 200,
        },
      });
    }),
    b2bDiscoveryOrganizationsCreate: http.post<
      never,
      B2BDiscoveryOrganizationsCreateOptions,
      DataResponse<B2BDiscoveryOrganizationsCreateResponse>
    >('https://api.stytch.com/sdk/v1/b2b/discovery/organizations/create', async () => {
      await delay(networkDelay);

      return HttpResponse.json({
        data: {
          intermediate_session_token: MOCK_INTERMEDIATE_SESSION_TOKEN,
          member: {
            ...(MOCK_MEMBER as unknown as Member),
            email_address: MOCK_EMAIL,
            email_address_verified: false,
            member_password_id: '',
            organization_id: MOCK_ORGANIZATION.organization_id,
            status: 'pending',
          },
          member_authenticated: false,
          member_id: MOCK_MEMBER.member_id,
          member_session: null,
          mfa_required: null,
          organization: {
            ...(MOCK_ORGANIZATION as unknown as Organization),
            auth_methods: 'ALL_ALLOWED',
          },
          primary_required: {
            allowed_auth_methods: ['sso', 'magic_link', 'password', 'google_oauth', 'microsoft_oauth', 'email_otp'],
          },
          request_id: MOCK_REQUEST_ID,
          session_jwt: '',
          session_token: '',
          status_code: 200,
        },
      });
    }),
    b2bDiscoveryIntermediateSessionsExchange: http.post<
      never,
      B2BDiscoveryIntermediateSessionsExchangeOptions,
      DataResponse<B2BDiscoveryIntermediateSessionsExchangeResponse> | ErrorResponse
    >('https://api.stytch.com/sdk/v1/b2b/discovery/intermediate_sessions/exchange', async ({ request }) => {
      await delay(networkDelay);

      const body = await request.json();

      if (body.organization_id === 'ist-not-found') {
        return makeErrorResponse({
          statusCode: 404,
          errorType: 'intermediate_session_not_found',
          message: 'Intermediate session could not be found.',
        });
      }

      return HttpResponse.json({
        data: {
          intermediate_session_token: MOCK_INTERMEDIATE_SESSION_TOKEN,
          member: {
            ...(MOCK_MEMBER as unknown as Member),
            email_address: MOCK_EMAIL,
            email_address_verified: false,
            member_password_id: '',
            organization_id: MOCK_ORGANIZATION.organization_id,
            status: 'pending',
          },
          member_authenticated: false,
          member_id: MOCK_MEMBER.member_id,
          member_session: null,
          mfa_required: null,
          organization: {
            ...(MOCK_ORGANIZATION as unknown as Organization),
            auth_methods: 'ALL_ALLOWED',
          },
          primary_required: {
            allowed_auth_methods: ['sso', 'magic_link', 'password', 'google_oauth', 'microsoft_oauth', 'email_otp'],
          },
          request_id: MOCK_REQUEST_ID,
          session_jwt: '',
          session_token: '',
          status_code: 200,
        },
      });
    }),
    b2bOtpEmailDiscoverySend: http.post<
      never,
      B2BDiscoveryOTPEmailSendOptions,
      DataResponse<B2BDiscoveryOTPEmailSendResponse> | ErrorResponse
    >('https://api.stytch.com/sdk/v1/b2b/otps/email/discovery/send', async ({ request }) => {
      await delay(networkDelay);

      const body = await request.json();

      if (inactiveEmails.has(body.email_address)) {
        return makeErrorResponse({
          statusCode: 400,
          errorType: 'inactive_email',
          message:
            'The email provided has been marked as inactive by our email provider. This happens most often when the email is undeliverable due to a hard bounce. If the cause of the hard bounce has been resolved, you can reactivate the email address via the User management tab or the Members tab in the Stytch Dashboard.',
        });
      }

      if (body.email_address.startsWith('inactive-email')) {
        inactiveEmails.add(body.email_address);
      }

      if (body.email_address.startsWith('error')) {
        return makeErrorResponse({
          statusCode: 400,
          errorType: 'test',
          message: 'We were unable to reach this email address. Please try another email or contact your admin.',
        });
      }

      return HttpResponse.json({
        data: {
          request_id: MOCK_REQUEST_ID,
          status_code: 200,
        },
      });
    }),
    b2bOtpEmailDiscoveryAuthenticate: http.post<
      never,
      B2BDiscoveryOTPEmailAuthenticateOptions,
      DataResponse<B2BDiscoveryOTPEmailAuthenticateResponse> | ErrorResponse
    >('https://api.stytch.com/sdk/v1/b2b/otps/email/discovery/authenticate', async ({ request }) => {
      await delay(networkDelay);

      const body = await request.json();

      if (body.code === '123456') {
        return HttpResponse.json({
          data: {
            discovered_organizations: [],
            email_address: body.email_address,
            intermediate_session_token: MOCK_INTERMEDIATE_SESSION_TOKEN,
            request_id: MOCK_REQUEST_ID,
            status_code: 200,
          },
        });
      }

      return makeErrorResponse({
        errorType: 'unauthorized_credentials',
        statusCode: 401,
        message: 'Unauthorized credentials',
      });
    }),
    b2bMagicLinksEmailDiscoverySend: http.post<
      never,
      B2BMagicLinksEmailDiscoverySendOptions,
      DataResponse<B2BMagicLinksEmailDiscoverySendResponse>
    >('https://api.stytch.com/sdk/v1/b2b/magic_links/email/discovery/send', async () => {
      await delay(networkDelay);

      return HttpResponse.json({
        data: {
          request_id: MOCK_REQUEST_ID,
          status_code: 200,
        },
      });
    }),
    b2bMagicLinksDiscoveryAuthenticate: http.post<
      never,
      B2BMagicLinksDiscoveryAuthenticateOptions,
      DataResponse<B2BMagicLinksDiscoveryAuthenticateResponse>
    >('https://api.stytch.com/sdk/v1/b2b/magic_links/discovery/authenticate', async () => {
      await delay(networkDelay);

      return HttpResponse.json({
        data: b2bDiscoveryAuthenticateResponseSuccess,
      });
    }),
    b2bOtpEmailLoginOrSignup: http.post<
      never,
      B2BOTPsEmailLoginOrSignupOptions,
      DataResponse<B2BOTPsEmailLoginOrSignupResponse> | ErrorResponse
    >('https://api.stytch.com/sdk/v1/b2b/otps/email/login_or_signup', async ({ request }) => {
      await delay(networkDelay);

      const body = await request.json();

      if (inactiveEmails.has(body.email_address)) {
        return makeErrorResponse({
          statusCode: 400,
          errorType: 'inactive_email',
          message:
            'The email provided has been marked as inactive by our email provider. This happens most often when the email is undeliverable due to a hard bounce. If the cause of the hard bounce has been resolved, you can reactivate the email address via the User management tab or the Members tab in the Stytch Dashboard.',
        });
      }

      if (body.email_address.startsWith('inactive-email')) {
        inactiveEmails.add(body.email_address);
      }

      if (body.email_address.startsWith('error')) {
        return makeErrorResponse({
          statusCode: 400,
          errorType: 'test',
          message: 'We were unable to reach this email address. Please try another email or contact your admin.',
        });
      }

      return HttpResponse.json({
        data: {
          request_id: MOCK_REQUEST_ID,
          status_code: 200,
        },
      });
    }),
    b2bOtpEmailAuthenticate: http.post<
      never,
      B2BOTPsEmailAuthenticateOptions,
      DataResponse<B2BOTPsEmailAuthenticateResponse> | ErrorResponse
    >('https://api.stytch.com/sdk/v1/b2b/otps/email/authenticate', async ({ request }) => {
      await delay(networkDelay);

      const body = await request.json();

      if (body.code === '123456') {
        return HttpResponse.json({
          data: { ...b2bAuthenticateResponseSuccess, method_id: 'fake-method-id' },
        });
      }

      return makeErrorResponse({
        errorType: 'unauthorized_credentials',
        statusCode: 401,
        message: 'Unauthorized credentials',
      });
    }),
    b2bSSODiscoveryConnection: http.get<
      never,
      never,
      | DataResponse<{ request_id: string; connections: { connection_id: string; display_name: string }[] }>
      | ErrorResponse
    >('https://api.stytch.com/sdk/v1/b2b/sso/discovery/connections', async ({ request }) => {
      await delay(networkDelay);

      const url = new URL(request.url);
      const emailAddress = url.searchParams.get('email_address');

      if (!emailAddress) {
        return makeErrorResponse({
          errorType: 'invalid_parameters',
          statusCode: 400,
          message: 'Missing required parameter: email_address',
        });
      }

      if (emailAddress.includes('error')) {
        return HttpResponse.error() as never;
      }

      const getConnections = () => {
        if (emailAddress.includes('zero')) {
          return [];
        }

        if (emailAddress.includes('multiple')) {
          return MOCK_SSO_ACTIVE_CONNECTIONS;
        }

        return MOCK_SSO_ACTIVE_CONNECTIONS.slice(0, 1);
      };

      return HttpResponse.json({
        data: {
          request_id: MOCK_REQUEST_ID,
          connections: getConnections(),
        },
      });
    }),
    b2bOrganizationGetBySlug: http.post<
      never,
      B2BOrganizationsGetBySlugOptions,
      DataResponse<B2BOrganizationsGetBySlugResponse> | ErrorResponse
    >('https://api.stytch.com/sdk/v1/b2b/organizations/search', async ({ request }) => {
      await delay(networkDelay);

      const { organization_slug: slug } = (await request.json()) as B2BOrganizationsGetBySlugOptions;

      if (slug === 'error-org') {
        return HttpResponse.error() as never;
      }

      const getMockOrganization = () => {
        if (slug === 'no-sso-connections') {
          return { ...organizationMeResponse, sso_active_connections: [] };
        }

        if (slug === 'multiple-sso-connections') {
          return {
            ...organizationMeResponse,
            sso_active_connections: MOCK_SSO_ACTIVE_CONNECTIONS,
          };
        }

        if (slug === 'org-logo') {
          return {
            ...organizationMeResponse,
            organization_logo_url: '/stytch2.jpg',
          };
        }

        return null;
      };

      return HttpResponse.json({
        data: {
          organization: getMockOrganization(),
          request_id: MOCK_REQUEST_ID,
          status_code: 200,
        },
      });
    }),
    b2bOrganizationMembersSearch: http.post<
      never,
      { email_address: string; organization_id: string },
      DataResponse<MemberSearchData> | ErrorResponse
    >('https://api.stytch.com/sdk/v1/b2b/organizations/members/search', async ({ request }) => {
      await delay(networkDelay);

      const body = await request.json();

      if (body.email_address.startsWith('active@')) {
        return HttpResponse.json({
          data: {
            request_id: MOCK_REQUEST_ID,
            status_code: 200,
            member: {
              member_password_id: 'mock_password_id',
              name: 'Mock Member',
              status: 'active',
            },
          },
        });
      }

      if (body.email_address.startsWith('member-without-password@')) {
        return HttpResponse.json({
          data: {
            request_id: MOCK_REQUEST_ID,
            status_code: 200,
            member: {
              member_password_id: '',
              name: 'Mock Member',
              status: 'active',
            },
          },
        });
      }

      if (body.email_address.startsWith('not-a-member@')) {
        return HttpResponse.json({
          data: {
            request_id: MOCK_REQUEST_ID,
            status_code: 200,
            member: null,
          },
        });
      }

      return makeErrorResponse({
        errorType: 'invalid_parameters',
        statusCode: 400,
      });
    }),
    b2bPasswordsEmailResetStart: http.post<
      never,
      B2BPasswordResetByEmailStartOptions,
      DataResponse<B2BPasswordResetByEmailStartResponse> | ErrorResponse
    >('https://api.stytch.com/sdk/v1/b2b/passwords/email/reset/start', async () => {
      await delay(networkDelay);

      return HttpResponse.json({
        data: {
          request_id: MOCK_REQUEST_ID,
          status_code: 200,
        },
      });
    }),
    b2bMagicLinkInvite: http.post<
      never,
      B2BMagicLinksInviteOptions,
      DataResponse<B2BMagicLinksInviteResponse> | ErrorResponse
    >('https://api.stytch.com/sdk/v1/b2b/magic_links/email/invite', async ({ request }) => {
      await delay(networkDelay);
      const body = await request.json();
      const requireTemplateIdMarker = '+require-template-id@';

      if (body.email_address.includes(requireTemplateIdMarker) && !body.invite_template_id) {
        return makeErrorResponse({
          errorType: 'missing_invite_template_id',
          statusCode: 400,
          message: 'Invite template ID is required for this email address.',
        });
      }

      return HttpResponse.json({
        data: {
          request_id: MOCK_REQUEST_ID,
          status_code: 200,
          member_id: MOCK_MEMBER.member_id,
          member: MOCK_MEMBER as unknown as Member,
          organization: MOCK_ORGANIZATION as unknown as Organization,
        },
      });
    }),
  }) satisfies Record<string, HttpHandler>;

/**
 * Use this type when overriding existing msw handlers to ensure you have used the correct key.
 * Do not use this if you are defining handlers unique to the story.
 *
 * @example
 * // In a Story
 * parameters: {
 *   msw: {
 *     handlers: {
 *       // Handlers here must override some existing handler key, otherwise there will be a type error
 *     } satisfies OverrideHandlers,
 *   }
 * }
 *
 */
export type OverrideHandlers = Partial<Record<keyof typeof handlers, HttpHandler>>;
