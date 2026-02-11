import {
  DisabledDFPProtectedAuthProvider,
  IB2BSubscriptionService,
  IDFPProtectedAuthProvider,
  INetworkClient,
  validate,
} from '@stytch/core';
import {
  B2BSMSAuthenticateOptions,
  B2BSMSAuthenticateResponse,
  B2BSMSSendOptions,
  B2BSMSSendResponse,
  IHeadlessB2BOTPsClient,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';
import StytchReactNativeModule from '../native-module';
import { Platform } from '../native-module/types';
import {
  B2BDiscoveryOTPEmailAuthenticateOptions,
  B2BDiscoveryOTPEmailAuthenticateResponse,
  B2BDiscoveryOTPEmailSendOptions,
  B2BDiscoveryOTPEmailSendResponse,
  B2BOTPsEmailAuthenticateOptions,
  B2BOTPsEmailAuthenticateResponse,
  B2BOTPsEmailLoginOrSignupOptions,
  B2BOTPsEmailLoginOrSignupResponse,
} from '@stytch/core/public';

export class RNB2BOTPsClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessB2BOTPsClient<TProjectConfiguration>
{
  private nativeModule: StytchReactNativeModule;
  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IB2BSubscriptionService<TProjectConfiguration>,
    private dfpProtectedAuth: IDFPProtectedAuthProvider = DisabledDFPProtectedAuthProvider(),
  ) {
    this.nativeModule = new StytchReactNativeModule();
  }

  sms = {
    send: async (data: B2BSMSSendOptions): Promise<B2BSMSSendResponse> => {
      validate('stytch.otps.sms.send')
        .isString('organization_id', data.organization_id)
        .isString('member_id', data.member_id)
        .isOptionalString('mfa_phone_number', data.mfa_phone_number)
        .isOptionalString('locale', data.locale);
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
        validate('stytch.otps.sms.authenticate')
          .isString('organization_id', data.organization_id)
          .isString('member_id', data.member_id)
          .isString('code', data.code)
          .isOptionalString('set_mfa_enrollment', data.set_mfa_enrollment);
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

  email = {
    loginOrSignup: async (data: B2BOTPsEmailLoginOrSignupOptions): Promise<B2BOTPsEmailLoginOrSignupResponse> => {
      validate('stytch.otps.email.loginOrSignup')
        .isString('organization_id', data.organization_id)
        .isString('email_address', data.email_address)
        .isOptionalString('login_template_id', data.login_template_id)
        .isOptionalString('signup_template_id', data.signup_template_id)
        .isOptionalString('locale', data.locale)
        .isOptionalNumber('login_expiration_minutes', data.login_expiration_minutes)
        .isOptionalNumber('signup_expiration_minutes', data.signup_expiration_minutes);

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
        validate('stytch.otps.email.authenticate')
          .isString('code', data.code)
          .isString('email_address', data.email_address)
          .isString('organization_id', data.organization_id)
          .isNumber('session_duration_minutes', data.session_duration_minutes)
          .isOptionalString('locale', data.locale);

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
        validate('stytch.otps.email.discovery.send')
          .isString('email_address', data.email_address)
          .isOptionalString('login_template_id', data.login_template_id)
          .isOptionalString('locale', data.locale)
          .isOptionalNumber('discovery_expiration_minutes', data.discovery_expiration_minutes);

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
          validate('stytch.otps.email.discovery.authenticate')
            .isString('code', data.code)
            .isString('email_address', data.email_address);

          const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
          const requestBody = {
            dfp_telemetry_id,
            captcha_token,
            ...data,
          };

          return this._networkClient.retriableFetchSDK<B2BDiscoveryOTPEmailAuthenticateResponse<TProjectConfiguration>>(
            {
              url: '/b2b/otps/email/discovery/authenticate',
              body: requestBody,
              method: 'POST',
              retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
            },
          );
        },
      ),
    },
  };
}
