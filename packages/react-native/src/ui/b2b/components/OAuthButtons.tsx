import { B2BOAuthProviders } from '@stytch/core/public';
import React from 'react';
import { View } from 'react-native';

import { useConfig, useGlobalReducer } from '../ContextProvider';
import { useEffectiveAuthConfig } from '../hooks/useEffectiveAuthConfig';
import { OAuthB2BButton } from './OAuthB2BButton';

export const getCustomScopesForProvider = (
  oauthProvider: {
    type: B2BOAuthProviders;
    one_tap: boolean;
    customScopes: string[];
    providerParams: Record<string, string>;
  },
  oauthOptionsCustomScopes: string[] | undefined,
) => {
  let currentCustomScopes = oauthProvider.customScopes;
  if (Object.keys(currentCustomScopes).length == 0) {
    currentCustomScopes = oauthOptionsCustomScopes as string[];
  }
  return currentCustomScopes;
};

export const getProviderParamsForProvider = (
  oauthProvider: {
    type: B2BOAuthProviders;
    one_tap: boolean;
    customScopes: string[];
    providerParams: Record<string, string>;
  },
  oauthOptionsProviderParams: Record<string, string> | undefined,
  email: string | undefined,
) => {
  let currentProviderParams = oauthProvider.providerParams;
  if (Object.keys(currentProviderParams).length == 0) {
    currentProviderParams = oauthOptionsProviderParams ?? {};
  }

  if (
    email &&
    (oauthProvider.type === B2BOAuthProviders.Google || oauthProvider.type === B2BOAuthProviders.Microsoft) &&
    !('login_hint' in currentProviderParams)
  ) {
    currentProviderParams = {
      ...currentProviderParams,
      login_hint: email,
    };
  }

  return currentProviderParams;
};

const getProviderInfo = (provider: string) => {
  switch (provider) {
    case B2BOAuthProviders.Google:
      return {
        providerTypeTitle: 'Google',
        icon: require('../../assets/google.png'),
      };
    case B2BOAuthProviders.Microsoft:
      return {
        providerTypeTitle: 'Microsoft',
        icon: require('../../assets/microsoft.png'),
      };
    case B2BOAuthProviders.HubSpot:
      return {
        providerTypeTitle: 'HubSpot',
        icon: require('../../assets/hubspot.png'),
      };
    case B2BOAuthProviders.Slack:
      return {
        providerTypeTitle: 'Slack',
        icon: require('../../assets/slack.png'),
      };
    case B2BOAuthProviders.GitHub:
      return {
        providerTypeTitle: 'GitHub',
        icon: require('../../assets/github.png'),
      };
    default:
      return {
        providerTypeTitle: '',
        icon: <></>,
      };
  }
};

export const OAuthButtons = () => {
  const [state] = useGlobalReducer();
  const { oauthProviderSettings } = useEffectiveAuthConfig();

  const config = useConfig();
  const { loginRedirectURL, signupRedirectURL, discoveryRedirectURL, customScopes, providerParams } =
    config.productConfig.oauthOptions ?? {};

  const mappedProviders = oauthProviderSettings.map((oauthProvider) => {
    const { icon, providerTypeTitle } = getProviderInfo(oauthProvider.type);
    return (
      <OAuthB2BButton
        key={`oauth-${oauthProvider.type}`}
        icon={icon}
        providerTypeTitle={providerTypeTitle}
        providerType={oauthProvider.type}
        loginRedirectUrl={loginRedirectURL}
        signupRedirectUrl={signupRedirectURL}
        discoveryRedirectUrl={discoveryRedirectURL}
        customScopes={getCustomScopesForProvider(oauthProvider, customScopes)}
        providerParams={getProviderParamsForProvider(
          oauthProvider,
          providerParams,
          state.memberState.emailAddress.emailAddress,
        )}
      />
    );
  });

  return <View style={{ flexDirection: 'column', gap: 8, marginBottom: 8 }}>{mappedProviders}</View>;
};
