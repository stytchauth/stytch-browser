import { useMemo } from 'react';
import { OAuthProviders, Products } from '@stytch/core/public';
import { useConfig } from '../b2c/GlobalContextProvider';
import { getShouldRenderFloatingOneTap } from '../../oneTap/positionModes';

export const useIsOnlyFloatingOneTap = () => {
  const config = useConfig();
  const isOnlyFloatingOneTap = useMemo(() => {
    const position = config.oauthOptions?.providers[0].position;
    return (
      config.products.length === 1 &&
      config.products.includes(Products.oauth) &&
      config.oauthOptions?.providers.length === 1 &&
      config.oauthOptions?.providers[0].type === OAuthProviders.Google &&
      config.oauthOptions?.providers[0].one_tap === true &&
      getShouldRenderFloatingOneTap(position)
    );
  }, [config]);

  return isOnlyFloatingOneTap;
};
