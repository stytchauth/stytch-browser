import {
  OAuthGetURLOptions,
  OAuthProviders,
  OAuthStartResponse,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';

import { NativeOAuthAuthenticateResponse } from '../../../OAuthClient';
import { SafeOAuthProviderOptions } from '../components/OAuthButton';
import { useConfig, useGlobalReducer, useRedirectUrl, useStytch } from '../ContextProvider';
import { createErrorResponseFromError } from '../utils';
import { useEventLogger } from './useEventLogger';

export const useOAuthStart = <TProjectConfiguration extends StytchProjectConfigurationInput>() => {
  const stytchClient = useStytch<TProjectConfiguration>();
  const config = useConfig();
  const redirectUrl = useRedirectUrl();
  const [, dispatch] = useGlobalReducer();
  const { logEvent } = useEventLogger();

  const authenticateNativeOAuth = <TProjectConfiguration extends StytchProjectConfigurationInput>(
    resp: NativeOAuthAuthenticateResponse<TProjectConfiguration>,
  ) => {
    logEvent({ name: 'oauth_success', details: { provider_type: resp.provider_type } });
    dispatch({ type: 'oauth/authenticate/success', response: resp });
  };

  const startOAuthForProvider = async (provider: SafeOAuthProviderOptions) => {
    dispatch({ type: 'oauth/start' });
    try {
      let response: OAuthStartResponse;
      const oauthOptionsForStart: OAuthGetURLOptions = {
        login_redirect_url: redirectUrl,
        signup_redirect_url: redirectUrl,
        custom_scopes: provider.customScopes,
        provider_params: provider.providerParams,
      };
      const nativeOAuthOptions = {
        ...oauthOptionsForStart,
        session_duration_minutes: config.sessionOptions.sessionDurationMinutes,
        onCompleteCallback: authenticateNativeOAuth,
      };
      switch (provider.provider as OAuthProviders) {
        case OAuthProviders.Amazon:
          response = await stytchClient.oauth.amazon.start(oauthOptionsForStart);
          break;
        case OAuthProviders.Apple:
          response = await stytchClient.oauth.apple.start(nativeOAuthOptions);
          break;
        case OAuthProviders.Bitbucket:
          response = await stytchClient.oauth.bitbucket.start(oauthOptionsForStart);
          break;
        case OAuthProviders.Coinbase:
          response = await stytchClient.oauth.coinbase.start(oauthOptionsForStart);
          break;
        case OAuthProviders.Discord:
          response = await stytchClient.oauth.discord.start(oauthOptionsForStart);
          break;
        case OAuthProviders.Facebook:
          response = await stytchClient.oauth.facebook.start(oauthOptionsForStart);
          break;
        case OAuthProviders.Figma:
          response = await stytchClient.oauth.figma.start(oauthOptionsForStart);
          break;
        case OAuthProviders.GitLab:
          response = await stytchClient.oauth.gitlab.start(oauthOptionsForStart);
          break;
        case OAuthProviders.Github:
          response = await stytchClient.oauth.github.start(oauthOptionsForStart);
          break;
        case OAuthProviders.Google:
          response = await stytchClient.oauth.google.start(nativeOAuthOptions);
          break;
        case OAuthProviders.LinkedIn:
          response = await stytchClient.oauth.linkedin.start(oauthOptionsForStart);
          break;
        case OAuthProviders.Microsoft:
          response = await stytchClient.oauth.microsoft.start(oauthOptionsForStart);
          break;
        case OAuthProviders.Salesforce:
          response = await stytchClient.oauth.salesforce.start(oauthOptionsForStart);
          break;
        case OAuthProviders.Slack:
          response = await stytchClient.oauth.slack.start(oauthOptionsForStart);
          break;
        case OAuthProviders.Snapchat:
          response = await stytchClient.oauth.snapchat.start(oauthOptionsForStart);
          break;
        case OAuthProviders.TikTok:
          response = await stytchClient.oauth.tiktok.start(oauthOptionsForStart);
          break;
        case OAuthProviders.Twitch:
          response = await stytchClient.oauth.twitch.start(oauthOptionsForStart);
          break;
        case OAuthProviders.Twitter:
          response = await stytchClient.oauth.twitter.start(oauthOptionsForStart);
          break;
        case OAuthProviders.Yahoo:
          response = await stytchClient.oauth.yahoo.start(oauthOptionsForStart);
          break;
      }
      dispatch({ type: 'oauth/start/success', response: response });
    } catch (e: unknown) {
      const errorResponse = createErrorResponseFromError(e);
      dispatch({ type: 'oauth/start/error', error: errorResponse });
    }
  };
  return { startOAuthForProvider };
};
