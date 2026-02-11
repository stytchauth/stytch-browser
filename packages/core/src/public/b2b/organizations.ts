import { Cacheable } from '../../utils';
import { locale, MemberEmailUpdateDeliveryMethod, ResponseCommon, UnsubscribeFunction } from '../common';
import { B2BAllowedAuthMethods, B2BAllowedMFAMethods, Member, MemberResponseCommon, Organization } from './common';

export type B2BOrganizationsUpdateOptions = {
  /**
   * The name of the organization
   */
  organization_name?: string;
  /**
   * The unique URL slug of the Organization. A minimum of two characters is required.
   * The slug only accepts alphanumeric characters and the following reserved characters: - . _ ~.
   */
  organization_slug?: string;
  /**
   * The image URL of the Organization logo.
   */
  organization_logo_url?: string;
  /**
   * The default connection used for SSO when there are multiple active connections.
   */
  sso_default_connection_id?: string;
  /**
   * The authentication setting that controls the JIT provisioning of Members when authenticating via SSO.
   * The accepted values are:
   *   ALL_ALLOWED – new Members will be automatically provisioned upon successful authentication via any of the Organization's sso_active_connections.
   *   RESTRICTED – only new Members with SSO logins that comply with sso_jit_provisioning_allowed_connections can be provisioned upon authentication.
   *   NOT_ALLOWED – disable JIT provisioning via SSO.
   */
  sso_jit_provisioning?: string;
  /**
   * An array of connection_ids that reference SAML Connection objects.
   * Only these connections will be allowed to JIT provision Members via SSO when sso_jit_provisioning is set to RESTRICTED.
   */
  sso_jit_provisioning_allowed_connections?: string[];
  /**
   * An array of email domains that allow invites or JIT provisioning for new Members.
   * This list is enforced when either email_invites or email_jit_provisioning is set to RESTRICTED.
   * Common domains such as gmail.com are not allowed.
   */
  email_allowed_domains?: string[];
  /**
   * The authentication setting that controls how a new Member can be provisioned by authenticating via Email Magic Link.
   * The accepted values are:
   *   ALL_ALLOWED - any new Member can be provisioned via Email Magic Link.
   *   RESTRICTED – only new Members with verified emails that comply with email_allowed_domains can be provisioned upon authentication via Email Magic Link.
   *   NOT_ALLOWED – disable JIT provisioning via Email Magic Link.
   */
  email_jit_provisioning?: 'ALL_ALLOWED' | 'RESTRICTED' | 'NOT_ALLOWED';
  /**
   * The authentication setting that controls how a new Member can be invited to an organization by email.
   * The accepted values are:
   *   ALL_ALLOWED – any new Member can be invited to join via email.
   *   RESTRICTED – only new Members with verified emails that comply with email_allowed_domains can be invited via email.
   *   NOT_ALLOWED – disable email invites.
   */
  email_invites?: 'ALL_ALLOWED' | 'RESTRICTED' | 'NOT_ALLOWED';
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
   * The setting that controls which authentication methods can be used by Members of an Organization.
   * The accepted values are:
   *   ALL_ALLOWED – the default setting which allows all authentication methods to be used.
   *   RESTRICTED – only methods that comply with allowed_auth_methods can be used for authentication. This setting does not apply to Members with is_breakglass set to true.
   */
  auth_methods?: string;
  /**
   * An array of allowed authentication methods.
   * This list is enforced when auth_methods is set to RESTRICTED.
   * The list's accepted values are: sso, magic_link, password, google_oauth, microsoft_oauth, hubspot_oauth, and slack_oauth.
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
  mfa_policy?: string;
  /**
   * An array of implicit role assignments granted to members in this organization whose emails match the domain.
   * See our {@link https://stytch.com/docs/b2b/guides/rbac/role-assignment RBAC guide} for more information about
   * role assignment.
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
};

export type B2BOrganizationsUpdateResponse = ResponseCommon & {
  /**
   * The Organization object.
   * See {@link Organization} for details.
   */
  organization: Organization;
};

export type B2BOrganizationsDeleteResponse = ResponseCommon & {
  /**
   * Globally unique UUID that identifies a specific Organization.
   */
  organization_id: string;
};

export type B2BOrganizationsGetBySlugOptions = {
  /**
   * The URL slug of the Organization to get.
   */
  organization_slug: string;
};

export type OrganizationBySlugMatch = Pick<
  Organization,
  | 'organization_id'
  | 'sso_active_connections'
  | 'organization_name'
  | 'organization_logo_url'
  | 'sso_default_connection_id'
  | 'email_jit_provisioning'
  | 'email_allowed_domains'
  | 'oauth_tenant_jit_provisioning'
  | 'allowed_oauth_tenants'
  | 'auth_methods'
  | 'allowed_auth_methods'
  | 'mfa_policy'
  | 'organization_slug'
>;

export type B2BOrganizationsGetBySlugResponse = ResponseCommon & {
  /**
   * The matching organization, or null if no matching organization was found.
   */
  organization: OrganizationBySlugMatch | null;
};

export type B2BOrganizationsGetConnectedAppsResponse = ResponseCommon & {
  connected_apps: {
    connected_app_id: string;
    name: string;
    description: string;
    client_type: string;
    logo_url?: string;
  }[];
};

export type B2BOrganizationsGetConnectedAppOptions = {
  connected_app_id: string;
};

export type B2BOrganizationsGetConnectedAppResponse = ResponseCommon & {
  connected_app_id: string;
  name: string;
  description: string;
  client_type: string;
  logo_url?: string;
  active_members: {
    member_id: string;
    granted_scopes: string[];
  }[];
};

export type B2BOrganizationsMembersCreateOptions = {
  /**
   * The email address of the Member.
   */
  email_address: string;
  /**
   * The name of the Member.
   */
  name?: string;
  /**
   * An arbitrary JSON object of application-specific data.
   * These fields can be edited directly by the frontend SDK, and should not be used to store critical information.
   */
  untrusted_metadata?: Record<string, unknown>;
  /**
   * Flag for whether or not to save a Member as pending or active in Stytch. It defaults to false.
   * If true, new Members will be created with status pending in Stytch's backend.
   * Their status will remain pending and they will continue to receive signup email templates for every Email Magic Link until that Member authenticates and becomes active.
   * If false, new Members will be created with status active.
   */
  create_member_as_pending?: boolean;
  /**
   * Identifies the Member as a break glass user - someone who has permissions to authenticate into an Organization by bypassing the Organization's settings.
   * A break glass account is typically used for emergency purposes to gain access outside of normal authentication procedures.
   */
  is_breakglass?: boolean;
  /**
   * The Member's phone number. A Member may only have one phone number.
   */
  mfa_phone_number?: string;
  /**
   * Sets whether the Member is enrolled in MFA.
   * If true, the Member must complete an MFA step whenever they wish to log in to their Organization.
   * If false, the Member only needs to complete an MFA step if the Organization's MFA policy is set to REQUIRED_FOR_ALL.
   */
  mfa_enrolled?: boolean;
  /**
   * Roles to explicitly assign to this Member.
   * See our {@link https://stytch.com/docs/b2b/guides/rbac/role-assignment RBAC guide} for more information about
   * role assignment.
   */
  roles?: string[];
};

export type B2BOrganizationsMembersCreateResponse = MemberResponseCommon;

export type B2BOrganizationsMembersUpdateOptions = {
  /**
   * Globally unique UUID that identifies a specific Member.
   */
  member_id: string;
  /**
   * The name of the Member.
   */
  name?: string;
  /**
   * An arbitrary JSON object of application-specific data.
   * These fields can be edited directly by the frontend SDK, and should not be used to store critical information.
   */
  untrusted_metadata?: Record<string, unknown>;
  /**
   * Identifies the Member as a break glass user - someone who has permissions to authenticate into an Organization by bypassing the Organization's settings.
   * A break glass account is typically used for emergency purposes to gain access outside of normal authentication procedures.
   */
  is_breakglass?: boolean;
  /**
   * The Member's phone number. A Member may only have one phone number.
   */
  mfa_phone_number?: string;
  /**
   * Sets whether the Member is enrolled in MFA.
   * If true, the Member must complete an MFA step whenever they wish to log in to their Organization.
   * If false, the Member only needs to complete an MFA step if the Organization's MFA policy is set to REQUIRED_FOR_ALL.
   */
  mfa_enrolled?: boolean;
  /**
   * Roles to explicitly assign to this Member. Will completely replace any existing explicitly assigned roles.
   * If a Role is removed from a Member, and the Member is also implicitly assigned this Role from an SSO connection
   * or an SSO group, we will by default revoke any existing sessions for the Member that contain any SSO authentication
   * factors with the affected connection ID. You can preserve these sessions by passing in the
   * preserve_existing_sessions parameter with a value of true.
   * See our {@link https://stytch.com/docs/b2b/guides/rbac/role-assignment RBAC guide} for more information about
   * role assignment.
   */
  roles?: string[];
  /**
   * Whether to preserve existing sessions when explicit Roles that are revoked are also implicitly assigned by SSO
   * connection or SSO group. Defaults to false - that is, existing Member Sessions that contain SSO authentication
   * factors with the affected SSO connection IDs will be revoked.
   */
  preserve_existing_sessions?: boolean;
  /**
   * Sets the Member's default MFA method. Valid values are 'sms_otp' and 'totp'.
   * This value will determine
   * 1. Which MFA method the Member is prompted to use when logging in
   * 2. Whether An SMS will be sent automatically after completing the first leg of authentication
   */
  default_mfa_method?: 'sms_otp' | 'totp';
  /**
   * Updates the Member's `email_address`, if provided.
   */
  email_address?: string;
  /**
   * If set to `true`, and an `email_address` is provided, this will unlink the Member's previous email, marking it as
   * deleted instead of retired at the conclusion of a successful update. Defaults to false.
   * See our {@link https://stytch.com/docs/b2b/api/unlink-retired-member-email Unlink Retired Email API reference} for more
   * information about email unlinking.
   */
  unlink_email?: boolean;
};

export type B2BOrganizationsMembersUpdateResponse = MemberResponseCommon;

export type SearchQueryOperand =
  | {
      filter_name: 'member_ids';
      filter_value: string[];
    }
  | {
      filter_name: 'member_emails';
      filter_value: string[];
    }
  | {
      filter_name: 'member_email_fuzzy';
      filter_value: string;
    }
  | {
      filter_name: 'member_is_breakglass';
      filter_value: boolean;
    }
  | {
      filter_name: 'statuses';
      filter_value: string[];
    }
  | {
      filter_name: 'member_mfa_phone_numbers';
      filter_value: string[];
    }
  | {
      filter_name: 'member_mfa_phone_number_fuzzy';
      filter_value: string;
    }
  | {
      filter_name: 'member_password_exists';
      filter_value: boolean;
    }
  | {
      filter_name: 'member_roles';
      filter_value: string[];
    }
  | {
      filter_name: string;
      [key: string]: unknown;
    };

export type B2BOrganizationsMembersSearchOptions = {
  /**
   * The cursor field allows you to paginate through your results.
   * Each result array is limited to 1000 results.
   * If your query returns more than 1000 results, you will need to paginate the responses using the cursor.
   * If you receive a response that includes a non-null next_cursor in the results_metadata object, repeat the search call with the next_cursor value set to the cursor field to retrieve the next page of results.
   * Continue to make search calls until the next_cursor in the response is null.
   */
  cursor?: string;
  /**
   * The number of search results to return per page.
   * The default limit is 100. A maximum of 1000 results can be returned by a single search request.
   * If the total size of your result set is greater than one page size, you must paginate the response.
   * See the cursor field.
   */
  limit?: number;
  /**
   * The optional query object contains the operator, i.e. AND or OR, and the operands that will filter your results.
   * Only an operator is required. If you include no operands, no filtering will be applied.
   * If you include no query object, it will return all Members with no filtering applied.
   */
  query?: {
    /**
     * The action to perform on the operands. The accepted value are:
     *
     *   `AND` – all the operand values provided must match.
     *
     *   `OR` – the operator will return any matches to at least one of the operand values you supply.
     */
    operator: 'OR' | 'AND' | string;
    /**
     * An array of operand objects that contains all of the filters and values to apply to your search query.
     */
    operands: SearchQueryOperand[];
  };
};

export type B2BOrganizationsMembersSearchResponse = ResponseCommon & {
  members: Member[];
  /**
   * The search `results_metadata` object contains metadata relevant to your specific query like `total` and
   * `next_cursor`.
   */
  results_metadata: {
    total: number;
    /**
     * The `next_cursor` string is returned when your search result contains more than one page of results.
     * This value is passed into your next search call in the `cursor` field.
     */
    next_cursor?: string;
  };
  /**
   * A map from `organization_id` to
   * [Organization object](https://stytch.com/docs/b2b/api/organization-object). The map only contains the
   * Organizations that the Members belongs to.
   */
  organizations: Record<string, Organization>;
};

export type B2BOrganizationsMembersDeleteResponse = ResponseCommon & {
  /**
   * Globally unique UUID that identifies a specific Member.
   */
  member_id: string;
};

export type B2BOrganizationsMembersReactivateResponse = MemberResponseCommon;

export type B2BOrganizationsMemberDeletePasswordResponse = MemberResponseCommon;

export type B2BOrganizationsMemberDeleteMFAPhoneNumberResponse = MemberResponseCommon;

export type B2BOrganizationsMemberDeleteMFATOTPResponse = MemberResponseCommon;

export type B2BOrganizationsMemberUnlinkRetiredEmailOptions = {
  /**
   * Globally unique UUID that identifies a specific Member.
   */
  member_id: string;

  /**
   * Unique identifier for the retired email to be deleted.
   * Either the email_id, or the email_address, or both must be provided.
   * If both are provided they must reference the same retired email.
   */
  email_id?: string;

  /**
   * The retired email address to be deleted
   * Either the email_id, or the email_address, or both must be provided.
   * If both are provided they must reference the same retired email.
   */
  email_address?: string;
};

export type B2BOrganizationsMemberUnlinkRetiredEmailResponse = MemberResponseCommon;

export type B2BOrganizationsMemberStartEmailUpdateOptions = {
  /**
   * Globally unique UUID that identifies a specific Member.
   */
  member_id: string;

  /**
   * The new email address to be set (after verification) for the Member.
   */
  email_address: string;

  /**
   * The url the user is redirected to after clicking the login email magic link.
   * This should be a url that your app receives and parses and subsequently send an API request to authenticate the magic link and log in the member.
   * If this value is not passed, the default login redirect URL that you set in your Dashboard is used.
   * If you have not set a default login redirect URL, an error is returned.
   */
  login_redirect_url?: string;

  /**
   * The email template ID to use for magic linkemails.
   * If not provided, your default email template will be sent. If providing a template ID, it must be either a template using Stytch's customizations,
   * or a Magic link Login custom HTML template.
   */
  login_template_id?: string;

  /**
   * The locale is used to determine which language to use in the email. Parameter is a {@link https://www.w3.org/International/articles/language-tags/ IETF BCP 47 language tag}, e.g. "en".
   * Currently supported languages are English ("en"), Spanish ("es"), and Brazilian Portuguese ("pt-br"); if no value is provided, the copy defaults to English.
   */
  locale?: locale;

  /**
   * The delivery method to use when sending the email, either EMAIL_MAGIC_LINK or EMAIL_OTP. By default, EMAIL_MAGIC_LINK is used.
   */
  delivery_method?: MemberEmailUpdateDeliveryMethod;
};

export type B2BOrganizationsMemberStartEmailUpdateResponse = MemberResponseCommon;

export type B2BOrganizationsMemberGetConnectedAppsOptions = {
  member_id: string;
};

export type B2BOrganizationsMemberGetConnectedAppsResponse = ResponseCommon & {
  connected_apps: {
    connected_app_id: string;
    name: string;
    description: string;
    client_type: string;
    logo_url?: string;
    scopes_granted: string;
  }[];
};

export type B2BOrganizationsMemberRevokeConnectedAppOptions = {
  member_id: string;
  connected_app_id: string;
};

export type B2BOrganizationsMemberRevokeConnectedAppResponse = ResponseCommon;

export type OrganizationInfo = Cacheable<{
  /**
   * The organization object, or null if no organization exists.
   */
  organization: Organization | null;
}>;

export interface IHeadlessB2BOrganizationClient {
  /**
   * The asynchronous method, `organization.get`, wraps the {@link https://stytch.com/docs/b2b/api/get-organization get organization} endpoint.
   * It fetches the Organization's data and refreshes the cached object if changes are detected.
   * The Stytch SDK will invoke this method automatically in the background, so you probably won't need to call this method directly.
   *
   * @returns An {@link Organization} object.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   */
  get(): Promise<Organization | null>;

  /**
   * If logged in, the `organization.getSync` method returns the cached Organization object.
   * Otherwise, it returns `null`.
   * This method does not refresh the Organization's data.
   *
   * @returns An {@link Organization} object, or null if no organization exists.
   *
   * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
   * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
   */
  getSync(): Organization | null;

  /**
   * The `organization.getInfo` method is similar to `organization.getSync`, but it returns an object containing the `organization` object and a `fromCache` boolean.
   * If `fromCache` is true, the Organization object is from the cache and a state refresh is in progress.
   */
  getInfo(): OrganizationInfo;

  /**
   * The `organization.onChange` method takes in a callback that gets called whenever the Organization object changes. It returns an unsubscribe method for you to call when you no longer want to listen for such changes.
   *
   * @param callback - Gets called whenever the organization object changes. See {@link B2BOrganizationOnChangeCallback}.
   *
   * @returns An {@link UnsubscribeFunction} for you to call when you no longer want to listen for changes in the organization object.
   *
   * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
   * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  onChange: (callback: (organization: Organization | null) => void) => UnsubscribeFunction;

  /**
   * The update organization method wraps the {@link https://stytch.com/docs/b2b/api/update-organization update organization} API endpoint.
   * This will update the logged-in Member's Organization.
   *
   * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/organizations#update-organization Stytch Docs} for a complete reference.
   *
   * @rbac action="requested", resource="stytch.organization"
   *
   * @param data - {@link B2BOrganizationsUpdateOptions}
   *
   * @returns A {@link B2BOrganizationsUpdateResponse} response.
   *
   * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
   * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
   */
  update(data: B2BOrganizationsUpdateOptions): Promise<B2BOrganizationsUpdateResponse>;

  /**
   * The Delete Organization method wraps the {@link https://stytch.com/docs/b2b/api/delete-organization delete organization} API endpoint.
   * This will delete the logged-in Member's Organization.
   * As a consequence, their Member object will also be deleted, and their session will be revoked.
   *
   * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/organizations#delete-organization Stytch Docs} for a complete reference.
   *
   * @rbac action="delete", resource="stytch.organization"
   *
   * @returns A {@link B2BOrganizationsDeleteResponse} response.
   *
   * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
   * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
   */
  delete(): Promise<B2BOrganizationsDeleteResponse>;

  /**
   * The `organization.getBySlug` method can be used to retrieve details about an organization from its slug.
   * This method may be called even if the Member is not logged in.
   *
   * @param data - {@link B2BOrganizationsGetBySlugOptions}
   *
   * @returns A {@link B2BOrganizationsGetBySlugResponse} response.
   *
   * @throws A `StytchSDKAPIError` when the Stytch API returns an¿ error.
   * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  getBySlug(data: B2BOrganizationsGetBySlugOptions): Promise<B2BOrganizationsGetBySlugResponse>;

  /**
   * The Get Connected Apps method wraps the {@link https://stytch.com/docs/b2b/api/connected-app-org-get-all Get Connected Apps} API endpoint.
   * The `organization_id` will be automatically inferred from the logged-in Member's session.
   * This method retrieves a list of Connected Apps that have been installed by the Organization's Members. A Connected App
   * can be considered to be installed if at least one of the Organization's Members has successfully completed an
   * authorization flow with the Connected App and no revocation has occurred since that completion. A Connected App may
   * be uninstalled if the Organization changes its `first_party_connected_apps_allowed_type`or `third_party_connected_apps_allowed_type`
   * policies.
   *
   * See the {@link https://stytch.com/docs/b2b/sdks/organizations/connected-apps-get-all Stytch Docs} for a complete reference.
   *
   * @returns A {@link B2BOrganizationsGetConnectedAppsResponse} list of allowed Connected Apps.
   *
   * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
   * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  getConnectedApps(): Promise<B2BOrganizationsGetConnectedAppsResponse>;

  /**
   * The Get Connected App method wraps the {@link https://stytch.com/docs/b2b/api/connected-app-org-get Get Connected App} API endpoint.
   * The `organization_id` will be automatically inferred from the logged-in Member's session.
   *
   * This method retrieves information about the specified Connected App as well as a list of Members in
   * the Organization who have completed an authorization flow with the Connected App.
   *
   * See the {@link https://stytch.com/docs/b2b/sdks/organizations/connected-app-get Stytch Docs} for a complete reference.
   *
   * @param data - {@link B2BOrganizationsGetConnectedAppOptions}
   * @returns A {@link B2BOrganizationsGetConnectedAppResponse} list of allowed Connected Apps.
   *
   * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
   * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  getConnectedApp(data: B2BOrganizationsGetConnectedAppOptions): Promise<B2BOrganizationsGetConnectedAppResponse>;

  members: {
    /**
     * The Create Member method wraps the {@link https://stytch.com/docs/b2b/api/create-member Create Member} API endpoint.
     * The `organization_id` will be automatically inferred from the logged-in Member's session.
     * This method cannot be used to create Members in other Organizations.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/members#create-member Stytch Docs} for a complete reference.
     *
     * @param data - {@link B2BOrganizationsMembersCreateOptions}
     *
     * @rbac action="create", resource="stytch.member"
     *
     * @returns A {@link B2BOrganizationsMembersCreateResponse} response.
     *
     * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
     * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
     */
    create(data: B2BOrganizationsMembersCreateOptions): Promise<B2BOrganizationsMembersCreateResponse>;

    /**
     * The Search Members method wraps the {@link https://stytch.com/docs/b2b/api/search-members Search Members} API endpoint. It can be used to search for Members within the logged-in Member's Organization.
     *
     * Submitting an empty `query` returns all non-deleted Members within the logged-in Member's Organization.
     *
     * *All fuzzy search filters require a minimum of three characters.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/members#search-members Stytch Docs} for a complete reference.
     *
     * @rbac action="search", resource="stytch.member"
     *
     * @param data - {@link B2BOrganizationsMembersSearchOptions}
     *
     * @returns A {@link B2BOrganizationsMembersSearchResponse} response.
     *
     * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
     * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
     */
    search(data: B2BOrganizationsMembersSearchOptions): Promise<B2BOrganizationsMembersSearchResponse>;

    /**
     * The Update Member method wraps the {@link https://stytch.com/docs/b2b/api/update-member Update Member} API endpoint.
     * The `organization_id` will be automatically inferred from the logged-in Member's session.
     * This method can be used to update any Member in the logged-in Member's Organization.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/members#update-member Stytch Docs} for a complete reference.
     *
     * @param data - {@link B2BOrganizationsMembersUpdateOptions}
     *
     * @returns A {@link B2BOrganizationsMembersUpdateResponse} response.
     *
     * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
     * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
     */
    update(data: B2BOrganizationsMembersUpdateOptions): Promise<B2BOrganizationsMembersUpdateResponse>;

    /**
     * The Delete Member password method wraps the {@link https://stytch.com/docs/b2b/api/delete-member-password Delete Member password} API endpoint.
     * The `organization_id` will be automatically inferred from the logged-in Member's session.
     * This method cannot be used to delete the passwords of Members in other Organizations.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/members#delete-member-password Stytch Docs} for a complete reference.
     *
     * @rbac action="update.info.delete.password", resource="stytch.member"
     *
     * @param passwordId - The ID of the password to be deleted
     *
     * @returns A {@link B2BOrganizationsMemberDeletePasswordResponse} response.
     *
     * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
     * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
     */
    deletePassword(passwordId: string): Promise<B2BOrganizationsMemberDeletePasswordResponse>;

    /**
     * The Delete Member MFA phone number method wraps the {@link https://stytch.com/docs/b2b/api/delete-member-mfa-phone-number Delete Member MFA phone number} API endpoint.
     * The `organization_id` will be automatically inferred from the logged-in Members's session.
     * This method cannot be used to delete the phone numbers of Members in other Organizations.
     *
     * To change a Member's phone number, you must first call this endpoint to delete the existing phone number.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/members#delete-member-mfa-phone-number Stytch Docs} for a complete reference.
     *
     * @rbac action="update.info.delete.mfa-phone", resource="stytch.member"
     *
     * @param memberId - The ID of the member
     *
     * @returns A {@link B2BOrganizationsMemberDeleteMFAPhoneNumberResponse} response.
     *
     * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
     * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
     */
    deleteMFAPhoneNumber(memberId: string): Promise<B2BOrganizationsMemberDeleteMFAPhoneNumberResponse>;

    /**
     * The Delete Member method wraps the {@link https://stytch.com/docs/b2b/api/delete-member delete member} API endpoint.
     * The `organization_id` will be automatically inferred from the logged-in Member's session.
     * This method cannot be used to delete Members in other Organizations.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/members#delete-member Stytch Docs} for a complete reference.
     *
     * @rbac action="delete", resource="stytch.member or stytch.self (depending on target MemberID)"
     *
     * @param memberId - The ID of the member to be deleted
     *
     * @returns A {@link B2BOrganizationsMembersDeleteResponse} response.
     *
     * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
     * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
     */
    delete(memberId: string): Promise<B2BOrganizationsMembersDeleteResponse>;

    /**
     * The Reactivate Member method wraps the {@link https://stytch.com/docs/b2b/api/reactivate-member Reactivate Member} API endpoint.
     * The `organization_id` will be automatically inferred from the logged-in Member's session.
     * This method cannot be used to reactivate Members in other Organizations.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/members#reactivate-member Stytch Docs} for a complete reference.
     *
     * @rbac action="create", resource="stytch.member"
     *
     * @param memberId - The ID of the member to be reactivated
     *
     * @returns A {@link B2BOrganizationsMembersReactivateResponse} response.
     *
     * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
     * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
     */
    reactivate(memberId: string): Promise<B2BOrganizationsMembersReactivateResponse>;

    /**
     * The Delete Member TOTP method wraps the {@link https://stytch.com/docs/b2b/api/delete-member-mfa-totp Delete Member TOTP} API endpoint.
     * The `organization_id` will be automatically inferred from the logged-in Member's session.
     * This method cannot be used to delete totps of Members in other Organizations.
     *
     * To change a Member's TOTP, you must first call this endpoint to delete the existing TOTP.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/members#delete-member-mfa-totp Stytch Docs} for a complete reference.
     *
     * @rbac action="update.info.delete.mfa-totp", resource="stytch.member"
     *
     * @param memberId - The ID of the member
     *
     * @returns A {@link B2BOrganizationsMemberDeleteMFATOTPResponse} response.
     *
     * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
     * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
     */
    deleteMFATOTP(memberId: string): Promise<B2BOrganizationsMemberDeleteMFATOTPResponse>;

    /**
     * The Unlink Member Retired Email Address method wraps the {@link https://stytch.com/docs/b2b/api/unlink-retired-member-email Unlink Retired Email} API endpoint.
     * The `organization_id` will be automatically inferred from the logged-in Member's session.
     * This method cannot be used to unlink emails of Members in other Organizations.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/members#unlink-retired-member-email Stytch Docs} for a complete reference.
     *
     * @rbac action="update.info.unlink.retired-email", resource="stytch.member"
     *
     * @param data - {@link B2BOrganizationsMemberUnlinkRetiredEmailOptions}.
     *
     * @returns A {@link B2BOrganizationsMemberUnlinkRetiredEmailResponse} response.
     *
     * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
     * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
     */
    unlinkRetiredEmail(
      data: B2BOrganizationsMemberUnlinkRetiredEmailOptions,
    ): Promise<B2BOrganizationsMemberUnlinkRetiredEmailResponse>;

    /**
     * The Start Email Update method wraps the {@link https://stytch.com/docs/b2b/api/start-member-email-update Start Member Email Update} API endpoint.
     * The `organization_id` will be automatically inferred from the logged-in Member's session.
     * This method cannot be used to start the self-serve email update process for Members in other Organizations.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/members/start-member-email-update Stytch Docs} for a complete reference.
     *
     * @rbac action="update.info.email", resource="stytch.member"
     *
     * @param data - {@link B2BOrganizationsMemberStartEmailUpdateOptions}
     * @returns A {@link B2BOrganizationsMemberStartEmailUpdateResponse} indicating that an email update has been started.
     *
     * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
     * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input.
     */
    startEmailUpdate(
      data: B2BOrganizationsMemberStartEmailUpdateOptions,
    ): Promise<B2BOrganizationsMemberStartEmailUpdateResponse>;

    /**
     * The Member Get Connected Apps method wraps the {@link https://stytch.com/docs/b2b/api/connected-app-member-get-all Member Get Connected Apps} API endpoint.
     * The `organization_id` will be automatically inferred from the logged-in Member's session.
     *
     * This method retrieves a list of Connected Apps that the Member has completed an authorization flow with successfully.
     * If the Member revokes a Connected App's access (e.g. via the `revokeConnectedApp` method) then the Connected App will
     * no longer be returned in this endpoint's response. A Connected App's access may be revoked if the Organization's
     * allowed Connected App policy changes.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/members/get-member-connected-apps Stytch Docs} for a complete reference.
     *
     * @rbac action="get.connected-apps", resource="stytch.member"
     *
     * @returns A {@link B2BMemberGetConnectedAppsResponse} containing a list of the member's connected apps.
     *
     * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
     * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input.
     */
    getConnectedApps(
      data: B2BOrganizationsMemberGetConnectedAppsOptions,
    ): Promise<B2BOrganizationsMemberGetConnectedAppsResponse>;

    /**
     * The Member Revoke Connected App method wraps the {@link https://stytch.com/docs/b2b/api/connected-app-member-revoke Member Revoke Connected App} API endpoint.
     * The `organization_id` will be automatically inferred from the logged-in Member's session.
     *
     * This method revokes a Connected App's access to the Member and revokes all active tokens that have been
     * created on the Member's behalf. New tokens cannot be created until the Member completes a new authorization
     * flow with the Connected App.
     *
     * Note that after calling this method, the Member will be forced to grant consent in subsequent authorization
     * flows with the Connected App.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/members/revoke-member-connected-app Stytch Docs} for a complete reference.
     *
     * @rbac action="revoke.connected-app", resource="stytch.member"
     *
     * @param data - {@link B2BMemberRevokeConnectedAppOptions}
     * @returns A {@link B2BMemberRevokeConnectedAppResponse} indicating that the Connected App's access has been revoked.
     *
     * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
     * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input.
     */
    revokeConnectedApp(
      data: B2BOrganizationsMemberRevokeConnectedAppOptions,
    ): Promise<B2BOrganizationsMemberRevokeConnectedAppResponse>;
  };
}
