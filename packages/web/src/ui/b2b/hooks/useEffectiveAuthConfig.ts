import { B2BOAuthProviderConfig, B2BOAuthProviders } from '@stytch/core/public';
import { useMemo } from 'react';

import { isTruthy } from '../../../utils/isTruthy';
import { getParamsFromB2BOAuthProviderConfig } from '../../../utils/oauthProviderType';
import { useConfig, useGlobalReducer } from '../GlobalContextProvider';
import { ProductId, StytchB2BProduct } from '../StytchB2BProduct';

export type OauthProviderParams = {
  type: B2BOAuthProviders;
  one_tap: boolean;
  customScopes: string[];
  providerParams: Record<string, string>;
  cancel_on_tap_outside: boolean | undefined;
};

// Note that the order of products here is used when displaying fallback auth
// methods below
const productsToAuthMethods: Record<ProductId, string | undefined> = {
  oauth: undefined, // OAuth methods are defined per-provider
  sso: 'sso',
  emailMagicLinks: 'magic_link',
  emailOtp: 'email_otp',
  passwords: 'password',
};

const oauthProvidersToAuthMethods: Record<B2BOAuthProviders, string> = {
  [B2BOAuthProviders.Google]: 'google_oauth',
  [B2BOAuthProviders.Microsoft]: 'microsoft_oauth',
  [B2BOAuthProviders.HubSpot]: 'hubspot_oauth',
  [B2BOAuthProviders.Slack]: 'slack_oauth',
  [B2BOAuthProviders.GitHub]: 'github_oauth',
};

const authMethodsToProducts: Record<string, ProductId> = Object.fromEntries(
  Object.entries(productsToAuthMethods).map(([product, authMethod]) => [authMethod, product]),
);

const oauthMethodsToOauthProviders: Record<string, B2BOAuthProviders> = Object.fromEntries(
  Object.entries(oauthProvidersToAuthMethods).map(([provider, method]) => [
    method,
    provider as keyof typeof oauthProvidersToAuthMethods,
  ]),
);

const authMethodToProduct = (authMethod: string): ProductId | undefined => {
  if (authMethod in oauthMethodsToOauthProviders) {
    return 'oauth';
  }
  return authMethodsToProducts[authMethod];
};

const allOauthProviders = Object.values(B2BOAuthProviders);

const flattenConfigToAuthMethods = (products: StytchB2BProduct[], oauthProviders: B2BOAuthProviderConfig[]) =>
  products
    .flatMap((product) => {
      if (product.id === 'oauth') {
        return oauthProviders.map((provider) => {
          const authMethod = oauthProvidersToAuthMethods[typeof provider === 'string' ? provider : provider.type];
          if (authMethod) {
            return authMethod;
          }
        });
      } else {
        const authMethod = productsToAuthMethods[product.id];
        if (authMethod) {
          return authMethod;
        }
      }
    })
    .filter(isTruthy);

const useOAuthProviderConfigs = () => {
  const config = useConfig();
  return useMemo(() => {
    if (!config.oauthOptions?.providers) {
      return [];
    }

    return config.oauthOptions.providers.map(getParamsFromB2BOAuthProviderConfig);
  }, [config.oauthOptions?.providers]);
};

const useRestrictedAuthMethods = () => {
  const [state] = useGlobalReducer();

  const { primaryAuthMethods } = state.primary;
  const hasPrimaryAuthMethods = !!primaryAuthMethods;

  const restrictedAuthMethods = useMemo(() => {
    if (state.primary.primaryAuthMethods) {
      return new Set(state.primary.primaryAuthMethods);
    }

    if (state.flowState.organization?.auth_methods === 'RESTRICTED') {
      return new Set(state.flowState.organization?.allowed_auth_methods ?? []);
    }
  }, [
    state.flowState.organization?.allowed_auth_methods,
    state.flowState.organization?.auth_methods,
    state.primary.primaryAuthMethods,
  ]);

  return { restrictedAuthMethods, hasPrimaryAuthMethods };
};

export const useEffectiveAuthConfig = () => {
  const [state] = useGlobalReducer();
  const config = useConfig();

  const { restrictedAuthMethods, hasPrimaryAuthMethods } = useRestrictedAuthMethods();

  const oauthProviderConfigs = useOAuthProviderConfigs();

  const flattenedConfiguredAuthMethods = useMemo(
    () => flattenConfigToAuthMethods(config.products, oauthProviderConfigs),
    [config.products, oauthProviderConfigs],
  );

  const authMethodsToShow = useMemo(() => {
    // If there are no restrictions, use the auth methods from the UI config as-is
    if (!restrictedAuthMethods) {
      return flattenedConfiguredAuthMethods;
    }

    // If there are restrictions, filter the auth methods from the UI config
    const restrictedAuthMethodsInUiConfig = flattenedConfiguredAuthMethods.filter((authMethod) =>
      restrictedAuthMethods.has(authMethod),
    );

    // Use the filtered methods unless there are none _and_ the restrictions
    // come from `primary_required` (not just org-level restrictions)
    if (restrictedAuthMethodsInUiConfig.length > 0 || !hasPrimaryAuthMethods) {
      return restrictedAuthMethodsInUiConfig;
    }

    // If the org restricts allowed auth methods, show all of the methods
    // included in `primary_required`
    if (state.flowState.organization?.auth_methods === 'RESTRICTED') {
      return flattenConfigToAuthMethods(config.organizationProducts, allOauthProviders).filter((authMethod) =>
        restrictedAuthMethods.has(authMethod),
      );
    }

    // If the org doesn't have any auth method restrictions, default to email
    // magic links
    return ['magic_link'];
  }, [
    config.organizationProducts,
    flattenedConfiguredAuthMethods,
    hasPrimaryAuthMethods,
    restrictedAuthMethods,
    state.flowState.organization?.auth_methods,
  ]);

  const products = useMemo(() => {
    const productIds = [...new Set(authMethodsToShow.map(authMethodToProduct).filter(isTruthy))];
    return productIds.map((productId) => config.organizationProducts.find((p) => p.id === productId)).filter(isTruthy);
  }, [authMethodsToShow, config.organizationProducts]);

  const oauthProviderSettings = useMemo<OauthProviderParams[]>(
    () =>
      authMethodsToShow
        .map((authMethod) => {
          const provider = oauthMethodsToOauthProviders[authMethod];
          if (provider) {
            return (
              oauthProviderConfigs.find((oauthProvider) => oauthProvider.type === provider) ??
              getParamsFromB2BOAuthProviderConfig(provider)
            );
          }
        })
        .filter(isTruthy),
    [authMethodsToShow, oauthProviderConfigs],
  );

  return { products, oauthProviderSettings };
};
