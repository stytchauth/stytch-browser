import {
  HeadlessB2BOAuthClient,
  IB2BSubscriptionService,
  IDFPProtectedAuthProvider,
  INetworkClient,
  IPKCEManager,
  validateInDev,
} from '@stytch/core';
import {
  B2BOAuthDiscoveryStartOptions,
  B2BOAuthProviders,
  IHeadlessB2BOAuthClient,
  OAuthStartOptions,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';
import { InAppBrowser } from '@stytch/react-native-inappbrowser-reborn';
import { Linking } from 'react-native';

type DynamicConfig = Promise<{
  cnameDomain: null | string;
  pkceRequiredForOAuth: boolean;
}>;

type Config = {
  publicToken: string;
  testAPIURL: string;
  liveAPIURL: string;
};

export class B2BOAuthClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  extends HeadlessB2BOAuthClient<TProjectConfiguration>
  implements IHeadlessB2BOAuthClient<TProjectConfiguration>
{
  constructor(
    _networkClient: INetworkClient,
    _subscriptionService: IB2BSubscriptionService<TProjectConfiguration>,
    _pkceManager: IPKCEManager,
    _dynamicConfig: DynamicConfig,
    _config: Config,
    protected dfpProtectedAuth: IDFPProtectedAuthProvider,
  ) {
    super(_networkClient, _subscriptionService, _pkceManager, _dynamicConfig, _config, dfpProtectedAuth);
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

      const queryParams: Record<string, string> = { public_token: this._config.publicToken };

      if (login_redirect_url) {
        queryParams['login_redirect_url'] = login_redirect_url;
      }

      if (signup_redirect_url) {
        queryParams['signup_redirect_url'] = signup_redirect_url;
      }

      if (organization_id) {
        queryParams['organization_id'] = organization_id;
      }

      if (organization_slug) {
        queryParams['slug'] = organization_slug;
      }

      if (custom_scopes) {
        validateInDev(
          'startOAuthFlow',
          { custom_scopes },
          {
            custom_scopes: 'stringArray',
          },
        );
        queryParams['custom_scopes'] = custom_scopes.join(' ');
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
          queryParams['provider_' + key] = provider_params[key];
        }
      }

      if (pkceRequiredForOAuth) {
        const keyPair = await this._pkceManager.startPKCETransaction();
        queryParams['pkce_code_challenge'] = keyPair.code_challenge;
      } else {
        this._pkceManager.clearPKPair();
      }

      // maps queryParams dict into url query params format
      const queryParamsAsString = Object.keys(queryParams)
        .reduce(
          (prevValue, currValue) =>
            `${prevValue}&${encodeURIComponent(currValue)}=${encodeURIComponent(queryParams[currValue])}`,
          '',
        )
        .slice(1);
      const startUrl = `${baseURL}/v1/b2b/public/oauth/${providerType}/start?${queryParamsAsString}`;

      if (await InAppBrowser.isAvailable()) {
        let resp;
        try {
          InAppBrowser.closeAuth();
          resp = await InAppBrowser.openAuth(startUrl, '');
        } catch {
          InAppBrowser.closeAuth();
          resp = await InAppBrowser.openAuth(startUrl, '');
        }
        if (resp.type === 'success') {
          Linking.openURL(resp.url);
        }
      } else {
        Linking.openURL(startUrl);
      }
    };
  }

  protected startDiscoveryOAuthFlow(providerType: B2BOAuthProviders) {
    return async (options: B2BOAuthDiscoveryStartOptions): Promise<void> => {
      const { discovery_redirect_url, custom_scopes, provider_params } = options;
      const { pkceRequiredForOAuth } = await this._dynamicConfig;

      const baseURL = await this.getBaseApiUrl();

      const queryParams: Record<string, string> = { public_token: this._config.publicToken };

      if (discovery_redirect_url) {
        queryParams['discovery_redirect_url'] = discovery_redirect_url;
      }

      if (custom_scopes) {
        validateInDev(
          'startOAuthFlow',
          { custom_scopes },
          {
            custom_scopes: 'stringArray',
          },
        );
        queryParams['custom_scopes'] = custom_scopes.join(' ');
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
          queryParams['provider_' + key] = provider_params[key];
        }
      }

      if (pkceRequiredForOAuth) {
        const keyPair = await this._pkceManager.startPKCETransaction();
        queryParams['pkce_code_challenge'] = keyPair.code_challenge;
      } else {
        this._pkceManager.clearPKPair();
      }

      // maps queryParams dict into url query params format
      const queryParamsAsString = Object.keys(queryParams)
        .reduce(
          (prevValue, currValue) =>
            `${prevValue}&${encodeURIComponent(currValue)}=${encodeURIComponent(queryParams[currValue])}`,
          '',
        )
        .slice(1);
      const startUrl = `${baseURL}/v1/b2b/public/oauth/${providerType}/discovery/start?${queryParamsAsString}`;

      if (await InAppBrowser.isAvailable()) {
        let resp;
        try {
          InAppBrowser.closeAuth();
          resp = await InAppBrowser.openAuth(startUrl, '');
        } catch {
          InAppBrowser.closeAuth();
          resp = await InAppBrowser.openAuth(startUrl, '');
        }
        if (resp.type === 'success') {
          Linking.openURL(resp.url);
        }
      } else {
        Linking.openURL(startUrl);
      }
    };
  }
}
