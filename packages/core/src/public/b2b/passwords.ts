import { ExtractOpaqueTokens, IfOpaqueTokens } from '../../typeConfig';
import { locale, ResponseCommon, SDKDeviceHistory, SessionDurationOptions } from '../common';
import { StytchProjectConfigurationInput } from '../typeConfig';
import { B2BAuthenticateResponse, B2BAuthenticateResponseWithMFA, MemberResponseCommon } from './common';
import { B2BDiscoveryOrganizationsResponse } from './discovery';

export type B2BPasswordAuthenticateOptions = SessionDurationOptions & {
  /**
   * The id of the Organization under which the Member and password belong
   */
  organization_id: string;
  /**
   * The email of the Member.
   */
  email_address: string;
  /**
   * The password for the Member.
   */
  password: string;

  /**
   * The locale will be used if an OTP code is sent to the member's phone number as part of a
   * secondary authentication requirement.
   */
  locale?: locale;
};

export type B2BPasswordDiscoveryAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = B2BDiscoveryOrganizationsResponse & {
  intermediate_session_token: IfOpaqueTokens<ExtractOpaqueTokens<TProjectConfiguration>, '', string>;
};

export type B2BPasswordDiscoveryAuthenticateOptions = {
  /**
   * The email attempting to login.
   */
  email_address: string;
  /**
   * The password for the email address.
   */
  password: string;
};

export type B2BPasswordAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = B2BAuthenticateResponseWithMFA<TProjectConfiguration> & {
  /**
   * The device history of the member.
   */
  member_device?: SDKDeviceHistory;
};

export type B2BPasswordResetByEmailStartOptions = {
  /**
   * The id of the Organization under which the Member and password belong
   */
  organization_id: string;
  /**
   * The email of the Member that requested the password reset.
   */
  email_address: string;
  /**
   * The url that the Member clicks from the password reset email to skip resetting their password and directly login.
   * This should be a url that your app receives, parses, and subsequently sends an API request to the magic link authenticate endpoint to complete the login process without reseting their password.
   * If this value is not passed, the login redirect URL that you set in your Dashboard is used.
   * If you have not set a default login redirect URL, an error is returned.
   */
  login_redirect_url?: string;
  /**
   * The url that the Member clicks from the password reset email to finish the reset password flow.
   * This should be a url that your app receives and parses before showing your app's reset password page.
   * After the Member submits a new password to your app, it should send an API request to complete the password reset process.
   * If this value is not passed, the default reset password redirect URL that you set in your Dashboard is used.
   * If you have not set a default reset password redirect URL, an error is returned.
   */
  reset_password_redirect_url?: string;
  /**
   * Set the expiration for the password reset, in minutes.
   * By default, it expires in 30 minutes.
   * The minimum expiration is 5 minutes and the maximum is 7 days (10080 mins).
   */
  reset_password_expiration_minutes?: number;
  /**
   * The email template ID to use for password reset.
   * If not provided, your default email template will be sent. If providing a template ID, it must be either a template using Stytch's customizations,
   * or a Passwords reset custom HTML template.
   */
  reset_password_template_id?: string;
  /**
   * The email template ID to use for first-time users verifying their email while resetting their password.
   * If not provided, your default email template will be sent. If providing a template ID, it must be either a template using Stytch's customizations,
   * or a Passwords email verification custom HTML template.
   */
  verify_email_template_id?: string;
  /**
   * The locale is used to determine which language to use in the email. Parameter is a {@link https://www.w3.org/International/articles/language-tags/ IETF BCP 47 language tag}, e.g. "en".
   * Currently supported languages are English ("en"), Spanish ("es"), and Brazilian Portuguese ("pt-br"); if no value is provided, the copy defaults to English.
   */
  locale?: locale;
};

export type B2BPasswordResetByEmailStartResponse = ResponseCommon;

export type B2BPasswordDiscoveryResetByEmailStartOptions = {
  /**
   * The email that requested the password reset.
   */
  email_address: string;
  /**
   * The url that the Member clicks from the password reset email to skip resetting their password and directly login.
   * This should be a url that your app receives, parses, and subsequently sends an API request to the magic link authenticate endpoint to complete the login process without reseting their password.
   * If this value is not passed, the login redirect URL that you set in your Dashboard is used.
   * If you have not set a default login redirect URL, an error is returned.
   */
  discovery_redirect_url?: string;
  /**
   * The url that the Member clicks from the password reset email to finish the reset password flow.
   * This should be a url that your app receives and parses before showing your app's reset password page.
   * After the Member submits a new password to your app, it should send an API request to complete the password reset process.
   * If this value is not passed, the default reset password redirect URL that you set in your Dashboard is used.
   * If you have not set a default reset password redirect URL, an error is returned.
   */
  reset_password_redirect_url?: string;
  /**
   * Set the expiration for the password reset, in minutes.
   * By default, it expires in 30 minutes.
   * The minimum expiration is 5 minutes and the maximum is 7 days (10080 mins).
   */
  reset_password_expiration_minutes?: number;
  /**
   * The email template ID to use for password reset.
   * If not provided, your default email template will be sent. If providing a template ID, it must be either a template using Stytch's customizations,
   * or a Passwords reset custom HTML template.
   */
  reset_password_template_id?: string;
  /**
   * The email template ID to use for first-time users verifying their email while resetting their password.
   * If not provided, your default email template will be sent. If providing a template ID, it must be either a template using Stytch's customizations,
   * or a Passwords email verification custom HTML template.
   */
  verify_email_template_id?: string;
  /**
   * The locale is used to determine which language to use in the email. Parameter is a {@link https://www.w3.org/International/articles/language-tags/ IETF BCP 47 language tag}, e.g. "en".
   * Currently supported languages are English ("en"), Spanish ("es"), and Brazilian Portuguese ("pt-br"); if no value is provided, the copy defaults to English.
   */
  locale?: locale;
};

export type B2BPasswordDiscoveryResetByEmailStartResponse = ResponseCommon;

export type B2BPasswordDiscoveryResetByEmailOptions = {
  /**
   * The token to authenticate.
   */
  password_reset_token: string;
  /**
   * The new password for the Member.
   */
  password: string;
};

export type B2BPasswordDiscoveryResetByEmailResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = B2BDiscoveryOrganizationsResponse & {
  intermediate_session_token: IfOpaqueTokens<ExtractOpaqueTokens<TProjectConfiguration>, '', string>;
};

export type B2BPasswordResetByEmailOptions = SessionDurationOptions & {
  /**
   * The token to authenticate.
   */
  password_reset_token: string;
  /**
   * The new password for the Member.
   */
  password: string;

  /**
   * The locale will be used if an OTP code is sent to the member's phone number as part of a
   * secondary authentication requirement.
   */
  locale?: locale;
};

// B2BPasswordEmailResetResponse
export type B2BPasswordResetByEmailResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = B2BAuthenticateResponseWithMFA<TProjectConfiguration> & {
  /**
   * The device history of the member.
   */
  member_device?: SDKDeviceHistory;
};

export type B2BPasswordResetByExistingPasswordOptions = SessionDurationOptions & {
  /**
   * The id of the Organization under which the Member and password belong
   */
  organization_id: string;
  /**
   * The Member's email.
   */
  email_address: string;
  /**
   * The Member's existing password.
   */
  existing_password: string;
  /**
   * The new password for the Member.
   */
  new_password: string;

  /**
   * The locale will be used if an OTP code is sent to the member's phone number as part of a
   * secondary authentication requirement.
   */
  locale?: locale;
};

// B2BPasswordExistingPasswordResetResponse
export type B2BPasswordResetByExistingPasswordResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = B2BAuthenticateResponseWithMFA<TProjectConfiguration> & {
  /**
   * The device history of the member.
   */
  member_device?: SDKDeviceHistory;
};

export type B2BPasswordResetBySessionOptions = {
  /**
   * The new password for the Member.
   */
  password: string;
};

// B2BPasswordSessionResetResponse
export type B2BPasswordResetBySessionResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = B2BAuthenticateResponse<TProjectConfiguration> & {
  /**
   * The device history of the member.
   */
  member_device?: SDKDeviceHistory;
};

export type B2BPasswordStrengthCheckOptions = {
  /**
   * The email associated with the password. Provide this for a more accurate strength check.
   */
  email_address?: string;
  /**
   * The password to strength check.
   */
  password: string;
};

export type B2BPasswordStrengthCheckResponse = MemberResponseCommon & {
  /**
   * Whether the password is considered valid and secure.
   * Read more about password validity {@link https://stytch.com/docs/api/password-strength-check in our docs}.
   */
  valid_password: boolean;
  /**
   * The score of the password as determined by {@link https://github.com/dropbox/zxcvbn zxcvbn}.
   */
  score: number;
  /**
   * Determines if the password has been breached using {@link https://haveibeenpwned.com/ HaveIBeenPwned}.
   */
  breached_password: boolean;
  /**
   * Will return true if breach detection will be evaluated. By default this option is enabled.
   * This option can be disabled by contacting support@stytch.com. If this value is false then
   * breached_password will always be false as well.
   */
  breach_detection_on_create: boolean;
  /**
   * The strength policy type enforced, either `zxcvbn` or `luds`.
   */
  strength_policy: 'luds' | 'zxcvbn';
  /**
   * Feedback for how to improve the password's strength using {@link https://github.com/dropbox/zxcvbn zxcvbn}.
   */
  zxcvbn_feedback: {
    suggestions: string[];
    warning: string;
  };
  /**
   * Feedback for how to improve the password's strength using Lowercase Uppercase Digits Special Characters
   */
  luds_feedback: {
    has_lower_case: boolean;
    has_upper_case: boolean;
    has_digit: boolean;
    has_symbol: boolean;
    missing_complexity: number;
    missing_characters: number;
  };
};

export interface IHeadlessB2BPasswordClient<TProjectConfiguration extends StytchProjectConfigurationInput> {
  /**
   * The Authenticate method wraps the {@link https://stytch.com/docs/b2b/api/passwords-authenticate Authenticate} Password API endpoint.
   * This endpoint verifies that the Member has a password currently set, and that the entered password is correct.
   *
   * There are cases where this endpoint will return a `reset_password` error even if the password entered is correct.
   * View our {@link https://stytch.com/docs/api/password-authenticate API Docs} for complete details.
   *
   * If this method succeeds, the Member will be logged in, granted an active session, and the
   * {@link https://stytch.com/docs/sdks/javascript-sdk/resources/cookies-and-session-management session cookies} will be minted and stored in the browser.
   *
   * @example
   * stytch.passwords.authenticate({
   *   email_address: 'sandbox@stytch.com',
   *   password: 'aVerySecurePassword',
   *   session_duration_minutes: 60
   * });
   *
   * @param options - {@link B2BPasswordAuthenticateOptions}
   *
   * @returns A {@link B2BPasswordAuthenticateResponse} indicating the password is valid and that the Member is now logged in.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
   */
  authenticate(
    options: B2BPasswordAuthenticateOptions,
  ): Promise<B2BPasswordAuthenticateResponse<TProjectConfiguration>>;

  /**
   * The `resetByEmailStart` method wraps the {@link https://stytch.com/docs/b2b/api/email-reset-start Reset By Email Start} Password API endpoint.
   * This endpoint initiates a password reset for the email address provided.
   * This will trigger an email to be sent to the address, containing a magic link that will allow them to set a new password and authenticate.
   *
   * @example
   * stytch.passwords.resetByEmailStart({
   *   email_address: 'sandbox@stytch.com',
   *   reset_password_redirect_url: 'https://example.com/login/reset',
   *   reset_password_expiration_minutes: 10,
   *   login_redirect_url: 'https://example.com/login/authenticate',
   * });
   *
   * @param options - {@link B2BPasswordResetByEmailStartOptions}
   *
   * @returns A {@link B2BPasswordResetByEmailStartResponse} indicating the password is valid and that the Member is now logged in.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
   */
  resetByEmailStart(options: B2BPasswordResetByEmailStartOptions): Promise<B2BPasswordResetByEmailStartResponse>;

  /**
   * The `resetByEmail` method wraps the {@link https://stytch.com/docs/b2b/api/email-reset Password reset by email} API endpoint.
   * This endpoint resets the Member's password and authenticates them.
   * The provided password needs to meet your Stytch project's password strength requirements, which can be checked in advance using the {@link IHeadlessB2BPasswordClient#strengthCheck password strength check} method.
   *
   * If this method succeeds, the Member will be logged in, granted an active session, and the
   * {@link https://stytch.com/docs/sdks/javascript-sdk/resources/cookies-and-session-management session cookies} will be minted and stored in the browser.
   *
   * @example
   * const currentLocation = new URL(window.location.href);
   * const token = currentLocation.searchParams.get('token');
   * stytch.passwords.resetByEmail({
   *   token,
   *   email_address: 'sandbox@stytch.com',
   *   password: 'aVerySecurePassword',
   *   session_duration_minutes: 60
   * });
   *
   * @param options - {@link B2BPasswordResetByEmailOptions}
   *
   * @returns A {@link B2BPasswordResetByEmailResponse} indicating the password is valid and that the Member is now logged in.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
   */
  resetByEmail(
    options: B2BPasswordResetByEmailOptions,
  ): Promise<B2BPasswordResetByEmailResponse<TProjectConfiguration>>;

  /**
   * The strengthCheck method wraps the {@link https://stytch.com/docs/b2b/api/strength-check Strength Check} Password API endpoint.
   *
   * This endpoint allows you to check whether or not the Member’s provided password is valid,
   * and to provide feedback to the Member on how to increase the strength of their password.
   *
   * @example
   * const {valid_password, feedback} = await stytch.passwords.strengthCheck({ email, password });
   * if (!valid_password) {
   *   throw new Error('Password is not strong enough: ' + feedback.warning);
   * }
   *
   * @param options - {@link B2BPasswordStrengthCheckOptions}
   *
   * @returns A {@link B2BPasswordStrengthCheckResponse} containing password strength feedback.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
   */
  strengthCheck(options: B2BPasswordStrengthCheckOptions): Promise<B2BPasswordStrengthCheckResponse>;

  /**
   * The resetByExistingPassword method wraps the {@link https://stytch.com/docs/b2b/api/existing-reset Reset By Existing Password} API endpoint.
   * If this method succeeds, the Member will be logged in, granted an active session, and the
   * {@link https://stytch.com/docs/sdks/javascript-sdk/resources/cookies-and-session-management session cookies} will be minted and stored in the browser.
   *
   * @example
   * stytch.passwords.resetByExistingPassword({
   *   email_address: 'sandbox@stytch.com',
   *   existing_password: 'aVerySecurePassword',
   *   new_password: 'aVerySecureNewPassword'
   * });
   *
   * @param options - {@link B2BPasswordResetByExistingPasswordOptions}
   *
   * @returns A {@link B2BPasswordResetByExistingPasswordResponse} indicating the password is valid and that the Member is now logged in.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
   */
  resetByExistingPassword(
    options: B2BPasswordResetByExistingPasswordOptions,
  ): Promise<B2BPasswordResetByExistingPasswordResponse<TProjectConfiguration>>;

  /**
   * The resetBySession method wraps the {@link https://stytch.com/docs/b2b/api/session-reset Reset By Session} API endpoint.
   * If this method succeeds, the Member will be logged in, granted an active session, and the
   * {@link https://stytch.com/docs/sdks/javascript-sdk/resources/cookies-and-session-management session cookies} will be minted and stored in the browser.
   *
   * @example
   * stytch.passwords.resetBySession({
   *   password: 'aVerySecurePassword'
   * });
   *
   * @param options - {@link B2BPasswordResetBySessionOptions}
   *
   * @returns A {@link B2BPasswordResetBySessionResponse} indicating the password is valid and that the Member is now logged in.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
   */
  resetBySession(
    options: B2BPasswordResetBySessionOptions,
  ): Promise<B2BPasswordResetBySessionResponse<TProjectConfiguration>>;

  discovery: {
    /**
     * The `resetByEmailStart` method wraps the {@link https://stytch.com/docs/b2b/api/discovery-email-reset-start Reset By Email Discovery Start} Password API endpoint.
     * If this method succeeds, an email will be sent to the provided email address with a link to reset the password.
     * @param options - {@link B2BPasswordDiscoveryResetByEmailStartOptions}
     *
     * @returns A {@link B2BPasswordDiscoveryResetByEmailStartResponse} indicating the password reset email has been sent.
     *
     * @throws A `StytchAPIError` when the Stytch API returns an error.
     * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
     */
    resetByEmailStart(
      options: B2BPasswordDiscoveryResetByEmailStartOptions,
    ): Promise<B2BPasswordDiscoveryResetByEmailStartResponse>;

    /**
     * The `resetByEmail` method wraps the {@link https://stytch.com/docs/b2b/api/discovery-email-reset Reset By Email Discovery} Password API endpoint.
     * This endpoint resets the password associated with an email and starts an intermediate session for the user.
     * @param options - {@link B2BPasswordDiscoveryResetByEmailOptions}
     *
     * @returns A {@link B2BPasswordDiscoveryResetByEmailResponse} indicating the password is valid and that the Member is now logged in.
     *
     * @throws A `StytchAPIError` when the Stytch API returns an error.
     * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
     */
    resetByEmail(
      options: B2BPasswordDiscoveryResetByEmailOptions,
    ): Promise<B2BPasswordDiscoveryResetByEmailResponse<TProjectConfiguration>>;

    /**
     * The `authenticate` method wraps the {@link https://stytch.com/docs/b2b/api/passwords-discovery-authenticate Discovery Authenticate} Password API endpoint.
     * This endpoint verifies that the email has a password currently set, and that the entered password is correct.
     * @param options - {@link B2BPasswordDiscoveryAuthenticateOptions}
     *
     * @returns A {@link B2BPasswordDiscoveryAuthenticateResponse} indicating the password is valid and that the Member is now logged in.
     *
     * @throws A `StytchAPIError` when the Stytch API returns an error.
     * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
     */
    authenticate(
      options: B2BPasswordDiscoveryAuthenticateOptions,
    ): Promise<B2BPasswordDiscoveryAuthenticateResponse<TProjectConfiguration>>;
  };
}
