import { ExtractOpaqueTokens, IfOpaqueTokens, RedactedToken } from '../typeConfig';
import { Redacted } from '../utils/Redacted';
import { Session } from './session';
import { StytchProjectConfigurationInput } from './typeConfig';

export type ResponseCommon = {
  /**
   * Globally unique UUID that is returned with every API call.
   * This value is important to log for debugging purposes;
   * Stytch may ask for this value to help identify a specific API call when helping you debug an issue.
   */
  request_id: string;
  /**
   * The HTTP status code of the response.
   * Stytch follows standard HTTP response status code patterns, e.g. 2XX values equate to success,
   * 3XX values are redirects, 4XX are client errors, and 5XX are server errors.
   */
  status_code: number;
};

export type User = {
  /**
   * The timestamp of the user's creation.
   * Values conform to the RFC 3339 standard and are expressed in UTC, e.g. `2021-12-29T12:33:09Z`.
   */
  created_at: string;
  /**
   * The `crypto_wallets` array contains a list of all crypto wallets that a user has linked via Stytch.
   */
  crypto_wallets: {
    /**
     * Globally unique UUID that identifies a specific crypto wallet in the Stytch API.
     * The `crypto_wallet_id` is used when you need to operate on a specific user's crypto wallet, e.g. to remove the crypto wallet from the Stytch user.
     */
    crypto_wallet_id: string;
    /**
     * The `crypto_wallet_address` is the actual blockchain address of this user's crypto wallet.
     */
    crypto_wallet_address: string;
    /**
     * The `crypto_wallet_type` is the blockchain that the user's crypto wallet operates on, e.g. Ethereum, Solana, etc.
     */
    crypto_wallet_type: string;
    /**
     * The `verified` boolean denotes whether or not this method has been successfully authenticated by the user.
     */
    verified: boolean;
  }[];
  /**
   * The `emails` array contains an array of `email` objects for the user.
   */
  emails: {
    /**
     * The email address.
     */
    email: string;
    /**
     * Globally unique UUID that identifies a specific email address in the Stytch API.
     * The `email_id` is used when you need to operate on a specific user's email address,
     * e.g. to delete the email address from the Stytch user.
     */
    email_id: string;
    /**
     * The `verified` boolean denotes whether or not this method has been successfully authenticated by the user.
     */
    verified: boolean;
  }[];
  name: {
    first_name: string;
    last_name: string;
    middle_name: string;
  };
  /**
   * A JSON object containing application-specific metadata.
   * This field can only be updated by a direct API integration.
   * Use it to store fields that a user should not be allowed to edit without backend validation - such as `role` or `subscription_status`.
   * See our {@link https://stytch.com/docs/api/metadata metadata reference} for complete details.
   */
  trusted_metadata: Record<string, unknown>;
  /**
   * A JSON object containing application-specific metadata.
   * Use it to store fields that a user can be allowed to edit directly without backend validation - such as `display_theme` or `preferred_locale`.
   * See our {@link https://stytch.com/docs/api/metadata metadata reference} for complete details.
   */
  untrusted_metadata: Record<string, unknown>;
  /**
   * The `phone_numbers` array contains an array of phone number objects for the user.
   */
  phone_numbers: {
    /**
     * A phone number.
     */
    phone_number: string;
    /**
     * Globally unique UUID that identifies a specific phone number in the Stytch API.
     * The `phone_id` is used when you need to operate on a specific user's phone number,
     * e.g. to delete the phone number from the Stytch user.
     */
    phone_id: string;
    /**
     * The `verified` boolean denotes whether or not this method has been successfully authenticated by the user.
     */
    verified: boolean;
  }[];
  /**
   * The `providers` array contains an array of provider objects for the user, i.e. which OAuth providers the user has used to link their account.
   */
  providers: {
    /**
     * Globally unique UUID that identifies singluar registration of a user with an OAuth identity provider in the Stytch API.
     */
    oauth_user_registration_id: string;
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
  }[];
  /**
   * The `password` object is returned for users with a password.
   */
  password: null | {
    /**
     * Globally unique UUID that identifies a specific password in the Stytch API.
     */
    password_id: string;
    /**
     * The `requires_reset` field indicates whether the user will need to reset their password to use it in the future.
     * See {@link https://stytch.com/docs/api/password-authenticate the API docs} for explanations of scenarios where
     * this might be required.
     */
    requires_reset: boolean;
  };
  /**
   * The `status` value denotes whether or not a user has successfully logged in at least once with any available login method.
   * Possible values are `active` and `pending`.
   */
  status: 'active' | 'pending';
  /**
   * The `totps` array contains a list of all TOTP instances for a given user in the Stytch API.
   */
  totps: {
    /**
     * Globally unique UUID that identifies a specific TOTP instance in the Stytch API.
     * The `totp_id` is used when you need to operate on a specific user's TOTP instance, e.g. to delete the TOTP instance from the Stytch user.
     */
    totp_id: string;
    /**
     * The `verified` boolean denotes whether or not this method has been successfully authenticated by the user.
     */
    verified: boolean;
  }[];
  /**
   * Globally unique UUID that identifies a specific user in the Stytch API.
   * The user_id critical to perform operations on a user in our API, like Get user, Delete user, etc,
   * so be sure to preserve this value.
   */
  user_id: string;
  /**
   * The `webauthn_registrations` array contains a list of all WebAuthn registrations for a given user in the Stytch API.
   */
  webauthn_registrations: WebAuthnRegistration[];
  /**
   * The `biometric_registrations` array contains a list of all Biometric registrations for a given user in the Stytch API.
   */
  biometric_registrations: {
    /**
     * Globally unique UUID that identifies a specific Biometric registration in the Stytch API.
     * The `biometric_registration_id` is used when you need to operate on a specific user's Biometric registration,
     * e.g. to delete the Biometric instance from the Stytch user.
     */
    biometric_registration_id: string;
    /**
     * The `verified` boolean denotes whether or not this method has been successfully authenticated by the user.
     */
    verified: boolean;
  }[];
  /**
   * The `roles` array contains a list of all roles assigned to a given user in the Stytch API.
   */
  roles: string[];
  /**
   * The external ID of the user.
   */
  external_id?: string;
};

export type WebAuthnRegistration = {
  /**
   * The `domain` on which a WebAuthn registration was started.
   * This will be the domain of your app.
   */
  domain: string;
  /**
   * The `user_agent` of the user's browser or device.
   */
  user_agent: string;
  /**
   * The `authenticator_type` string displays the requested authenticator type of the WebAuthn device.
   * The two valid types are "platform" and "cross-platform".
   * If no value is present, the WebAuthn device was created without an authenticator type preference.
   */
  authenticator_type: string;
  /**
   * The `verified` boolean denotes whether or not this method has been successfully authenticated by the user.
   */
  verified: boolean;
  /**
   * Globally unique UUID that identifies a specific WebAuthn registration in the Stytch API.
   * The `webauthn_registration_id` is used when you need to operate on a specific user's WebAuthn registration,
   * e.g. to delete the WebAuthn instance from the Stytch user.
   */
  webauthn_registration_id: string;
  /**
   * The name of the WebAuthn device. We randomly generate the field to begin with but you can update it to a
   * custom value via the {@link https://stytch.com/docs/api/webauthn-update WebAuthnUpdate} endpoint.
   */
  name: string;
};

type SessionTokens = {
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

export type AuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = ResponseCommon & {
  /**
   * Globally unique UUID that identifies a specific user in the Stytch API.
   * The user_id critical to perform operations on a user in our API, like Get user, Delete user, etc,
   * so be sure to preserve this value.
   */
  user_id: string;

  /**
   * The Session object created.
   * See {@link Session} for details.
   */
  session: Session;
  /**
   * The user object affected by this API call.
   * See the {@link https://stytch.com/docs/api/get-user Get user} endpiont for complete response field detail.
   */
  user: User;
} & IfOpaqueTokens<ExtractOpaqueTokens<TProjectConfiguration>, Redacted<SessionTokens, RedactedToken>, SessionTokens>;

export type DeleteResponse = ResponseCommon & {
  /**
   * Globally unique UUID that identifies a specific user in the Stytch API.
   * The user_id critical to perform operations on a user in our API, like Get user, Delete user, etc,
   * so be sure to preserve this value.
   */
  user_id: string;
};

export type UpdateResponse = ResponseCommon & {
  /**
   * Globally unique UUID that identifies a specific user in the Stytch API.
   * The user_id critical to perform operations on a user in our API, like Get user, Delete user, etc,
   * so be sure to preserve this value.
   */
  user_id: string;
};

export type SessionDurationOptions = {
  /**
   * Set the session lifetime to be this many minutes from now.
   * This will return both an opaque `session_token` and `session_jwt` for this session, which will automatically be stored in the browser cookies.
   * The `session_jwt` will have a fixed lifetime of five minutes regardless of the underlying session duration, and will be automatically refreshed by the SDK in the background over time.
   * This value must be a minimum of 5 and may not exceed the maximum session duration minutes value set in the
   * {@link https://stytch.com/dashboard/sdk-configuration SDK Configuration } page of the Stytch dashboard.
   */
  session_duration_minutes: number;
};

export type UnsubscribeFunction = () => void;

export type StytchClientOptions = {
  cookieOptions?: {
    /**
     * The name of the cookie containing the opaque Stytch session token.
     * Defaults to `stytch_session`
     */
    opaqueTokenCookieName?: string;

    /**
     * The name of the cookie containing the opaque Stytch session token.
     * Defaults to `stytch_session_jwt`
     */
    jwtCookieName?: string;

    /**
     * The name of the cookie containing the Stytch intermediate session token.
     * Defaults to `stytch_intermediate_session_token`
     */
    istCookieName?: string;

    /**
     * What HTTP path the cookies should be available on.
     * Equal to configuring the `;path=${}` param in the set-cookie directive.
     * Defaults to unset.
     */
    path?: string;

    /**
     * What domain the cookies should be available on.
     * Equal to configuring the `;domain=${}` param in the set-cookie directive.
     * The domain _must_ match the domain of the Javascript origin the SDK is running on.
     * Also requires setting availableToSubdomains: true to have any effect.
     * Defaults to unset.
     */
    domain?: string;

    /**
     * Whether to make the cookies available to subdomains.
     * When true, equivalent to configuring the `;domain=${window.location.host}` directive
     * When false, equivalent to leaving the directive unset
     * Defaults to false.
     */
    availableToSubdomains?: boolean;

    // TODO: Should this be a knob we expose?
    /**
     * Which session persistence artifacts to set as cookies - either opaque tokens, JWTs, or both.
     * Defaults to both.
     */
    // cookies?: 'opaqueToken' | 'jwt' | 'both';
  };

  /**
   * The custom domain to use for Stytch API calls. Defaults to
   * `api.stytch.com`.
   */
  customBaseUrl?: string;

  /**
   * The custom domain to use for DFP Protected Auth. You must contact Stytch support to set up the domain
   * prior to using it in the SDK.
   */
  dfppaUrl?: string;

  /**
   * The custom domain to use for the DFP Protected Auth CDN to load the telemetry.js script.
   */
  dfpCdnUrl?: string;

  /**
   * @deprecated dfppaDomain and dfpCdnDomain are now configured as dfppaUrl and dfpCdnUrl directly under StytchClientOptions
   *   apiDomain and testApiDomain are now configured using customBaseUrl directly under StytchClientOptions
   */
  endpointOptions?: {
    /**
     * The custom domain to use for Stytch API calls. Defaults to
     * `api.stytch.com`.
     *
     * This value is only used for live projects, not test projects.
     */
    apiDomain?: string;
    /**
     * The custom domain to use for Stytch API calls. Defaults to
     * `test.stytch.com`.
     *
     * This value is only used for test projects, not live projects.
     */
    testApiDomain?: string;
    /**
     * The custom domain to use for DFP Protected Auth. You must contact Stytch support to set up the domain
     * prior to using it in the SDK.
     */
    dfppaDomain?: string;
    /**
     * The custom domain to use for the DFP Protected Auth CDN to load the telemetry.js script.
     */
    dfpCdnDomain?: string;
  };

  /**
   * If true, the session will be automatically extended when the user has the
   * application open.
   */
  keepSessionAlive?: boolean;

  // persistenceMode?: 'cookie' | 'localStorage' | 'none';
};

export type ConsumerState = {
  user?: User;
  session?: Session;
};

export type locale = 'en' | 'es' | 'pt-br' | string;

export type MemberEmailUpdateDeliveryMethod = 'EMAIL_MAGIC_LINK' | 'EMAIL_OTP';

export type DeviceAttributeDetails = {
  is_new: boolean;
  first_seen_at?: string; // ISO 8601 timestamp string
  last_seen_at?: string; // ISO 8601 timestamp string
};

export type SDKDeviceHistory = {
  ip_address?: string;
  ip_address_details?: DeviceAttributeDetails;
  ip_geo_city?: string;
  ip_geo_region?: string;
  ip_geo_country?: string;
  ip_geo_country_details?: DeviceAttributeDetails;
};

export type ConnectedAppPublic = {
  client_id: string;
  client_type: string;
  client_name: string;
  client_description: string;
  client_logo_url?: string;
};

export type ScopeResult = {
  scope: string;
  is_grantable: boolean;
  description: string;
};
