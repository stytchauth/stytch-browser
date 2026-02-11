import { ResponseCommon, SDKDeviceHistory, SessionDurationOptions, locale } from '../common';
import { StytchProjectConfigurationInput } from '../typeConfig';
import { B2BAuthenticateResponseWithMFA, MemberResponseCommon } from './common';
import { B2BDiscoveryAuthenticateResponse } from './discovery';

export type B2BMagicLinksInviteOptions = {
  /**
   * The email address of the end user to whom the invite will be sent.
   */
  email_address: string;

  /**
   * The URL that the Member clicks from the invite Email Magic Link.
   * This URL should be an endpoint in the backend server that verifies the request by querying
   * Stytch's authenticate endpoint and finishes the invite flow.
   * If this value is not passed, the default `invite_redirect_url` that you set in your Dashboard is used.
   * If you have not set a default `invite_redirect_url`, an error is returned.
   */
  invite_redirect_url?: string;

  /**
   * Use a custom template for invite emails.
   * By default, it will use your default email template.
   * The template must be a template using our built-in customizations or a custom HTML email for Magic Links - Invite.
   */
  invite_template_id?: string;

  /**
   * The name of the Member.
   */
  name?: string;

  /**
   * A JSON object containing application-specific metadata.
   * Use it to store fields that a member can be allowed to edit directly without backend validation - such as `display_theme` or `preferred_locale`.
   * See our {@link https://stytch.com/docs/api/metadata metadata reference} for complete details.
   */
  untrusted_metadata?: Record<string, unknown>;

  /**
   * The locale is used to determine which language to use in the email. Parameter is a {@link https://www.w3.org/International/articles/language-tags/ IETF BCP 47 language tag}, e.g. "en".
   * Currently supported languages are English ("en"), Spanish ("es"), and Brazilian Portuguese ("pt-br"); if no value is provided, the copy defaults to English.
   */
  locale?: locale;
  /**
   * Roles to explicitly assign to this Member.
   * See our {@link https://stytch.com/docs/b2b/guides/rbac/role-assignment RBAC guide} for more information about
   * role assignment.
   */
  roles?: string[];

  /**
   * The expiration time, in minutes. If not accepted within this time frame, the invite will need to be resent.
   * Defaults to 10080 (1 week) with a minimum of 5 and a maximum of 10080.
   */
  invite_expiration_minutes?: number;
};

export type B2BMagicLinksInviteResponse = MemberResponseCommon;

export type B2BMagicLinkLoginOrSignupOptions = {
  /**
   * The email of the member logging in or signing up
   */
  email_address: string;

  /**
   * The id of the organization the member belongs to
   */
  organization_id: string;

  /**
   * The url the user clicks from the login email magic link.
   * This should be a url that your app receives and parses and subsequently send an API request to authenticate the magic link and log in the member.
   * If this value is not passed, the default login redirect URL that you set in your Dashboard is used.
   * If you have not set a default login redirect URL, an error is returned.
   */
  login_redirect_url?: string;

  /**
   * The url the user clicks from the sign-up email magic link.
   * This should be a url that your app receives and parses and subsequently send an api request to authenticate the magic link and sign-up the user.
   * If this value is not passed, the default sign-up redirect URL that you set in your Dashboard is used.
   * If you have not set a default sign-up redirect URL, an error is returned.
   */
  signup_redirect_url?: string;

  /**
   * The email template ID to use for login emails.
   * If not provided, your default email template will be sent. If providing a template ID, it must be either a template using Stytch's customizations,
   * or a Magic link Login custom HTML template.
   */
  login_template_id?: string;

  /**
   * The email template ID to use for sign-up emails.
   * If not provided, your default email template will be sent. If providing a template ID, it must be either a template using Stytch's customizations,
   * or a Magic link Sign-up custom HTML template.
   */
  signup_template_id?: string;

  /**
   * The locale is used to determine which language to use in the email. Parameter is a {@link https://www.w3.org/International/articles/language-tags/ IETF BCP 47 language tag}, e.g. "en".
   * Currently supported languages are English ("en"), Spanish ("es"), and Brazilian Portuguese ("pt-br"); if no value is provided, the copy defaults to English.
   */
  locale?: locale;

  /**
   * The expiration time, in minutes, for a login Email Magic Link. If not authenticated within this time frame, the email will need to be resent.
   * Defaults to 60 (1 hour) with a minimum of 5 and a maximum of 10080 (1 week).
   */
  login_expiration_minutes?: number;

  /**
   * The expiration time, in minutes, for a signup Email Magic Link. If not authenticated within this time frame, the email will need to be resent.
   * Defaults to 60 (1 hour) with a minimum of 5 and a maximum of 10080 (1 week).
   */
  signup_expiration_minutes?: number;
};

export type B2BMagicLinkLoginOrSignupResponse = ResponseCommon;

export type B2BMagicLinksAuthenticateOptions = SessionDurationOptions & {
  /**
   *  The magic link token used to authenticate a member
   */
  magic_links_token: string;

  /**
   * The locale will be used if an OTP code is sent to the member's phone number as part of a
   * secondary authentication requirement.
   */
  locale?: locale;
};

export type B2BMagicLinksAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = B2BAuthenticateResponseWithMFA<TProjectConfiguration> & {
  /**
   * The ID of the method used to send a magic link.
   */
  method_id: string;
  /**
   * The device history of the member.
   */
  member_device?: SDKDeviceHistory;
};

export type B2BMagicLinksEmailDiscoverySendOptions = {
  /**
   * The email of the member logging in
   */
  email_address: string;

  /**
   * The url the user clicks from the login email magic link.
   * This should be a url that your app receives and parses and subsequently send an API request to authenticate the magic link and log in the member.
   * If this value is not passed, the default discovery redirect URL that you set in your Dashboard is used.
   * If you have not set a default discovery redirect URL, an error is returned.
   */
  discovery_redirect_url?: string;

  /**
   * The email template ID to use for login emails.
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
   * The expiration time, in minutes. If not accepted within this time frame, the email will need to be resent.
   * Defaults to 60 (1 hour) with a minimum of 5 and a maximum of 10080 (1 week).
   */
  discovery_expiration_minutes?: number;
};

export type B2BMagicLinksEmailDiscoverySendResponse = ResponseCommon;

export type B2BMagicLinksDiscoveryAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = B2BDiscoveryAuthenticateResponse<TProjectConfiguration>;

export type B2BMagicLinksDiscoveryAuthenticateOptions = {
  /**
   *  The discovery magic link token used to authenticate an end user
   */
  discovery_magic_links_token: string;
};

export interface IHeadlessB2BMagicLinksClient<TProjectConfiguration extends StytchProjectConfigurationInput> {
  email: {
    /**
     * The invite method wraps the {@link https://stytch.com/docs/b2b/api/send-invite-email invite} Email Magic Link API endpoint.
     *
     * The `organization_id` will be automatically inferred from the logged-in Member's session.
     *
     * To revoke an existing invite, use the {@link https://stytch.com/docs/b2b/sdks/members/delete-member Delete Member} endpoint. This will both delete the invited Member from the target Organization and revoke all existing invite emails.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/email-magic-links#invite Stytch Docs} for a complete reference.
     *
     * @example
     * stytch.magicLinks.email.invite({
     *   email_address: 'sandbox@stytch.com',
     * });
     *
     * @rbac action="create", resource="stytch.member"
     *
     * @param data - {@link B2BMagicLinksInviteOptions}
     *
     * @returns A {@link B2BMagicLinksInviteResponse} indicating that the email has been sent.
     *
     * @throws A `StytchSDKAPIError` when the Stytch API returns an error.
     * @throws A `SDKAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
     */
    invite(data: B2BMagicLinksInviteOptions): Promise<B2BMagicLinksInviteResponse>;

    /**
     * The `loginOrSignup` method wraps the {@link https://stytch.com/docs/b2b/api/send-login-signup-email login or signup} Email magic link API endpoint.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/email-magic-links#login-or-signup Stytch Docs} for a complete reference.
     *
     * @example
     * stytch.magicLinks.email.loginOrSignup({
     *   email_address: 'sandbox@stytch.com',
     *   organization_id: 'organization-test-123',
     * });
     *
     * @param data - {@link B2BMagicLinkLoginOrSignupOptions}
     *
     * @returns A {@link B2BMagicLinkLoginOrSignupResponse} indicating that the email has been sent.
     *
     * @throws A `StytchAPIError` when the Stytch API returns an error.
     * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
     */
    loginOrSignup(data: B2BMagicLinkLoginOrSignupOptions): Promise<B2BMagicLinkLoginOrSignupResponse>;

    discovery: {
      /**
       * The Send Discovery Email method wraps the {@link https://stytch.com/docs/b2b/api/send-discovery-email send discovery email} API endpoint.
       *
       * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/email-magic-links#send-discovery-email Stytch Docs} for a complete reference.
       *
       * @example
       * stytch.magicLinks.email.discovery.send({
       *   email_address: 'sandbox@stytch.com',
       * });
       *
       * @param data - {@link B2BMagicLinksEmailDiscoverySendOptions}
       *
       * @returns A {@link B2BMagicLinksEmailDiscoverySendResponse} indicating that the email has been sent.
       *
       * @throws A `StytchAPIError` when the Stytch API returns an error.
       * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
       * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
       */
      send(data: B2BMagicLinksEmailDiscoverySendOptions): Promise<B2BMagicLinksEmailDiscoverySendResponse>;
    };
  };

  /**
   * The Authenticate method wraps the {@link https://stytch.com/docs/b2b/api/authenticate-magic-link authenticate} magic link API endpoint which validates the magic link token passed in.
   *
   * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/email-magic-links#authenticate Stytch Docs} for a complete reference.
   *
   * @example
   * stytch.magicLinks.authenticate({
   *   magic_link_token: 'token',
   *   session_duration_minutes: 60,
   * });
   *
   * @param data - {@link B2BMagicLinksAuthenticateOptions}
   *
   * @returns A {@link B2BMagicLinksAuthenticateResponse} indicating that magic link has been authenticated and the member is now logged in.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
   */
  authenticate(
    data: B2BMagicLinksAuthenticateOptions,
  ): Promise<B2BMagicLinksAuthenticateResponse<TProjectConfiguration>>;

  discovery: {
    /**
     * The Authenticate Discovery Magic Link method wraps the {@link https://stytch.com/docs/b2b/api/authenticate-discovery-magic-link authenticate} discovery magic link API endpoint, which validates the discovery magic link token passed in.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/email-magic-links#authenticate-discovery-magic-link Stytch Docs} for a complete reference.
     *
     * @example
     * stytch.magicLinks.discovery.authenticate({
     *   discovery_magic_link_token: 'token',
     * });
     *
     * @param data - {@link B2BMagicLinksDiscoveryAuthenticateOptions}
     *
     * @returns A {@link B2BMagicLinksDiscoveryAuthenticateResponse} indicating that the magic link has been authenticated.
     * The response will contain the intermediate_session_token, the email address that the magic link was sent to,
     * and a list of discovered organizations that are associated with the email address.
     *
     * @throws A `StytchAPIError` when the Stytch API returns an error.
     * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
     */
    authenticate(
      data: B2BMagicLinksDiscoveryAuthenticateOptions,
    ): Promise<B2BMagicLinksDiscoveryAuthenticateResponse<TProjectConfiguration>>;
  };
}
