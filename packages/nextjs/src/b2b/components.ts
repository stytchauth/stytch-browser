'use client';

import { AuthTokenParams } from '@stytch/web';
import { B2BIDPConsentManifestGenerator, B2BSDKConfig, StytchProjectConfigurationInput } from '@stytch/web/b2b';
import {
  B2BIdentityProvider as B2BIdentityProviderComponent,
  StytchB2B as StytchB2BComponent,
} from '@stytch/web/react/b2b';

import { withSsrSafe } from '../bindings/withSsrSafe';

type B2BIdentityProviderProps<TProjectConfiguration extends StytchProjectConfigurationInput> = Pick<
  B2BSDKConfig<TProjectConfiguration>,
  'presentation' | 'callbacks' | 'strings'
> & {
  /**
   * Optional {@link B2BIDPConsentManifestGenerator} to customize the consent screen.
   */
  getIDPConsentManifest?: B2BIDPConsentManifestGenerator;

  /**
   * Optional {@link AuthTokenParams} to provide a trusted auth token to provide for attestation prior to running OAuth flow.
   */
  trustedAuthTokenParams?: AuthTokenParams;
};

export const StytchB2B = /* @__PURE__ */ withSsrSafe(StytchB2BComponent);
export const B2BIdentityProvider =
  /* @__PURE__ */
  withSsrSafe<B2BIdentityProviderProps<StytchProjectConfigurationInput>>(B2BIdentityProviderComponent);
