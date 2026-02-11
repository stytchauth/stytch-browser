import { IBootstrapData } from './BootstrapDataManager';
import { CaptchaProvider } from './CaptchaProvider';
import { INetworkClient, ISearchData } from '@stytch/core';
import StytchReactNativeModule from './native-module';
import type { StytchClient } from './StytchClient';
import type { StytchB2BClient } from './b2b/StytchB2BClient';
import { StytchProjectConfigurationInput } from '@stytch/core/public';

type Internals = {
  // Internal Utilities
  bootstrap: IBootstrapData;
  publicToken: string;
  networkClient: INetworkClient;
};

export type B2CInternals = Internals & {
  captcha: CaptchaProvider;
  search: ISearchData;
};

export const internalSymB2C = Symbol.for('stytch__internal_b2c');

export const writeB2CInternals = (obj: StytchClient<StytchProjectConfigurationInput>, internals: B2CInternals) => {
  Object.assign(obj, {
    [internalSymB2C]: internals,
  });
};

export const readB2CInternals = (obj: StytchClient<StytchProjectConfigurationInput>): B2CInternals => {
  const casted = obj as { [internalSymB2C]?: B2CInternals };
  if (!casted[internalSymB2C]) {
    throw Error('Internals not found!');
  }
  return casted[internalSymB2C];
};

export type B2BInternals = Internals & {
  searchManager: ISearchData;
  nativeModule: StytchReactNativeModule;
};
export const internalSymB2B = Symbol.for('stytch__internal_b2b');

export const writeB2BInternals = (obj: StytchB2BClient<StytchProjectConfigurationInput>, internals: B2BInternals) => {
  Object.assign(obj, {
    [internalSymB2B]: internals,
  });
};

export const readB2BInternals = (obj: StytchB2BClient<StytchProjectConfigurationInput>): B2BInternals => {
  const casted = obj as { [internalSymB2B]?: B2BInternals };
  if (!casted[internalSymB2B]) {
    throw Error('Internals not found!');
  }
  return casted[internalSymB2B];
};
