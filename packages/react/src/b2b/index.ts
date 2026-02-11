import { createStytchB2BClient } from '@stytch/web/b2b/headless';

/**
 * @deprecated - use {@link createStytchB2BClient} instead
 */
export const createStytchB2BUIClient = createStytchB2BClient;

export type { StytchB2BProviderProps } from './StytchB2BContext';
export {
  StytchB2BProvider,
  useStytchB2BClient,
  useStytchIsAuthorized,
  useStytchMember,
  useStytchMemberSession,
  useStytchOrganization,
  withStytchB2BClient,
  withStytchMember,
  withStytchMemberSession,
  withStytchOrganization,
  withStytchPermissions,
} from './StytchB2BContext';
export type {
  B2BIDPConsentManifestGenerator,
  B2BIDPSDKConfig,
  B2BSDKConfig,
  Strings,
  StytchB2BUIConfig,
} from '@stytch/web/b2b';
export { B2BProducts } from '@stytch/web/b2b';
export * from '@stytch/web/b2b/headless';
export * from '@stytch/web/common';
export type { B2BIdentityProviderProps, StytchB2BProps } from '@stytch/web/react/b2b';
export { B2BIdentityProvider, StytchB2B } from '@stytch/web/react/b2b';
