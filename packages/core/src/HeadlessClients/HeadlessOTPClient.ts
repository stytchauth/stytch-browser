import { IConsumerSubscriptionService, IDFPProtectedAuthProvider, INetworkClient } from '..';
import {
  IHeadlessOTPsClient,
  OTPAuthenticateOptions,
  OTPCodeEmailOptions,
  OTPCodeOptions,
  OTPCodeSMSOptions,
  OTPsAuthenticateResponse,
  OTPsLoginOrCreateResponse,
  OTPsSendResponse,
  StytchProjectConfigurationInput,
} from '../public';
import { WithUser, omitUser, validate } from '../utils';

export class HeadlessOTPClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessOTPsClient<TProjectConfiguration>
{
  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IConsumerSubscriptionService<TProjectConfiguration>,
    private executeRecaptcha: () => Promise<string | undefined> = () => Promise.resolve(undefined),
    private dfpProtectedAuth: IDFPProtectedAuthProvider,
  ) {}

  sms = {
    loginOrCreate: async (phone_number: string, options: OTPCodeSMSOptions): Promise<OTPsLoginOrCreateResponse> => {
      const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
      const requestBody = { ...options, phone_number, captcha_token, dfp_telemetry_id };
      return this._networkClient.retriableFetchSDK<OTPsLoginOrCreateResponse>({
        url: '/otps/sms/login_or_create',
        body: requestBody,
        method: 'POST',
        retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
      });
    },
    send: async (phone_number: string, options: OTPCodeSMSOptions): Promise<OTPsSendResponse> => {
      const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
      const requestBody = { ...options, phone_number, captcha_token, dfp_telemetry_id };

      const isLoggedIn = !!this._subscriptionService.getSession();

      const endpoint = isLoggedIn ? '/otps/sms/send/secondary' : '/otps/sms/send/primary';

      return this._networkClient.retriableFetchSDK<OTPsSendResponse>({
        url: endpoint,
        body: requestBody,
        method: 'POST',
        retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
      });
    },
  };

  whatsapp = {
    loginOrCreate: async (phone_number: string, options: OTPCodeOptions): Promise<OTPsLoginOrCreateResponse> => {
      const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
      const requestBody = { ...options, phone_number, dfp_telemetry_id, captcha_token };
      return this._networkClient.retriableFetchSDK<OTPsLoginOrCreateResponse>({
        url: '/otps/whatsapp/login_or_create',
        body: requestBody,
        method: 'POST',
        retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
      });
    },
    send: async (phone_number: string, options: OTPCodeOptions): Promise<OTPsSendResponse> => {
      const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
      const requestBody = { ...options, phone_number, captcha_token, dfp_telemetry_id };

      const isLoggedIn = !!this._subscriptionService.getSession();

      const endpoint = isLoggedIn ? '/otps/whatsapp/send/secondary' : '/otps/whatsapp/send/primary';

      return this._networkClient.retriableFetchSDK<OTPsSendResponse>({
        url: endpoint,
        body: requestBody,
        method: 'POST',
        retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
      });
    },
  };

  email = {
    loginOrCreate: async (email: string, options: OTPCodeEmailOptions): Promise<OTPsLoginOrCreateResponse> => {
      const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
      const requestBody = { ...options, email, captcha_token, dfp_telemetry_id };
      return this._networkClient.retriableFetchSDK<OTPsLoginOrCreateResponse>({
        url: '/otps/email/login_or_create',
        body: requestBody,
        method: 'POST',
        retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
      });
    },
    send: async (email: string, options: OTPCodeEmailOptions): Promise<OTPsSendResponse> => {
      const captcha_token = await this.executeRecaptcha();
      const requestBody = { ...options, email, captcha_token };

      const isLoggedIn = !!this._subscriptionService.getSession();

      const endpoint = isLoggedIn ? '/otps/email/send/secondary' : '/otps/email/send/primary';

      return this._networkClient.fetchSDK<OTPsSendResponse>({
        url: endpoint,
        body: requestBody,
        method: 'POST',
      });
    },
  };

  authenticate = this._subscriptionService.withUpdateSession(
    async (code: string, method_id: string, options: OTPAuthenticateOptions) => {
      validate('stytch.otps.authenticate')
        .isString('Code', code)
        .isNumber('session_duration_minutes', options.session_duration_minutes);
      const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

      const requestBody = {
        token: code,
        method_id,
        dfp_telemetry_id,
        captcha_token,
        ...options,
      };
      const resp = await this._networkClient.retriableFetchSDK<
        WithUser<OTPsAuthenticateResponse<TProjectConfiguration>>
      >({
        url: '/otps/authenticate',
        body: requestBody,
        method: 'POST',
        retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
      });

      return omitUser(resp);
    },
  );
}
