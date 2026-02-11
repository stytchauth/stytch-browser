import {
  IHeadlessOAuthClient,
  OAuthAttachResponse,
  OAuthAuthenticateOptions,
  OAuthAuthenticateResponse,
  OAuthGetURLOptions,
  OAuthProviders,
  StytchProjectConfigurationInput,
} from '../public';
import { INetworkClient, IPKCEManager, IConsumerSubscriptionService } from '..';
import { WithUser, omitUser, logger, validate, isTestPublicToken } from '../utils';

type DynamicConfig = Promise<{
  cnameDomain: null | string;
  pkceRequiredForOAuth: boolean;
}>;
type Config = {
  publicToken: string;
  testAPIURL: string;
  liveAPIURL: string;
};

export class HeadlessOAuthClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessOAuthClient<TProjectConfiguration>
{
  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IConsumerSubscriptionService<TProjectConfiguration>,
    private _pkceManager: IPKCEManager,
    private _dynamicConfig: DynamicConfig,
    private _config: Config,
  ) {}

  google = {
    start: this.startOAuthFlow(OAuthProviders.Google),
  };

  apple = {
    start: this.startOAuthFlow(OAuthProviders.Apple),
  };

  microsoft = {
    start: this.startOAuthFlow(OAuthProviders.Microsoft),
  };

  github = {
    start: this.startOAuthFlow(OAuthProviders.Github),
  };

  gitlab = {
    start: this.startOAuthFlow(OAuthProviders.GitLab),
  };

  facebook = {
    start: this.startOAuthFlow(OAuthProviders.Facebook),
  };

  discord = {
    start: this.startOAuthFlow(OAuthProviders.Discord),
  };

  salesforce = {
    start: this.startOAuthFlow(OAuthProviders.Salesforce),
  };

  slack = {
    start: this.startOAuthFlow(OAuthProviders.Slack),
  };

  amazon = {
    start: this.startOAuthFlow(OAuthProviders.Amazon),
  };

  bitbucket = {
    start: this.startOAuthFlow(OAuthProviders.Bitbucket),
  };

  linkedin = {
    start: this.startOAuthFlow(OAuthProviders.LinkedIn),
  };

  coinbase = {
    start: this.startOAuthFlow(OAuthProviders.Coinbase),
  };

  twitch = {
    start: this.startOAuthFlow(OAuthProviders.Twitch),
  };

  twitter = {
    start: this.startOAuthFlow(OAuthProviders.Twitter),
  };

  tiktok = {
    start: this.startOAuthFlow(OAuthProviders.TikTok),
  };

  snapchat = {
    start: this.startOAuthFlow(OAuthProviders.Snapchat),
  };

  figma = {
    start: this.startOAuthFlow(OAuthProviders.Figma),
  };

  yahoo = {
    start: this.startOAuthFlow(OAuthProviders.Yahoo),
  };

  authenticate = this._subscriptionService.withUpdateSession(
    async (token: string, options: OAuthAuthenticateOptions) => {
      validate('stytch.oauth.authenticate')
        .isString('Token', token)
        .isNumber('session_duration_minutes', options.session_duration_minutes);

      const keyPair = await this._pkceManager.getPKPair();

      if (!keyPair) {
        logger.warn(
          'No code verifier found in local storage for OAuth flow.\n' +
            'Consider using stytch.oauth.$provider.start() to add PKCE to your OAuth flows for added security.\n' +
            'See https://stytch.com/docs/oauth#guides_pkce for more information.',
        );
      }

      const resp = await this._networkClient.fetchSDK<WithUser<OAuthAuthenticateResponse<TProjectConfiguration>>>({
        url: '/oauth/authenticate',
        method: 'POST',
        body: {
          token,
          code_verifier: keyPair?.code_verifier,
          ...options,
        },
      });

      this._pkceManager.clearPKPair();

      return omitUser(resp);
    },
  );

  async attach(provider: string): Promise<OAuthAttachResponse> {
    validate('stytch.oauth.attach').isString('Provider', provider);
    return await this._networkClient.fetchSDK<OAuthAttachResponse>({
      url: '/oauth/attach',
      method: 'POST',
      body: { provider },
    });
  }

  private async getBaseApiUrl() {
    const { cnameDomain } = await this._dynamicConfig;
    if (cnameDomain) {
      // The API returns cname domains without a protocol - assume HTTPS
      return `https://${cnameDomain}`;
    }
    // Our TestAPIURL and LiveAPIURL should have the HTTPS protocol already attached
    // Don't add it twice!
    if (isTestPublicToken(this._config.publicToken)) {
      return this._config.testAPIURL;
    }
    return this._config.liveAPIURL;
  }

  private startOAuthFlow(providerType: OAuthProviders) {
    return async ({
      login_redirect_url,
      signup_redirect_url,
      custom_scopes,
      provider_params,
      oauth_attach_token,
    }: OAuthGetURLOptions = {}): Promise<void> => {
      const { cnameDomain, pkceRequiredForOAuth } = await this._dynamicConfig;
      const baseURL = await this.getBaseApiUrl();

      this._networkClient.logEvent({
        name: 'start_oauth_flow',
        details: {
          provider_type: providerType,
          custom_scopes,
          cname_domain: cnameDomain,
          pkce: pkceRequiredForOAuth,
          provider_params,
        },
      });

      const oauthUrl = new URL(`${baseURL}/v1/public/oauth/${providerType}/start`);
      oauthUrl.searchParams.set('public_token', this._config.publicToken);

      if (pkceRequiredForOAuth) {
        const keyPair = await this._pkceManager.startPKCETransaction();
        oauthUrl.searchParams.set('code_challenge', keyPair.code_challenge);
      } else {
        this._pkceManager.clearPKPair();
      }

      if (custom_scopes) {
        validate('startOAuthFlow').isStringArray('custom_scopes', custom_scopes);
        oauthUrl.searchParams.set('custom_scopes', custom_scopes.join(' '));
      }
      if (provider_params) {
        validate('startOAuthFlow').isOptionalObject('provider_params', provider_params);
        for (const key in provider_params) {
          oauthUrl.searchParams.set('provider_' + key, provider_params[key]);
        }
      }
      if (login_redirect_url) oauthUrl.searchParams.set('login_redirect_url', login_redirect_url);
      if (signup_redirect_url) oauthUrl.searchParams.set('signup_redirect_url', signup_redirect_url);
      if (oauth_attach_token) oauthUrl.searchParams.set('oauth_attach_token', oauth_attach_token);

      window.location.href = oauthUrl.toString();
    };
  }
}
