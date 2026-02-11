import { IB2BSubscriptionService, IDFPProtectedAuthProvider, INetworkClient } from '../..';
import { validate } from '../../utils';
import {
  B2BTOTPAuthenticateOptions,
  B2BTOTPAuthenticateResponse,
  B2BTOTPCreateOptions,
  B2BTOTPCreateResponse,
  IHeadlessB2BTOTPsClient,
} from '../../public/b2b/totp';
import { StytchProjectConfigurationInput } from '../../public/typeConfig';

export class HeadlessB2BTOTPsClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessB2BTOTPsClient<TProjectConfiguration>
{
  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IB2BSubscriptionService<TProjectConfiguration>,
    private dfpProtectedAuth: IDFPProtectedAuthProvider,
  ) {}

  async create(data: B2BTOTPCreateOptions): Promise<B2BTOTPCreateResponse> {
    validate('stytch.totp.create')
      .isString('organization_id', data.organization_id)
      .isString('member_id', data.member_id)
      .isOptionalNumber('expiration_minutes', data.expiration_minutes);
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

  authenticate = this._subscriptionService.withUpdateSession(
    async (data: B2BTOTPAuthenticateOptions): Promise<B2BTOTPAuthenticateResponse<TProjectConfiguration>> => {
      validate('stytch.totp.authenticate')
        .isString('organization_id', data.organization_id)
        .isString('member_id', data.member_id)
        .isString('code', data.code)
        .isNumber('session_duration_minutes', data.session_duration_minutes)
        .isOptionalString('set_mfa_enrollment', data.set_mfa_enrollment)
        .isOptionalBoolean('set_default_mfa', data.set_default_mfa);
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
