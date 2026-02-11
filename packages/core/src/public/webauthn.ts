import {
  AuthenticateResponse,
  ResponseCommon,
  SDKDeviceHistory,
  SessionDurationOptions,
  WebAuthnRegistration,
} from './common';
import { StytchProjectConfigurationInput } from './typeConfig';

export type WebAuthnRegisterStartOptions = SessionDurationOptions & {
  /**
   * The domain for the WebAuthn registration.
   * @default window.location.hostname
   */
  domain?: string;
  /**
   * The requested authenticator type of the WebAuthn device. The two valid values are `platform` and `cross-platform`. If no value passed, we assume both values are allowed.
   */
  authenticator_type?: 'platform' | 'cross-platform';
  /**
   * Whether the flow should be optimized for Passkeys.
   */
  is_passkey?: boolean;
  /**
   * The desired ID for the `user` key in the `public_key_credential_creation_options` response field. The default is the User's ID.
   */
  override_id?: string;
  /**
   * The desired name for the `user` key in the `public_key_credential_creation_options` response field. The default is the User's name, email, or phone number.
   */
  override_name?: string;
  /**
   * The desired display_name for the `user` key in the `public_key_credential_creation_options` response field. The default is the User's name, email, or phone number.
   */
  override_display_name?: string;
  /**
   * If true, will encode credentials using base64 URL encoding instead of base64 standard encoding. Defaults to false.
   */
  use_base64_url_encoding?: boolean;
};

export type WebAuthnRegisterStartResponse = ResponseCommon & {
  /**
   * The user ID of an active user the WebAuthn registration is for.
   */
  user_id: string;
  /**
   * Options used for WebAuthn registration.
   */
  public_key_credential_creation_options: string;
};

export type WebAuthnRegisterResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = AuthenticateResponse<TProjectConfiguration> & {
  /**
   * A unique ID that identifies a specific WebAuthn registration.
   */
  webauthn_registration_id: string;
};

export type WebAuthnAuthenticateStartOptions = SessionDurationOptions & {
  /**
   * The domain for the WebAuthn registration.
   */
  domain?: string;
  /**
   * Whether the flow should be optimized for Passkeys.
   */
  is_passkey?: boolean;
  /**
   * Whether to use conditional mediation (autofill) in the authentication flow.
   */
  conditional_mediation?: boolean;
  /**
   * An optional `AbortSignal` to allow aborting the authentication process.
   */
  signal?: AbortSignal;

  /**
   * conditional_mediation requires a form input with webauthn autocomplete attribute.
   * The SDK will try to check for the presence of this element, but this check can
   * incorrectly fail if for example the input is inside a shadow DOM.
   * Setting this to false will override this check.
   */
  disable_input_check?: boolean;
};

export type WebAuthnAuthenticateStartResponse = ResponseCommon & {
  /**
   * The user ID of an active user the WebAuthn authentication is for.
   */
  userId: string;
  /**
   * Options used for WebAuthn authentication.
   */
  public_key_credential_request_options: string;
};

export type WebAuthnAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = AuthenticateResponse<TProjectConfiguration> & {
  /**
   * A unique ID that identifies a specific WebAuthn registration.
   */
  webauthn_registration_id: string;
  /**
   * The device history of the user.
   */
  user_device?: SDKDeviceHistory;
};

export type WebAuthnUpdateOptions = {
  /**
   * A unique ID that identifies a specific WebAuthn registration.
   */
  webauthn_registration_id: string;
  /**
   * A readable name for the registration.
   */
  name: string;
};

export type WebAuthnUpdateResponse = ResponseCommon & {
  /**
   * The webauthn registration object.
   */
  webauthn_registration: WebAuthnRegistration;
};

export interface IHeadlessWebAuthnClient<TProjectConfiguration extends StytchProjectConfigurationInput> {
  /**
   * Wraps Stytch's {@link https://stytch.com/docs/api/webauthn-register-start register_start} and {@link https://stytch.com/docs/api/webauthn-register register} WebAuthn endpoints and the [navigator.credentials](https://developer.mozilla.org/en-US/docs/Web/API/CredentialsContainer/create) web API. Call this method to prompt the user to enroll a new WebAuthn factor and save the factor in Stytch.
   *
   * Call `webauthn.register` inside an event callback triggered by a user gesture.
   *
   * You can listen for successful user updates anywhere in the codebase with the `stytch.user.onChange()` method or `useStytchUser()` hook if you are using React.
   *
   * **Note:** If a user has enrolled another MFA method, this method will require MFA. See the {@link https://stytch.com/docs/sdks/javascript-sdk/resources/mfa Multi-factor authentication} section for more details.
   *
   * @example
   * ```
   * const registerWebAuthn = useCallback(() => {
   *  stytchClient.register({
   *    domain: 'subdomain.example.com',
   *    authenticator_type: 'platform'
   *  });
   * }, [stytchClient]);
   * ```
   *
   * @param options - {@link WebAuthnRegisterStartOptions}
   *
   * @returns A {@link WebAuthnRegisterResponse} indicating WebAuthn has been registered.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  register(options?: WebAuthnRegisterStartOptions): Promise<WebAuthnRegisterResponse<TProjectConfiguration>>;
  /**
   * Wraps Stytch's {@link https://stytch.com/docs/api/webauthn-authenticate-start authenticate_start} and {@link https://stytch.com/docs/api/webauthn-authenticate authenticate} WebAuthn endpoints and the [navigator.credentials](https://developer.mozilla.org/en-US/docs/Web/API/CredentialsContainer/create) web API. Call this method to prompt the user to enroll a new WebAuthn factor and save the factor in Stytch.
   *
   * Call `webauthn.authenticate` inside an event callback triggered by a user gesture.
   *
   * You can listen for successful user updates anywhere in the codebase with the `stytch.user.onChange()` method or `useStytchUser()` hook if you are using React.
   *
   * @example
   * ```
   * const authenticateWebAuthn = useCallback(() => {
   *  stytchClient.webauthn.authenticate({
   *    domain: 'subdomain.example.com',
   *    session_duration_minutes: 60,
   *  });
   * }, [stytchClient]);
   * ```
   *
   * @param options - {@link WebAuthnAuthenticateStartOptions}
   *
   * @returns A {@link WebAuthnAuthenticateResponse} indicating the WebAuthn registration has been authenticated.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  authenticate(
    options: WebAuthnAuthenticateStartOptions,
  ): Promise<WebAuthnAuthenticateResponse<TProjectConfiguration> | null>;
  /**
   * Allows a WebAuthn registration to be updated with a different name.
   */
  update(options: WebAuthnUpdateOptions): Promise<WebAuthnUpdateResponse>;
  /**
   * Determines if the browser supports autofill. If it does, we recommend using `conditional_mediation` when authenticating.
   */
  browserSupportsAutofill(): Promise<boolean>;
}
