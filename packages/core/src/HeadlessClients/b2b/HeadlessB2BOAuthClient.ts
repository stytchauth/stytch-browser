import { IB2BSubscriptionService, IDFPProtectedAuthProvider, INetworkClient, IPKCEManager } from '../..';
import {
  B2BOAuthAuthenticateOptions,
  B2BOAuthAuthenticateResponse,
  B2BOAuthDiscoveryAuthenticateResponse,
  B2BOAuthDiscoveryStartOptions,
  IHeadlessB2BOAuthClient,
  OAuthDiscoveryAuthenticateOptions,
  OAuthStartOptions,
} from '../../public/b2b/oauth';
import { B2BOAuthProviders } from '../../public/b2b/ui';
import { StytchProjectConfigurationInput } from '../../public/typeConfig';
import { isTestPublicToken, logger } from '../../utils';
import { validateInDev } from '../../utils/dev';

type DynamicConfig = Promise<{
  cnameDomain: null | string;
  pkceRequiredForOAuth: boolean;
}>;
type Config = {
  publicToken: string;
  testAPIURL: string;
  liveAPIURL: string;
};

export class HeadlessB2BOAuthClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessB2BOAuthClient<TProjectConfiguration>
{
  authenticate: (options: B2BOAuthAuthenticateOptions) => Promise<B2BOAuthAuthenticateResponse<TProjectConfiguration>>;

  discovery: {
    authenticate: (
      data: OAuthDiscoveryAuthenticateOptions,
    ) => Promise<B2BOAuthDiscoveryAuthenticateResponse<TProjectConfiguration>>;
  };

  google: {
    start: (options: OAuthStartOptions) => Promise<void>;
    discovery: {
      start: (options: B2BOAuthDiscoveryStartOptions) => Promise<void>;
    };
  };

  microsoft: {
    start: (options: OAuthStartOptions) => Promise<void>;
    discovery: {
      start: (options: B2BOAuthDiscoveryStartOptions) => Promise<void>;
    };
  };

  hubspot: {
    start: (options: OAuthStartOptions) => Promise<void>;
    discovery: {
      start: (options: B2BOAuthDiscoveryStartOptions) => Promise<void>;
    };
  };

  slack: {
    start: (options: OAuthStartOptions) => Promise<void>;
    discovery: {
      start: (options: B2BOAuthDiscoveryStartOptions) => Promise<void>;
    };
  };

  github: {
    start: (options: OAuthStartOptions) => Promise<void>;
    discovery: {
      start: (options: B2BOAuthDiscoveryStartOptions) => Promise<void>;
    };
  };

  constructor(
    protected _networkClient: INetworkClient,
    protected _subscriptionService: IB2BSubscriptionService<TProjectConfiguration>,
    protected _pkceManager: IPKCEManager,
    protected _dynamicConfig: DynamicConfig,
    protected _config: Config,
    protected dfpProtectedAuth: IDFPProtectedAuthProvider,
  ) {
    this.authenticate = this._subscriptionService.withUpdateSession(async (options: B2BOAuthAuthenticateOptions) => {
      validateInDev('stytch.oauth.authenticate', options, {
        oauth_token: 'string',
        session_duration_minutes: 'number',
        locale: 'optionalString',
      });

      const keyPair = await this._pkceManager.getPKPair();

      if (!keyPair) {
        logger.warn(
          'No code verifier found in local storage for OAuth flow.\n' +
            'Consider using stytch.oauth.$provider.start() to add PKCE to your OAuth flows for added security.\n' +
            'See https://stytch.com/docs/oauth#guides_pkce for more information.',
        );
      }

      const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
      const resp = await this._networkClient.retriableFetchSDK<B2BOAuthAuthenticateResponse<TProjectConfiguration>>({
        url: '/b2b/oauth/authenticate',
        method: 'POST',
        body: {
          pkce_code_verifier: keyPair?.code_verifier,
          dfp_telemetry_id,
          captcha_token,
          intermediate_session_token: (await this._subscriptionService.getIntermediateSessionToken()) || undefined,
          ...options,
        },
        retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
      });

      this._pkceManager.clearPKPair();

      return resp;
    });

    this.discovery = {
      authenticate: this._subscriptionService.withUpdateSession(
        async (
          data: OAuthDiscoveryAuthenticateOptions,
        ): Promise<B2BOAuthDiscoveryAuthenticateResponse<TProjectConfiguration>> => {
          validateInDev('stytch.oauth.discovery.authenticate', data, {
            discovery_oauth_token: 'string',
          });

          const pkPair = await this._pkceManager.getPKPair();

          const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();

          const requestBody = {
            pkce_code_verifier: pkPair?.code_verifier,
            dfp_telemetry_id,
            captcha_token,
            ...data,
          };
          const resp = await this._networkClient.retriableFetchSDK<
            B2BOAuthDiscoveryAuthenticateResponse<TProjectConfiguration>
          >({
            url: '/b2b/oauth/discovery/authenticate',
            body: requestBody,
            method: 'POST',
            retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
          });

          this._pkceManager.clearPKPair();

          return resp;
        },
      ),
    };

    this.google = {
      start: this.startOAuthFlow(B2BOAuthProviders.Google),
      discovery: {
        start: this.startDiscoveryOAuthFlow(B2BOAuthProviders.Google),
      },
    };

    this.microsoft = {
      start: this.startOAuthFlow(B2BOAuthProviders.Microsoft),
      discovery: {
        start: this.startDiscoveryOAuthFlow(B2BOAuthProviders.Microsoft),
      },
    };

    this.hubspot = {
      start: this.startOAuthFlow(B2BOAuthProviders.HubSpot),
      discovery: {
        start: this.startDiscoveryOAuthFlow(B2BOAuthProviders.HubSpot),
      },
    };

    this.slack = {
      start: this.startOAuthFlow(B2BOAuthProviders.Slack),
      discovery: {
        start: this.startDiscoveryOAuthFlow(B2BOAuthProviders.Slack),
      },
    };

    this.github = {
      start: this.startOAuthFlow(B2BOAuthProviders.GitHub),
      discovery: {
        start: this.startDiscoveryOAuthFlow(B2BOAuthProviders.GitHub),
      },
    };
  }

  protected async getBaseApiUrl() {
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

  protected startOAuthFlow(providerType: B2BOAuthProviders) {
    return async (options: OAuthStartOptions): Promise<void> => {
      const {
        organization_id,
        organization_slug,
        login_redirect_url,
        signup_redirect_url,
        custom_scopes,
        provider_params,
      } = options;
      const { pkceRequiredForOAuth } = await this._dynamicConfig;
      const baseURL = await this.getBaseApiUrl();

      const startUrl = new URL(`${baseURL}/v1/b2b/public/oauth/${providerType}/start`);
      startUrl.searchParams.set('public_token', this._config.publicToken);
      if (organization_id && organization_id != '') {
        startUrl.searchParams.set('organization_id', organization_id);
      }

      if (organization_slug && organization_slug != '') {
        startUrl.searchParams.set('slug', organization_slug);
      }

      if (custom_scopes) {
        validateInDev(
          'startOAuthFlow',
          { custom_scopes },
          {
            custom_scopes: 'stringArray',
          },
        );
        startUrl.searchParams.set('custom_scopes', custom_scopes.join(' '));
      }
      if (provider_params) {
        validateInDev(
          'startOAuthFlow',
          { provider_params },
          {
            provider_params: 'optionalObject',
          },
        );
        for (const key in provider_params) {
          startUrl.searchParams.set('provider_' + key, provider_params[key]);
        }
      }

      if (pkceRequiredForOAuth) {
        const keyPair = await this._pkceManager.startPKCETransaction();
        startUrl.searchParams.set('pkce_code_challenge', keyPair.code_challenge);
      } else {
        this._pkceManager.clearPKPair();
      }

      if (login_redirect_url) startUrl.searchParams.set('login_redirect_url', login_redirect_url);
      if (signup_redirect_url) startUrl.searchParams.set('signup_redirect_url', signup_redirect_url);

      this.navigate(startUrl);
    };
  }

  protected startDiscoveryOAuthFlow(providerType: B2BOAuthProviders) {
    return async (options: B2BOAuthDiscoveryStartOptions): Promise<void> => {
      const { discovery_redirect_url, custom_scopes, provider_params } = options;
      const { pkceRequiredForOAuth } = await this._dynamicConfig;
      const baseURL = await this.getBaseApiUrl();

      const startUrl = new URL(`${baseURL}/v1/b2b/public/oauth/${providerType}/discovery/start`);
      startUrl.searchParams.set('public_token', this._config.publicToken);
      if (custom_scopes) {
        validateInDev(
          'startOAuthFlow',
          { custom_scopes },
          {
            custom_scopes: 'stringArray',
          },
        );
        startUrl.searchParams.set('custom_scopes', custom_scopes.join(' '));
      }
      if (provider_params) {
        validateInDev(
          'startOAuthFlow',
          { provider_params },
          {
            provider_params: 'optionalObject',
          },
        );
        for (const key in provider_params) {
          startUrl.searchParams.set('provider_' + key, provider_params[key]);
        }
      }

      if (pkceRequiredForOAuth) {
        const keyPair = await this._pkceManager.startPKCETransaction();
        startUrl.searchParams.set('pkce_code_challenge', keyPair.code_challenge);
      } else {
        this._pkceManager.clearPKPair();
      }

      if (discovery_redirect_url) {
        startUrl.searchParams.set('discovery_redirect_url', discovery_redirect_url);
      }

      this.navigate(startUrl);
    };
  }

  // Public so it can be mocked in tests
  navigate(url: URL) {
    window.location.href = url.toString();
  }
}
