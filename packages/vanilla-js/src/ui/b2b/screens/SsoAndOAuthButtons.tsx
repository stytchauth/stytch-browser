import React from 'react';
import { B2BOAuthProviders, AuthFlowType } from '@stytch/core/public';
import { arrayUtils } from '@stytch/core';
import { useLingui } from '@lingui/react/macro';

import { Text } from '../../components/Text';
import { B2BGoogleOneTap } from '../components/B2BOneTap';
import { OAuthB2BButton } from '../components/OAuthB2BButton';
import { AuthButton } from '../components/AuthButton';
import { useConfig, useGlobalReducer } from '../GlobalContextProvider';
import { AppScreens } from '../types/AppScreens';
import { OauthProviderParams, useEffectiveAuthConfig } from '../hooks/useEffectiveAuthConfig';
import { SSOButton } from '../components/SSOButton';
import { Component } from '../generateProductComponentsOrdering';
import { assertUnreachable } from '../../../utils/assertUnreachable';
import { AuthButton as AuthButtonType, getButtonId, getSsoMethodKey } from '../types/authMethodKeys';
import { useLastUsedAuthMethod } from '../hooks/useLastUsedAuthMethod';

import SSOIcon from '../../../assets/sso';

// OAuth helper functions
export const getCustomScopesForProvider = (
  oauthProvider: {
    type: B2BOAuthProviders;
    one_tap: boolean;
    customScopes: string[];
    providerParams: Record<string, string>;
    cancel_on_tap_outside?: boolean;
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
    cancel_on_tap_outside?: boolean;
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

export const SsoAndOAuthButtons = ({ buttons }: { buttons: (Component.OAuthButtons | Component.SSOButtons)[] }) => {
  const { t } = useLingui();
  const [state, dispatch] = useGlobalReducer();
  const { oauthProviderSettings = [] } = useEffectiveAuthConfig();

  const [lastUsedMethod, setLastUsedMethod] = useLastUsedAuthMethod();

  const config = useConfig();
  const { loginRedirectURL, signupRedirectURL, discoveryRedirectURL, customScopes, providerParams } =
    config.oauthOptions ?? {};

  // Determine which buttons need to be displayed
  const isDiscoveryFlow = state.flowState.type === AuthFlowType.Discovery;
  const authButtons = buttons.flatMap<AuthButtonType>((button) => {
    if (button === Component.OAuthButtons) {
      return oauthProviderSettings.map((provider) => ({ type: 'oauth', provider }));
    } else if (button === Component.SSOButtons) {
      return isDiscoveryFlow
        ? { type: 'sso-discovery' }
        : (state.flowState.organization?.sso_active_connections?.map((connection) => ({ type: 'sso', connection })) ??
            []);
    } else {
      assertUnreachable(button);
    }
  });

  if (authButtons.length === 0) {
    return null;
  }

  // Reorder providers based on last used
  const [reorderedButtons, foundLastUsedOAuth] = arrayUtils.moveToFront(
    authButtons,
    (button) => getButtonId(button) === lastUsedMethod,
  );

  // Helper function to create OAuth button component
  const createOAuthButton = (oauthProvider: OauthProviderParams) => {
    const providerProps = {
      customScopes: getCustomScopesForProvider(oauthProvider, customScopes),
      providerParams: getProviderParamsForProvider(oauthProvider, providerParams, state.primary.email),
    };

    if (oauthProvider.one_tap) {
      return (
        <B2BGoogleOneTap
          key={oauthProvider.type}
          {...providerProps}
          cancelOnTapOutside={oauthProvider.cancel_on_tap_outside}
        />
      );
    }

    return (
      <OAuthB2BButton
        key={oauthProvider.type}
        providerType={oauthProvider.type}
        loginRedirectUrl={loginRedirectURL}
        signupRedirectUrl={signupRedirectURL}
        discoveryRedirectUrl={discoveryRedirectURL}
        onSuccess={() => setLastUsedMethod(oauthProvider.type)}
        {...providerProps}
      />
    );
  };

  return (
    <>
      {reorderedButtons.map((button, index) => {
        const buttonComponent = (() => {
          switch (button.type) {
            case 'oauth':
              return createOAuthButton(button.provider);

            case 'sso':
              return (
                <SSOButton
                  key={button.connection.display_name}
                  connection={button.connection}
                  onStart={() => setLastUsedMethod(getSsoMethodKey(button.connection))}
                />
              );

            case 'sso-discovery':
              return (
                <AuthButton
                  key="sso-discovery"
                  icon={<SSOIcon />}
                  onClick={() => {
                    dispatch({ type: 'transition', screen: AppScreens.SSODiscoveryEmail, history: 'push' });
                  }}
                  id="sso-discovery"
                >
                  {t({ id: 'provider.continueWithSSO', message: 'Continue with SSO' })}
                </AuthButton>
              );

            default:
              assertUnreachable(button);
          }
        })();

        if (foundLastUsedOAuth && index === 0) {
          return (
            <div key={getButtonId(button)}>
              <Text size="helper" color="secondary" align="right">
                {t({ id: 'provider.lastUsed', message: 'Last used' })}
              </Text>

              {buttonComponent}
            </div>
          );
        }

        return buttonComponent;
      })}
    </>
  );
};
