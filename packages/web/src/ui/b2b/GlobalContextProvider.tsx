import { AuthFlowType, Callbacks, StytchProjectConfigurationInput } from '@stytch/core/public';
import React, { useContext } from 'react';

import { StytchB2BClient } from '../../b2b/StytchB2BClient';
import { StytchB2BExtendedLoginConfig } from '../../types';
import { noop } from '../../utils';
import { useEvent } from '../hooks/useEvent';
import { DEFAULT_MFA_STATE } from './MfaState';
import { Action, reducer } from './reducer';
import { AppScreens } from './types/AppScreens';
import { AppState } from './types/AppState';
import { ErrorType } from './types/ErrorType';

export type AppContext<TProjectConfiguration extends StytchProjectConfigurationInput> = {
  client: StytchB2BClient<TProjectConfiguration>;
  config: StytchB2BExtendedLoginConfig;
  callbacks?: Callbacks<TProjectConfiguration>;
  state: [AppState, React.Dispatch<Action>];
};

export const DEFAULT_STATE: AppState = {
  screen: AppScreens.Main,
  screenHistory: [],
  formState: {
    emailState: {
      userSuppliedEmail: '',
    },
    otpState: {
      codeExpiration: null,
    },
    discoveryState: {
      email: '',
      discoveredOrganizations: [],
    },
    passwordState: {
      email: '',
    },
    ssoDiscoveryState: {
      connections: [],
    },
  },
  flowState: {
    type: AuthFlowType.Organization,
    organization: null,
  },
  mfa: DEFAULT_MFA_STATE,
  primary: {},
  error: {
    type: ErrorType.Default,
    canGoBack: false,
  },
};

export const GlobalContext = React.createContext<AppContext<StytchProjectConfigurationInput>>({
  client: {} as StytchB2BClient<StytchProjectConfigurationInput>,
  config: {} as StytchB2BExtendedLoginConfig,
  state: [DEFAULT_STATE, () => null],
});

export type GlobalContextProviderProps<TProjectConfiguration extends StytchProjectConfigurationInput> = {
  children: React.ReactNode;
  client: StytchB2BClient<TProjectConfiguration>;
  config: StytchB2BExtendedLoginConfig;
  callbacks?: Callbacks<TProjectConfiguration>;
  initialState?: AppState;
};

export const GlobalContextProvider = <TProjectConfiguration extends StytchProjectConfigurationInput>({
  children,
  client,
  config,
  callbacks,
  initialState,
}: GlobalContextProviderProps<TProjectConfiguration>) => {
  const state = React.useReducer(reducer, initialState ?? DEFAULT_STATE);

  return <GlobalContext.Provider value={{ client, state, config, callbacks }}>{children}</GlobalContext.Provider>;
};

export const useGlobalContext = () => useContext(GlobalContext);
export const useStytch = () => useGlobalContext().client;
export const useGlobalReducer = () => useGlobalContext().state;
export const useConfig = () => useGlobalContext().config;
export const useErrorCallback = () => useEvent(useGlobalContext().callbacks?.onError ?? noop);
export const useEventCallback = () => useEvent(useGlobalContext().callbacks?.onEvent ?? noop);
