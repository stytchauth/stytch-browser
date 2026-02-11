import { B2BOAuthProviders } from '@stytch/core/public';
import { useMemo } from 'react';

import { getParamsFromB2BOAuthProviderConfig } from '../../../utils/oauthProviderType';
import { useConfig } from '../GlobalContextProvider';
import { hasProduct } from '../utils';

export const useIsOnlyFloatingOneTap = () => {
  const config = useConfig();
  const isOnlyFloatingOneTap = useMemo(() => {
    const oauthProvider = config.oauthOptions
      ? getParamsFromB2BOAuthProviderConfig(config.oauthOptions?.providers[0])
      : undefined;
    const isGoogleOneTap = oauthProvider?.type === B2BOAuthProviders.Google && oauthProvider?.one_tap === true;
    return (
      config.products.length === 1 &&
      hasProduct(config.products, 'oauth') &&
      config.oauthOptions?.providers.length === 1 &&
      isGoogleOneTap
    );
  }, [config]);

  return isOnlyFloatingOneTap;
};
