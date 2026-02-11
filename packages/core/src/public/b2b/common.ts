import { RBACPolicyRole } from '../../rbac';
import { ExtractOpaqueTokens, IfOpaqueTokens, RedactedToken } from '../../typeConfig';
import { Redacted } from '../../utils/Redacted';
import { ResponseCommon } from '../common';
import { StytchProjectConfigurationInput } from '../typeConfig';

// Authentication Factors
export interface B2BEmailFactor {
  delivery_method: 'email';
  type: string;
  last_authenticated_at: string;
  email_factor: {
    email_id: string;
    email_address: string;
  };
  sequence_order: 'PRIMARY';
}

export interface B2BPhoneNumberFactor {
  delivery_method: 'sms' | 'whatsapp';
  type: string;
  last_authenticated_at: string;
  phone_number_factor: {
    phone_id: string;
    phone_number: string;
  };
  sequence_order: 'SECONDARY';
}

export interface B2BGoogleOAuthFactor {
  delivery_method: 'oauth_google';
  type: string;
  last_authenticated_at: string;
  google_oauth_factor: {
    id: string;
    email_id: string;
    provider_subject: string;
  };
  sequence_order: 'PRIMARY';
}

export interface B2BMicrosoftOAuthFactor {
  delivery_method: 'oauth_microsoft';
  type: string;
  last_authenticated_at: string;
  microsoft_oauth_factor: {
    id: string;
    email_id: string;
    provider_subject: string;
  };
  sequence_order: 'PRIMARY';
}

export interface B2BHubSpotOAuthFactor {
  delivery_method: 'oauth_hubspot';
  type: string;
  last_authenticated_at: string;
  hubspot_oauth_factor: {
    id: string;
    email_id: string;
    provider_subject: string;
    provider_tenant_id?: string;
  };
  sequence_order: 'PRIMARY';
}

export interface B2BSlackOAuthFactor {
  delivery_method: 'oauth_slack';
  type: string;
  last_authenticated_at: string;
  slack_oauth_factor: {
    id: string;
    email_id: string;
    provider_subject: string;
    provider_tenant_id?: string;
  };
  sequence_order: 'PRIMARY';
}

export interface B2BGitHubOAuthFactor {
  delivery_method: 'oauth_github';
  type: string;
  last_authenticated_at: string;
  github_oauth_factor: {
    id: string;
    email_id: string;
    provider_subject: string;
    provider_tenant_ids?: string[];
  };
  sequence_order: 'PRIMARY';
}

export type B2BAuthenticationFactor =
  | B2BEmailFactor
  | B2BPhoneNumberFactor
  | B2BGoogleOAuthFactor
  | B2BMicrosoftOAuthFactor
  | B2BHubSpotOAuthFactor
  | B2BSlackOAuthFactor
  | B2BGitHubOAuthFactor;

export type MemberResponseCommon = ResponseCommon & {
  /**
   * Globally unique UUID that identifies a specific member in the Stytch API.
   * The member_id critical to perform operations on a member in our API
   * so be sure to preserve this value.
   */
  member_id: string;

  /**
   * The Member object.
   * See {@link Member} for details.
   */
  member: Member;

  /**
   * The Organization object.
   * See {@link Organization} for details.
   */
  organization: Organization;
};

export interface MemberSession {
  /**
   * Globally unique UUID that identifies a specific member session in the Stytch API.
   */
  member_session_id: string;

  /**
   * Globally unique UUID that identifies a specific member in the Stytch API.
   * The member_id critical to perform operations on a member in our API
   * so be sure to preserve this value.
   */
  member_id: string;

  /**
   * Globally unique UUID that identifies an organization in the Stytch API.
   */
  organization_id: string;

  /**
   * The timestamp of the session's creation.
   * Values conform to the RFC 3339 standard and are expressed in UTC, e.g. `2021-12-29T12:33:09Z`.
   */
  started_at: string;

  /**
   * The timestamp of the last time the session was accessed.
   * Values conform to the RFC 3339 standard and are expressed in UTC, e.g. `2021-12-29T12:33:09Z`.
   */
  last_accessed_at: string;

  /**
   * The timestamp of the session's expiration.
   * Values conform to the RFC 3339 standard and are expressed in UTC, e.g. `2021-12-29T12:33:09Z`.
   */
  expires_at: string;

  /**
   * All the authentication factors that have been associated with the current member session.
   */
  authentication_factors: B2BAuthenticationFactor[];

  /**
   * A map of the custom claims associated with the session.
   * Custom claims can only be set from the server, they cannot be set using the clientside SDKs.
   * After claims have been added to a session, call {@link IHeadlessB2BSessionClient#authenticate stytch.session.authenticate} to refresh the session state clientside.
   * See our {@link https://stytch.com/docs/sessions#using-sessions_custom-claims guide} for more information.
   * If no claims are set, this field will be null.
   */
  custom_claims?: Record<string, unknown>;

  /**
   * A list of the roles associated with the session.
   * Members may inherit certain roles depending on the factors in their session.
   * For example, some roles may only be active if the member logged in from a specific SAML IDP.
   */
  roles: string[];

  /**
   * The slug of the organization that the member belongs to.
   */
  organization_slug: string;
}

interface SSORegistration {
  connection_id: string;
  external_id: string;
  registration_id: string;
  sso_attributes: Record<string, unknown>;
}

export interface OAuthRegistration {
  /**
   * Globally unique UUID that identifies a specific member OAuth registration in the Stytch API.
   */
  member_oauth_registration_id: string;
  /**
   * The `provider_subject` field is the unique identifier used to identify the user within a given OAuth provider.
   * Also commonly called the "sub" or "Subject field" in OAuth protocols.
   */
  provider_subject: string;
  /**
   * The `type` field denotes the OAuth identity provider that the user has authenticated with, e.g. Google, Facebook, GitHub etc.
   */
  provider_type: string;
  /**
   * If available, the `profile_picture_url` is a url of the user's profile picture set in OAuth identity the provider that the user has authenticated with, e.g. Facebook profile picture.
   */
  profile_picture_url: string | null;
  /**
   * If available, the `locale` is the user's locale set in the OAuth identity provider that the user has authenticated with.
   */
  locale: string | null;
  /**
   * A list of known tenants associated with the provider.
   */
  provider_tenants: {
    /**
     * The ID of the tenant assigned by the provider.
     */
    tenant_id: string;
    /**
     * The name of the tenant.
     */
    tenant_name: string;
  }[];
}

type RoleSource =
  | { type: 'direct_assignment'; details: Record<string, never> }
  | { type: 'email_assignment'; details: { email_domain: string } }
  | { type: 'sso_connection'; details: { connection_id: string } }
  | { type: 'sso_connection_group'; details: { connection_id: string; group: string } }
  | { type: 'scim_connection_group'; details: { connection_id: string; group_id: string } };

export interface MemberRole {
  role_id: string;
  sources: RoleSource[];
}

export interface RetiredEmailAddress {
  email_id?: string;
  email_address?: string;
}

export interface Member {
  /**
   * Globally unique UUID that identifies an organization in the Stytch API.
   */
  organization_id: string;

  /**
   * Globally unique UUID that identifies a specific member in the Stytch API.
   * The member_id critical to perform operations on a member in our API
   * so be sure to preserve this value.
   */
  member_id: string;

  /**
   * The email address of the member.
   */
  email_address: string;

  /**
   * Whether the member's email address is verified.
   */
  email_address_verified: boolean;

  /**
   * A list of retired email addresses associated with the Member, if any exist.
   */
  retired_email_addresses: RetiredEmailAddress[];

  /**
   * The `status` value denotes whether or not a user has successfully logged in at least once with any available login method.
   */
  status: string;

  /**
   * The name of the member
   */
  name: string;

  /**
   * A JSON object containing application-specific metadata.
   * This field can only be updated by a direct API integration.
   * Use it to store fields that a member should not be allowed to edit without backend validation - such as `role` or `subscription_status`.
   * See our {@link https://stytch.com/docs/api/metadata metadata reference} for complete details.
   */
  trusted_metadata: Record<string, unknown>;

  /**
   * A JSON object containing application-specific metadata.
   * Use it to store fields that a member can be allowed to edit directly without backend validation - such as `display_theme` or `preferred_locale`.
   * See our {@link https://stytch.com/docs/api/metadata metadata reference} for complete details.
   */
  untrusted_metadata: Record<string, unknown>;

  /**
   * The timestamp of the Member's creation. Values conform to the RFC 3339 standard and are expressed in
   * UTC, e.g. `2021-12-29T12:33:09Z`.
   */
  created_at: string;

  /**
   * The timestamp of when the Member was last updated. Values conform to the RFC 3339 standard and are
   * expressed in UTC, e.g. `2021-12-29T12:33:09Z`.
   */
  updated_at: string;

  sso_registrations: SSORegistration[];

  /**
   * Identifies the Member as a break glass user - someone who has permissions to authenticate into an Organization by bypassing the Organization's settings.
   * A break glass account is typically used for emergency purposes to gain access outside of normal authentication procedures.
   */
  is_breakglass: boolean;

  /**
   * Whether or not the Member has the `stytch_admin` Role. This Role is automatically granted to Members
   * who create an Organization through the discovery flow. See the
   * {@link https://stytch.com/docs/b2b/guides/rbac/stytch-default RBAC guide} for more details on this Role.
   */
  is_admin: boolean;

  /**
   * Returned if the member has a registered password
   */
  member_password_id: string;

  /**
   * If true, the member must complete a secondary authentication flow, such as SMS OTP, along with their
   * primary authentication factor in order to log in and attain a member session.
   */
  mfa_enrolled: boolean;

  /**
   * Returned if the member has a phone number.
   */
  mfa_phone_number: string;

  /**
   * Whether the member's phone number is verified.
   */
  mfa_phone_number_verified: boolean;

  /**
   * A list of the member's roles and their sources
   */
  roles: MemberRole[];
  /**
   * The member's default MFA method.
   */
  default_mfa_method: string;
  /**
   * Globally unique UUID that identifies a TOTP instance.
   */
  totp_registration_id: string;
  /**
   * A list of OAuth registrations for the member.
   */
  oauth_registrations: OAuthRegistration[];
  /**
   * The external ID of the member.
   */
  external_id?: string;
}

type B2BSessionTokens = {
  /**
   * An opaque session token.
   * Session tokens need to be authenticated via the {@link https://stytch.com/docs/b2b/api/authenticate-session SessionsAuthenticate}
   * endpoint before a member takes any action that requires authentication.
   * If the project is configured to use HttpOnly cookies, this field will always be empty.
   * See {@link https://stytch.com/docs/sessions#session-tokens-vs-JWTs_tokens our documentation} for more information.
   */
  session_token: string;

  /**
   * A JSON Web Token that contains standard claims about the user as well as information about the Stytch session
   * Session JWTs can be authenticated locally without an API call.
   * A session JWT is signed by project-specific keys stored by Stytch.
   * If the project is configured to use HttpOnly cookies, this field will always be empty.
   * See {@link https://stytch.com/docs/sessions#session-tokens-vs-JWTs_jwts our documentation} for more information.
   */
  session_jwt: string;
};

export type B2BAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = ResponseCommon & {
  /**
   * Globally unique UUID that identifies a specific member in the Stytch API.
   * The member_id critical to perform operations on a member in our API
   * so be sure to preserve this value.
   */
  member_id: string;

  /**
   * The Member Session object.
   * See {@link MemberSession} for details.
   */
  member_session: MemberSession;

  /**
   * The Member object.
   * See {@link Member} for details.
   */
  member: Member;

  /**
   * The Organization object.
   * See {@link Organization} for details.
   */
  organization: Organization;
} & IfOpaqueTokens<
    ExtractOpaqueTokens<TProjectConfiguration>,
    Redacted<B2BSessionTokens, RedactedToken>,
    B2BSessionTokens
  >;

export type B2BAuthenticateResponseWithMFA<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = Omit<B2BAuthenticateResponse<TProjectConfiguration>, 'member_session'> &
  (
    | {
        /**
         * The Member Session object.
         * See {@link MemberSession} for details.
         */
        member_session: MemberSession;

        /**
         * Returns true if the member is fully authenticated, in which case a member session is returned.
         * Returns false if the member still needs to complete a secondary authentication requirement,
         * in which case an intermediate_session_token is returned.
         */
        member_authenticated: true;

        /**
         * The intermediate_session_token can be passed into a secondary authentication endpoint, such as OTP authenticate,
         * in order to receive a member session. The intermediate_session_token can also be used with discovery endpoints
         * to join a different organization or create a new organization.
         * If the project is configured to use HttpOnly cookies, this field will always be empty.
         */
        intermediate_session_token: '';

        /**
         * Contains information about the member's options for completing MFA, if applicable.
         */
        mfa_required: null;

        /**
         * Contains information about the member's requirements for verifying their email, if applicable.
         */
        primary_required: null;
      }
    | {
        /**
         * The Member Session object.
         * See {@link MemberSession} for details.
         */
        member_session: null;

        /**
         * Returns true if the member is fully authenticated, in which case a member session is returned.
         * Returns false if the member still needs to complete a secondary authentication requirement,
         * in which case an intermediate_session_token is returned.
         */
        member_authenticated: false;

        /**
         * The intermediate_session_token can be passed into a secondary authentication endpoint, such as OTP authenticate,
         * in order to receive a member session. The intermediate_session_token can also be used with discovery endpoints
         * to join a different organization or create a new organization.
         * If the project is configured to use HttpOnly cookies, this field will always be empty.
         */
        intermediate_session_token: IfOpaqueTokens<ExtractOpaqueTokens<TProjectConfiguration>, RedactedToken, string>;

        /**
         * Contains information about the member's options for completing MFA, if applicable.
         */
        mfa_required: MfaRequired | null;

        /**
         * Contains information about the member's requirements for verifying their email, if applicable.
         */
        primary_required: PrimaryRequired | null;
      }
  );
export type B2BAllowedAuthMethods =
  | 'sso'
  | 'magic_link'
  | 'password'
  | 'google_oauth'
  | 'microsoft_oauth'
  | 'hubspot_oauth'
  | 'slack_oauth'
  | 'github_oauth'
  | 'email_otp';

export type B2BAllowedMFAMethods = 'sms_otp' | 'totp';

export interface SSOActiveConnection {
  connection_id: string;
  display_name: string;
  identity_provider: string;
}

export interface Organization {
  /**
   * Globally unique UUID that identifies an organization in the Stytch API.
   */
  organization_id: string;

  /**
   * The name of the organization.
   */
  organization_name: string;

  /**
   * The slug of the organization.
   */
  organization_slug: string;

  /**
   * The external ID of the organization.
   */
  organization_external_id?: string;

  /**
   * A URL of the organization's logo.
   */
  organization_logo_url: string;

  /**
   * A JSON object containing application-specific metadata.
   * This field can only be updated by a direct API integration.
   */
  trusted_metadata: Record<string, unknown>;

  /**
   * The organization's custom RBAC roles.
   * Custom roles are additive to the project's base RBAC policy.
   */
  custom_roles?: RBACPolicyRole[];

  /**
   * The default connection used for SSO when there are multiple active connections.
   */
  sso_default_connection_id: string | null;

  /**
   * The authentication setting that controls the JIT provisioning of Members when authenticating via SSO.
   * The accepted values are:
   *   ALL_ALLOWED – new Members will be automatically provisioned upon successful authentication via any of the Organization's sso_active_connections.
   *   RESTRICTED – only new Members with SSO logins that comply with sso_jit_provisioning_allowed_connections can be provisioned upon authentication.
   *   NOT_ALLOWED – disable JIT provisioning via SSO.
   */
  sso_jit_provisioning: 'ALL_ALLOWED' | 'RESTRICTED' | 'NOT_ALLOWED';

  /**
   * An array of connection_ids that reference SAML Connection objects.
   * Only these connections will be allowed to JIT provision Members via SSO when sso_jit_provisioning is set to RESTRICTED.
   */
  sso_jit_provisioning_allowed_connections: string[];

  /**
   * An array of active SSO Connection references.
   */
  sso_active_connections: SSOActiveConnection[];

  /**
   * An active SCIM Connection reference.
   */
  scim_active_connection: { connection_id: string; display_name: string } | null;

  /**
   * An array of email domains that allow invites or JIT provisioning for new Members.
   * This list is enforced when either email_invites or email_jit_provisioning is set to RESTRICTED.
   * Common domains such as gmail.com are not allowed.
   */
  email_allowed_domains: string[];

  /**
   * The authentication setting that controls how a new Member can be provisioned by authenticating via Email Magic Link.
   * The accepted values are:
   *   ALL_ALLOWED - any new Member can be provisioned via Email Magic Link.
   *   RESTRICTED – only new Members with verified emails that comply with email_allowed_domains can be provisioned upon authentication via Email Magic Link.
   *   NOT_ALLOWED – disable JIT provisioning via Email Magic Link.
   */
  email_jit_provisioning: 'ALL_ALLOWED' | 'RESTRICTED' | 'NOT_ALLOWED';

  /**
   * The authentication setting that controls how a new Member can be invited to an organization by email.
   * The accepted values are:
   *   ALL_ALLOWED – any new Member can be invited to join via email.
   *   RESTRICTED – only new Members with verified emails that comply with email_allowed_domains can be invited via email.
   *   NOT_ALLOWED – disable email invites.
   */
  email_invites: 'ALL_ALLOWED' | 'RESTRICTED' | 'NOT_ALLOWED';
  /**
   * The authentication setting that controls how a new Member can be provisioned by authenticating via OAuth, when the OAuth provider does not guarantee the validity of the email.
   * The accepted values are:
   *   RESTRICTED – only Members coming from an OAuth Tenant are in allowed_oauth_tenants are allowed to JIT provision.
   *   NOT_ALLOWED – disable JIT provisioning via OAuth.
   */
  oauth_tenant_jit_provisioning: 'RESTRICTED' | 'NOT_ALLOWED';
  /**
   * A JSON object of allowed OAuth Tenants to be used with oauth_tenant_jit_provisioning.
   * Records are provided with the provider, e.g. "hubspot", as the key, and a list of tenants, e.g. ['HubID1234', 'HubID2345'], as the value.
   */
  allowed_oauth_tenants: Record<string, string[]>;
  /**
   * The setting that controls which authentication methods can be used by Members of an Organization.
   * The accepted values are:
   *   ALL_ALLOWED – the default setting which allows all authentication methods to be used.
   *   RESTRICTED – only methods that comply with allowed_auth_methods can be used for authentication. This setting does not apply to Members with is_breakglass set to true.
   */
  auth_methods: 'ALL_ALLOWED' | 'RESTRICTED';

  /**
   * An array of allowed authentication methods.
   * This list is enforced when auth_methods is set to RESTRICTED.
   * The list's accepted values are: sso, magic_link, password, google_oauth, microsoft_oauth, hubspot_oauth, slack_oauth, github_oauth, and email_otp.
   */
  allowed_auth_methods?: B2BAllowedAuthMethods[];
  /**
   * The setting that controls which mfa methods can be used by Members of an Organization.
   * The accepted values are:
   *   ALL_ALLOWED – the default setting which allows all MFA methods to be used.
   *   RESTRICTED – only methods that comply with allowed_mfa_methods can be used for MFA. This setting does not apply to Members with is_breakglass set to true.
   */
  mfa_methods?: 'ALL_ALLOWED' | 'RESTRICTED';
  /**
   * An array of allowed MFA methods.
   * This list is enforced when mfa_methods is set to RESTRICTED.
   * The list's accepted values are: sms_otp and totp.
   */
  allowed_mfa_methods?: B2BAllowedMFAMethods[];
  /**
   * The setting that controls the MFA policy for all Members in the Organization. The accepted values are:
   *   REQUIRED_FOR_ALL – All Members within the Organization will be required to complete MFA every time they wish to log in.
   *   OPTIONAL – The default value. The Organization does not require MFA by default for all Members. Members will be required to complete MFA only if their mfa_enrolled status is set to true
   */
  mfa_policy: 'OPTIONAL' | 'REQUIRED_FOR_ALL';
  /**
   * An array of implicit role assignments granted to members in this organization whose emails match the domain.
   */
  rbac_email_implicit_role_assignments?: { role_id: string; domain: string }[];
  /**
   * The setting that controls an Organization's policy towards allowing First Party Connected Apps to interact with its Members.
   * The accepted values are:
   *   ALL_ALLOWED - any Connected App in the Project may interact with the Organization's Members.
   *   RESTRICTED – only Connected Apps set in the allowlist (`allowed_first_party_connected_apps`) are permitted.
   *   NOT_ALLOWED – no Connected Apps are allowed.
   */
  first_party_connected_apps_allowed_type?: 'ALL_ALLOWED' | 'RESTRICTED' | 'NOT_ALLOWED';
  /**
   * The IDs of First Party Connected Apps that are allowed to interact with an Organization's Members. This value is only
   * used if `first_party_connected_apps_allowed_type` is set to 'RESTRICTED'.
   */
  allowed_first_party_connected_apps?: string[];
  /**
   * The setting that controls an Organization's policy towards allowing Third Party Connected Apps to interact with its Members.
   * The accepted values are:
   *   ALL_ALLOWED - any Connected App in the Project may interact with the Organization's Members.
   *   RESTRICTED – only Connected Apps set in the allowlist (`allowed_first_party_connected_apps`) are permitted.
   *   NOT_ALLOWED – no Connected Apps are allowed.
   */
  third_party_connected_apps_allowed_type?: 'ALL_ALLOWED' | 'RESTRICTED' | 'NOT_ALLOWED';
  /**
   * The IDs of Third Party Connected Apps that are allowed to interact with an Organization's Members. This value is only used
   * if `first_party_connected_apps_allowed_type` is set to 'RESTRICTED'.
   */
  allowed_third_party_connected_apps?: string[];
}

export type B2BState = {
  member?: Member;
  organization?: Organization;
  session?: MemberSession;
};

export interface DiscoveredOrganization {
  organization: Organization;
  membership:
    | {
        type: 'eligible_to_join_by_email_domain';
        details: { domain: string };
        member: null;
      }
    | {
        type: 'active_member' | 'pending_member' | 'invited_member';
        details: null;
        member: Member;
      }
    | {
        type: 'eligible_to_join_by_oauth_tenant';
        details: { provider: string; tenant: string };
        member: null;
      };
  member_authenticated: boolean;
  primary_required: PrimaryRequired | null;
  mfa_required: MfaRequired | null;
}

export interface MfaRequired {
  member_options: MemberOptions | null;

  /**
   * Equal to 'sms_otp' if an OTP code was sent to the member's phone number.
   */
  secondary_auth_initiated: 'sms_otp' | null;
}

export interface PrimaryRequired {
  allowed_auth_methods: string[];
}

export interface MemberOptions {
  mfa_phone_number: string;
}

export interface X509Certificate {
  certificate_id: string;
  certificate: string;
  issuer: string;
  created_at: string;
  expires_at: string;
  updated_at: string;
}

export interface EncryptionPrivateKey {
  private_key_id: string;
  private_key: string;
  created_at: string;
}

export interface SAMLConnection {
  /**
   * Globally unique UUID that identifies a specific Organization.
   */
  organization_id: string;
  /**
   * Globally unique UUID that identifies a specific SAML Connection.
   */
  connection_id: string;
  /**
   * The status of the connection.
   * The possible values are `pending` or `active`.
   * See the {@link https://stytch.com/docs/b2b/api/update-saml-connection Update SAML Connection} endpoint for more details.
   */
  status: string;
  /**
   * An object that represents the attributes used to identify a Member.
   * This object will map the IdP-defined User attributes to Stytch-specific values.
   * Required attributes: `email` and one of `full_name` or `first_name` and `last_name`.
   */
  attribute_mapping: Record<string, string>;
  /**
   * A globally unique name for the IdP. This will be provided by the IdP.
   */
  idp_entity_id: string;
  /**
   * A human-readable display name for the connection.
   */
  display_name: string;
  /**
   * The URL for which assertions for login requests will be sent. This will be provided by the IdP.
   */
  idp_sso_url: string;
  /**
   * The URL of the Assertion Consumer Service.
   * This value will be passed to the IdP to redirect the Member back to Stytch after a sign-in attempt.
   * Read our {@link https://stytch.com/docs/b2b/api/saml-overview SAML Overview} for more info.
   */
  acs_url: string;
  /**
   * The URL of the Audience Restriction.
   * This value will indicate that Stytch is the intended audience of an assertion.
   * Read our {@link https://stytch.com/docs/b2b/api/saml-overview SAML Overview} for more info.
   */
  audience_uri: string;
  /**
   * A list of X.509 certificates Stytch will use to sign its assertion requests. Certificates should be uploaded to the IdP.
   */
  signing_certificates: X509Certificate[];
  /**
   * A list of X.509 certificates Stytch will use to validate an assertion callback. Certificates should be populated from the IdP.
   */
  verification_certificates: X509Certificate[];
  /**
   * An array of implicit role assignments granted to members in this organization who log in with this SAML connection.
   * See our {@link https://stytch.com/docs/b2b/guides/rbac/role-assignment RBAC guide} for more information about
   * role assignment.
   */
  saml_connection_implicit_role_assignments: { role_id: string }[];
  /**
   * An array of implicit role assignments granted to members in this organization who log in with this SAML connection
   * and belong to the specified group.
   * See our {@link https://stytch.com/docs/b2b/guides/rbac/role-assignment RBAC guide} for more information about
   * role assignment.
   */
  saml_group_implicit_role_assignments: { role_id: string; group: string }[];
  /**
   * The identity provider of this connection. For SAML, the accepted values are `generic`, `okta`, `microsoft-entra`, and 'google-workspace'.
   */
  identity_provider: string;
  /**
   * A list of encryption private keys used to decrypt encrypted SAML assertions.
   */
  saml_encryption_private_keys: EncryptionPrivateKey[];
}

export interface OIDCConnection {
  /**
   * Globally unique UUID that identifies a specific Organization.
   */
  organization_id: string;
  /**
   * Globally unique UUID that identifies a specific OIDC Connection.
   */
  connection_id: string;
  /**
   * The status of the connection.
   * The possible values are `pending` or `active`.
   * See the {@link https://stytch.com/docs/b2b/api/update-oidc-connection Update OIDC Connection} endpoint for more details.
   */
  status: string;

  /**
   * A human-readable display name for the connection.
   */
  display_name: string;
  /**
   * The callback URL for this OIDC connection. This value will be passed to the IdP to redirect the Member back to Stytch after a sign-in attempt.
   */
  redirect_url: string;
  /**
   * A case-sensitive `https://` URL that uniquely identifies the IdP. This will be provided by the IdP.
   */
  issuer: string;
  /**
   * The OAuth2.0 client ID used to authenticate login attempts. This will be provided by the IdP.
   */
  client_id: string;
  /**
   * The secret belonging to the OAuth2.0 client used to authenticate login attempts. This will be provided by the IdP.
   */
  client_secret: string;
  /**
   * The location of the URL that starts an OAuth login at the IdP. This will be provided by the IdP.
   */
  authorization_url: string;
  /**
   * The location of the URL that issues OAuth2.0 access tokens and OIDC ID tokens. This will be provided by the IdP.
   */
  token_url: string;
  /**
   * The location of the IDP's UserInfo Endpoint. This will be provided by the IdP.
   */
  userinfo_url: string;
  /**
   * The location of the IdP's JSON Web Key Set, used to verify credentials issued by the IdP. This will be provided by the IdP.
   */
  jwks_url: string;
  /**
   * The identity provider of this connection. For OIDC, the accepted values are `generic`, `okta`, and `microsoft-entra`.
   */
  identity_provider: string;
  /**
   * A space-separated list of custom scopes that will be requested on each SSOStart call. The total set of scopes will be the union of: the OIDC scopes `openid email profile`, the scopes requested in the `custom_scopes` query parameter on each SSOStart call, and the scopes listed in the OIDC Connection object.
   */
  custom_scopes: string;
  /**
   * An object that represents the attributes used to identify a Member. This object will map the IdP-defined User attributes to Stytch-specific values, which will appear on the member's Trusted Metadata.
   */
  attribute_mapping: Record<string, string>;
}

export interface ExternalConnection {
  /**
   * Globally unique UUID that identifies a specific Organization.
   */
  organization_id: string;
  /**
   * Globally unique UUID that identifies a specific Connection.
   */
  connection_id: string;
  /**
   * Globally unique UUID that identifies a specific External Organization.
   */
  external_organization_id: string;
  /**
   * Globally unique UUID that identifies a specific External Connection.
   */
  external_connection_id: string;
  /**
   * The status of the connection.
   * External connections are always `active`.
   * See the {@link https://stytch.com/docs/b2b/api/update-external-connection Update External Connection} endpoint for more details.
   */
  status: string;
  /**
   * A human-readable display name for the connection.
   */
  display_name: string;
  /**
   * An array of implicit role assignments granted to members in this organization who log in with this external connection.
   * See our {@link https://stytch.com/docs/b2b/guides/rbac/role-assignment RBAC guide} for more information about
   * role assignment.
   */
  external_connection_implicit_role_assignments: { role_id: string }[];
  /**
   * An array of implicit role assignments granted to members in this organization who log in with this external connection
   * and belong to the specified group.
   * See our {@link https://stytch.com/docs/b2b/guides/rbac/role-assignment RBAC guide} for more information about
   * role assignment.
   */
  external_group_implicit_role_assignments: { role_id: string; group: string }[];
}
