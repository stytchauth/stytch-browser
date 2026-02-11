import React, { useContext } from 'react';
import { useEvent } from '../hooks/useEvent';
import { StytchB2BUIClient } from '../../b2b/StytchB2BUIClient';

import {
  AuthFlowType,
  B2BProducts,
  Callbacks,
  StytchB2BUIConfig,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';
import { DEFAULT_MFA_STATE } from './MfaState';
import { Action, reducer } from './reducer';
import { AppScreens } from './types/AppScreens';
import { ErrorType } from './types/ErrorType';
import { AppState } from './types/AppState';

export type AppContext<TProjectConfiguration extends StytchProjectConfigurationInput> = {
  client: StytchB2BUIClient<TProjectConfiguration>;
  config: StytchB2BUIConfig;
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

export const DEFAULT_CONFIG: StytchB2BUIConfig = {
  products: [B2BProducts.emailMagicLinks],
  authFlowType: AuthFlowType.Organization,
  sessionOptions: {
    sessionDurationMinutes: 60,
  },
};

export const GlobalContext = React.createContext<AppContext<StytchProjectConfigurationInput>>({
  client: {} as StytchB2BUIClient<StytchProjectConfigurationInput>,
  config: DEFAULT_CONFIG,
  state: [DEFAULT_STATE, () => null],
});

export type GlobalContextProviderProps<TProjectConfiguration extends StytchProjectConfigurationInput> = {
  children: React.ReactNode;
  client: StytchB2BUIClient<TProjectConfiguration>;
  config: StytchB2BUIConfig;
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

  return (
    <GlobalContext.Provider
      value={{ client: client as StytchB2BUIClient<TProjectConfiguration>, state, config, callbacks }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

const noop = () => {
  // noop
};

export const useGlobalContext = () => useContext(GlobalContext);
export const useStytch = () => useGlobalContext().client;
export const useGlobalReducer = () => useGlobalContext().state;
export const useConfig = () => useGlobalContext().config;
export const useErrorCallback = () => useEvent(useGlobalContext().callbacks?.onError ?? noop);
export const useEventCallback = () => useEvent(useGlobalContext().callbacks?.onEvent ?? noop);
