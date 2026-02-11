import {
  DisabledDFPProtectedAuthProvider,
  IB2BSubscriptionService,
  IDFPProtectedAuthProvider,
  INetworkClient,
  validateInDev,
} from '@stytch/core';
import {
  B2BDiscoveryOTPEmailAuthenticateOptions,
  B2BDiscoveryOTPEmailAuthenticateResponse,
  B2BDiscoveryOTPEmailSendOptions,
  B2BDiscoveryOTPEmailSendResponse,
  B2BOTPsEmailAuthenticateOptions,
  B2BOTPsEmailAuthenticateResponse,
  B2BOTPsEmailLoginOrSignupOptions,
  B2BOTPsEmailLoginOrSignupResponse,
  B2BSMSAuthenticateOptions,
  B2BSMSAuthenticateResponse,
  B2BSMSSendOptions,
  B2BSMSSendResponse,
  IHeadlessB2BOTPsClient,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';

import StytchReactNativeModule from '../native-module';
import { Platform } from '../native-module/types';

export class RNB2BOTPsClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessB2BOTPsClient<TProjectConfiguration>
{
  private nativeModule: StytchReactNativeModule;

  sms: {
    send: (data: B2BSMSSendOptions) => Promise<B2BSMSSendResponse>;
    authenticate: (data: B2BSMSAuthenticateOptions) => Promise<B2BSMSAuthenticateResponse<TProjectConfiguration>>;
  };

  email: {
    loginOrSignup: (data: B2BOTPsEmailLoginOrSignupOptions) => Promise<B2BOTPsEmailLoginOrSignupResponse>;
    authenticate: (
      data: B2BOTPsEmailAuthenticateOptions,
    ) => Promise<B2BOTPsEmailAuthenticateResponse<TProjectConfiguration>>;
    discovery: {
      send: (data: B2BDiscoveryOTPEmailSendOptions) => Promise<B2BDiscoveryOTPEmailSendResponse>;
      authenticate: (
        data: B2BDiscoveryOTPEmailAuthenticateOptions,
      ) => Promise<B2BDiscoveryOTPEmailAuthenticateResponse<TProjectConfiguration>>;
    };
  };

  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IB2BSubscriptionService<TProjectConfiguration>,
    private dfpProtectedAuth: IDFPProtectedAuthProvider = DisabledDFPProtectedAuthProvider(),
  ) {
    this.nativeModule = new StytchReactNativeModule();
    this.sms = {
      send: async (data: B2BSMSSendOptions): Promise<B2BSMSSendResponse> => {
        validateInDev('stytch.otps.sms.send', data, {
          organization_id: 'string',
          member_id: 'string',
          mfa_phone_number: 'optionalString',
          locale: 'optionalString',
        });
        const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

        if (this.nativeModule.DeviceInfo.get().platform === Platform.Android && !!data?.enable_autofill) {
          this.nativeModule.SMS.startRetriever().then((code) => {
            if (code) {
              this.sms.authenticate({
                organization_id: data.organization_id,
                member_id: data.member_id,
                code: code,
                session_duration_minutes: data.autofill_session_duration_minutes ?? 5,
              });
            }
          });
        }
        return this._networkClient.retriableFetchSDK<B2BSMSSendResponse>({
          url: '/b2b/otps/sms/send',
          body: {
            ...data,
            dfp_telemetry_id,
            captcha_token,
            intermediate_session_token: (await this._subscriptionService.getIntermediateSessionToken()) || undefined,
          },
          method: 'POST',
          retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
        });
      },

      authenticate: this._subscriptionService.withUpdateSession(
        async (data: B2BSMSAuthenticateOptions): Promise<B2BSMSAuthenticateResponse<TProjectConfiguration>> => {
          validateInDev('stytch.otps.sms.authenticate', data, {
            organization_id: 'string',
            member_id: 'string',
            code: 'string',
            set_mfa_enrollment: 'optionalString',
          });
          const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
          const requestBody = {
            ...data,
            dfp_telemetry_id,
            captcha_token,
            intermediate_session_token: this._subscriptionService.getIntermediateSessionToken() || undefined,
          };
          return this._networkClient.retriableFetchSDK<B2BSMSAuthenticateResponse<TProjectConfiguration>>({
            url: '/b2b/otps/sms/authenticate',
            body: requestBody,
            method: 'POST',
            retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
          });
        },
      ),
    };

    this.email = {
      loginOrSignup: async (data: B2BOTPsEmailLoginOrSignupOptions): Promise<B2BOTPsEmailLoginOrSignupResponse> => {
        validateInDev('stytch.otps.email.loginOrSignup', data, {
          organization_id: 'string',
          email_address: 'string',
          login_template_id: 'optionalString',
          signup_template_id: 'optionalString',
          locale: 'optionalString',
          login_expiration_minutes: 'optionalNumber',
          signup_expiration_minutes: 'optionalNumber',
        });

        const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
        return this._networkClient.retriableFetchSDK<B2BOTPsEmailLoginOrSignupResponse>({
          url: '/b2b/otps/email/login_or_signup',
          body: {
            ...data,
            dfp_telemetry_id,
            captcha_token,
          },
          method: 'POST',
          retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
        });
      },
      authenticate: this._subscriptionService.withUpdateSession(
        async (
          data: B2BOTPsEmailAuthenticateOptions,
        ): Promise<B2BOTPsEmailAuthenticateResponse<TProjectConfiguration>> => {
          validateInDev('stytch.otps.email.authenticate', data, {
            code: 'string',
            email_address: 'string',
            organization_id: 'string',
            session_duration_minutes: 'number',
            locale: 'optionalString',
          });

          const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
          return this._networkClient.retriableFetchSDK<B2BOTPsEmailAuthenticateResponse<TProjectConfiguration>>({
            url: '/b2b/otps/email/authenticate',
            body: {
              ...data,
              intermediate_session_token: (await this._subscriptionService.getIntermediateSessionToken()) || undefined,
              dfp_telemetry_id,
              captcha_token,
            },
            method: 'POST',
            retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
          });
        },
      ),
      discovery: {
        send: async (data: B2BDiscoveryOTPEmailSendOptions): Promise<B2BDiscoveryOTPEmailSendResponse> => {
          validateInDev('stytch.otps.email.discovery.send', data, {
            email_address: 'string',
            login_template_id: 'optionalString',
            locale: 'optionalString',
            discovery_expiration_minutes: 'optionalNumber',
          });

          const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
          const requestBody = {
            ...data,
            dfp_telemetry_id,
            captcha_token,
          };
          return this._networkClient.retriableFetchSDK<B2BDiscoveryOTPEmailSendResponse>({
            url: '/b2b/otps/email/discovery/send',
            body: requestBody,
            method: 'POST',
            retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
          });
        },
        authenticate: this._subscriptionService.withUpdateSession(
          async (
            data: B2BDiscoveryOTPEmailAuthenticateOptions,
          ): Promise<B2BDiscoveryOTPEmailAuthenticateResponse<TProjectConfiguration>> => {
            validateInDev('stytch.otps.email.discovery.authenticate', data, {
              code: 'string',
              email_address: 'string',
            });

            const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
            const requestBody = {
              dfp_telemetry_id,
              captcha_token,
              ...data,
            };

            return this._networkClient.retriableFetchSDK<
              B2BDiscoveryOTPEmailAuthenticateResponse<TProjectConfiguration>
            >({
              url: '/b2b/otps/email/discovery/authenticate',
              body: requestBody,
              method: 'POST',
              retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
            });
          },
        ),
      },
    };
  }
}
