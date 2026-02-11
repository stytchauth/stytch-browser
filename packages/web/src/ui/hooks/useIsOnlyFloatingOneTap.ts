import { OAuthProviders } from '@stytch/core/public';
import { useMemo } from 'react';

import { getShouldRenderFloatingOneTap } from '../../oneTap/positionModes';
import { StytchLoginConfig } from '../../types';
import { hasProduct } from '../b2c/utils';

export const useIsOnlyFloatingOneTap = (config: StytchLoginConfig) => {
  return useMemo(() => {
    const position = config.oauthOptions?.providers[0].position;
    return (
      config.products.length === 1 &&
      hasProduct(config.products, 'oauth') &&
      config.oauthOptions?.providers.length === 1 &&
      config.oauthOptions?.providers[0].type === OAuthProviders.Google &&
      config.oauthOptions?.providers[0].one_tap === true &&
      getShouldRenderFloatingOneTap(position)
    );
  }, [config]);
};
