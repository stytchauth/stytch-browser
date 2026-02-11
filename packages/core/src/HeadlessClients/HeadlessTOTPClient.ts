import { IConsumerSubscriptionService, IDFPProtectedAuthProvider, INetworkClient } from '..';
import {
  IHeadlessTOTPClient,
  StytchProjectConfigurationInput,
  TOTPAuthenticateOptions,
  TOTPAuthenticateResponse,
  TOTPCreateOptions,
  TOTPCreateResponse,
  TOTPRecoverOptions,
  TOTPRecoverResponse,
  TOTPRecoveryCodesResponse,
} from '../public';
import { omitUser, WithUser } from '../utils';
import { validateInDev } from '../utils/dev';

export class HeadlessTOTPClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessTOTPClient<TProjectConfiguration>
{
  authenticate: (options: TOTPAuthenticateOptions) => Promise<TOTPAuthenticateResponse<TProjectConfiguration>>;

  recover: (options: TOTPRecoverOptions) => Promise<TOTPRecoverResponse<TProjectConfiguration>>;

  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IConsumerSubscriptionService<TProjectConfiguration>,
    private dfpProtectedAuth: IDFPProtectedAuthProvider,
  ) {
    this.authenticate = this._subscriptionService.withUpdateSession(
      async (options: TOTPAuthenticateOptions): Promise<TOTPAuthenticateResponse<TProjectConfiguration>> => {
        validateInDev('stytch.totps.authenticate', options, {
          session_duration_minutes: 'number',
          totp_code: 'string',
        });

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

    this.recover = this._subscriptionService.withUpdateSession(
      async (options: TOTPRecoverOptions): Promise<TOTPRecoverResponse<TProjectConfiguration>> => {
        validateInDev('stytch.totps.recover', options, {
          session_duration_minutes: 'number',
          recovery_code: 'string',
        });
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

  async create(options: TOTPCreateOptions): Promise<TOTPCreateResponse> {
    validateInDev('stytch.totps.create', options, {
      expiration_minutes: 'number',
    });

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

  async recoveryCodes(): Promise<TOTPRecoveryCodesResponse> {
    return this._networkClient.fetchSDK<TOTPRecoveryCodesResponse>({
      url: '/totps/recovery_codes',
      method: 'POST',
    });
  }
}
