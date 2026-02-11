import {
  IHeadlessTOTPClient,
  TOTPAuthenticateOptions,
  TOTPAuthenticateResponse,
  TOTPCreateOptions,
  TOTPCreateResponse,
  TOTPRecoverOptions,
  TOTPRecoverResponse,
  TOTPRecoveryCodesResponse,
  StytchProjectConfigurationInput,
} from '../public';

import { IConsumerSubscriptionService, IDFPProtectedAuthProvider, INetworkClient } from '..';
import { omitUser, validate, WithUser } from '../utils';

export class HeadlessTOTPClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessTOTPClient<TProjectConfiguration>
{
  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IConsumerSubscriptionService<TProjectConfiguration>,
    private dfpProtectedAuth: IDFPProtectedAuthProvider,
  ) {}

  async create(options: TOTPCreateOptions): Promise<TOTPCreateResponse> {
    validate('stytch.totps.create').isNumber('expiration_minutes', options.expiration_minutes);

    const resp = await this._networkClient.fetchSDK<WithUser<TOTPCreateResponse>>({
      url: '/totps',
      method: 'POST',
      body: {
        expiration_minutes: options.expiration_minutes,
      },
    });

    this._subscriptionService.updateUser(resp.__user);

    return omitUser(resp);
  }

  authenticate = this._subscriptionService.withUpdateSession(
    async (options: TOTPAuthenticateOptions): Promise<TOTPAuthenticateResponse<TProjectConfiguration>> => {
      validate('stytch.totps.authenticate')
        .isNumber('session_duration_minutes', options.session_duration_minutes)
        .isString('totp_code', options.totp_code);

      const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

      const resp = await this._networkClient.retriableFetchSDK<
        WithUser<TOTPAuthenticateResponse<TProjectConfiguration>>
      >({
        url: '/totps/authenticate',
        method: 'POST',
        body: {
          session_duration_minutes: options.session_duration_minutes,
          totp_code: options.totp_code,
          captcha_token,
          dfp_telemetry_id,
        },
        retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
      });

      return omitUser(resp);
    },
  );

  async recoveryCodes(): Promise<TOTPRecoveryCodesResponse> {
    return this._networkClient.fetchSDK<TOTPRecoveryCodesResponse>({
      url: '/totps/recovery_codes',
      method: 'POST',
    });
  }

  recover = this._subscriptionService.withUpdateSession(
    async (options: TOTPRecoverOptions): Promise<TOTPRecoverResponse<TProjectConfiguration>> => {
      validate('stytch.totps.recover')
        .isNumber('session_duration_minutes', options.session_duration_minutes)
        .isString('recovery_code', options.recovery_code);
      const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

      const resp = await this._networkClient.retriableFetchSDK<WithUser<TOTPRecoverResponse<TProjectConfiguration>>>({
        url: '/totps/recover',
        method: 'POST',
        body: {
          session_duration_minutes: options.session_duration_minutes,
          recovery_code: options.recovery_code,
          captcha_token,
          dfp_telemetry_id,
        },
        retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
      });

      return omitUser(resp);
    },
  );
}
