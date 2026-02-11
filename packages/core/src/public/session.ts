import { ExtractOpaqueTokens, IfOpaqueTokens } from '../typeConfig';
import { Cacheable } from '../utils';
import { AuthenticateResponse, ResponseCommon, SessionDurationOptions, UnsubscribeFunction } from './common';
import { StytchProjectConfigurationInput } from './typeConfig';

// Factors

export interface EmailFactor {
  delivery_method: 'email' | 'embedded';
  type: string;
  last_authenticated_at: string;
  email_factor: {
    email_id: string;
    email_address: string;
  };
}

export interface PhoneNumberFactor {
  delivery_method: 'sms' | 'whatsapp';
  type: string;
  last_authenticated_at: string;
  phone_number_factor: {
    phone_id: string;
    phone_number: string;
  };
}

export interface GoogleOAuthFactor {
  delivery_method: 'oauth_google';
  type: string;
  last_authenticated_at: string;
  google_oauth_factor: {
    id: string;
    email_id: string;
    provider_subject: string;
  };
}

export interface MicrosoftOAuthFactor {
  delivery_method: 'oauth_microsoft';
  type: string;
  last_authenticated_at: string;
  microsoft_oauth_factor: {
    id: string;
    email_id: string;
    provider_subject: string;
  };
}

export interface AppleOAuthFactor {
  delivery_method: 'oauth_apple';
  type: string;
  last_authenticated_at: string;
  apple_oauth_factor: {
    id: string;
    email_id: string;
    provider_subject: string;
  };
}

export interface GithubOAuthFactor {
  delivery_method: 'oauth_github';
  type: string;
  last_authenticated_at: string;
  github_oauth_factor: {
    id: string;
    email_id: string;
    provider_subject: string;
  };
}

export interface GitLabOAuthFactor {
  delivery_method: 'oauth_gitlab';
  type: string;
  last_authenticated_at: string;
  gitlab_oauth_factor: {
    id: string;
    email_id: string;
    provider_subject: string;
  };
}

export interface FacebookOAuthFactor {
  delivery_method: 'oauth_facebook';
  type: string;
  last_authenticated_at: string;
  facebook_oauth_factor: {
    id: string;
    email_id: string;
    provider_subject: string;
  };
}

export interface DiscordOAuthFactor {
  delivery_method: 'oauth_discord';
  type: string;
  last_authenticated_at: string;
  discord_oauth_factor: {
    id: string;
    email_id: string;
    provider_subject: string;
  };
}

export interface SalesforceOAuthFactor {
  delivery_method: 'oauth_salesforce';
  type: string;
  last_authenticated_at: string;
  salesforce_oauth_factor: {
    id: string;
    email_id: string;
    provider_subject: string;
  };
}

export interface SlackOAuthFactor {
  delivery_method: 'oauth_slack';
  type: string;
  last_authenticated_at: string;
  slack_oauth_factor: {
    id: string;
    email_id: string;
    provider_subject: string;
  };
}

export interface AmazonOAuthFactor {
  delivery_method: 'oauth_amazon';
  type: string;
  last_authenticated_at: string;
  amazon_oauth_factor: {
    id: string;
    email_id: string;
    provider_subject: string;
  };
}

export interface BitbucketOAuthFactor {
  delivery_method: 'oauth_bitbucket';
  type: string;
  last_authenticated_at: string;
  bitbucket_oauth_factor: {
    id: string;
    email_id: string;
    provider_subject: string;
  };
}

export interface LinkedInOAuthFactor {
  delivery_method: 'oauth_linkedin';
  type: string;
  last_authenticated_at: string;
  linkedin_oauth_factor: {
    id: string;
    email_id: string;
    provider_subject: string;
  };
}

export interface CoinbaseOAuthFactor {
  delivery_method: 'oauth_coinbase';
  type: string;
  last_authenticated_at: string;
  coinbase_oauth_factor: {
    id: string;
    email_id: string;
    provider_subject: string;
  };
}

export interface TwitchOAuthFactor {
  delivery_method: 'oauth_twitch';
  type: string;
  last_authenticated_at: string;
  twitch_oauth_factor: {
    id: string;
    email_id: string;
    provider_subject: string;
  };
}

export interface TwitterOAuthFactor {
  delivery_method: 'oauth_twitter';
  type: string;
  last_authenticated_at: string;
  twitter_oauth_factor: {
    id: string;
    provider_subject: string;
  };
}

export interface TikTokOAuthFactor {
  delivery_method: 'oauth_tiktok';
  type: string;
  last_authenticated_at: string;
  tiktok_oauth_factor: {
    id: string;
    provider_subject: string;
  };
}

export interface FigmaOAuthFactor {
  delivery_method: 'oauth_figma';
  type: string;
  last_authenticated_at: string;
  figma_oauth_factor: {
    id: string;
    email_id: string;
    provider_subject: string;
  };
}

export interface SnapchatOAuthFactor {
  delivery_method: 'oauth_snapchat';
  type: string;
  last_authenticated_at: string;
  snapchat_oauth_factor: {
    id: string;
    provider_subject: string;
  };
}

export interface YahooOAuthFactor {
  delivery_method: 'oauth_yahoo';
  type: string;
  last_authenticated_at: string;
  yahoo_oauth_factor: {
    id: string;
    email_id: string;
    provider_subject: string;
  };
}

export interface WebAuthnFactor {
  delivery_method: 'webauthn_registration';
  type: string;
  last_authenticated_at: string;
  webauthn_factor: {
    webauthn_registration_id: string;
    domain: string;
    user_agent: string;
  };
}

export interface AuthenticatorAppFactor {
  delivery_method: 'authenticator_app';
  type: string;
  last_authenticated_at: string;
  authenticator_app_factor: {
    totp_id: string;
  };
}

export interface RecoveryCodeFactor {
  delivery_method: 'recovery_code';
  type: string;
  last_authenticated_at: string;
  recovery_code_factor: {
    totp_recovery_code_id: string;
  };
}

export interface CryptoWalletFactor {
  delivery_method: 'crypto_wallet';
  type: string;
  last_authenticated_at: string;
  crypto_wallet_factor: {
    crypto_wallet_id: string;
    crypto_wallet_address: string;
    crypto_wallet_type: string;
  };
}

export interface PasswordFactor {
  delivery_method: 'knowledge';
  type: string;
  last_authenticated_at: string;
}

export interface BiometricFactor {
  delivery_method: 'biometric';
  type: string;
  last_authenticated_at: string;
  biometric_factor: {
    biometric_registration_id: string;
  };
}

export interface AccessTokenExchangeFactor {
  delivery_method: 'oauth_access_token_exchange';
  type: string;
  last_authenticated_at: string;
  oauth_access_token_exchange_factor: {
    client_id: string;
  };
}

export type AuthenticationFactor =
  | EmailFactor
  | PhoneNumberFactor
  | GoogleOAuthFactor
  | MicrosoftOAuthFactor
  | AppleOAuthFactor
  | GithubOAuthFactor
  | GitLabOAuthFactor
  | FacebookOAuthFactor
  | DiscordOAuthFactor
  | SalesforceOAuthFactor
  | SlackOAuthFactor
  | AmazonOAuthFactor
  | BitbucketOAuthFactor
  | LinkedInOAuthFactor
  | CoinbaseOAuthFactor
  | TwitchOAuthFactor
  | TwitterOAuthFactor
  | TikTokOAuthFactor
  | SnapchatOAuthFactor
  | FigmaOAuthFactor
  | YahooOAuthFactor
  | WebAuthnFactor
  | AuthenticatorAppFactor
  | RecoveryCodeFactor
  | CryptoWalletFactor
  | PasswordFactor
  | BiometricFactor
  | AccessTokenExchangeFactor;

export type Session = {
  attributes: {
    ip_address: string;
    user_agent: string;
  };
  /**
   * All the authentication factors that have been associated with the current session.
   * @example
   * const userIsMFAd = session.authentication_factors.length > 2;
   */
  authentication_factors: AuthenticationFactor[];
  /**
   * The timestamp of the session's expiration.
   * Values conform to the RFC 3339 standard and are expressed in UTC, e.g. `2021-12-29T12:33:09Z`.
   */
  expires_at: string;
  /**
   * The timestamp of the last time the session was accessed.
   * Values conform to the RFC 3339 standard and are expressed in UTC, e.g. `2021-12-29T12:33:09Z`.
   */
  last_accessed_at: string;
  /**
   * Globally unique UUID that identifies a specific session in the Stytch API.
   */
  session_id: string;
  /**
   * The timestamp of the session's creation.
   * Values conform to the RFC 3339 standard and are expressed in UTC, e.g. `2021-12-29T12:33:09Z`.
   */
  started_at: string;
  /**
   * Globally unique UUID that identifies a specific user in the Stytch API.
   */
  user_id: string;
  /**
   * A map of the custom claims associated with the session.
   * Custom claims can only be set from the server, they cannot be set using the clientside SDKs.
   * After claims have been added to a session, call {@link IHeadlessSessionClient#authenticate stytch.session.authenticate} to refresh the session state clientside.
   * See our {@link https://stytch.com/docs/sessions#using-sessions_custom-claims guide} for more information.
   * If no claims are set, this field will be null.
   */
  custom_claims: null | Record<string, unknown>;
  /**
   * A list of the roles associated with the session.
   */
  roles: string[];
};

export type SessionAuthenticateOptions = Partial<SessionDurationOptions>;

export type SessionAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = AuthenticateResponse<TProjectConfiguration>;

export type SessionAccessTokenExchangeOptions = SessionDurationOptions & {
  /**
   * The Connected Apps access token.
   */
  access_token: string;
};

export type SessionAccessTokenExchangeResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = AuthenticateResponse<TProjectConfiguration>;

export type SessionRevokeOptions = {
  /**
   * When true, clear the user and session object in the local storage, even in the event of a network failure revoking the session.
   * When false, the user and session object will not be cleared in the event that the SDK cannot contact the Stytch servers.
   * The user and session object will always be cleared when the session revoke call succeeds.
   * Defaults to false
   */
  forceClear?: boolean;
};

export type SessionRevokeResponse = ResponseCommon;

export type SessionAttestOptions = {
  /**
   * The ID of the token profile used to validate the JWT string.
   */
  profile_id: string;

  /**
   * JWT string.
   */
  token: string;
} & Partial<SessionDurationOptions> &
  Partial<SessionTokens>;

export type SessionAttestResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = AuthenticateResponse<TProjectConfiguration>;

export type SessionOnChangeCallback = (session: Session | null) => void;

export type SessionTokens = {
  /**
   * An opaque session token.
   * Session tokens need to be authenticated via the {@link https://stytch.com/docs/api/session-auth SessionsAuthenticate}
   * endpoint before a user takes any action that requires authentication
   * See {@link https://stytch.com/docs/sessions#session-tokens-vs-JWTs_tokens our documentation} for more information.
   */
  session_token: string;

  /**
   * A JSON Web Token that contains standard claims about the user as well as information about the Stytch session
   * Session JWTs can be authenticated locally without an API call.
   * A session JWT is signed by project-specific keys stored by Stytch.
   * You can retrieve your project's public keyset via our {@link https://stytch.com/docs/api/jwks-get GetJWKS} endpoint
   * See {@link https://stytch.com/docs/sessions#session-tokens-vs-JWTs_jwts our documentation} for more information.
   */
  session_jwt: string;
};

export type SessionTokensUpdate = {
  /**
   * An opaque session token.
   * Session tokens need to be authenticated via the {@link https://stytch.com/docs/api/session-auth SessionsAuthenticate}
   * endpoint before a user takes any action that requires authentication
   * See {@link https://stytch.com/docs/sessions#session-tokens-vs-JWTs_tokens our documentation} for more information.
   */
  session_token: string;

  /**
   * A JSON Web Token that contains standard claims about the user as well as information about the Stytch session
   * Session JWTs can be authenticated locally without an API call.
   * A session JWT is signed by project-specific keys stored by Stytch.
   * You can retrieve your project's public keyset via our {@link https://stytch.com/docs/api/jwks-get GetJWKS} endpoint
   * See {@link https://stytch.com/docs/sessions#session-tokens-vs-JWTs_jwts our documentation} for more information.
   */
  session_jwt?: string | null;
};

export type SessionInfo = Cacheable<{
  /**
   * The session object, or null if no session exists.
   */
  session: Session | null;
}>;

export interface IHeadlessSessionClient<TProjectConfiguration extends StytchProjectConfigurationInput> {
  /**
   * The SDK provides the `session.getSync` method to retrieve the current session.
   * The `session.onChange` method can be used to listen to session changes.
   *
   * If logged in, `session.getSync` returns the in-memory session object. Otherwise, it returns `null`.
   * @example
   * const sess = stytch.session.getSync();
   * const hasWebAuthn = sess.authentication_factors.find(
   *   factor => factor.delivery_method === 'webauthn_registration'
   * );
   * @returns The user's active {@link Session} object or `null`
   */
  getSync(): Session | null;

  /**
   * The `session.getInfo` method is similar to `session.getSync`, but it returns an object containing the `session` object and a `fromCache` boolean.
   * If `fromCache` is true, the session object is from the cache and a state refresh is in progress.
   */
  getInfo(): SessionInfo;

  /**
   * Returns the `session_token` and `session_jwt` values associated with the logged-in user's active session.
   *
   * Session tokens are only available if:
   * - There is an active session, and
   * - The session is _not_ managed via HttpOnly cookies.
   *
   * If either of these conditions is not met, `getTokens` will return `null`.
   *
   * Note that the Stytch SDK stores the `session_token` and `session_jwt` values as session cookies in the user's browser.
   * Those cookies will be automatically included in any request that your frontend makes to a service (such as your backend) that shares the domain set on the cookies, so in most cases, you will not need to explicitly retrieve the `session_token` and `session_jwt` values using the `getTokens()` method.
   * However, we offer this method to serve some unique use cases where explicitly retrieving the tokens is necessary.
   *
   * @example
   * const {session_jwt} = stytch.session.getTokens();
   * fetch('https://api.example.com, {
   *   headers: new Headers({
   *    'Authorization': 'Bearer ' + session_jwt,
   *    credentials: 'include',
   *   }),
   * })
   *
   */
  getTokens(): IfOpaqueTokens<ExtractOpaqueTokens<TProjectConfiguration>, never, SessionTokens | null>;

  /**
   * The `session.onChange` method takes in a callback that gets called whenever the session object changes.
   * It returns an unsubscribe method for you to call when you no longer want to listen for such changes.
   *
   * In React, the `@stytch/react` library provides the `useStytchSession` hook that implements these methods for you to easily access the session and listen for changes.
   *
   * @example
   * stytch.session.onChange((sess) => {
   *   if(!sess) {
   *     // The user has been logged out!
   *     window.location.href = 'https://example.com/login'
   *   }
   * })
   * @param callback - {@link SessionOnChangeCallback}
   */
  onChange(callback: SessionOnChangeCallback): UnsubscribeFunction;

  /**
   * Wraps Stytch's {@link https://stytch.com/docs/api/session-auth Authenticate} Session endpoint and validates that the session issued to the user is still valid.
   * The SDK will invoke this method automatically in the background.
   * You probably won't need to call this method directly.
   * It's recommended to use `session.getSync` and `session.onChange` instead.
   *
   * @example
   * stytch.session.authenticate({
   *   // Extend the session for another 60 minutes
   *   session_duration_minutes: 60
   * })
   * @param options - {@link SessionAuthenticateOptions}
   * @returns A {@link SessionAuthenticateResponse}
   */
  authenticate(options?: SessionAuthenticateOptions): Promise<SessionAuthenticateResponse<TProjectConfiguration>>;

  /**
   * Wraps Stytch's {@link https://stytch.com/docs/api/connected-app-access-token-exchange Exchange Access Token} endpoint and exchanges a Connected Apps token for a Session for the original User.
   * @example
   * stytch.session.exchangeAccessToken({
   *   access_token: 'eyJh...',
   *   session_duration_minutes: 60
   * })
   * @param options - {@link SessionAccessTokenExchangeOptions}
   * @returns A {@link SessionAccessTokenExchangeResponse}
   */
  exchangeAccessToken(
    options: SessionAccessTokenExchangeOptions,
  ): Promise<SessionAccessTokenExchangeResponse<TProjectConfiguration>>;

  /**
   * Wraps Stytch's {@link https://stytch.com/docs/api/session-revoke Revoke} Session endpoint and revokes the user's current session. This method should be used to log out a user.
   *
   * While calling this method, we clear the user and session objects from local storage
   * unless the SDK cannot contact the Stytch servers. This behavior can be overriden by using the optional param object.
   *
   * @param options - {@link SessionRevokeOptions}
   * @example
   * stytch.session.revoke()
   *   .then(() => window.location.href = 'https://example.com/login');
   * @returns A {@link SessionRevokeResponse}
   */
  revoke(options?: SessionRevokeOptions): Promise<SessionRevokeResponse>;

  /**
   * Update a user's session tokens to hydrate a front-end session from the backend.
   * For example, if you log your users in with one of our backend SDKs, you can pass the resulting `session_token` and `session_jwt` to this method to prime the frontend SDK with a valid set of tokens.
   * You must then make an {@link https://stytch.com/docs/api/session-auth authenticate} call to authenticate the session tokens and retrieve the user's current session.
   *
   * @param tokens - The session tokens to update to
   */
  updateSession(tokens: SessionTokensUpdate): void;

  /**
   * Wraps Stytch's {@link https://stytch.com/docs/api/attest-session Attest} Session endpoint and gets a Stytch session from a trusted JWT.
   *
   * @param data - {@link SessionAttestOptions}
   * @returns A {@link SessionAttestResponse}
   */
  attest(data: SessionAttestOptions): Promise<SessionAttestResponse<TProjectConfiguration>>;
}
