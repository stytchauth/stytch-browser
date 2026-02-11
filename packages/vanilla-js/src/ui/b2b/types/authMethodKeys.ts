import { B2BOAuthProviders, SSOActiveConnection } from '@stytch/core/public';
import { OauthProviderParams } from '../hooks/useEffectiveAuthConfig';

// This file contains a combined type to identify OAuth providers and SSO connections,
// used to help with rendering these buttons and storing the last used method.
// Extracting the logic for generating the key helps make it more consistent

export type LastUsedMethod = B2BOAuthProviders | `sso:${string}`;

/* eslint-disable lingui/no-unlocalized-strings */

export function getSsoMethodKey(method: SSOActiveConnection): LastUsedMethod {
  return `sso:${method.connection_id}`;
}

export function extractConnectionId(method: string | null): string | undefined {
  return method?.startsWith('sso:') ? method.slice(4) : undefined;
}

export type AuthButton =
  | { type: 'oauth'; provider: OauthProviderParams }
  | { type: 'sso'; connection: SSOActiveConnection }
  | { type: 'sso-discovery' };

export function getButtonId(button: AuthButton) {
  if (button.type === 'oauth') {
    return button.provider.type;
  } else if (button.type === 'sso') {
    return getSsoMethodKey(button.connection);
  } else {
    return 'sso-discovery';
  }
}
