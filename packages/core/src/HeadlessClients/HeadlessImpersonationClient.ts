import { IDFPProtectedAuthProvider } from '../DFPProtectedAuthProvider';
import { INetworkClient } from '../NetworkClient';
import {
  ImpersonationAuthenticateOptions,
  ImpersonationAuthenticateResponse,
  IHeadlessImpersonationClient,
} from '../public/impersonation';
import { StytchProjectConfigurationInput } from '../public/typeConfig';
import { validate } from '../utils';
import { IConsumerSubscriptionService } from '../SubscriptionService';

export class HeadlessImpersonationClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessImpersonationClient<TProjectConfiguration>
{
  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IConsumerSubscriptionService<TProjectConfiguration>,
    private dfpProtectedAuth: IDFPProtectedAuthProvider,
  ) {}

  authenticate = this._subscriptionService.withUpdateSession(async (data: ImpersonationAuthenticateOptions) => {
    validate('stytch.impersonation.authenticate').isString('impersonation_token', data.impersonation_token);
    const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
    return this._networkClient.retriableFetchSDK<ImpersonationAuthenticateResponse<TProjectConfiguration>>({
      url: '/impersonation/authenticate',
      body: {
        ...data,
        dfp_telemetry_id,
        captcha_token,
      },
      method: 'POST',
      retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
    });
  });
}
