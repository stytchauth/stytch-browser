import { B2BOAuthProviderConfig, B2BOAuthProviders } from '@stytch/core/public';

export const getParamsFromB2BOAuthProviderConfig = (provider: B2BOAuthProviderConfig) => {
  let providerType = '';
  let oneTap = false;
  let customScopes: string[] = [];
  let providerParams: Record<string, string> = {};
  let cancelOnTapOutside: boolean | undefined = undefined;
  if (typeof provider === 'string') {
    providerType = provider;
  } else {
    providerType = provider.type;
    if (provider.type === B2BOAuthProviders.Google && 'one_tap' in provider) {
      oneTap = provider.one_tap;
      cancelOnTapOutside = provider.cancel_on_tap_outside;
    }
    customScopes = provider.customScopes || [];
    providerParams = provider.providerParams || {};
  }
  const oauthProvider = providerType as B2BOAuthProviders;
  return {
    type: oauthProvider,
    one_tap: oneTap,
    customScopes,
    providerParams,
    cancel_on_tap_outside: cancelOnTapOutside,
  };
};
