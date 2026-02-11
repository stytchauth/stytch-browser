import { IB2BSubscriptionService, IDFPProtectedAuthProvider, INetworkClient } from '../..';
import {
  B2BTOTPAuthenticateOptions,
  B2BTOTPAuthenticateResponse,
  B2BTOTPCreateOptions,
  B2BTOTPCreateResponse,
  IHeadlessB2BTOTPsClient,
} from '../../public/b2b/totp';
import { StytchProjectConfigurationInput } from '../../public/typeConfig';
import { validateInDev } from '../../utils/dev';

export class HeadlessB2BTOTPsClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessB2BTOTPsClient<TProjectConfiguration>
{
  authenticate: (data: B2BTOTPAuthenticateOptions) => Promise<B2BTOTPAuthenticateResponse<TProjectConfiguration>>;

  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IB2BSubscriptionService<TProjectConfiguration>,
    private dfpProtectedAuth: IDFPProtectedAuthProvider,
  ) {
    this.authenticate = this._subscriptionService.withUpdateSession(
      async (data: B2BTOTPAuthenticateOptions): Promise<B2BTOTPAuthenticateResponse<TProjectConfiguration>> => {
        validateInDev('stytch.totp.authenticate', data, {
          organization_id: 'string',
          member_id: 'string',
          code: 'string',
          session_duration_minutes: 'number',
          set_mfa_enrollment: 'optionalString',
          set_default_mfa: 'optionalBoolean',
        });
        const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
        const requestBody = {
          ...data,
          dfp_telemetry_id,
          captcha_token,
          intermediate_session_token: this._subscriptionService.getIntermediateSessionToken() || undefined,
        };

        return this._networkClient.retriableFetchSDK<B2BTOTPAuthenticateResponse<TProjectConfiguration>>({
          url: '/b2b/totp/authenticate',
          body: requestBody,
          method: 'POST',
          retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
        });
      },
    );
  }

  async create(data: B2BTOTPCreateOptions): Promise<B2BTOTPCreateResponse> {
    validateInDev('stytch.totp.create', data, {
      organization_id: 'string',
      member_id: 'string',
      expiration_minutes: 'optionalNumber',
    });
    const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
    const response = await this._networkClient.retriableFetchSDK<B2BTOTPCreateResponse>({
      url: '/b2b/totp',
      body: {
        ...data,
        dfp_telemetry_id,
        captcha_token,
        intermediate_session_token: (await this._subscriptionService.getIntermediateSessionToken()) || undefined,
      },
      method: 'POST',
      retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
    });

    if (response.member_id === this._subscriptionService.getMember()?.member_id) {
      this._subscriptionService.updateMember(response.member);
    }

    return response;
  }
}
