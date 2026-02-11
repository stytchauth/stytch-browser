import { locale, SDKDeviceHistory, SessionDurationOptions } from '../common';
import { StytchProjectConfigurationInput } from '../typeConfig';
import { B2BAuthenticateResponseWithMFA } from './common';
import { B2BDiscoveryAuthenticateResponse } from './discovery';

type OAuthOrgSelectorOptions =
  | {
      /**
       * The id of the organization the member belongs to.
       */
      organization_id: string;
      /**
       * The slug of the organization the member belongs to.
       */
      organization_slug?: never;
    }
  | {
      organization_slug: string;
      organization_id?: never;
    };

export type OAuthStartOptions = OAuthOrgSelectorOptions & {
  /**
   * The URL that Stytch redirects to after the OAuth flow is completed for a member that already exists.
   * This URL should be an endpoint in the backend server that verifies the request by querying Stytch's /oauth/authenticate endpoint and finishes the login.
   * The URL should be configured as a Login URL in the Stytch Dashboard's Redirect URL page.
   * If the field is not specified, the default in the Dashboard is used.
   */
  login_redirect_url?: string;
  /**
   * The URL that Stytch redirects to after the OAuth flow is completed for a member that does not yet exist.
   * This URL should be an endpoint in the backend server that verifies the request by querying Stytch's /oauth/authenticate endpoint and finishes the login.
   * The URL should be configured as a Sign Up URL in the Stytch Dashboard's Redirect URL page.
   * If the field is not specified, the default in the Dashboard is used.
   */
  signup_redirect_url?: string;
  /**
   * An optional list of custom scopes that you'd like to request from the member in addition to the ones Stytch requests by default.
   * @example Google Custom Scopes
   * ['https://www.googleapis.com/auth/gmail.compose', 'https://www.googleapis.com/auth/firebase']
   */
  custom_scopes?: string[];
  /**
   * An optional mapping of provider specific values to pass through as query params to the OAuth provider
   * @example Google authorization parameters
   * {"prompt": "select_account", "login_hint": "example@stytch.com"}
   */
  provider_params?: Record<string, string>;
};

export type B2BOAuthDiscoveryStartOptions = {
  /**
   * The URL that Stytch redirects to after the OAuth flow is completed for the member to perform discovery actions.
   * This URL should be an endpoint in the backend server that verifies the request by querying Stytch's /oauth/discovery/authenticate endpoint and finishes the login.
   * The URL should be configured as a Discovery URL in the Stytch Dashboard's Redirect URL page.
   * If the field is not specified, the default in the Dashboard is used.
   */
  discovery_redirect_url?: string;
  /**
   * An optional list of custom scopes that you'd like to request from the member in addition to the ones Stytch requests by default.
   * @example Google Custom Scopes
   * ['https://www.googleapis.com/auth/gmail.compose', 'https://www.googleapis.com/auth/firebase']
   */
  custom_scopes?: string[];
  /**
   * An optional mapping of provider specific values to pass through to the OAuth provider
   * @example Google authorization parameters
   * {"prompt": "select_account", "login_hint": "example@stytch.com"}
   */
  provider_params?: Record<string, string>;
};

export type B2BOAuthAuthenticateOptions = SessionDurationOptions & {
  /**
   *  The oauth token used to authenticate a member
   */
  oauth_token: string;

  /**
   * The locale will be used if an OTP code is sent to the member's phone number as part of a
   * secondary authentication requirement.
   */
  locale?: locale;
};

export type OAuthDiscoveryAuthenticateOptions = {
  /**
   *  The oauth token used to finish the discovery flow
   */
  discovery_oauth_token: string;
};

export type B2BOAuthDiscoveryAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = B2BDiscoveryAuthenticateResponse<TProjectConfiguration>;

export type B2BOAuthAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = B2BAuthenticateResponseWithMFA<TProjectConfiguration> & {
  /**
   * The `provider_values` object lists relevant identifiers, values, and scopes for a given OAuth provider.
   * For example this object will include a provider's `access_token` that you can use to access the provider's API for a given member.
   * Note that these values will vary based on the OAuth provider in question, e.g. `id_token` may not be returned by all providers.
   */
  provider_values: {
    /**
     * The `access_token` that you may use to access the member's data in the provider's API.
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
     * The `refresh_token` that you may use to refresh a member's session within the provider's API.
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
  /**
   * The device history of the member.
   */
  member_device?: SDKDeviceHistory;
};

/**
 * Methods for interacting with an individual OAuth provider.
 */
interface IOAuthProvider {
  /**
   * The `oauth.$provider.start()` methods start OAuth flows by redirecting the browser to one of Stytch's {@link https://stytch.com/docs/b2b/api/oauth-google-start OAuth Start} endpoints.
   * One of `organization_id` or `slug` is required to specify which organization the user is trying to access.
   * If the organization that the user is trying to access is not yet known, use the `oauth.$provider.discovery.start()` method instead.
   *
   * The method will also generate a PKCE `code_verifier` and store it in local storage on the device (See the {@link https://stytch.com/docs/guides/oauth/adding-pkce PKCE OAuth guide} for details).
   * If your application is configured to use a custom subdomain with Stytch, it will be used automatically.
   *
   * @example
   * const loginWithGoogle = useCallback(()=> {
   *   stytch.oauth.google.start({
   *     login_redirect_url: 'https://example.com/oauth/callback',
   *     signup_redirect_url: 'https://example.com/oauth/callback',
   *     organization_id: 'organization-test-123',
   *     custom_scopes: ['https://www.googleapis.com/auth/gmail.compose']
   *   })
   * }, [stytch]);
   * return (
   *   <Button onClick={loginWithGoogle}> Log in with OAuth Provider </Button>
   * );
   *
   * @param data - An {@link OAuthStartOptions} object
   *
   * @returns void - the browser is redirected during this function call. You should not attempt to run any code after calling this function.
   *
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  start(data: OAuthStartOptions): Promise<void>;
  discovery: {
    /**
     * Start a discovery OAuth login flow by redirecting the browser to Stytch's {@link https://stytch.com/docs/b2b/api/oauth-google-discovery-start OAuth discovery start} endpoint.
     * If enabled, this method will also generate a pkce_code_verifier and store it in localstorage on the device.
     * @example
     * const loginWithGoogle = useCallback(()=> {
     *   stytch.oauth.discovery.start({
     *     discovery_redirect_url: 'https://example.com/oauth/login',
     *     custom_scopes: 'profile avatar',
     *   })
     * }, [stytch]);
     * return (
     *   <Button onClick={loginWithGoogle}> Log in with IDP </Button>
     * );
     *
     * @param data - An {@link B2BOAuthDiscoveryStartOptions} object
     *
     * @returns void - the browser is redirected during this function call. You should not attempt to run any code after calling this function.
     *
     * @throws A `StytchSDKUsageError` when called with invalid input.
     */
    start(data: B2BOAuthDiscoveryStartOptions): Promise<void>;
  };
}

export interface IHeadlessB2BOAuthClient<TProjectConfiguration extends StytchProjectConfigurationInput> {
  google: IOAuthProvider;
  microsoft: IOAuthProvider;
  hubspot: IOAuthProvider;
  slack: IOAuthProvider;
  github: IOAuthProvider;

  /**
   * The `authenticate` method wraps the {@link https://stytch.com/docs/b2b/api/authenticate-oauth Authenticate OAuth} API endpoint which validates the OAuth token passed in.
   *
   * @example
   *  stytch.oauth.authenticate({
   *    oauth_token: token,
   *    session_duration_minutes: 60,
   *  });
   *
   * @param data - An {@link OAuthStartOptions} object
   *
   * @returns void - the browser is redirected during this function call. You should not attempt to run any code after calling this function.
   *
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  authenticate(data: B2BOAuthAuthenticateOptions): Promise<B2BOAuthAuthenticateResponse<TProjectConfiguration>>;
  discovery: {
    /**
     * The authenticate method wraps the {@link https://stytch.com/docs/b2b/api/authenticate-discovery-oauth Authenticate Discovery OAuth} API endpoint which validates the OAuth token passed in.
     * If this method succeeds, the intermediate session token will be stored in the browser as a cookie.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/oauth#discovery-authenticate Stytch Docs} for a complete reference.
     *
     * @example
     * stytch.oauth.discovery.authenticate({
     *   discovery_oauth_token: 'token',
     * });
     *
     * @param data - {@link OAuthDiscoveryAuthenticateOptions}
     *
     * @returns A {@link B2BOAuthDiscoveryAuthenticateResponse} indicating that the OAuth flow has been authenticated.
     *
     * @throws A `StytchAPIError` when the Stytch API returns an error.
     * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
     */
    authenticate(
      data: OAuthDiscoveryAuthenticateOptions,
    ): Promise<B2BOAuthDiscoveryAuthenticateResponse<TProjectConfiguration>>;
  };
}
