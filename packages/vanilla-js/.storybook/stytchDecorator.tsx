import { action } from '@storybook/addon-actions';
import type { Decorator } from '@storybook/preact';
import { fn } from '@storybook/test';
import { InternalStytchClientOptions } from '@stytch/core';
import merge from 'lodash.merge';
import React, { useEffect, useMemo } from 'react';
import { __clearB2BDataLayerCache, __clearConsumerDataLayerCache } from '../src/SubscriptionService';
import { StytchClientContext } from '../src/adminPortal/StytchClientContext';
import { ToastContextProvider } from '../src/adminPortal/components/Toast';
import { AdminPortalOrgUIConfig } from '../src/adminPortal/settings/AdminPortalOrgSettings';
import { StytchB2BUIClient } from '../src/b2b';
import {
  AuthFlowType,
  B2BProducts,
  Callbacks,
  Products,
  StytchB2BUIConfig,
  StytchLoginConfig,
  StytchUIClient,
} from '../src/index';
import {
  GlobalContextProvider as B2BGlobalContextProvider,
  GlobalContextProviderProps as B2BGlobalContextProviderProps,
  DEFAULT_STATE as B2B_DEFAULT_STATE,
} from '../src/ui/b2b/GlobalContextProvider';
import { DEFAULT_STATE, GlobalContextProvider, GlobalContextProviderProps } from '../src/ui/b2c/GlobalContextProvider';
import { Snackbar } from '../src/ui/components/Snackbar';

export const onEvent = fn<Parameters<NonNullable<Callbacks['onEvent']>>, void>(action('onEvent'));
export const onError = fn<Parameters<NonNullable<Callbacks['onError']>>, void>(action('onError'));
const callbacks = { onEvent, onError };

const {
  STORYBOOK_PUBLIC_TEST_API_URL,
  STORYBOOK_PUBLIC_LIVE_API_URL,
  STORYBOOK_PUBLIC_DFP_BACKEND_URL,
  STORYBOOK_PUBLIC_CLIENTSIDE_SERVICES_IFRAME_URL,
  STORYBOOK_STYTCH_PUBLIC_TOKEN,
  STORYBOOK_STYTCH_B2B_PUBLIC_TOKEN,
  // @ts-expect-error TODO: There should some way to get TS to use the newer module option only for Storybook config files
} = import.meta.env;

const clientOptions = {
  endpoints: {
    testAPIURL: STORYBOOK_PUBLIC_TEST_API_URL,
    liveAPIURL: STORYBOOK_PUBLIC_LIVE_API_URL,
    dfpBackendURL: STORYBOOK_PUBLIC_DFP_BACKEND_URL,
    clientsideServicesIframeURL: STORYBOOK_PUBLIC_CLIENTSIDE_SERVICES_IFRAME_URL,
  },
} as InternalStytchClientOptions;

const DEFAULT_CONFIG: StytchLoginConfig = {
  products: [Products.passwords, Products.emailMagicLinks],
};

const B2CDecorator = (props: Omit<GlobalContextProviderProps<Stytch.DefaultProjectConfiguration>, 'client'>) => {
  const client = useMemo(() => {
    const publicToken = STORYBOOK_STYTCH_PUBLIC_TOKEN ?? 'public-token-fake-public-token';

    // This is a hack, but allows us to synchronously clear cached data when a
    // new client is created/a new story is rendered
    window.localStorage.removeItem(`stytch_sdk_state_${publicToken}`);
    window.localStorage.removeItem(`stytch_sdk_state_${publicToken}::bootstrap`);
    __clearConsumerDataLayerCache();

    return new StytchUIClient(publicToken, clientOptions);
  }, []);

  return <GlobalContextProvider {...props} callbacks={callbacks} client={client} />;
};

const B2B_DEFAULT_CONFIG: StytchB2BUIConfig = {
  authFlowType: AuthFlowType.Discovery,
  products: [B2BProducts.emailMagicLinks, B2BProducts.sso],
  sessionOptions: {
    sessionDurationMinutes: 60,
  },
  passwordOptions: {
    loginRedirectURL: 'https://example.com/authenticate',
    resetPasswordRedirectURL: 'https://example.com/reset',
  },
};

interface B2BDecoratorProps extends Omit<B2BGlobalContextProviderProps<Stytch.DefaultProjectConfiguration>, 'client'> {
  adminPortalConfig: AdminPortalOrgUIConfig;
}
const B2BDecorator = (props: B2BDecoratorProps) => {
  const client = useMemo(() => {
    const publicToken = STORYBOOK_STYTCH_B2B_PUBLIC_TOKEN ?? 'public-token-fake-public-token';

    // This is a hack, but allows us to synchronously clear cached data when a
    // new client is created/a new story is rendered
    window.localStorage.removeItem(`stytch_sdk_state_${publicToken}`);
    window.localStorage.removeItem(`stytch_sdk_state_${publicToken}::bootstrap`);
    __clearB2BDataLayerCache();

    return new StytchB2BUIClient(publicToken, clientOptions);
  }, []);

  useEffect(() => {
    client.session.authenticate();

    return () => {
      client.session.revoke();
    };
  }, [client]);

  return (
    <B2BGlobalContextProvider {...props} callbacks={callbacks} client={client}>
      <StytchClientContext.Provider
        value={{
          client,
          config: props.adminPortalConfig,
        }}
      >
        <ToastContextProvider>{props.children}</ToastContextProvider>
      </StytchClientContext.Provider>
    </B2BGlobalContextProvider>
  );
};

export const stytchDecorator: Decorator = (storyFn, context) => {
  const b2cState = merge({}, DEFAULT_STATE, context.parameters?.stytch?.b2c?.initialState);
  const b2bState = merge({}, B2B_DEFAULT_STATE, context.parameters?.stytch?.b2b?.initialState);

  const b2cConfig = merge({}, DEFAULT_CONFIG, context.parameters?.stytch?.b2c?.config);
  const b2bConfig = merge({}, B2B_DEFAULT_CONFIG, context.parameters?.stytch?.b2b?.config);

  const adminPortalConfig = context.parameters?.stytch?.adminPortalConfig;

  const showSnackbar = !context.parameters?.stytch?.disableSnackbar;

  return (
    <B2CDecorator config={b2cConfig} initialState={b2cState}>
      <B2BDecorator config={b2bConfig} initialState={b2bState} adminPortalConfig={adminPortalConfig}>
        {storyFn(context) as React.ReactNode}
        {showSnackbar && <Snackbar />}
      </B2BDecorator>
    </B2CDecorator>
  );
};
