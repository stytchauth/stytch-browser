import { ExtractOpaqueTokens, IfOpaqueTokens, RedactedToken } from '../../typeConfig';
import { ResponseCommon, SessionDurationOptions, locale } from '../common';
import { StytchProjectConfigurationInput } from '../typeConfig';
import { B2BAllowedAuthMethods, B2BAuthenticateResponseWithMFA, DiscoveredOrganization } from './common';

export type B2BDiscoveryOrganizationsResponse = ResponseCommon & {
  /**
   * The email corresponding to the intermediate_session_token, session_token, or session_jwt that was passed in
   */
  email_address: string;

  discovered_organizations: DiscoveredOrganization[];

  /**
   * The organization_id that the intermediate_session_token is associated with, if any. This field will be null
   * if a session_token or session_jwt is passed in.
   */
  organization_id_hint: string | null;
};

export type B2BDiscoveryOrganizationsCreateOptions = SessionDurationOptions & {
  /**
   * The name of the new Organization. If the name is not specified, a name will be created based on the email
   * that was used in the discovery flow.
   */
  organization_name?: string;

  /**
   * The unique URL slug of the new Organization. If the slug is not specified, a slug will be created based on the
   * email that was used in the discovery flow.
   */
  organization_slug?: string;

  /**
   * The image URL of the new Organization.
   */
  organization_logo_url?: string;

  /**
   * The authentication setting that controls the JIT provisioning of Members to the new Organization
   * when authenticating via SSO. The accepted values are: ALL_ALLOWED, RESTRICTED, and NOT_ALLOWED.
   */
  sso_jit_provisioning?: string;

  /**
   * An array of email domains that allow invites or JIT provisioning for new Members to the new Organization.
   * This list is enforced when email_invites, email_jit_provisioning, or sso_jit_provisioning are set to RESTRICTED.
   */
  email_allowed_domains?: string[];

  /**
   * The authentication setting that controls how a new Member can be provisioned to the new Organization by
   * authenticating via Email Magic Link. The accepted values are RESTRICTED and NOT_ALLOWED.
   */
  email_jit_provisioning?: string;

  /**
   * The authentication setting that controls how a new Member can be invited to the new Organization via
   * Email Magic Link. The accepted values are: ALL_ALLOWED, RESTRICTED, and NOT_ALLOWED.
   */
  email_invites?: string;

  /**
   * The authentication setting that controls how a new Member can be provisioned by authenticating via OAuth, when the OAuth provider does not guarantee the validity of the email.
   * The accepted values are:
   *   RESTRICTED – only Members coming from an OAuth Tenant are in allowed_oauth_tenants are allowed to JIT provision.
   *   NOT_ALLOWED – disable JIT provisioning via OAuth.
   */
  oauth_tenant_jit_provisioning?: 'RESTRICTED' | 'NOT_ALLOWED';

  /**
   * A JSON object of allowed OAuth Tenants to be used with oauth_tenant_jit_provisioning.
   * Records are provided with the provider, e.g. "hubspot", as the key, and a list of tenants, e.g. ['HubID1234', 'HubID2345'], as the value.
   */
  allowed_oauth_tenants?: Record<string, string[]>;

  /**
   * Determines whether authenticating to the Organization should be restricted to specific authentication methods.
   * The accepted values are: ALL_ALLOWED, RESTRICTED, and NOT_ALLOWED.
   */
  auth_methods?: string;

  /**
   * An array of authentication methods that Members are allowed to use to authenticate to the Organization.
   * This list is enforced when auth_methods is set to RESTRICTED.
   * The accepted values are 'sso', 'magiclink', 'password', 'google_oauth', 'microsoft_oauth', 'hubspot_oauth', 'slack_oauth', and 'github_oauth'.
   */
  allowed_auth_methods?: B2BAllowedAuthMethods[];

  /**
   * The MFA policy of the organization. If 'REQUIRED_FOR_ALL', all members (including the new one that will be created
   * through this endpoint) will be required to complete MFA when logging in to the organization. If 'OPTIONAL',
   * members will only be required to complete MFA if their mfa_enrolled field is set to true.
   * The accepted values are 'REQUIRED_FOR_ALL' and 'OPTIONAL'.
   */
  mfa_policy?: string;
};

export type B2BDiscoveryOrganizationsCreateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = B2BAuthenticateResponseWithMFA<TProjectConfiguration>;

export type B2BDiscoveryIntermediateSessionsExchangeOptions = SessionDurationOptions & {
  /**
   * The id of the Organization that the new Member is joining.
   */
  organization_id: string;

  /**
   * The locale will be used if an OTP code is sent to the member's phone number as part of a
   * secondary authentication requirement.
   */
  locale?: locale;
};

export type B2BDiscoveryIntermediateSessionsExchangeResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = B2BAuthenticateResponseWithMFA<TProjectConfiguration>;

export interface IHeadlessB2BDiscoveryClient<TProjectConfiguration extends StytchProjectConfigurationInput> {
  organizations: {
    /**
     * Wraps Stytch's {@link https://stytch.com/docs/b2b/api/list-discovered-organizations list discovered Organizations} endpoint.
     * If there is a current Member Session, the SDK will call the endpoint with the session token.
     * Otherwise, the SDK will use the intermediate session token.
     * If neither a Member Session nor an intermediate session token is present, this method will fail.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/discovery#list-discovered-organizations Stytch Docs} for a complete reference.
     *
     * @example
     * stytch.discovery.organizations.list();
     *
     * @returns A {@link B2BDiscoveryOrganizationsResponse} containing the email address associated with the session
     * factor passed in, and a list of discovered organizations associated with the email.
     *
     * @throws A `StytchAPIError` when the Stytch API returns an error.
     * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
     */
    list(): Promise<B2BDiscoveryOrganizationsResponse>;

    /**
     * Wraps Stytch's {@link https://stytch.com/docs/b2b/api/create-organization-via-discovery create Organization via discovery} endpoint.
     * This method will fail if there is no intermediate session token present.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/discovery#create-organization-via-discovery Stytch Docs} for a complete reference.
     *
     * @example
     * stytch.discovery.organizations.create({
     *   organization_name: 'my-great-organization',
     *   organization_slug: 'my-great-organization',
     *   sso_jit_provisioning: 'ALL_ALLOWED',
     *   session_duration_minutes: 60,
     * });
     *
     * @param data - {@link B2BDiscoveryOrganizationsCreateOptions}
     *
     * @returns A {@link B2BDiscoveryOrganizationsCreateResponse} indicating that the intermediate session token
     * has been authenticated, a new Organization has been created, and the Member has been created and is logged in
     * to the new Organization
     *
     * @throws A `StytchAPIError` when the Stytch API returns an error.
     * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
     */
    create(
      data: B2BDiscoveryOrganizationsCreateOptions,
    ): Promise<B2BDiscoveryOrganizationsCreateResponse<TProjectConfiguration>>;
  };

  intermediateSessions: {
    /**
     * Wraps Stytch's {@link https://stytch.com/docs/b2b/api/exchange-intermediate-session exchange intermediate session} endpoint.
     * This method will fail if there is no intermediate session token present.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/discovery#exchange-intermediate-session Stytch Docs} for a complete reference.
     *
     * @example
     * stytch.discovery.intermediateSessions.exchange({
     *   organization_id: 'organization-test-123',
     *   session_duration_minutes: 60,
     * });
     *
     * @param data - {@link B2BDiscoveryIntermediateSessionsExchangeOptions}
     *
     * @returns A {@link B2BDiscoveryIntermediateSessionsExchangeResponse} indicating that the intermediate session token
     * has been authenticated and the member is now logged in.
     *
     * @throws A `StytchAPIError` when the Stytch API returns an error.
     * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
     */
    exchange(
      data: B2BDiscoveryIntermediateSessionsExchangeOptions,
    ): Promise<B2BDiscoveryIntermediateSessionsExchangeResponse<TProjectConfiguration>>;
  };
}

export type B2BDiscoveryAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = ResponseCommon & {
  /**
   * The intermediate session token. This token does not belong to a specific instance of a member,
   * but may be exchanged for a member session or used to create a new organization.
   * If the project is configured to use HttpOnly cookies, this field will always be empty.
   */
  intermediate_session_token: IfOpaqueTokens<ExtractOpaqueTokens<TProjectConfiguration>, RedactedToken, string>;

  /**
   * The email of the end user who is logging in
   */
  email_address: string;

  discovered_organizations: DiscoveredOrganization[];
};
