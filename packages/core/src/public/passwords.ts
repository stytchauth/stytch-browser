import { AuthenticateResponse, ResponseCommon, SDKDeviceHistory, SessionDurationOptions } from './common';
import { StytchProjectConfigurationInput } from './typeConfig';

export type PasswordCreateOptions = SessionDurationOptions & {
  /**
   * The email of the new user.
   */
  email: string;
  /**
   * The password for the new user.
   */
  password: string;
};

// PasswordsCreateResponse
export type PasswordCreateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = AuthenticateResponse<TProjectConfiguration> & {
  /**
   * Globally unique UUID that identifies a specific email address in the Stytch API.
   * The `email_id` is used when you need to operate on a specific user's email address,
   * e.g. to delete the email address from the Stytch user.
   */
  email_id: string;
  /**
   * The device history of the user.
   */
  user_device?: SDKDeviceHistory;
};

export type PasswordAuthenticateOptions = SessionDurationOptions & {
  /**
   * The email of the user.
   */
  email: string;
  /**
   * The password for the user.
   */
  password: string;
};

// PasswordsAuthenticateResponse
export type PasswordAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = AuthenticateResponse<TProjectConfiguration> & {
  /**
   * The device history of the user.
   */
  user_device?: SDKDeviceHistory;
};

export type PasswordResetByEmailStartOptions = {
  /**
   * The email of the user that requested the password reset.
   */
  email: string;
  /**
   * The url that the user clicks from the password reset email to skip resetting their password and directly login.
   * This should be a url that your app receives, parses, and subsequently sends an API request to the magic link authenticate endpoint to complete the login process without reseting their password.
   * If this value is not passed, the login redirect URL that you set in your Dashboard is used.
   * If you have not set a default login redirect URL, an error is returned.
   */
  login_redirect_url?: string;
  /**
   * Set the expiration for the login email magic link, in minutes.
   * By default, it expires in 1 hour.
   * The minimum expiration is 5 minutes and the maximum is 10080 minutes (7 days).
   */
  login_expiration_minutes?: number;
  /**
   * The url that the user clicks from the password reset email to finish the reset password flow.
   * This should be a url that your app receives and parses before showing your app's reset password page.
   * After the user submits a new password to your app, it should send an API request to complete the password reset process.
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
   * Used to determine which language to use when sending the user this delivery method. Parameter is a [IETF BCP 47 language tag](https://www.w3.org/International/articles/language-tags/), e.g. `"en"`.
   *
   * Currently supported languages are English (`"en"`), Spanish (`"es"`), and Brazilian Portuguese (`"pt-br"`); if no value is provided, the copy defaults to English.
   */
  locale?: string;
};

export type PasswordResetByEmailStartResponse = ResponseCommon;

export type PasswordResetByEmailOptions = SessionDurationOptions & {
  /**
   * The token to authenticate.
   */
  token: string;
  /**
   * The new password for the user.
   */
  password: string;
};

// PasswordsEmailResetResponse
export type PasswordResetByEmailResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = AuthenticateResponse<TProjectConfiguration> & {
  /**
   * The device history of the user.
   */
  user_device?: SDKDeviceHistory;
};

export type PasswordResetByExistingPasswordOptions = SessionDurationOptions & {
  /**
   * The user's email.
   */
  email: string;
  /**
   * The user's existing password.
   */
  existing_password: string;
  /**
   * The new password for the user.
   */
  new_password: string;
};

// PasswordsExistingPasswordResetResponse
export type PasswordResetByExistingPasswordResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = AuthenticateResponse<TProjectConfiguration> & {
  /**
   * The device history of the user.
   */
  user_device?: SDKDeviceHistory;
};

export type PasswordResetBySessionOptions = SessionDurationOptions & {
  /**
   * The new password for the user.
   */
  password: string;
};

// PasswordsSessionResetResponse
export type PasswordResetBySessionResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = AuthenticateResponse<TProjectConfiguration> & {
  /**
   * The device history of the user.
   */
  user_device?: SDKDeviceHistory;
};

export type PasswordStrengthCheckOptions = {
  /**
   * The email associated with the password. Provide this for a more accurate strength check.
   */
  email?: string;
  /**
   * The password to strength check.
   */
  password: string;
};

export type PasswordStrengthCheckResponse = ResponseCommon & {
  /**
   * Whether or not the password is considered valid and secure.
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
  feedback: {
    suggestions: string[];
    warning: string;
    /**
     * Contains which LUDS properties are fulfilled by the password and which are missing to convert
     * an invalid password into a valid one. You'll use these fields to provide feedback to the user
     * on how to improve the password.
     */
    luds_requirements: {
      has_digit: boolean;
      has_lower_case: boolean;
      has_symbol: boolean;
      has_upper_case: boolean;
      missing_characters: number;
      missing_complexity: number;
    };
  };
};

export interface IHeadlessPasswordClient<TProjectConfiguration extends StytchProjectConfigurationInput> {
  /**
   * The Create method wraps the {@link https://stytch.com/docs/api/password-create Create} Password API endpoint.
   * If a user with this email already exists in the project, this API will return an error.
   * Existing passwordless users who wish to create a password need to go through the reset password flow.
   *
   * This endpoint will return an error if the password provided does not meet our strength requirements,
   * which you can check beforehand with the {@link https://stytch.com/docs/api/password-strength-check Strength Check} Password API endpoint.
   *
   * If this method succeeds, the user will be logged in, granted an active session, and the
   * {@link https://stytch.com/docs/sdks/javascript-sdk/resources/cookies-and-session-management session cookies} will be minted and stored in the browser.
   *
   * @example
   * const {valid_password} = await stytch.passwords.strengthCheck({ email, password });
   * if (valid_password) {
   *   stytch.passwords.create({ email, password, session_duration_minutes: 60 });
   * }
   *
   * @param options - {@link PasswordCreateOptions}
   *
   * @returns A {@link PasswordCreateResponse} indicating the user has been created and that the user is now logged in.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
   */
  create(options: PasswordCreateOptions): Promise<PasswordCreateResponse<TProjectConfiguration>>;

  /**
   * The Authenticate method wraps the {@link https://stytch.com/docs/api/password-authenticate Authenticate} Password API endpoint.
   * This endpoint verifies that the user has a password currently set, and that the entered password is correct.
   *
   * There are cases where this endpoint will return a `reset_password` error even if the password entered is correct.
   * View our {@link https://stytch.com/docs/api/password-authenticate API Docs} for complete details.
   *
   * @example
   * stytch.passwords.authenticate({
   *   email: 'sandbox@stytch.com',
   *   password: 'aVerySecurePassword',
   *   session_duration_minutes: 60
   * });
   *
   * @param options - {@link PasswordAuthenticateOptions}
   *
   * @returns A {@link PasswordAuthenticateResponse} indicating the password is valid and that the user is now logged in.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
   */
  authenticate(options: PasswordAuthenticateOptions): Promise<PasswordAuthenticateResponse<TProjectConfiguration>>;

  /**
   * The resetByEmailStart method wraps the {@link https://stytch.com/docs/api/password-email-reset-start Reset By Email Start} Password API endpoint.
   * This endpoint initiates a password reset for the email address provided.
   * This will trigger an email to be sent to the address, containing a magic link that will allow them to set a new password and authenticate.
   *
   * @example
   * stytch.passwords.resetByEmailStart({
   *   email: 'sandbox@stytch.com',
   *   reset_password_redirect_url: 'https://example.com/login/reset',
   *   reset_password_expiration_minutes: 10,
   *   login_redirect_url: 'https://example.com/login/authenticate',
   * });
   *
   * @param options - {@link PasswordResetByEmailStartOptions}
   *
   * @returns A {@link PasswordResetByEmailStartResponse} indicating the password is valid and that the user is now logged in.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
   */
  resetByEmailStart(options: PasswordResetByEmailStartOptions): Promise<PasswordResetByEmailStartResponse>;

  /**
   * The resetByEmail method wraps the {@link https://stytch.com/docs/api/password-email-reset Reset By Email} Password API endpoint.
   * This endpoint the user’s password and authenticate them.
   * This endpoint checks that the magic link token is valid, hasn't expired, or already been used.
   * The provided password needs to meet our password strength requirements, which can be checked in advance with the {@link https://stytch.com/docs/api/password-strength-check Strength Check} Password API endpoint.
   *
   * @example
   * const currentLocation = new URL(window.location.href);
   * const token = currentLocation.searchParams.get('token');
   * stytch.passwords.resetByEmail({
   *   token,
   *   email: 'sandbox@stytch.com',
   *   password: 'aVerySecurePassword',
   *   session_duration_minutes: 60
   * });
   *
   * @param options - {@link PasswordResetByEmailOptions}
   *
   * @returns A {@link PasswordResetByEmailResponse} indicating the password is valid and that the user is now logged in.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
   */
  resetByEmail(options: PasswordResetByEmailOptions): Promise<PasswordResetByEmailResponse<TProjectConfiguration>>;

  /**
   * The `strengthCheck` method wraps the {@link https://stytch.com/docs/api/password-strength-check Strength Check} Password API endpoint.
   *
   * This method allows you to check whether or not the user’s provided password is valid, and to provide feedback to the user on how to increase the strength of their password.
   * All passwords must pass the strength requirements to be accepted as valid.
   *
   * @example
   * const {valid_password, feedback} = await stytch.passwords.strengthCheck({ email, password });
   * if (!valid_password) {
   *   throw new Error('Password is not strong enough: ' + feedback.warning);
   * }
   *
   * @param options - {@link PasswordStrengthCheckOptions}
   *
   * @returns A {@link PasswordStrengthCheckResponse} containing password strength feedback.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
   */
  strengthCheck(options: PasswordStrengthCheckOptions): Promise<PasswordStrengthCheckResponse>;

  /**
   * The resetByExistingPassword method wraps the {@link https://stytch.com/docs/api/password-existing-password-reset Reset By Existing Password} API endpoint.
   *
   * @example
   * stytch.passwords.resetByExistingPassword({
   *   email: 'sandbox@stytch.com',
   *   existing_password: 'aVerySecurePassword',
   *   new_password: 'aVerySecureNewPassword'
   * });
   *
   * @param options - {@link PasswordResetByExistingPasswordOptions}
   *
   * @returns A {@link PasswordResetByExistingPasswordResponse} indicating the password is valid and that the user is now logged in.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
   */
  resetByExistingPassword(
    options: PasswordResetByExistingPasswordOptions,
  ): Promise<PasswordResetByExistingPasswordResponse<TProjectConfiguration>>;

  /**
   * The resetBySession method wraps the {@link https://stytch.com/docs/api/password-session-reset Reset By Session} API endpoint.
   *
   * @example
   * stytch.passwords.resetBySession({
   *   password: 'aVerySecurePassword'
   * });
   *
   * @param options - {@link PasswordResetBySessionOptions}
   *
   * @returns A {@link PasswordResetBySessionResponse} indicating the password is valid and that the user is now logged in.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
   */
  resetBySession(
    options: PasswordResetBySessionOptions,
  ): Promise<PasswordResetBySessionResponse<TProjectConfiguration>>;
}
