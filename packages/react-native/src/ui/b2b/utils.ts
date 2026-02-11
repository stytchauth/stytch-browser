import { StytchAPIError, StytchSDKError, B2BOAuthProviderConfig, B2BOAuthProviders } from '@stytch/core/public';
import { ErrorResponse } from '../shared/types';

export const getEnabledMethods = <TMethod>({
  allMethods,
  orgSupportedMethods,
  uiIncludedMethods,
}: {
  allMethods: readonly TMethod[];
  orgSupportedMethods: readonly TMethod[];
  uiIncludedMethods: readonly TMethod[] | undefined;
}) => {
  // If the org only supported a restricted set of methods, use that
  if (orgSupportedMethods?.length) {
    return new Set(orgSupportedMethods);
  }

  // Use the configured list of included methods, or all methods by default
  const methodsArr = uiIncludedMethods?.length ? uiIncludedMethods : allMethods;
  return new Set(methodsArr);
};

type Falsy = false | null | undefined | 0 | 0n | '';

export const isTruthy = <T>(value: T): value is Exclude<T, Falsy> => Boolean(value);

export const createErrorResponseFromError = (e: unknown): ErrorResponse | undefined => {
  if (e instanceof StytchSDKError) {
    return { sdkError: e };
  }
  if (e instanceof StytchAPIError) {
    return { apiError: e };
  }
  return undefined;
};

export const getParamsFromB2BOAuthProviderConfig = (provider: B2BOAuthProviderConfig) => {
  let providerType = '';
  let oneTap = false;
  let customScopes: string[] = [];
  let providerParams: Record<string, string> = {};
  if (typeof provider === 'string') {
    providerType = provider;
  } else {
    providerType = provider.type;
    if (provider.type === B2BOAuthProviders.Google && 'one_tap' in provider) {
      oneTap = provider.one_tap;
    }
    customScopes = provider.customScopes || [];
    providerParams = provider.providerParams || {};
  }
  const oauthProvider = providerType as B2BOAuthProviders;
  return { type: oauthProvider, one_tap: oneTap, customScopes, providerParams };
};
