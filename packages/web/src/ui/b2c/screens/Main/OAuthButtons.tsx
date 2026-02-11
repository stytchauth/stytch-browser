import { arrayUtils } from '@stytch/core';
import React from 'react';

import ButtonColumn from '../../../components/molecules/ButtonColumn';
import LastUsed from '../../../components/molecules/LastUsed';
import { GoogleOneTap } from '../../components/GoogleOneTap';
import { OAuthButton } from '../../components/OAuthButton';
import { useConfig } from '../../GlobalContextProvider';
import { useLastUsedOAuth } from './useLastUsedOAuth';

export const OAuthButtons = () => {
  const config = useConfig();
  const [lastUsedOAuth, setLastUsedOAuth] = useLastUsedOAuth();

  if (!config.oauthOptions) return <></>;
  const { providers, loginRedirectURL, signupRedirectURL } = config.oauthOptions;

  const [reorderedProviders, foundLastUsed] = arrayUtils.moveToFront(
    providers,
    (provider) => provider.type === lastUsedOAuth,
  );

  return (
    <ButtonColumn>
      {reorderedProviders.map((provider, index) => {
        const providerProps = {
          customScopes: provider.custom_scopes,
          providerParams: provider.provider_params,
        };

        if (provider.one_tap) {
          return (
            <GoogleOneTap
              position={provider.position}
              key={`oauth-${provider.type}`}
              {...providerProps}
              cancelOnTapOutside={provider.cancel_on_tap_outside}
            />
          );
        }

        const button = (
          <OAuthButton
            key={`oauth-${provider.type}`}
            providerType={provider.type}
            loginRedirectUrl={loginRedirectURL}
            signupRedirectUrl={signupRedirectURL}
            onSuccess={() => setLastUsedOAuth(provider.type)}
            {...providerProps}
          />
        );

        return foundLastUsed && index === 0 ? <LastUsed>{button}</LastUsed> : button;
      })}
    </ButtonColumn>
  );
};
