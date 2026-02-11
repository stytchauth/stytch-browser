import { BootstrapData } from '@stytch/core';
import { RNUIProductConfig, StytchProjectConfigurationInput } from '@stytch/core/public';
import React, { useContext } from 'react';

import { Platform } from '../../native-module/types';
import { StytchClient } from '../../StytchClient';
import { StytchTheme } from '../shared/config';
import { B2CUIAction } from './actions';
import { DEFAULT_UI_CONFIG } from './config';
import { GlobalReducer } from './reducers';
import { DEFAULT_UI_STATE, UIState } from './states';

export type AppContext<TProjectConfiguration extends StytchProjectConfigurationInput> = {
  client: StytchClient<TProjectConfiguration>;
  config: RNUIProductConfig;
  theme: StytchTheme;
  state: [UIState, React.Dispatch<B2CUIAction>];
  bootstrapData: BootstrapData;
  platform?: Platform;
};

export const GlobalContext = React.createContext<AppContext<StytchProjectConfigurationInput>>({
  client: {} as StytchClient<StytchProjectConfigurationInput>,
  config: DEFAULT_UI_CONFIG.productConfig,
  state: [DEFAULT_UI_STATE, () => null],
  theme: DEFAULT_UI_CONFIG.styles!.lightTheme,
  bootstrapData: {} as BootstrapData,
  platform: undefined,
});

type GlobalContextProviderProps = {
  children: React.ReactNode;
  client: StytchClient<StytchProjectConfigurationInput>;
  config: RNUIProductConfig;
  theme: StytchTheme;
  bootstrapData: BootstrapData;
  initialState?: UIState;
  platform?: Platform;
};

export const GlobalContextProvider = ({
  children,
  client,
  config,
  theme,
  bootstrapData,
  initialState,
  platform,
}: GlobalContextProviderProps) => {
  const state = React.useReducer(GlobalReducer, initialState ?? DEFAULT_UI_STATE);
  return (
    <GlobalContext.Provider value={{ client, state, config, theme, bootstrapData, platform }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = <TProjectConfiguration extends StytchProjectConfigurationInput>() =>
  useContext(GlobalContext) as AppContext<TProjectConfiguration>;
export const useStytch = <TProjectConfiguration extends StytchProjectConfigurationInput>() =>
  useGlobalContext<TProjectConfiguration>().client;
export const useGlobalReducer = () => useGlobalContext().state;
export const useConfig = () => useGlobalContext().config;
export const useTheme = () => useGlobalContext().theme;
export const useBootStrapData = () => useGlobalContext().bootstrapData;
export const useRedirectUrl = () => `stytch-ui-${useGlobalContext().client.publicToken}://deeplink`;
export const usePlatform = () => useGlobalContext().platform;
