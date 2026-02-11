import { locale, ResponseCommon, SDKDeviceHistory, SessionDurationOptions } from '../common';
import { StytchProjectConfigurationInput } from '../typeConfig';
import { B2BAuthenticateResponse, B2BAuthenticateResponseWithMFA } from './common';
import { B2BDiscoveryAuthenticateResponse } from './discovery';

// SMS OTP

export type B2BSMSSendOptions = {
  /**
   * The ID of the organization the member belongs to
   */
  organization_id: string;

  /**
   * The ID of the member to send the OTP to
   */
  member_id: string;

  /**
   * The phone number to send the OTP to. If the member already has a phone number, this argument is not needed.
   * If the member does not have a phone number and this argument is not provided, an error will be thrown.
   */
  mfa_phone_number?: string;

  /**
   * The locale is used to determine which language to use in the email. Parameter is a {@link https://www.w3.org/International/articles/language-tags/ IETF BCP 47 language tag}, e.g. "en".
   * Currently supported languages are English ("en"), Spanish ("es"), and Brazilian Portuguese ("pt-br"); if no value is provided, the copy defaults to English.
   */
  locale?: locale;

  /**
   * Indicates whether the SMS message should include autofill metadata
   */
  enable_autofill?: boolean;

  /**
   * Indicates how long the autofill session should be valid. Defaults to 5 minutes
   */
  autofill_session_duration_minutes?: number;
};

export type B2BSMSSendResponse = ResponseCommon;

export type B2BSMSAuthenticateOptions = SessionDurationOptions & {
  /**
   * The ID of the organization the member belongs to
   */
  organization_id: string;

  /**
   * The ID of the member to authenticate
   */
  member_id: string;

  /**
   * The OTP to authenticate
   */
  code: string;

  /**
   * If set to 'enroll', enrolls the member in MFA by setting the "mfa_enrolled" boolean to true.
   * If set to 'unenroll', unenrolls the member in MFA by setting the "mfa_enrolled" boolean to false.
   * If not set, does not affect the member's MFA enrollment.
   */
  set_mfa_enrollment?: 'enroll' | 'unenroll';
};

// B2BOTPsSMSAuthenticateResponse
export type B2BSMSAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = B2BAuthenticateResponse<TProjectConfiguration> & {
  /**
   * The device history of the member.
   */
  member_device?: SDKDeviceHistory;
};

// Tenanted Email OTP

export type B2BOTPsEmailLoginOrSignupOptions = {
  /**
   * The ID of the organization the member belongs to.
   */
  organization_id: string;

  /**
   * The email of the member to send the OTP to.
   */
  email_address: string;

  /**
   * The email template ID to use for login emails. If not provided, your default email template will be sent.
   * If providing a template ID, it must be either a template using Stytch's customizations, or an OTP Login custom HTML template.
   */
  login_template_id?: string;

  /**
   * The email template ID to use for sign-up emails.
   * If not provided, your default email template will be sent. If providing a template ID, it must be either a template using Stytch's customizations,
   * or an OTP Sign-up custom HTML template.
   */
  signup_template_id?: string;

  /**
   * The locale is used to determine which language to use in the email. Parameter is a {@link https://www.w3.org/International/articles/language-tags/ IETF BCP 47 language tag}, e.g. "en".
   * Currently supported languages are English ("en"), Spanish ("es"), and Brazilian Portuguese ("pt-br"); if no value is provided, the copy defaults to English.
   */
  locale?: locale;

  /**
   * The expiration time, in minutes, for a login OTP. If not authenticated within this time frame, the OTP email will need to be resent.
   * Defaults to 10 with a minimum of 2 and a maximum of 15.
   */
  login_expiration_minutes?: number;

  /**
   * The expiration time, in minutes, for a signup OTP. If not authenticated within this time frame, the OTP will need to be resent.
   * Defaults to 10 with a minimum of 2 and a maximum of 15.
   */
  signup_expiration_minutes?: number;
};

export type B2BOTPsEmailLoginOrSignupResponse = ResponseCommon;

export type B2BOTPsEmailAuthenticateOptions = SessionDurationOptions & {
  /**
   * The OTP to authenticate
   */
  code: string;

  /**
   * The email of the member we're attempting to authenticate the otp for.
   */
  email_address: string;

  /*
   * The organization ID of the member attempting to authenticate for.
   */
  organization_id: string;

  /**
   * The locale will be used if an OTP code is sent to the member's phone number as part of a
   * secondary authentication requirement.
   */
  locale?: locale;
};

export type B2BOTPsEmailAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = B2BAuthenticateResponseWithMFA<TProjectConfiguration> & {
  /**
   * The ID of the email used to send an OTP.
   */
  method_id: string;

  /**
   * The device history of the member.
   */
  member_device?: SDKDeviceHistory;
};

// Discovery Email OTP

export type B2BDiscoveryOTPEmailSendOptions = {
  /**
   * The email address to send the OTP to.
   */
  email_address: string;

  /**
   * The email template ID to use for login emails. If not provided, your default email template will be sent.
   * If providing a template ID, it must be either a template using Stytch's customizations, or an OTP Login custom HTML template.
   */
  login_template_id?: string;

  /**
   * The locale is used to determine which language to use in the email. Parameter is a {@link https://www.w3.org/International/articles/language-tags/ IETF BCP 47 language tag}, e.g. "en".
   * Currently supported languages are English ("en"), Spanish ("es"), and Brazilian Portuguese ("pt-br"); if no value is provided, the copy defaults to English.
   */
  locale?: locale;

  /**
   * The expiration time, in minutes. If not accepted within this time frame, the OTP will need to be resent.
   * Defaults to 10 with a minimum of 2 and a maximum of 15.
   */
  discovery_expiration_minutes?: number;
};

export type B2BDiscoveryOTPEmailSendResponse = ResponseCommon;

export type B2BDiscoveryOTPEmailAuthenticateOptions = {
  /**
   * The OTP to authenticate the user.
   */
  code: string;

  /**
   * The email address of the member attempting to authenticate.
   */
  email_address: string;
};

export type B2BDiscoveryOTPEmailAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = B2BDiscoveryAuthenticateResponse<TProjectConfiguration>;

export interface IHeadlessB2BOTPsClient<TProjectConfiguration extends StytchProjectConfigurationInput> {
  sms: {
    /**
     * The SMS Send method wraps the {@link https://stytch.com/docs/b2b/api/otp-sms-send send} via SMS API endpoint. Call this method to send an SMS passcode to an existing Member.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/otps#otps-sms-send Stytch Docs} for a complete reference.
     *
     * @example
     * stytch.otps.sms.send({
     *   organization_id: 'organization-test-123',
     *   member_id: 'member-id-123',
     *   phone_number: '+12025550162',
     * });
     *
     * @param data - {@link B2BSMSSendOptions}
     *
     * @returns A {@link B2BSMSSendResponse} indicating that the SMS has been sent.
     *
     * @throws A `StytchAPIError` when the Stytch API returns an error.
     * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input.
     */
    send(data: B2BSMSSendOptions): Promise<B2BSMSSendResponse>;

    /**
     * The SMS Authenticate method wraps the {@link https://stytch.com/docs/b2b/api/authenticate-otp-sms authenticate SMS} API endpoint.
     *
     * If there is a current Member Session, the SDK will call the endpoint with the session token.
     * This will add the phone number factor to the existing Member Session.
     * Otherwise, the SDK will use the intermediate session token.
     * This will consume the intermediate session token and create a Member Session.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/otps#otps-sms-authenticate Stytch Docs} for a complete reference.
     *
     * @example
     * stytch.otps.sms.authenticate({
     *   organization_id: 'organization-test-123',
     *   member_id: 'member-id-123',
     *   code: '123456',
     *   session_duration_minutes: 60,
     * });
     *
     * @param data - {@link B2BSMSAuthenticateOptions}
     *
     * @returns A {@link B2BSMSAuthenticateResponse} indicating that the SMS OTP factor has been authenticated
     * and added to the member's session.
     *
     * @throws A `StytchAPIError` when the Stytch API returns an error.
     * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input.
     */
    authenticate(data: B2BSMSAuthenticateOptions): Promise<B2BSMSAuthenticateResponse<TProjectConfiguration>>;
  };
  email: {
    /**
     * The loginOrSignup method wraps the {@link https://stytch.com/docs/b2b/api/send-login-signup-email-otp login_or_signup} Email OTP API endpoint.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/email-otps#login-or-signup Stytch Docs} for a complete reference.
     *
     * @example
     * stytch.otps.email.loginOrSignup({
     *   email_address: 'sandbox@stytch.com',
     *   organization_id: 'organization-test-123',
     * });
     *
     * @param data - {@link B2BOTPsEmailLoginOrSignupOptions}
     *
     * @returns A {@link B2BOTPsEmailLoginOrSignupResponse} indicating that the email has been sent.
     *
     * @throws A `StytchAPIError` when the Stytch API returns an error.
     * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
     */
    loginOrSignup(data: B2BOTPsEmailLoginOrSignupOptions): Promise<B2BOTPsEmailLoginOrSignupResponse>;

    /**
     * The authenticate method wraps the {@link https://stytch.com/docs/b2b/api/authenticate-email-otp authenticate} Email OTP API endpoint.
     *
     * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/email-otp#authenticate Stytch Docs} for a complete reference.
     *
     * @example
     * stytch.email.otps.authenticate({
     *   code: '123456',
     *   member_id: 'member-id-123',
     *   organization_id: 'organization-test-123',
     *   session_duration_minutes: 60,
     * });
     *
     * @param data - {@link B2BOTPsEmailAuthenticateOptions}
     *
     * @returns A {@link B2BOTPsEmailAuthenticateResponse} indicating that the OTP has been authenticated and the member is now logged in.
     *
     * @throws A `StytchAPIError` when the Stytch API returns an error.
     * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
     */
    authenticate(
      data: B2BOTPsEmailAuthenticateOptions,
    ): Promise<B2BOTPsEmailAuthenticateResponse<TProjectConfiguration>>;
    discovery: {
      /**
       * The send method wraps the {@link https://stytch.com/docs/b2b/api/send-discovery-email-otp discovery} Email OTP discovery API endpoint.
       *
       * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/email-magic-links#send-discovery-email-otp Stytch Docs} for a complete reference.
       *
       * @example
       * stytch.otps.email.discovery.send({
       *   email_address: 'sandbox@stytch.com',
       * });
       *
       * @param data - {@link B2BDiscoveryOTPEmailSendOptions}
       *
       * @returns A {@link B2BDiscoveryOTPEmailSendResponse} indicating that the email has been sent.
       *
       * @throws A `StytchAPIError` when the Stytch API returns an error.
       * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
       * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
       */
      send(data: B2BDiscoveryOTPEmailSendOptions): Promise<B2BDiscoveryOTPEmailSendResponse>;

      /**
       * The discovery authenticate method wraps the {@link https://stytch.com/docs/b2b/api/authenticate-discovery-email-otp authenticate} discovery email OTP API endpoint.
       *
       * See the {@link https://stytch.com/docs/b2b/sdks/javascript-sdk/email-magic-links#authenticate-discovery-email-otp Stytch Docs} for a complete reference.
       *
       * @example
       * stytch.otps.email.discovery.authenticate({
       *   code: '123456',
       *   email_address: 'sandbox@stytch.com',
       * });
       *
       * @param data - {@link B2BDiscoveryOTPEmailAuthenticateOptions}
       *
       * @returns A {@link B2BDiscoveryOTPEmailAuthenticateResponse} indicating that the OTP has been authenticated.
       * The response will contain the intermediate_session_token, the email address that the OTP was sent to,
       * and a list of discovered organizations that are associated with the email address.
       *
       * @throws A `StytchAPIError` when the Stytch API returns an error.
       * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
       * @throws A `StytchSDKUsageError` when called with invalid input (invalid email, invalid options, etc.)
       */
      authenticate(
        data: B2BDiscoveryOTPEmailAuthenticateOptions,
      ): Promise<B2BDiscoveryOTPEmailAuthenticateResponse<TProjectConfiguration>>;
    };
  };
}
