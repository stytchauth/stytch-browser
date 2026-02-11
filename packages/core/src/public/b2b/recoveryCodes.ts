import { ResponseCommon, SDKDeviceHistory, SessionDurationOptions } from '../common';
import { StytchProjectConfigurationInput } from '../typeConfig';
import { B2BAuthenticateResponse } from './common';

export type RecoveryCodeRecoverOptions = SessionDurationOptions & {
  /**
   * The ID of the organization the member belongs to
   */
  organization_id: string;

  /**
   * The ID of the member creating a TOTP
   */
  member_id: string;

  /**
   * The recovery code to authenticate.
   */
  recovery_code: string;
};

// B2BRecoveryCodesRecoverResponse
export type RecoveryCodeRecoverResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = B2BAuthenticateResponse<TProjectConfiguration> & {
  /**
   * Number of recovery codes remaining for the member.
   */
  recovery_codes_remaining: number;

  /**
   * The device history of the member.
   */
  member_device?: SDKDeviceHistory;
};

export type RecoveryCodeRotateResponse = ResponseCommon & {
  /**
   * The recovery codes used to authenticate the member without an authenticator app.
   */
  recovery_codes: string[];
};

export type RecoveryCodeGetResponse = ResponseCommon & {
  /**
   * The recovery codes used to authenticate the member in place of a secondary factor.
   */
  recovery_codes: string[];
};

export interface IHeadlessB2BRecoveryCodesClient<TProjectConfiguration extends StytchProjectConfigurationInput> {
  /**
   * The Recovery Codes Recover method wraps the {@link https://stytch.com/docs/b2b/api/recovery-codes-recover Recovery Codes Recover}API endpoint.
   * It takes a single `recovery_code` parameter, which is a recovery code that was previously generated for the Member. Calling
   * the recover endpoint will consume the recovery code and authenticate the Member, minting a new session for them.
   *
   * Currently, recovery codes are only generated when a Member enrolls in TOTP as their secondary MFA factor, and as such
   * authenticate members in place of a `stytch.totps.authenticate()`.
   *
   * If neither a Member Session nor an intermediate session token is present, this method will fail.
   *
   * @example
   * ```
   * stytch.recoveryCodes.recover({ recovery_code: '12345678' });
   * ```
   *
   * @param options - {@link RecoveryCodeRecoverOptions}
   *
   * @returns A {@link RecoveryCodeRecoverResponse} indicating that the member has been authenticated.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  recover(options: RecoveryCodeRecoverOptions): Promise<RecoveryCodeRecoverResponse<TProjectConfiguration>>;

  /**
   * The Rotate Recovery Codes method wraps the {@link https://stytch.com/docs/b2b/api/recovery-codes-rotate Rotate Recovery Codes} API endpoint.
   *
   * Rotation requires a logged-in Member Session, as both `organization_id` and `member_id` will be inferred from the session.
   * All existing recovery codes will be invalidated and new ones will be generated.
   *
   * @example
   * ```
   * stytch.recoveryCodes.rotate();
   * ```
   *
   * @returns A {@link RecoveryCodeRotateResponse} indicating that the member's recovery codes have been rotated.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  rotate(): Promise<RecoveryCodeRotateResponse>;

  /**
   * The Get Recovery Codes method wraps the {@link https://stytch.com/docs/b2b/api/recovery-codes-get Get Recovery Codes} API endpoint.
   * Both the `organization_id` and `member_id` for this request will be inferred from the current Member's session.
   * @example
   * ```
   * stytch.recoveryCodes.get();
   * ```
   *
   * @returns A {@link RecoveryCodeGetResponse} containing the member's recovery codes.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  get(): Promise<RecoveryCodeGetResponse>;
}
