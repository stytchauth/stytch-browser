import {
  HeadlessB2BSSOClient,
  IAsyncPKCEManager,
  IB2BSubscriptionService,
  IDFPProtectedAuthProvider,
  INetworkClient,
  validateInDev,
} from '@stytch/core';
import {
  IHeadlessB2BSSOClient,
  MissingPKCEError,
  SSOAuthenticateOptions,
  SSOAuthenticateResponse,
  SSOStartOptions,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';
import { InAppBrowser } from '@stytch/react-native-inappbrowser-reborn';
import { Linking } from 'react-native';

type Config = {
  publicToken: string;
  testAPIURL: string;
  liveAPIURL: string;
};

export class B2BSSOClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  extends HeadlessB2BSSOClient<TProjectConfiguration>
  implements IHeadlessB2BSSOClient<TProjectConfiguration>
{
  constructor(
    _networkClient: INetworkClient,
    _subscriptionService: IB2BSubscriptionService<TProjectConfiguration>,
    _pkceManager: IAsyncPKCEManager,
    _config: Config,
    protected dfpProtectedAuth: IDFPProtectedAuthProvider,
  ) {
    super(
      _networkClient,
      _subscriptionService,
      _pkceManager,
      Promise.resolve({
        pkceRequiredForSso: false,
      }),
      _config,
      dfpProtectedAuth,
    );
  }

  authenticate = this._subscriptionService.withUpdateSession(async (options: SSOAuthenticateOptions) => {
    validateInDev('stytch.sso.authenticate', options, {
      sso_token: 'string',
      session_duration_minutes: 'number',
    });
    const keyPair = await this._pkceManager.getPKPair();

    if (!keyPair) {
      return Promise.reject(new MissingPKCEError());
    }
    const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

    const resp = await this._networkClient.retriableFetchSDK<SSOAuthenticateResponse<TProjectConfiguration>>({
      url: '/b2b/sso/authenticate',
      method: 'POST',
      body: {
        pkce_code_verifier: keyPair?.code_verifier,
        ...options,
        dfp_telemetry_id,
        captcha_token,
        intermediate_session_token: this._subscriptionService.getIntermediateSessionToken() || undefined,
      },
      retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
    });

    this._pkceManager.clearPKPair();

    return resp;
  });

  async start(options: SSOStartOptions): Promise<void> {
    const ssoUrl = await this.createSSOURL(options);
    if (await InAppBrowser.isAvailable()) {
      const resp = await InAppBrowser.openAuth(ssoUrl, '');
      if (resp.type === 'success') {
        Linking.openURL(resp.url);
      }
    } else {
      Linking.openURL(ssoUrl);
    }
  }

  private async createSSOURL({ connection_id, login_redirect_url, signup_redirect_url }: SSOStartOptions) {
    const baseURL = await this.getBaseApiUrl();
    const keyPair = await this._pkceManager.startPKCETransaction();
    const queryParams: Record<string, string> = {
      public_token: this._config.publicToken,
      connection_id: connection_id,
      pkce_code_challenge: keyPair.code_challenge,
    };
    if (login_redirect_url) queryParams['login_redirect_url'] = login_redirect_url;
    if (signup_redirect_url) queryParams['signup_redirect_url'] = signup_redirect_url;
    // maps queryParams dict into url query params format
    const queryParamsAsString = Object.keys(queryParams)
      .reduce(
        (prevValue, currValue) =>
          `${prevValue}&${encodeURIComponent(currValue)}=${encodeURIComponent(queryParams[currValue])}`,
        '',
      )
      .slice(1);
    return `${baseURL}/v1/public/sso/start?${queryParamsAsString}`;
  }
}
