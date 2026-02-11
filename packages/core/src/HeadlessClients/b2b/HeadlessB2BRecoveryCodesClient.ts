import { IB2BSubscriptionService, IDFPProtectedAuthProvider, INetworkClient } from '../..';
import {
  IHeadlessB2BRecoveryCodesClient,
  RecoveryCodeGetResponse,
  RecoveryCodeRecoverOptions,
  RecoveryCodeRecoverResponse,
  RecoveryCodeRotateResponse,
} from '../../public/b2b/recoveryCodes';
import { StytchProjectConfigurationInput } from '../../public/typeConfig';
import { validateInDev } from '../../utils/dev';

export class HeadlessB2BRecoveryCodesClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessB2BRecoveryCodesClient<TProjectConfiguration>
{
  recover: (data: RecoveryCodeRecoverOptions) => Promise<RecoveryCodeRecoverResponse<TProjectConfiguration>>;

  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IB2BSubscriptionService<TProjectConfiguration>,
    private dfpProtectedAuth: IDFPProtectedAuthProvider,
  ) {
    this.recover = this._subscriptionService.withUpdateSession(
      async (data: RecoveryCodeRecoverOptions): Promise<RecoveryCodeRecoverResponse<TProjectConfiguration>> => {
        validateInDev('stytch.recoveryCodes.recover', data, {
          organization_id: 'string',
          member_id: 'string',
          recovery_code: 'string',
          session_duration_minutes: 'number',
        });
        const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
        const requestBody = {
          ...data,
          dfp_telemetry_id,
          captcha_token,
          intermediate_session_token: this._subscriptionService.getIntermediateSessionToken() || undefined,
        };
        return this._networkClient.retriableFetchSDK<RecoveryCodeRecoverResponse<TProjectConfiguration>>({
          url: '/b2b/recovery_codes/recover',
          body: requestBody,
          method: 'POST',
          retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
        });
      },
    );
  }

  async rotate(): Promise<RecoveryCodeRotateResponse> {
    const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
    return this._networkClient.retriableFetchSDK<RecoveryCodeRotateResponse>({
      url: '/b2b/recovery_codes/rotate',
      body: {
        dfp_telemetry_id,
        captcha_token,
      },
      method: 'POST',
      retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
    });
  }

  async get(): Promise<RecoveryCodeGetResponse> {
    return this._networkClient.fetchSDK<RecoveryCodeGetResponse>({
      url: '/b2b/recovery_codes',
      method: 'GET',
    });
  }
}
