import { createStytchClient } from '@stytch/web/headless';

/**
 * @deprecated - use {@link createStytchClient} instead
 */
export const createStytchUIClient = createStytchClient;

export type { StytchProviderProps } from './StytchContext';
export {
  StytchProvider,
  useStytch,
  useStytchIsAuthorized,
  useStytchSession,
  useStytchUser,
  withStytch,
  withStytchPermissions,
  withStytchSession,
  withStytchUser,
} from './StytchContext';
export * from '@stytch/core/public';
export type {
  AuthTokenParams,
  IDPConsentManifestGenerator,
  IDPSDKConfig,
  ResetPasswordSDKConfig,
  SDKConfig,
  Strings,
  StytchLoginConfig,
} from '@stytch/web';
export { Products } from '@stytch/web';
export * from '@stytch/web/common';
export * from '@stytch/web/headless';
export type { IdentityProviderProps, StytchProps, StytchResetPasswordProps } from '@stytch/web/react/b2c';
export { IdentityProvider, StytchLogin, StytchPasskeyRegistration, StytchPasswordReset } from '@stytch/web/react/b2c';
