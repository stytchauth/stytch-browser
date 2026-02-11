import { AuthenticateResponse, ResponseCommon, SDKDeviceHistory, SessionDurationOptions } from './common';
import { StytchProjectConfigurationInput } from './typeConfig';

export type TOTPCreateOptions = {
  /**
   * The expiration for the TOTP instance. If the newly created TOTP is not authenticated within this time frame the TOTP will be unusable. Defaults to 60 (1 hour) with a minimum of 5 and a maximum of 1440.
   */
  expiration_minutes: number;
};

export type TOTPCreateResponse = ResponseCommon & {
  /**
   * Globally unique UUID that identifies a specific TOTP registration in the Stytch API.
   */
  totp_id: string;
  /**
   * The TOTP secret key shared between the authenticator app and the server used to generate TOTP codes.
   */
  secret: string;
  /**
   * The QR code image encoded in base64.
   */
  qr_code: string;
  /**
   * The recovery codes used to authenticate the user without an authenticator app.
   */
  recovery_codes: string[];
};

export type TOTPAuthenticateOptions = SessionDurationOptions & {
  /**
   * The TOTP code to authenticate. The TOTP code should consist of 6 digits.
   */
  totp_code: string;
};

// TOTPsAuthenticateResponse
export type TOTPAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = AuthenticateResponse<TProjectConfiguration> & {
  /**
   * Globally unique UUID that identifies a specific TOTP registration in the Stytch API.
   */
  totp_id: string;
  /**
   * The device history of the user.
   */
  user_device?: SDKDeviceHistory;
};

type TOTPRecovery = {
  /**
   * Globally unique UUID that identifies a specific TOTP registration in the Stytch API.
   */
  totp_id: string;
  /**
   * Indicates whether or not the TOTP registration has been verified by the user.
   */
  verified: boolean;
  /**
   * The recovery codes for the TOTP registration.
   */
  recovery_codes: string[];
};

export type TOTPRecoveryCodesResponse = ResponseCommon & {
  /**
   * Globally unique UUID that identifies a specific user in the Stytch API.
   */
  user_id: string;
  /**
   * See {@link TOTPRecovery}.
   */
  totps: TOTPRecovery;
};

export type TOTPRecoverOptions = SessionDurationOptions & {
  /**
   * The recovery code to authenticate.
   */
  recovery_code: string;
};

// TOTPsRecoverResponse
export type TOTPRecoverResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = AuthenticateResponse<TProjectConfiguration> & {
  /**
   * Globally unique UUID that identifies a specific TOTP registration in the Stytch API.
   */
  totp_id: string;
  /**
   * The device history of the user.
   */
  user_device?: SDKDeviceHistory;
};

export interface IHeadlessTOTPClient<TProjectConfiguration extends StytchProjectConfigurationInput> {
  /**
   * Wraps Stytch's {@link https://stytch.com/docs/api/totp-create Create} endpoint. Call this method to create a new TOTP instance for a user. The user can use the authenticator application of their choice to scan the QR code or enter the secret.
   *
   * You can listen for successful user updates anywhere in the codebase with the `stytch.user.onChange()` method or `useStytchUser()` hook if you are using React.
   *
   * **Note:** If a user has enrolled another MFA method, this method will require MFA. See the {@link https://stytch.com/docs/sdks/javascript-sdk/resources/mfa Multi-factor Authentication} section for more details.
   *
   * @example
   * ```
   * stytchClient.totps.create({ expiration_minutes: 60 });
   * ```
   *
   * @param options - {@link TOTPCreateOptions}
   *
   * @returns A {@link TOTPCreateResponse} indicating a new TOTP instance has been created.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  create(options: TOTPCreateOptions): Promise<TOTPCreateResponse>;
  /**
   * Wraps Stytch's {@link https://stytch.com/docs/api/totp-authenticate Authenticate} endpoint. Call this method to authenticate a TOTP code entered by a user.
   *
   * @example
   * ```
   * stytch.totps.authenticate({ totp_code: '123456', session_duration_minutes: 60 });
   * ```
   *
   * @param options - {@link TOTPAuthenticateOptions}
   *
   * @returns A {@link TOTPAuthenticateResponse} indicating the TOTP code has been authenticated.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  authenticate(options: TOTPAuthenticateOptions): Promise<TOTPAuthenticateResponse<TProjectConfiguration>>;
  /**
   * Wraps Stytch's {@link https://stytch.com/docs/api/totp-get-recovery-codes Recovery Codes} endpoint. Call this method to retrieve the recovery codes for a TOTP instance tied to a user.
   *
   * You can listen for successful user updates anywhere in the codebase with the `stytch.user.onChange()` method or `useStytchUser()` hook if you are using React.
   *
   * **Note:** If a user has enrolled another MFA method, this method will require MFA. See the {@link https://stytch.com/docs/sdks/javascript-sdk/resources/mfa Multi-factor authentication} section for more details.
   *
   * @example
   * ```
   * stytchClient.totps.recoveryCodes();
   * ```
   *
   * @returns A {@link TOTPRecoveryCodesResponse} containing the TOTP recovery codes tied to the user.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   */
  recoveryCodes(): Promise<TOTPRecoveryCodesResponse>;
  /**
   * Wraps Stytch's {@link https://stytch.com/docs/api/totp-recover Recover} endpoint. Call this method to authenticate a recovery code for a TOTP instance.
   *
   * @example
   * ```
   * stytch.totps.recover({ recovery_code: 'xxxx-xxxx-xxxx', session_duration_minutes: 60 });
   * ```
   *
   * @param options - {@link TOTPRecoverOptions}
   *
   * @returns A {@link TOTPRecoverResponse} indicating the TOTP recovery code has been authenticated.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  recover(options: TOTPRecoverOptions): Promise<TOTPRecoverResponse<TProjectConfiguration>>;
}
