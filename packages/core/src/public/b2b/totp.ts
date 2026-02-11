import { SDKDeviceHistory, SessionDurationOptions } from '../common';
import { StytchProjectConfigurationInput } from '../typeConfig';
import { B2BAuthenticateResponse, MemberResponseCommon } from './common';

export type B2BTOTPCreateOptions = {
  /**
   * The ID of the organization the member belongs to
   */
  organization_id: string;

  /**
   * The ID of the member creating a TOTP
   */
  member_id: string;
  /**
   * The expiration for the TOTP instance. If the newly created TOTP is not authenticated within this time frame the TOTP will be unusable. Defaults to 60 (1 hour) with a minimum of 5 and a maximum of 1440.
   */
  expiration_minutes?: number;
};

export type B2BTOTPCreateResponse = MemberResponseCommon & {
  /**
   * Globally unique UUID that identifies a specific TOTP registration in the Stytch API.
   */
  totp_registration_id: string;
  /**
   * The TOTP secret key shared between the authenticator app and the server used to generate TOTP codes.
   */
  secret: string;
  /**
   * The QR code image encoded in base64.
   */
  qr_code: string;
  /**
   * The recovery codes used to authenticate the member without an authenticator app.
   */
  recovery_codes: string[];
};

export type B2BTOTPAuthenticateOptions = SessionDurationOptions & {
  /**
   * The ID of the organization the member belongs to
   */
  organization_id: string;

  /**
   * The ID of the member to authenticate
   */
  member_id: string;

  /**
   * The TOTP code to authenticate
   */
  code: string;

  /**
   * If set to 'enroll', enrolls the member in MFA by setting the "mfa_enrolled" boolean to true.
   * If set to 'unenroll', unenrolls the member in MFA by setting the "mfa_enrolled" boolean to false.
   * If not set, does not affect the member's MFA enrollment.
   */
  set_mfa_enrollment?: 'enroll' | 'unenroll';

  /**
   * If set to true, sets TOTP as the member's default MFA method.
   */
  set_default_mfa?: boolean;
};

// B2BTOTPsAuthenticateResponse
export type B2BTOTPAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = B2BAuthenticateResponse<TProjectConfiguration> & {
  /**
   * The device history of the member.
   */
  member_device?: SDKDeviceHistory;
};

export interface IHeadlessB2BTOTPsClient<TProjectConfiguration extends StytchProjectConfigurationInput> {
  /**
   * The TOTP Authenticate method wraps the {@link https://stytch.com/docs/b2b/api/authenticate-totp authenticate TOTP} API endpoint.
   *
   * If there is a current Member Session, the SDK will call the endpoint with the session token.
   * This will add the totp factor to the existing Member Session.
   * Otherwise, the SDK will use the intermediate session token.
   * This will consume the intermediate session token and create a Member Session.
   *
   * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/otps#totp-authenticate Stytch Docs} for a complete reference.
   *
   * @example
   * stytch.totp.authenticate({
   *   organization_id: 'organization-test-123',
   *   member_id: 'member-id-123',
   *   code: '123456',
   * });
   *
   * @param data - {@link B2BTOTPAuthenticateOptions}
   *
   * @returns A {@link B2BTOTPAuthenticateResponse} indicating that the TOTP factor has been authenticated
   * and added to the member's session.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  authenticate(data: B2BTOTPAuthenticateOptions): Promise<B2BTOTPAuthenticateResponse<TProjectConfiguration>>;

  /**
   * The TOTP Create method wraps the {@link https://stytch.com/docs/b2b/api/totp-create create} endpoint.
   * Call this method to create a TOTP registration on an existing Member.
   *
   * @example
   * ```
   * stytch.totp.create({ expiration_minutes: 60 });
   * ```
   *
   * @param options - {@link B2BTOTPCreateOptions}
   *
   * @returns A {@link B2BTOTPCreateResponse} indicating a new TOTP instance has been created.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  create(options: B2BTOTPCreateOptions): Promise<B2BTOTPCreateResponse>;
}
