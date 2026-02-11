import { EnumOrStringLiteral } from '@stytch/core';
import { B2BOAuthProviderConfig, B2BOAuthProviders } from '@stytch/core/public';
import { useMemo } from 'react';

import { B2BProducts } from '../config';
import { useConfig, useGlobalReducer } from '../ContextProvider';
import { getParamsFromB2BOAuthProviderConfig, isTruthy } from '../utils';

// Note that the order of products here is used when displaying fallback auth
// methods below
const productsToAuthMethods: Record<B2BProducts, string | undefined> = {
  [B2BProducts.oauth]: undefined, // OAuth methods are defined per-provider
  [B2BProducts.sso]: 'sso',
  [B2BProducts.emailMagicLinks]: 'magic_link',
  [B2BProducts.passwords]: 'password',
  [B2BProducts.emailOtp]: 'email_otp',
};

const oauthProvidersToAuthMethods: Record<B2BOAuthProviders, string> = {
  [B2BOAuthProviders.Google]: 'google_oauth',
  [B2BOAuthProviders.Microsoft]: 'microsoft_oauth',
  [B2BOAuthProviders.HubSpot]: 'hubspot_oauth',
  [B2BOAuthProviders.Slack]: 'slack_oauth',
  [B2BOAuthProviders.GitHub]: 'github_oauth',
};

const authMethodsToProducts: Record<string, B2BProducts> = Object.entries(productsToAuthMethods).reduce(
  (acc, [product, method]) => {
    if (method) {
      acc[method] = product as keyof typeof productsToAuthMethods;
    }
    return acc;
  },
  {} as Record<string, B2BProducts>,
);

const oauthMethodsToOauthProviders: Record<string, B2BOAuthProviders> = Object.entries(
  oauthProvidersToAuthMethods,
).reduce(
  (acc, [provider, method]) => {
    acc[method] = provider as keyof typeof oauthProvidersToAuthMethods;
    return acc;
  },
  {} as Record<string, B2BOAuthProviders>,
);

const oauthProviderToAuthMethod = (provider: EnumOrStringLiteral<B2BOAuthProviders>) =>
  oauthProvidersToAuthMethods[provider];

const oauthMethodToOauthProvider = (authMethod: string): B2BOAuthProviders | undefined =>
  oauthMethodsToOauthProviders[authMethod];

const productToAuthMethod = (product: EnumOrStringLiteral<B2BProducts>) => productsToAuthMethods[product];

const authMethodToProduct = (authMethod: string): B2BProducts | undefined => {
  if (authMethod in oauthMethodsToOauthProviders) {
    return B2BProducts.oauth;
  }

  return authMethodsToProducts[authMethod];
};

const allProducts = Object.keys(productsToAuthMethods) as B2BProducts[];
const allOauthProviders = Object.values(B2BOAuthProviders);

const flattenConfigToAuthMethods = (
  products: EnumOrStringLiteral<B2BProducts>[],
  oauthProviders: B2BOAuthProviderConfig[],
) => {
  return products.reduce<string[]>((acc, product) => {
    if (product === B2BProducts.oauth) {
      oauthProviders.forEach((provider) => {
        const authMethod = oauthProviderToAuthMethod(typeof provider === 'string' ? provider : provider.type);
        if (authMethod) {
          acc.push(authMethod);
        }
      });
    } else {
      const authMethod = productToAuthMethod(product);
      if (authMethod) {
        acc.push(authMethod);
      }
    }

    return acc;
  }, []);
};

const useOAuthProviderConfigs = () => {
  const config = useConfig();
  return useMemo(() => {
    if (!config.productConfig.oauthOptions?.providers) {
      return [];
    }

    return config.productConfig.oauthOptions.providers.map(getParamsFromB2BOAuthProviderConfig);
  }, [config.productConfig.oauthOptions?.providers]);
};

const useRestrictedAuthMethods = () => {
  const [state] = useGlobalReducer();

  const { primaryAuthMethods } = state.primaryAuthState;
  const hasPrimaryAuthMethods = !!primaryAuthMethods;

  const restrictedAuthMethods = useMemo(() => {
    if (state.primaryAuthState.primaryAuthMethods) {
      const products = new Set(state.primaryAuthState.primaryAuthMethods);
      return products;
    }

    if (state.authenticationState.organization?.auth_methods === 'RESTRICTED') {
      const products = new Set(state.authenticationState.organization?.allowed_auth_methods ?? []);
      return products;
    }
  }, [
    state.authenticationState.organization?.allowed_auth_methods,
    state.authenticationState.organization?.auth_methods,
    state.primaryAuthState.primaryAuthMethods,
  ]);

  return { restrictedAuthMethods, hasPrimaryAuthMethods };
};

export const useEffectiveAuthConfig = () => {
  const [state] = useGlobalReducer();
  const config = useConfig();

  const { restrictedAuthMethods, hasPrimaryAuthMethods } = useRestrictedAuthMethods();

  const oauthProviderConfigs = useOAuthProviderConfigs();

  const flattenedConfiguredAuthMethods = useMemo(
    () => flattenConfigToAuthMethods(config.productConfig.products, oauthProviderConfigs),
    [config.productConfig.products, oauthProviderConfigs],
  );

  const authMethodsToShow = useMemo(() => {
    // If there are no restrictions, use the auth methods from the UI config as-is
    if (!restrictedAuthMethods) {
      const products = flattenedConfiguredAuthMethods;
      return products;
    }

    // If there are restrictions, filter the auth methods from the UI config
    const restrictedAuthMethodsInUiConfig = flattenedConfiguredAuthMethods.filter((authMethod) =>
      restrictedAuthMethods.has(authMethod),
    );

    // Use the filtered methods unless there are none _and_ the restrictions
    // come from `primary_required` (not just org-level restrictions)
    if (restrictedAuthMethodsInUiConfig.length > 0 || !hasPrimaryAuthMethods) {
      const products = restrictedAuthMethodsInUiConfig;
      return products;
    }

    // If the org restricts allowed auth methods, show all of the methods
    // included in `primary_required`
    if (state.authenticationState.organization?.auth_methods === 'RESTRICTED') {
      const products = flattenConfigToAuthMethods(allProducts, allOauthProviders).filter((authMethod) =>
        restrictedAuthMethods.has(authMethod),
      );
      return products;
    }

    // If the org doesn't have any auth method restrictions, default to email
    // magic links
    return ['magic_link'];
  }, [
    flattenedConfiguredAuthMethods,
    hasPrimaryAuthMethods,
    restrictedAuthMethods,
    state.authenticationState.organization?.auth_methods,
  ]);

  const products = useMemo(() => {
    const setOfProducts = new Set(authMethodsToShow.map(authMethodToProduct).filter(isTruthy));
    return [...setOfProducts];
  }, [authMethodsToShow]);

  const oauthProviderSettings = useMemo(() => {
    return authMethodsToShow
      .map((authMethod) => {
        const provider = oauthMethodToOauthProvider(authMethod);
        if (provider) {
          return (
            oauthProviderConfigs.find((oauthProvider) => oauthProvider.type === provider) ??
            getParamsFromB2BOAuthProviderConfig(provider)
          );
        }
      })
      .filter(isTruthy);
  }, [authMethodsToShow, oauthProviderConfigs]);

  return { products, oauthProviderSettings };
};
