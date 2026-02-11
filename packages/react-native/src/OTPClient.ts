import {
  DisabledDFPProtectedAuthProvider,
  IConsumerSubscriptionService,
  IDFPProtectedAuthProvider,
  INetworkClient,
  omitUser,
  validateInDev,
  WithUser,
} from '@stytch/core';
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
} from '@stytch/core/public';

import StytchReactNativeModule from './native-module';
import { Platform } from './native-module/types';

export class RNHeadlessOTPClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessOTPsClient<TProjectConfiguration>
{
  private nativeModule: StytchReactNativeModule;

  authenticate: (
    code: string,
    method_id: string,
    options: OTPAuthenticateOptions,
  ) => Promise<OTPsAuthenticateResponse<TProjectConfiguration>>;

  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IConsumerSubscriptionService<TProjectConfiguration>,
    private executeRecaptcha: () => Promise<string | undefined> = () => Promise.resolve(undefined),
    private dfpProtectedAuth: IDFPProtectedAuthProvider = DisabledDFPProtectedAuthProvider(),
  ) {
    this.nativeModule = new StytchReactNativeModule();
    this.authenticate = this._subscriptionService.withUpdateSession(
      async (
        code: string,
        method_id: string,
        options: OTPAuthenticateOptions,
      ): Promise<OTPsAuthenticateResponse<TProjectConfiguration>> => {
        validateInDev(
          'stytch.otps.authenticate',
          { code, ...options },
          {
            code: 'string',
            session_duration_minutes: 'number',
          },
        );
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

  sms = {
    loginOrCreate: async (phone_number: string, options: OTPCodeSMSOptions): Promise<OTPsLoginOrCreateResponse> => {
      const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
      const requestBody = { ...options, phone_number, captcha_token, dfp_telemetry_id };
      if (this.nativeModule.DeviceInfo.get().platform === Platform.Android && !!options?.enable_autofill) {
        this.nativeModule.SMS.startRetriever().then(async (code) => {
          const methodId = await this.nativeModule.Storage.getData('method_id');
          if (!!code && !!methodId) {
            await this.authenticate(code, methodId, {
              session_duration_minutes: options.autofill_session_duration_minutes ?? 5,
            });
            await this.nativeModule.Storage.clearData('method_id');
          }
        });
      }
      const result = this._networkClient.retriableFetchSDK<OTPsLoginOrCreateResponse>({
        url: '/otps/sms/login_or_create',
        body: requestBody,
        method: 'POST',
        retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
      });
      const methodId = (await result).method_id;
      await this.nativeModule.Storage.setData('method_id', methodId);
      return result;
    },
    send: async (phone_number: string, options: OTPCodeSMSOptions): Promise<OTPsSendResponse> => {
      const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
      const requestBody = { ...options, phone_number, captcha_token, dfp_telemetry_id };

      const isLoggedIn = !!this._subscriptionService.getSession();

      const endpoint = isLoggedIn ? '/otps/sms/send/secondary' : '/otps/sms/send/primary';
      if (this.nativeModule.DeviceInfo.get().platform === Platform.Android && !!options?.enable_autofill) {
        this.nativeModule.SMS.startRetriever().then(async (code) => {
          const methodId = await this.nativeModule.Storage.getData('method_id');
          if (!!code && !!methodId) {
            await this.authenticate(code, methodId, {
              session_duration_minutes: options.autofill_session_duration_minutes ?? 5,
            });
            await this.nativeModule.Storage.clearData('method_id');
          }
        });
      }
      const result = this._networkClient.retriableFetchSDK<OTPsSendResponse>({
        url: endpoint,
        body: requestBody,
        method: 'POST',
        retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
      });
      const methodId = (await result).method_id;
      await this.nativeModule.Storage.setData('method_id', methodId);
      return result;
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
}
