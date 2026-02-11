import { createStytchClient } from '@stytch/web/headless';

/**
 * @deprecated - use {@link createStytchClient} instead
 */
export const createStytchUIClient = createStytchClient;

export * from './b2c/components';
export type {
  AuthTokenParams,
  IDPConsentManifestGenerator,
  IDPSDKConfig,
  ResetPasswordSDKConfig,
  SDKConfig,
  StytchLoginConfig,
} from '@stytch/web';
export { Products } from '@stytch/web';
export * from '@stytch/web/common';
export * from '@stytch/web/headless';
export type {
  IdentityProviderProps,
  StytchProps,
  StytchProviderProps,
  StytchResetPasswordProps,
} from '@stytch/web/react/b2c';
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
} from '@stytch/web/react/b2c';
