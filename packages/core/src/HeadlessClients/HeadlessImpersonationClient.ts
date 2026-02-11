import { IDFPProtectedAuthProvider } from '../DFPProtectedAuthProvider';
import { INetworkClient } from '../NetworkClient';
import {
  IHeadlessImpersonationClient,
  ImpersonationAuthenticateOptions,
  ImpersonationAuthenticateResponse,
} from '../public/impersonation';
import { StytchProjectConfigurationInput } from '../public/typeConfig';
import { IConsumerSubscriptionService } from '../SubscriptionService';
import { validateInDev } from '../utils/dev';

export class HeadlessImpersonationClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessImpersonationClient<TProjectConfiguration>
{
  authenticate: (
    data: ImpersonationAuthenticateOptions,
  ) => Promise<ImpersonationAuthenticateResponse<TProjectConfiguration>>;

  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IConsumerSubscriptionService<TProjectConfiguration>,
    private dfpProtectedAuth: IDFPProtectedAuthProvider,
  ) {
    this.authenticate = this._subscriptionService.withUpdateSession(async (data: ImpersonationAuthenticateOptions) => {
      validateInDev('stytch.impersonation.authenticate', data, {
        impersonation_token: 'string',
      });
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
}
