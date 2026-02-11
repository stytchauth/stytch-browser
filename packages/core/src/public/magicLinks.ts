import { StytchProjectConfigurationInput } from './typeConfig';
import { AuthenticateResponse, locale, ResponseCommon, SessionDurationOptions } from './common';

type MagicLinksBaseOptions = {
  /**
   * The url the user clicks from the sign-up email magic link.
   * This should be a url that your app receives and parses and subsequently send an api request to authenticate the magic link and sign-up the user.
   * If this value is not passed, the default sign-up redirect URL that you set in your Dashboard is used.
   * If you have not set a default sign-up redirect URL, an error is returned.
   */
  signup_magic_link_url?: string;

  /**
   * Set the expiration for the sign-up email magic link, in minutes.
   * By default, it expires in 1 week.
   * The minimum expiration is 5 minutes and the maximum is 10080 minutes (7 days).
   */
  signup_expiration_minutes?: number;

  /**
   * The url the user clicks from the login email magic link.
   * This should be a url that your app receives and parses and subsequently send an API request to authenticate the magic link and log in the user.
   * If this value is not passed, the default login redirect URL that you set in your Dashboard is used.
   * If you have not set a default login redirect URL, an error is returned.
   */
  login_magic_link_url?: string;

  /**
   * Set the expiration for the login email magic link, in minutes.
   * By default, it expires in 1 hour.
   * The minimum expiration is 5 minutes and the maximum is 10080 minutes (7 days).
   */
  login_expiration_minutes?: number;

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
   * Used to determine which language to use when sending the user this delivery method. Parameter is a [IETF BCP 47 language tag](https://www.w3.org/International/articles/language-tags/), e.g. `"en"`.
   *
   * Currently supported languages are English (`"en"`), Spanish (`"es"`), and Brazilian Portuguese (`"pt-br"`); if no value is provided, the copy defaults to English.
   */
  locale?: locale;
};

export type MagicLinksLoginOrCreateOptions = MagicLinksBaseOptions;

export type MagicLinksSendOptions = MagicLinksBaseOptions;

export type MagicLinksLoginOrCreateResponse = ResponseCommon;

export type MagicLinksSendResponse = ResponseCommon;

export type MagicLinksAuthenticateOptions = SessionDurationOptions;

// AuthenticateMagicResponse
export type MagicLinksAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = AuthenticateResponse<TProjectConfiguration> & {
  /**
   * The ID of the method used to send a magic link.
   */
  method_id: string;
};

export interface IHeadlessMagicLinksClient<TProjectConfiguration extends StytchProjectConfigurationInput> {
  email: {
    /**
     * The Login or create method wraps the {@link https://stytch.com/docs/api/log-in-or-create-user-by-email Login or Create} Email Magic Link API endpoint.
     *
     * See the {@link https://stytch.com/docs/sdks/javascript-sdk#email-magic-links_methods_send Stytch Docs} for a complete reference.
     *
     * @example
     * stytch.magicLinks.email.loginOrCreate('sandbox@stytch.com', {
     *   login_magic_link_url: 'https://example.com/authenticate',
     *   login_expiration_minutes: 60,
     *   signup_magic_link_url: 'https://example.com/authenticate',
     *   signup_expiration_minutes: 60,
     * });
     *
     * @param email - The email of the user to send the invite magic link to.
     * @param options - {@link MagicLinksLoginOrCreateOptions}
     *
     * @returns A {@link MagicLinksLoginOrCreateResponse} indicating that the email has been sent.
     *
     * @throws A `StytchAPIError` when the Stytch API returns an error.
     * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
     */
    loginOrCreate(email: string, options?: MagicLinksLoginOrCreateOptions): Promise<MagicLinksLoginOrCreateResponse>;
    /**
     * The Send method wraps the {@link https://stytch.com/docs/api/send-by-email send} Email Magic Link API endpoint.
     * This method requires that the user already exist within Stytch before a magic link may be sent.
     * This method is useful for gating your login flow to only pre-created users, e.g. an invite or waitlist.
     *
     * This method is also used when you need to add an email address to an existing Stytch User.
     * If there is a currently valid Stytch session, and the user inputs an email address that does not match one on their Stytch User object, upon successful authentication the new email address will be appended to the `emails` array.
     * Note, this does expose a potential account enumeration vector, see our article on {@link https://stytch.com/docs/resources/platform/account-enumeration preventing account enumeration} for more details.
     *
     * See the {@link https://stytch.com/docs/sdks/javascript-sdk#email-magic-links_methods_send Stytch Docs} for a complete reference.
     *
     * @example
     * stytch.magicLinks.email.send('sandbox@stytch.com', {
     *   login_magic_link_url: 'https://example.com/authenticate',
     *   login_expiration_minutes: 60,
     *   signup_magic_link_url: 'https://example.com/authenticate',
     *   signup_expiration_minutes: 60,
     * });
     *
     * @param email - The email of the user to send the invite magic link to.
     * @param options - {@link MagicLinksSendOptions}
     *
     * @returns A {@link MagicLinksSendResponse} indicating that the email has been sent.
     *
     * @throws A `StytchAPIError` when the Stytch API returns an error.
     * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
     */
    send(email: string, options?: MagicLinksSendOptions): Promise<MagicLinksSendResponse>;
  };

  /**
   * The Authenticate method wraps the {@link https://stytch.com/docs/api/authenticate-magic-link authenticate}
   * Magic Link API endpoint which validates the magic link token passed in.
   *
   * See the {@link https://stytch.com/docs/sdks/javascript-sdk#email-magic-links_methods_authenticate Stytch Docs} for a complete reference.
   *
   * @example
   * const currentLocation = new URL(window.location.href);
   * const token = currentLocation.searchParams.get('token');
   * stytch.magicLinks.authenticate(token, {
   *   session_duration_minutes: 60,
   * });
   *
   * @param token - The magic link token from the token query parameter in the URL.
   * @param options - {@link MagicLinksLoginOrCreateOptions}
   *
   * @returns A {@link MagicLinksAuthenticateResponse} indicating that magic link has been authenticated and the user is now logged in.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
   */
  authenticate(
    token: string,
    options: MagicLinksAuthenticateOptions,
  ): Promise<MagicLinksAuthenticateResponse<TProjectConfiguration>>;
}
