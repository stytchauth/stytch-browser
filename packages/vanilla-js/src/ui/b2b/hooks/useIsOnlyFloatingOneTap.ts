import { useMemo } from 'react';
import { useConfig } from '../GlobalContextProvider';
import { B2BOAuthProviders, B2BProducts } from '@stytch/core/public';
import { getParamsFromB2BOAuthProviderConfig } from '../../../utils/oauthProviderType';

export const useIsOnlyFloatingOneTap = () => {
  const config = useConfig();
  const isOnlyFloatingOneTap = useMemo(() => {
    const oauthProvider = config.oauthOptions
      ? getParamsFromB2BOAuthProviderConfig(config.oauthOptions?.providers[0])
      : undefined;
    const isGoogleOneTap = oauthProvider?.type === B2BOAuthProviders.Google && oauthProvider?.one_tap === true;
    return (
      config.products.length === 1 &&
      config.products.includes(B2BProducts.oauth) &&
      config.oauthOptions?.providers.length === 1 &&
      isGoogleOneTap
    );
  }, [config]);

  return isOnlyFloatingOneTap;
};
