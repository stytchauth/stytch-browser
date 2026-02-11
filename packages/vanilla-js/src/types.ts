import {
  Callbacks,
  IDPConsentScreenManifest,
  StringsOptions,
  StyleConfig,
  StytchB2BUIConfig,
  StytchLoginConfig,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';
import { StytchUIClient } from './StytchUIClient';
import { StytchB2BUIClient } from './b2b/StytchB2BUIClient';

export type SDKConfig<TProjectConfiguration extends StytchProjectConfigurationInput> = {
  client: StytchUIClient<TProjectConfiguration>;
  config: StytchLoginConfig;
  styles?: StyleConfig;
  callbacks?: Callbacks<TProjectConfiguration>;
} & StringsOptions;

export type B2BSDKConfig<TProjectConfiguration extends StytchProjectConfigurationInput> = {
  client: StytchB2BUIClient<TProjectConfiguration>;
  config: StytchB2BUIConfig;
  styles?: StyleConfig;
  callbacks?: Callbacks<TProjectConfiguration>;
} & StringsOptions;

export type ResetPasswordSDKConfig<TProjectConfiguration extends StytchProjectConfigurationInput> =
  SDKConfig<TProjectConfiguration> & {
    passwordResetToken: string;
  };

export type IDPConsentManifestGenerator = (input: { scopes: string[]; clientName: string }) => IDPConsentScreenManifest;

export type AuthTokenParams = { trustedAuthToken: string; tokenProfileID: string };

export type IDPSDKConfig<TProjectConfiguration extends StytchProjectConfigurationInput> = Pick<
  SDKConfig<TProjectConfiguration>,
  'client' | 'styles' | 'callbacks' | 'strings'
> & {
  getIDPConsentManifest?: IDPConsentManifestGenerator;
  authTokenParams?: AuthTokenParams;
};

export type B2BIDPConsentManifestGenerator = (input: {
  scopes: string[];
  clientName: string;
}) => IDPConsentScreenManifest;

export type B2BIDPSDKConfig<TProjectConfiguration extends StytchProjectConfigurationInput> = Pick<
  B2BSDKConfig<TProjectConfiguration>,
  'client' | 'styles' | 'callbacks' | 'strings'
> & {
  getIDPConsentManifest?: B2BIDPConsentManifestGenerator;
  trustedAuthTokenParams?: AuthTokenParams;
};
