import { IBootstrapData } from '../BootstrapDataManager';
import { SearchDataManager } from '@stytch/core';
import { CaptchaProvider } from '../CaptchaProvider';
import { OneTapProvider } from '../oneTap/OneTapProvider';
import { ClientsideServicesProvider } from '../ClientsideServicesProvider';
import { SubscriptionDataLayer } from '../SubscriptionService';
import { B2BState, ConsumerState, StytchProjectConfigurationInput } from '@stytch/core/public';
import { INetworkClient } from '@stytch/core';
import { B2BOneTapProvider } from '../b2b/oneTap/B2BOneTapProvider';
import type { StytchHeadlessClient } from '../StytchHeadlessClient';
import type { StytchB2BHeadlessClient } from '../b2b/StytchB2BHeadlessClient';

type Internals = {
  // Internal Utilities
  bootstrap: IBootstrapData;
  publicToken: string;
  searchManager: SearchDataManager;
  networkClient: INetworkClient;
  clientsideServices: ClientsideServicesProvider;
};

export type B2BInternals = Internals & {
  dataLayer: SubscriptionDataLayer<B2BState>;
  networkClient: INetworkClient;
  oneTap: B2BOneTapProvider;
};

export type B2CInternals = Internals & {
  captcha: CaptchaProvider;
  oneTap: OneTapProvider;
  dataLayer: SubscriptionDataLayer<ConsumerState>;
};

export const internalSymB2B = Symbol.for('stytch__internal_b2b');
export const internalSymB2C = Symbol.for('stytch__internal_b2c');

export const writeB2BInternals = (
  obj: StytchB2BHeadlessClient<StytchProjectConfigurationInput>,
  internals: B2BInternals,
) => {
  Object.assign(obj, {
    [internalSymB2B]: internals,
  });
};

export const readB2BInternals = (obj: StytchB2BHeadlessClient<StytchProjectConfigurationInput>): B2BInternals => {
  const casted = obj as { [internalSymB2B]?: B2BInternals };
  if (!casted[internalSymB2B]) {
    throw Error('Internals not found!');
  }
  return casted[internalSymB2B];
};

export const writeB2CInternals = (
  obj: StytchHeadlessClient<StytchProjectConfigurationInput>,
  internals: B2CInternals,
) => {
  Object.assign(obj, {
    [internalSymB2C]: internals,
  });
};

export const readB2CInternals = (obj: StytchHeadlessClient<StytchProjectConfigurationInput>): B2CInternals => {
  const casted = obj as { [internalSymB2C]?: B2CInternals };
  if (!casted[internalSymB2C]) {
    throw Error('Internals not found!');
  }
  return casted[internalSymB2C];
};
