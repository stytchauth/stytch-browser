import { BootstrapData } from '@stytch/core';
import { useEffect, useMemo, useState } from 'react';

import { readB2CInternals } from '../../utils/internal';
import { useStytch } from './GlobalContextProvider';
import { ProductId, StytchProduct } from './StytchProduct';

export const useBootstrap = (): { bootstrap: BootstrapData; fromCache: boolean } => {
  const stytchClient = useStytch();
  const [bootstrap, setBootstrap] = useState({
    bootstrap: readB2CInternals(stytchClient).bootstrap.getSync(),
    fromCache: true,
  });

  useEffect(() => {
    readB2CInternals(stytchClient)
      .bootstrap.getAsync()
      .then((data) =>
        setBootstrap({
          bootstrap: data,
          fromCache: false,
        }),
      );
  }, [stytchClient]);

  return bootstrap;
};

export function hasProduct(products: StytchProduct[], product: ProductId) {
  return products.some((p) => p.id === product);
}

export function useProductComponents<Type extends 'screens' | 'tabs' | 'mainScreen'>(
  products: StytchProduct[],
  screenType: Type,
) {
  return useMemo(() => {
    const map = {} as Required<StytchProduct[Type]>;
    for (const product of products) {
      if (product[screenType]) Object.assign(map, product[screenType]);
    }
    return map;
  }, [products, screenType]);
}

/**
 * In B2C, ResetPassword and PasskeyRegistration always need passwords and passkey products respectively,
 * so we inject these into config just in case the customer don't have it. If they are missing the components
 * just crash immediately.
 */
export function addProduct<Config extends { products?: StytchProduct[] }>(
  config: Config | undefined,
  product: StytchProduct,
): Config {
  if (config?.products?.includes(product)) return config;

  const products = config?.products ?? [];
  return {
    ...(config ?? {}),
    products: [...products, product],
  } as Config;
}
