import { AuthenticateResponse, locale, ResponseCommon, SDKDeviceHistory } from './common';
import { StytchProjectConfigurationInput } from './typeConfig';

export type OTPCodeOptions = {
  /**
   * Set the expiration for the one-time passcode, in minutes. The minimum expiration is 1 minute and the maximum is 10 minutes. The default expiration is 2 minutes.
   */
  expiration_minutes: number;

  /**
   * Used to determine which language to use when sending the user this delivery method. Parameter is a [IETF BCP 47 language tag](https://www.w3.org/International/articles/language-tags/), e.g. `"en"`.
   *
   * Currently supported languages are English (`"en"`), Spanish (`"es"`), and Brazilian Portuguese (`"pt-br"`); if no value is provided, the copy defaults to English.
   */
  locale?: locale;
};

export type OTPCodeSMSOptions = OTPCodeOptions & {
  /**
   * Indicates whether the SMS message should include autofill metadata
   */
  enable_autofill?: boolean;

  /**
   * Indicates how long the autofill session should be valid. Defaults to 5 minutes
   */
  autofill_session_duration_minutes?: number;
};

export type OTPCodeEmailOptions = OTPCodeOptions & {
  /**
   * The email template ID to use for login emails.
   * If not provided, your default email template will be sent. If providing a template ID, it must be either a template using Stytch's customizations,
   * or a OTP Login custom HTML template.
   */
  login_template_id?: string;

  /**
   * The email template ID to use for sign-up emails.
   * If not provided, your default email template will be sent. If providing a template ID, it must be either a template using Stytch's customizations,
   * or a OTP Sign-up custom HTML template.
   */
  signup_template_id?: string;
};

export type OTPAuthenticateOptions = {
  /**
   * Set the session lifetime to be this many minutes from now.
   * This value must be a minimum of 5 and may not exceed the `maximum session duration minutes` value set in the {@link https://stytch.com/dashboard/sdk-configuration SDK Configuration} page of the Stytch dashboard.
   * A successful authentication will continue to extend the session this many minutes.
   */
  session_duration_minutes: number;
};

type OTPsBaseResponse = ResponseCommon & {
  /**
   * The ID of the method used to send a one-time passcode.
   */
  method_id: string;
};

export type OTPsLoginOrCreateResponse = OTPsBaseResponse;

export type OTPsSendResponse = OTPsBaseResponse;

export type OTPsAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = AuthenticateResponse<TProjectConfiguration> & {
  /**
   * The ID of the method used to send a one-time passcode.
   */
  method_id: string;
  /**
   * The device history of the user.
   */
  user_device?: SDKDeviceHistory;
};

export interface IHeadlessOTPsClient<TProjectConfiguration extends StytchProjectConfigurationInput> {
  sms: {
    /**
     * Wraps Stytch's {@link https://stytch.com/docs/api/log-in-or-create-user-by-sms login_or_create} via SMS API endpoint. Call this method to send an SMS passcode to new or existing users.
     *
     * @example
     * ```
     * const sendPasscode = useCallback(() => {
     *  stytchClient.otps.sms.loginOrCreate('+12025550162', {
     *    expiration_minutes: 5,
     *  });
     * }, [stytchClient]);
     * ```
     *
     * @param phone_number - The phone number of the user to send a one-time passcode. The phone number should be in E.164 format (i.e. +1XXXXXXXXXX). You may use +10000000000 to test this endpoint, see {@link https://stytch.com/docs/testing Testing} for more detail.
     * @param options - {@link OTPCodeOptions}
     *
     * @returns A {@link OTPsLoginOrCreateResponse} indicating the one-time passcode has been sent.
     *
     * @throws A `StytchAPIError` when the Stytch API returns an error.
     * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input.
     */
    loginOrCreate(phone_number: string, options?: OTPCodeSMSOptions): Promise<OTPsLoginOrCreateResponse>;
    /**
     * Wraps Stytch's {@link https://stytch.com/docs/api/send-otp-by-sms send} via SMS API endpoint. Call this method to send an SMS passcode to existing users.
     *
     * @example
     * ```
     * const sendPasscode = useCallback(() => {
     *  stytchClient.otps.sms.send('+12025550162', {
     *    expiration_minutes: 5,
     *  });
     * }, [stytchClient]);
     * ```
     *
     * @param phone_number - The phone number of the user to send a one-time passcode. The phone number should be in E.164 format (i.e. +1XXXXXXXXXX). You may use +10000000000 to test this endpoint, see {@link https://stytch.com/docs/testing Testing} for more detail.
     * @param options - {@link OTPCodeOptions}
     *
     * @returns A {@link OTPsSendResponse} indicating the one-time passcode has been sent.
     *
     * @throws A `StytchAPIError` when the Stytch API returns an error.
     * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input.
     */
    send(phone_number: string, options?: OTPCodeSMSOptions): Promise<OTPsSendResponse>;
  };
  whatsapp: {
    /**
     *  Wraps Stytch's {@link https://stytch.com/docs/api/whatsapp-login-or-create login_or_create} via WhatsApp API endpoint. Call this method to send a WhatsApp passcode to new or existing users.
     *
     * @example
     * ```
     * const sendPasscode = useCallback(() => {
     *  stytchClient.otps.whatsapp.loginOrCreate('+12025550162', {
     *    expiration_minutes: 5,
     *  });
     * }, [stytchClient]);
     * ```
     *
     * @param phone_number - The phone number of the user to send a one-time passcode. The phone number should be in E.164 format (i.e. +1XXXXXXXXXX). You may use +10000000000 to test this endpoint, see {@link https://stytch.com/docs/testing Testing} for more detail.
     * @param options - {@link OTPCodeOptions}
     *
     * @returns A {@link OTPsLoginOrCreateResponse} indicating the one-time passcode has been sent.
     *
     * @throws A `StytchAPIError` when the Stytch API returns an error.
     * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input.
     */
    loginOrCreate(phone_number: string, options?: OTPCodeOptions): Promise<OTPsLoginOrCreateResponse>;
    /**
     * Wraps Stytch's {@link https://stytch.com/docs/api/whatsapp-send send} via WhatsApp API endpoint. Call this method to send an WhatsApp passcode to existing users.
     *
     * @example
     * ```
     * const sendPasscode = useCallback(() => {
     *  stytchClient.otps.whatsapp.send('+12025550162', {
     *    expiration_minutes: 5,
     *  });
     * }, [stytchClient]);
     * ```
     *
     * @param phone_number - The phone number of the user to send a one-time passcode. The phone number should be in E.164 format (i.e. +1XXXXXXXXXX). You may use +10000000000 to test this endpoint, see {@link https://stytch.com/docs/testing Testing} for more detail.
     * @param options - {@link OTPCodeOptions}
     *
     * @returns A {@link OTPsSendResponse} indicating the one-time passcode has been sent.
     *
     * @throws A `StytchAPIError` when the Stytch API returns an error.
     * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input.
     */
    send(phone_number: string, options?: OTPCodeOptions): Promise<OTPsSendResponse>;
  };
  email: {
    /**
     * Wraps Stytch's {@link https://stytch.com/docs/api/log-in-or-create-user-by-email login_or_create} via email API endpoint. Call this method to send an email passcode to new or existing users.
     *
     * @example
     * ```
     * const sendPasscode = useCallback(() => {
     *  stytchClient.otps.email.loginOrCreate('sandbox@stytch.com', {
     *    expiration_minutes: 5,
     *  });
     * }, [stytchClient]);
     * ```
     *
     * @param email - The email address of the user to send the one-time passcode to. You may use sandbox@stytch.com to test this endpoint, see {@link https://stytch.com/docs/testing Testing} for more detail.
     * @param options - {@link OTPCodeEmailOptions}
     *
     * @returns A {@link OTPsLoginOrCreateResponse} indicating the one-time passcode has been sent.
     *
     * @throws A `StytchAPIError` when the Stytch API returns an error.
     * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input.
     */
    loginOrCreate(email: string, options?: OTPCodeEmailOptions): Promise<OTPsLoginOrCreateResponse>;
    /**
     * Wraps Stytch's {@link https://stytch.com/docs/api/send-otp-by-email send} via Email API endpoint. Call this method to send an email passcode to existing users.
     *
     * @example
     * ```
     * const sendPasscode = useCallback(() => {
     *  stytchClient.otps.email.send('sandbox@stytch.com', {
     *    expiration_minutes: 5,
     *  });
     * }, [stytchClient]);
     * ```
     *
     * @param email - The email address of the user to send the one-time passcode to. You may use sandbox@stytch.com to test this endpoint, see {@link https://stytch.com/docs/testing Testing} for more detail.
     * @param options - {@link OTPCodeEmailOptions}
     *
     * @returns A {@link OTPsSendResponse} indicating the one-time passcode has been sent.
     *
     * @throws A `StytchAPIError` when the Stytch API returns an error.
     * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
     * @throws A `StytchSDKUsageError` when called with invalid input.
     */
    send(email: string, options?: OTPCodeEmailOptions): Promise<OTPsSendResponse>;
  };
  /**
   * The Authenticate method wraps the {@link https://stytch.com/docs/api/authenticate-otp authenticate} one-time passcode API method which validates the code passed in.
   *
   * @example
   * ```
   * const [code, setCode] = useState('');
   *
   * const method_id = "phone-number-test-d5a3b680-e8a3-40c0-b815-ab79986666d0"
   * // returned from calling loginOrCreate for OTPs on SMS, WhatsApp or Email
   *
   * const authenticate = useCallback((e) => {
   *  e.preventDefault();
   *  stytchClient.otps.authenticate(code, method_id, {
   *    session_duration_minutes: 60,
   *  });
   * }, [stytchClient, code]);
   *
   * const handleChange = useCallback((e) => {
   *  setCode(e.target.value);
   * }, []);
   * ```
   *
   * @param otp - The code to authenticate.
   * @param method_id - The ID of the method used to send a one-time passcode.
   * @param options - {@link OTPAuthenticateOptions}
   *
   * @returns A {@link OTPsAuthenticateResponse} indicating the one-time passcode method has been authenticated.
   *
   * @throws A `StytchAPIError` when the Stytch API returns an error.
   * @throws A `StytchAPIUnreachableError` when the SDK cannot contact the Stytch API.
   * @throws A `StytchSDKUsageError` when called with invalid input.
   */
  authenticate(
    otp: string,
    method_id: string,
    options?: OTPAuthenticateOptions,
  ): Promise<OTPsAuthenticateResponse<TProjectConfiguration>>;
}
