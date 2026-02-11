import { useLingui } from '@lingui/react/macro';
import { arrayUtils } from '@stytch/core';
import { AuthFlowType, B2BOAuthProviders } from '@stytch/core/public';
import React from 'react';

import { assertUnreachable } from '../../../utils/assertUnreachable';
import Button from '../../components/atoms/Button';
import ButtonColumn from '../../components/molecules/ButtonColumn';
import LastUsed from '../../components/molecules/LastUsed';
import { getButtonId, usePresentation } from '../../components/PresentationConfig';
import { useConfig, useGlobalReducer } from '../GlobalContextProvider';
import { OauthProviderParams, useEffectiveAuthConfig } from '../hooks/useEffectiveAuthConfig';
import { useLastUsedAuthMethod } from '../hooks/useLastUsedAuthMethod';
import { AppScreens, ButtonComponent, MainScreenComponent } from '../types/AppScreens';
import { AuthButton as AuthButtonType, getButtonKey, getSsoMethodKey } from '../types/authMethodKeys';
import { useProductComponents } from '../utils';

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

export const SsoAndOAuthButtons = ({ buttons }: { buttons: ButtonComponent[] }) => {
  const { t } = useLingui();
  const [state, dispatch] = useGlobalReducer();
  const { oauthProviderSettings = [] } = useEffectiveAuthConfig();
  const presentation = usePresentation();

  const [lastUsedMethod, setLastUsedMethod] = useLastUsedAuthMethod();

  const config = useConfig();
  const { loginRedirectURL, signupRedirectURL, discoveryRedirectURL, customScopes, providerParams } =
    config.oauthOptions ?? {};

  const { B2BGoogleOneTap, OAuthB2BButton, SSOButton } = useProductComponents(config, 'ssoAndOAuthButtons')!;

  // Determine which buttons need to be displayed
  const isDiscoveryFlow = state.flowState.type === AuthFlowType.Discovery;
  const authButtons = buttons.flatMap<AuthButtonType>((button) => {
    if (button === MainScreenComponent.OAuthButtons) {
      return oauthProviderSettings.map((provider) => ({ type: 'oauth', provider }));
    } else if (button === MainScreenComponent.SSOButtons) {
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
    (button) => getButtonKey(button) === lastUsedMethod,
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
    <ButtonColumn>
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
                <Button
                  key="sso-discovery"
                  variant="outline"
                  id={getButtonId('sso-discovery', presentation.options)}
                  onClick={() => {
                    dispatch({ type: 'transition', screen: AppScreens.SSODiscoveryEmail, history: 'push' });
                  }}
                >
                  {t({ id: 'provider.continueWithSSO', message: 'Use single sign-on' })}
                </Button>
              );

            default:
              assertUnreachable(button);
          }
        })();

        return foundLastUsedOAuth && index === 0 ? (
          <LastUsed key={getButtonKey(button)}>{buttonComponent}</LastUsed>
        ) : (
          buttonComponent
        );
      })}
    </ButtonColumn>
  );
};
