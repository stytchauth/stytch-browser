import React, { useContext } from 'react';
import { useEvent } from '../shared/hooks';
import { StytchB2BClient } from '../../b2b/StytchB2BClient';
import { DEFAULT_UI_STATE, UIState } from './states';
import { B2BUIAction } from './actions';
import { DEFAULT_UI_CONFIG, StytchRNB2BUIConfig } from './config';
import { StytchTheme } from '../shared/config';
import { GlobalReducer } from './reducers';
import { BootstrapData } from '@stytch/core';
import { Platform } from '../../native-module/types';
import { Callbacks } from '@stytch/core/public';

export type AppContext = {
  client: StytchB2BClient;
  config: StytchRNB2BUIConfig;
  theme: StytchTheme;
  state: [UIState, React.Dispatch<B2BUIAction>];
  bootstrapData: BootstrapData;
  platform?: Platform;
  callbacks?: Callbacks;
};

export const GlobalContext = React.createContext<AppContext>({
  client: {} as StytchB2BClient,
  config: DEFAULT_UI_CONFIG,
  state: [DEFAULT_UI_STATE, () => null],
  theme: DEFAULT_UI_CONFIG.styles!.lightTheme,
  bootstrapData: {} as BootstrapData,
  platform: undefined,
  callbacks: undefined,
});

type GlobalContextProviderProps = {
  children: React.ReactNode;
  client: StytchB2BClient;
  config: StytchRNB2BUIConfig;
  theme: StytchTheme;
  bootstrapData: BootstrapData;
  initialState?: UIState;
  platform?: Platform;
  callbacks?: Callbacks;
};

export const GlobalContextProvider = ({
  children,
  client,
  config,
  theme,
  bootstrapData,
  initialState,
  platform,
  callbacks,
}: GlobalContextProviderProps) => {
  const state = React.useReducer(GlobalReducer, initialState ?? DEFAULT_UI_STATE);
  return (
    <GlobalContext.Provider value={{ client, state, config, theme, bootstrapData, platform, callbacks }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
export const useStytch = () => useGlobalContext().client;
export const useGlobalReducer = () => useGlobalContext().state;
export const useConfig = () => useGlobalContext().config;
export const useTheme = () => useGlobalContext().theme;
export const useBootStrapData = () => useGlobalContext().bootstrapData;
export const useRedirectUrl = () => `stytch-ui-${useGlobalContext().client.publicToken}://deeplink`;
const noop = () => {
  // noop
};

export const usePlatform = () => useGlobalContext().platform;
export const useEventCallback = () => useEvent(useGlobalContext().callbacks?.onEvent ?? noop);
export const useErrorCallback = () => useEvent(useGlobalContext().callbacks?.onError ?? noop);
