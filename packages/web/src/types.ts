import type { CommonB2BLoginConfig, CommonLoginConfig } from '@stytch/core';
import type {
  Callbacks,
  IDPConsentScreenManifest,
  StringsOptions,
  StyleConfig,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';

import type { StytchB2BClient } from './b2b/StytchB2BClient';
import type { StytchClient } from './StytchClient';
import type { StytchB2BProduct } from './ui/b2b/StytchB2BProduct';
import type { IconNames } from './ui/b2c/components/Icons';
import type { StytchProduct } from './ui/b2c/StytchProduct';
import type { IconRegistry } from './ui/components/IconRegistry';
import type { PresentationOptions } from './ui/components/PresentationConfig';
import type { Theme } from './ui/components/themes/ThemeConfig';

export { IconRegistry, PresentationOptions, Theme };

export type PresentationConfig = {
  theme?: Partial<Theme> | readonly [light: Partial<Theme>, dark: Partial<Theme>];
  options?: Partial<PresentationOptions>;
  icons?: Partial<IconRegistry<IconNames>>;
};

/**
 * The products array allows you to specify the authentication methods that you would like to
 * expose to your users. The order of the products that you include here will also be the order
 * in which they appear in the login form,
 */
export type StytchLoginConfig = CommonLoginConfig & {
  products: StytchProduct[];
};

/**
 * The products array allows you to specify the authentication methods that you would like to
 * expose to your users. The order of the products that you include here will also be the order
 * in which they appear in the login form,
 */
export type StytchB2BUIConfig = CommonB2BLoginConfig & {
  /**
   * The products array allows you to specify the authentication methods that you would like to
   * expose to your users. The order of the products that you include here will also be the order
   * in which they appear in the login form,
   */
  products: StytchB2BProduct[];
};

// TODO: Build new entry point
export type StytchB2BExtendedLoginConfig = StytchB2BUIConfig & {
  /**
   * Organizations are allowed to specify their own login methods. In StytchB2BUIConfig this defaults to
   * all products. Overriding this will produce a smaller bundle.
   *
   * WARNING: If more login methods are specified in Stytch, they will not be available when users proceeds to
   * organization login. Only use the extended login method if you are sure more auth methods for organizations
   * will not be added.
   */
  organizationProducts: StytchB2BProduct[];
};

export type SDKConfig<TProjectConfiguration extends StytchProjectConfigurationInput> = {
  client: StytchClient<TProjectConfiguration>;
  config: StytchLoginConfig;
  presentation?: PresentationConfig;
  callbacks?: Callbacks<TProjectConfiguration>;
} & StringsOptions;

export type B2BSDKConfig<TProjectConfiguration extends StytchProjectConfigurationInput> = {
  client: StytchB2BClient<TProjectConfiguration>;
  config: StytchB2BUIConfig;
  presentation?: PresentationConfig;
  callbacks?: Callbacks<TProjectConfiguration>;
} & StringsOptions;

export type ResetPasswordSDKConfig<TProjectConfiguration extends StytchProjectConfigurationInput> =
  SDKConfig<TProjectConfiguration> & {
    passwordResetToken?: string;
  };

export type IDPConsentManifestGenerator = (input: { scopes: string[]; clientName: string }) => IDPConsentScreenManifest;

export type AuthTokenParams = {
  trustedAuthToken: string;
  tokenProfileID: string;
};

export type IDPSDKConfig<TProjectConfiguration extends StytchProjectConfigurationInput> = Pick<
  SDKConfig<TProjectConfiguration>,
  'client' | 'presentation' | 'callbacks' | 'strings'
> & {
  /**
   * Optional {@link IDPConsentManifestGenerator} to customize the consent screen.
   */
  getIDPConsentManifest?: IDPConsentManifestGenerator;

  /**
   * Optional {@link AuthTokenParams} to provide a trusted auth token to provide for attestation prior to running OAuth flow.
   */
  authTokenParams?: AuthTokenParams;
};

export type B2BIDPConsentManifestGenerator = (input: {
  scopes: string[];
  clientName: string;
}) => IDPConsentScreenManifest;

export type B2BIDPSDKConfig<TProjectConfiguration extends StytchProjectConfigurationInput> = Pick<
  B2BSDKConfig<TProjectConfiguration>,
  'client' | 'presentation' | 'callbacks' | 'strings'
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

export type DeprecatedSDKConfig = {
  styles?: StyleConfig;
};
