import { AuthenticateResponse, ResponseCommon, SessionDurationOptions } from './common';
import { StytchProjectConfigurationInput } from './typeConfig';

export type OAuthGetURLOptions = {
  /**
   * The URL that Stytch redirects to after the OAuth flow is completed for a user that already exists.
   * This URL should be an endpoint in the backend server that verifies the request by querying Stytch's /oauth/authenticate endpoint and finishes the login.
   * The URL should be configured as a Login URL in the Stytch Dashboard's Redirect URL page.
   * If the field is not specified, the default in the Dashboard is used.
   */
  login_redirect_url?: string;
  /**
   * The URL that Stytch redirects to after the OAuth flow is completed for a user that does not yet exist.
   * This URL should be an endpoint in the backend server that verifies the request by querying Stytch's /oauth/authenticate endpoint and finishes the login.
   * The URL should be configured as a Sign Up URL in the Stytch Dashboard's Redirect URL page.
   * If the field is not specified, the default in the Dashboard is used.
   */
  signup_redirect_url?: string;
  /**
   * An optional list of custom scopes that you'd like to request from the user in addition to the ones Stytch requests by default.
   * @example Google Custom Scopes
   * ['https://www.googleapis.com/auth/gmail.compose', 'https://www.googleapis.com/auth/firebase']
   *
   * @example Facebook Custom Scopes
   * ['public_profile', 'instagram_shopping_tag_products']
   */
  custom_scopes?: string[];
  /**
   * An optional mapping of provider specific values to pass through to the OAuth provider
   * @example Google authorization parameters
   * {"prompt": "select_account", "login_hint": "example@stytch.com"}
   */
  provider_params?: Record<string, string>;
  /**
   * An optional token to pre-associate an OAuth flow with an existing Stytch User
   */
  oauth_attach_token?: string;
};

export type OAuthAuthenticateOptions = SessionDurationOptions;
export type OAuthAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = AuthenticateResponse<TProjectConfiguration> & {
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
  profile_picture_url: string;
  /**
   * If available, the `locale` is the user's locale set in the OAuth identity provider that the user has authenticated with.
   */
  locale: string;
  /**
   * The `provider_values` object lists relevant identifiers, values, and scopes for a given OAuth provider.
   * For example this object will include a provider's `access_token` that you can use to access the provider's API for a given user.
   * Note that these values will vary based on the OAuth provider in question, e.g. `id_token` may not be returned by all providers.
   */
  provider_values: {
    /**
     * The `access_token` that you may use to access the user's data in the provider's API.
     */
    access_token: string;
    /**
     * The `id_token` returned by the OAuth provider.
     * ID Tokens are JWTs that contain structured information about a user.
     * The exact content of each ID Token varies from provider to provider.
     * ID Tokens are returned from OAuth providers that conform to the {@link https://openid.net/foundation/ OpenID Connect} specification, which is based on OAuth.
     */
    id_token: string;
    /**
     * The `refresh_token` that you may use to refresh a user's session within the provider's API.
     */
    refresh_token: string;
    /**
     * The OAuth scopes included for a given provider.
     * See each provider's section above to see which scopes are included by default and how to add custom scopes.
     */
    scopes: string[];
    /**
     * The timestamp when the Session expires.
     * Values conform to the RFC 3339 standard and are expressed in UTC, e.g. 2021-12-29T12:33:09Z.
     */
    expires_at: string;
  };
};
export type OAuthStartFailureReason = 'User Canceled' | 'Authentication Failed' | 'Invalid Platform';
export type OAuthStartResponse =
  | void
  | { success: true }
  | { success: false; reason: OAuthStartFailureReason; error?: Error };
/**
 * Methods for interacting with an individual OAuth provider.
 */
export interface IOAuthProvider {
  /**
   * Start an OAuth flow by redirecting the browser to one of Stytch's {@link https://stytch.com/docs/api/oauth-google-start oauth start} endpoints.
   * If enabled, this method will also generate a PKCE code_verifier and store it in localstorage on the device (See the {@link https://stytch.com/docs/oauth#guides_pkce PKCE OAuth guide} for details).
   * If your application is configured to use a custom subdomain with Stytch, it will be used automatically.
   * @example
   * const loginWithGoogle = useCallback(()=> {
   *   stytch.oauth.google.start({
   *     login_redirect_url: 'https://example.com/oauth/callback',
   *     signup_redirect_url: 'https://example.com/oauth/callback',
   *     custom_scopes: ['https://www.googleapis.com/auth/gmail.compose']
   *   })
   * }, [stytch]);
   * return (
   *   <Button onClick={loginWithGoogle}> Log in! </Button>
   * );
   *
   * @param options - An {@link OAuthGetURLOptions} object
   *
   * @returns OAuthStartResponse - In browsers, the browser is redirected during this function call and will return void. You should not attempt to run any code after calling this function. In React Native applications, an external browser is opened, and this method will return the result of the browser/native authentication attempt.
   *
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  start(options?: OAuthGetURLOptions): Promise<OAuthStartResponse>;
}

export type OAuthAttachResponse = ResponseCommon & { oauth_attach_token: string };

export interface IHeadlessOAuthClient<TProjectConfiguration extends StytchProjectConfigurationInput> {
  google: IOAuthProvider;
  microsoft: IOAuthProvider;
  apple: IOAuthProvider;
  github: IOAuthProvider;
  gitlab: IOAuthProvider;
  facebook: IOAuthProvider;
  discord: IOAuthProvider;
  salesforce: IOAuthProvider;
  slack: IOAuthProvider;
  amazon: IOAuthProvider;
  bitbucket: IOAuthProvider;
  linkedin: IOAuthProvider;
  coinbase: IOAuthProvider;
  twitch: IOAuthProvider;
  twitter: IOAuthProvider;
  tiktok: IOAuthProvider;
  snapchat: IOAuthProvider;
  figma: IOAuthProvider;
  yahoo: IOAuthProvider;

  /**
   * The authenticate method wraps the {@link https://stytch.com/docs/api/oauth-authenticate authenticate} OAuth API endpoint which validates the OAuth token passed in.
   *
   * @example
   * const token = new URLSearchParams(window.location.search).get('token');
   * stytch.oauth.authenticate(token, {
   *   session_duration_minutes: 60
   * }).then(...)
   *
   * @param token - The token to authenticate
   * @param options - {@link OAuthAuthenticateOptions}
   *
   * @returns A {@link OAuthAuthenticateResponse} indicating the token has been authenticated.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  authenticate(
    token: string,
    options: OAuthAuthenticateOptions,
  ): Promise<OAuthAuthenticateResponse<TProjectConfiguration>>;

  /**
   * The attach method wraps the {@link https://stytch.com/docs/api/oauth-attach attach} OAuth API endpoint and generates an OAuth Attach Token to pre-associate an OAuth flow with an existing Stytch User.
   *
   * You must have an active Stytch session to use this endpoint.
   * Pass the returned oauth_attach_token to the same provider's OAuth Start endpoint to treat this OAuth flow as a
   * login for that user instead of a signup
   *
   * @param provider - The OAuth provider's name.
   *
   * @returns A {@link OAuthAttachResponse} containing a single-use token for connecting the Stytch User selection from this request to the corresponding OAuth Start request.
   */
  attach(provider: string): Promise<OAuthAttachResponse>;
}
