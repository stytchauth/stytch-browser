import {
  IAsyncPKCEManager,
  IConsumerSubscriptionService,
  INetworkClient,
  isTestPublicToken,
  logger,
  omitUser,
  removeResponseCommon,
  validateInDev,
  WithUser,
} from '@stytch/core';
import {
  errorToStytchError,
  IRNHeadlessOAuthClient,
  MissingGoogleClientIDError,
  MissingPKCEError,
  OAuthAttachResponse,
  OAuthAuthenticateOptions,
  OAuthAuthenticateResponse,
  OAuthProviders,
  OAuthStartResponse,
  RNOAuthGetURLOptions,
  StytchAPIError,
  StytchProjectConfigurationInput,
  UserCancellationError,
  UserUpdateResponse,
} from '@stytch/core/public';
import { InAppBrowser } from '@stytch/react-native-inappbrowser-reborn';
import { Linking } from 'react-native';

import StytchReactNativeModule from './native-module';
import { Platform } from './native-module/types';

type DynamicConfig = Promise<{
  cnameDomain: null | string;
}>;
type Config = {
  publicToken: string;
  testAPIURL: string;
  liveAPIURL: string;
};

export type NativeOAuthAuthenticateResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = OAuthAuthenticateResponse<TProjectConfiguration> & {
  user_created: boolean;
};

export interface INativeOAuthClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  extends IRNHeadlessOAuthClient<TProjectConfiguration> {
  googleOneTap(options?: NativeOAuthOptions<TProjectConfiguration>): Promise<OAuthStartResponse>;
  signInWithApple(options?: NativeOAuthOptions<TProjectConfiguration>): Promise<OAuthStartResponse>;
  google: INativeOAuthProvider<TProjectConfiguration>;
  apple: INativeOAuthProvider<TProjectConfiguration>;
}

interface INativeOAuthProvider<TProjectConfiguration extends StytchProjectConfigurationInput> {
  start(options?: NativeOAuthOptions<TProjectConfiguration> & RNOAuthGetURLOptions): Promise<OAuthStartResponse>;
  startWithRedirect(options?: RNOAuthGetURLOptions): Promise<OAuthStartResponse>;
}

/**
 * These options are only used in the React Native SDK for Google One Tap or Sign in with Apple.
 */
type NativeOAuthOptions<TProjectConfiguration extends StytchProjectConfigurationInput> = {
  /**
   * An optional param for session duration.
   */
  session_duration_minutes?: number;
  /**
   * An optional param that allows a callback after Stytch has verified the OAuth request.
   */
  onCompleteCallback?: (resp: NativeOAuthAuthenticateResponse<TProjectConfiguration>) => void;
  /**
   * An optional token to pre-associate an OAuth flow with an existing Stytch User
   */
  oauth_attach_token?: string;
};

export class HeadlessOAuthClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements INativeOAuthClient<TProjectConfiguration>
{
  private nativeModule: StytchReactNativeModule;

  authenticate: (
    token: string,
    options: OAuthAuthenticateOptions,
  ) => Promise<OAuthAuthenticateResponse<TProjectConfiguration>>;

  constructor(
    private _networkClient: INetworkClient,
    private _subscriptionService: IConsumerSubscriptionService<TProjectConfiguration>,
    private _pkceManager: IAsyncPKCEManager,
    private _dynamicConfig: DynamicConfig,
    private _config: Config,
  ) {
    this.nativeModule = new StytchReactNativeModule();
    this.authenticate = this._subscriptionService.withUpdateSession(
      async (
        token: string,
        options: OAuthAuthenticateOptions,
      ): Promise<OAuthAuthenticateResponse<TProjectConfiguration>> => {
        validateInDev(
          'stytch.oauth.authenticate',
          { token, ...options },
          {
            token: 'string',
            session_duration_minutes: 'number',
          },
        );

        const keyPair = await this._pkceManager.getPKPair();

        if (!keyPair) {
          return Promise.reject(new MissingPKCEError());
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
  }

  googleOneTap(options?: NativeOAuthOptions<TProjectConfiguration>) {
    return this.startNativeGoogleOAuthFlow(
      options?.session_duration_minutes,
      options?.onCompleteCallback,
      options?.oauth_attach_token,
    );
  }

  signInWithApple(options?: NativeOAuthOptions<TProjectConfiguration>) {
    return this.startNativeAppleOAuthFlow(
      options?.session_duration_minutes,
      options?.onCompleteCallback,
      options?.oauth_attach_token,
    );
  }

  google = {
    start: this.startGoogleOAuthFlowWithFallback(),
    startWithRedirect: this.startOAuthFlow(OAuthProviders.Google),
  };

  apple = {
    start: this.startAppleOAuthFlowWithFallback(),
    startWithRedirect: this.startOAuthFlow(OAuthProviders.Apple),
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

  async attach(provider: string): Promise<OAuthAttachResponse> {
    validateInDev('stytch.oauth.attach', { provider }, { provider: 'string' });
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
    return async (options: RNOAuthGetURLOptions = {}): Promise<OAuthStartResponse> => {
      const { cnameDomain } = await this._dynamicConfig;

      this._networkClient.logEvent({
        name: 'start_oauth_flow',
        details: {
          provider_type: providerType,
          custom_scopes: options.custom_scopes,
          cname_domain: cnameDomain,
          pkce: true,
        },
      });

      const oauthUrl = await this.createOAuthURL(providerType, options);
      if (await InAppBrowser.isAvailable()) {
        let resp;
        try {
          InAppBrowser.closeAuth();
          resp = await InAppBrowser.openAuth(oauthUrl, '', { showInRecents: options.show_in_recents === true });
        } catch {
          InAppBrowser.closeAuth();
          resp = await InAppBrowser.openAuth(oauthUrl, '', { showInRecents: options.show_in_recents === true });
        }
        if (resp.type === 'success') {
          Linking.openURL(resp.url);
          return { success: true };
        } else {
          return { success: false, reason: 'User Canceled' };
        }
      } else {
        Linking.openURL(oauthUrl);
        return { success: true };
      }
    };
  }

  private async createOAuthURL(
    providerType: OAuthProviders,
    {
      login_redirect_url,
      signup_redirect_url,
      custom_scopes,
      provider_params,
      oauth_attach_token,
    }: RNOAuthGetURLOptions,
  ) {
    const baseURL = await this.getBaseApiUrl();

    const keyPair = await this._pkceManager.startPKCETransaction();

    const queryParams: Record<string, string> = {
      public_token: this._config.publicToken,
      code_challenge: keyPair.code_challenge,
    };

    if (custom_scopes) {
      validateInDev(
        'createOAuthURL', //
        { custom_scopes },
        { custom_scopes: 'stringArray' },
      );
      queryParams['custom_scopes'] = custom_scopes.join(' ');
    }

    if (provider_params) {
      validateInDev(
        'createOAuthURL', //
        { provider_params },
        { provider_params: 'optionalObject' },
      );
      for (const key in provider_params) {
        queryParams['provider_' + key] = provider_params[key];
      }
    }

    if (login_redirect_url) queryParams['login_redirect_url'] = login_redirect_url;
    if (signup_redirect_url) queryParams['signup_redirect_url'] = signup_redirect_url;
    if (oauth_attach_token) queryParams['oauth_attach_token'] = oauth_attach_token;

    // maps queryParams dict into url query params format
    const queryParamsAsString = Object.keys(queryParams)
      .reduce((prevValue, currValue) => `${prevValue}&${currValue}=${queryParams[currValue]}`, '')
      .slice(1);

    return `${baseURL}/v1/public/oauth/${providerType}/start?${queryParamsAsString}`;
  }

  private async startNativeAppleOAuthFlow(
    session_duration_minutes?: number,
    onCompleteCallback?: (resp: NativeOAuthAuthenticateResponse<TProjectConfiguration>) => void,
    oauth_attach_token?: string,
  ): Promise<OAuthStartResponse> {
    const platform = this.nativeModule.DeviceInfo.get().platform;
    if (platform !== Platform.iOS) {
      return { success: false, reason: 'Invalid Platform' };
    }
    return this.nativeModule.OAuth.signInWithAppleStart()
      .then(async ({ idToken, nonce, name }): Promise<OAuthStartResponse> => {
        const sessionDurationMinutes = session_duration_minutes || 60;
        return await this._networkClient
          .fetchSDK<WithUser<NativeOAuthAuthenticateResponse<TProjectConfiguration>>>({
            url: '/oauth/apple/id_token/authenticate',
            method: 'POST',
            body: {
              id_token: idToken,
              nonce: nonce,
              session_duration_minutes: sessionDurationMinutes,
              oauth_attach_token: oauth_attach_token,
            },
          })
          .then(async (resp: NativeOAuthAuthenticateResponse<TProjectConfiguration>): Promise<OAuthStartResponse> => {
            this._subscriptionService.updateSession(resp, { sessionDurationMinutes });
            if (name != undefined) {
              const updateUserResp = await this._networkClient.fetchSDK<WithUser<UserUpdateResponse>>({
                url: '/users/me',
                body: {
                  name: {
                    first_name: name.firstName,
                    last_name: name.lastName,
                  },
                },
                method: 'PUT',
              });
              const user = removeResponseCommon(updateUserResp.__user);
              this._subscriptionService.updateUser(user);
            }
            onCompleteCallback?.(resp);
            return { success: true };
          })
          .catch((err): OAuthStartResponse => {
            logger.error('Unable to authenticate OAuth ID token', err);
            const stytchError = errorToStytchError(err);
            return { success: false, reason: 'Authentication Failed', error: stytchError };
          });
      })
      .catch((err: Error): OAuthStartResponse => {
        logger.warn('Sign In With Apple is unavailable', err);
        return { success: false, reason: 'User Canceled', error: new UserCancellationError() };
      });
  }

  private async fetchGoogleClientId(publicToken: string) {
    const baseURL = await this.getBaseApiUrl();
    const oneTapStartUrl = `${baseURL}/v1/public/oauth/google/onetap/start?public_token=${publicToken}`;
    const resp = await fetch(oneTapStartUrl, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await resp.json();
    if (!resp.ok) {
      throw new StytchAPIError(data);
    }
    const { request_id, google_client_id } = data;
    if (!google_client_id) {
      throw new MissingGoogleClientIDError();
    }
    return {
      requestId: request_id,
      googleClientId: google_client_id,
    };
  }

  private async startNativeGoogleOAuthFlow(
    session_duration_minutes?: number,
    onCompleteCallback?: (resp: NativeOAuthAuthenticateResponse<TProjectConfiguration>) => void,
    oauth_attach_token?: string,
  ): Promise<OAuthStartResponse> {
    const system = this.nativeModule.DeviceInfo.get().platform;
    if (system !== Platform.Android) {
      return { success: false, reason: 'Invalid Platform' };
    }
    const { googleClientId } = await this.fetchGoogleClientId(this._config.publicToken);
    return this.nativeModule.OAuth.googleOneTapStart(googleClientId, false)
      .then(async ({ idToken, nonce }): Promise<OAuthStartResponse> => {
        const sessionDurationMinutes = session_duration_minutes || 60;
        return await this._networkClient
          .fetchSDK<WithUser<NativeOAuthAuthenticateResponse<TProjectConfiguration>>>({
            url: '/oauth/google/id_token/authenticate',
            method: 'POST',
            body: {
              id_token: idToken,
              nonce: nonce,
              session_duration_minutes: sessionDurationMinutes,
              oauth_attach_token: oauth_attach_token,
            },
          })
          .then((resp: NativeOAuthAuthenticateResponse<TProjectConfiguration>): OAuthStartResponse => {
            this._subscriptionService.updateSession(resp, { sessionDurationMinutes });
            onCompleteCallback?.(resp);
            return { success: true };
          })
          .catch((err): OAuthStartResponse => {
            logger.error('Unable to authenticate OAuth ID token', err);
            const stytchError = errorToStytchError(err);
            return { success: false, reason: 'Authentication Failed', error: stytchError };
          });
      })
      .catch((err: Error): OAuthStartResponse => {
        logger.warn('Google OneTap is unavailable', err);
        return { success: false, reason: 'User Canceled', error: new UserCancellationError() };
      });
  }

  private startGoogleOAuthFlowWithFallback() {
    return async (
      options: NativeOAuthOptions<TProjectConfiguration> & RNOAuthGetURLOptions = {},
    ): Promise<OAuthStartResponse> => {
      const resp = await this.startNativeGoogleOAuthFlow(
        options.session_duration_minutes,
        options.onCompleteCallback,
        options.oauth_attach_token,
      );
      if (!resp || resp.success !== true) {
        return this.startOAuthFlow(OAuthProviders.Google)(options);
      }
      return { success: true };
    };
  }

  private startAppleOAuthFlowWithFallback() {
    return async (
      options: NativeOAuthOptions<TProjectConfiguration> & RNOAuthGetURLOptions = {},
    ): Promise<OAuthStartResponse> => {
      const resp = await this.startNativeAppleOAuthFlow(
        options.session_duration_minutes,
        options.onCompleteCallback,
        options.oauth_attach_token,
      );
      if (!resp || resp.success !== true) {
        return this.startOAuthFlow(OAuthProviders.Apple)(options);
      }
      return { success: true };
    };
  }
}
