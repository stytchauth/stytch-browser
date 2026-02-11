import { IB2BSubscriptionService, IDFPProtectedAuthProvider, INetworkClient } from '../..';
import {
  B2BImpersonationAuthenticateOptions,
  B2BImpersonationAuthenticateResponse,
  IHeadlessB2BImpersonationClient,
} from '../../public/b2b/impersonation';
import { StytchProjectConfigurationInput } from '../../public/typeConfig';
import { validate } from '../../utils';

export class HeadlessB2BImpersonationClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessB2BImpersonationClient<TProjectConfiguration>
{
  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IB2BSubscriptionService<TProjectConfiguration>,
    private dfpProtectedAuth: IDFPProtectedAuthProvider,
  ) {}

  authenticate = this._subscriptionService.withUpdateSession(async (data: B2BImpersonationAuthenticateOptions) => {
    validate('stytch.impersonation.authenticate').isString('impersonation_token', data.impersonation_token);

    const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

    return this._networkClient.retriableFetchSDK<B2BImpersonationAuthenticateResponse<TProjectConfiguration>>({
      url: '/b2b/impersonation/authenticate',
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
