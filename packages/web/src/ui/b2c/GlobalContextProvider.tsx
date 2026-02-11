import { Callbacks, OTPMethods, StytchProjectConfigurationInput, Wallets } from '@stytch/core/public';
import React, { useContext } from 'react';

import type { StytchClient } from '../../StytchClient';
import { StytchLoginConfig } from '../../types';
import { noop } from '../../utils';
import { useEvent } from '../hooks/useEvent';
import { Action, reducer } from './reducer';

/* eslint-disable lingui/no-unlocalized-strings -- internal constants, not user-facing strings */
export const AppScreens = {
  Main: 'Main',
  FloatingOneTap: 'FloatingOneTap',
  PasskeyRegistrationStart: 'PasskeyRegistrationStart',
  PasskeyRegistrationSuccess: 'PasskeyRegistrationSuccess',
  PasskeyConfirmation: 'PasskeyConfirmation',
  PasswordCreateOrLogin: 'PasswordCreateOrLogin',
  PasswordResetForm: 'PasswordResetForm',
  PasswordForgot: 'PasswordForgot',
  PasswordBreached: 'PasswordBreached',
  PasswordSetNew: 'PasswordSetNew',
  PasswordDedupe: 'PasswordDedupe',
  PasswordConfirmation: 'PasswordConfirmation',
  EmailConfirmation: 'EmailConfirmation',
  OTPAuthenticate: 'OTPAuthenticate',
  OTPConfirmation: 'OTPConfirmation',
  CryptoConnect: 'CryptoConnect',
  CryptoSignMessage: 'CryptoSignMessage',
  CryptoOtherScreen: 'CryptoOtherScreen',
  CryptoSetupWallet: 'CryptoSetupWallet',
  CryptoError: 'CryptoError',
  CryptoConfirmation: 'CryptoConfirmation',
} as const;
/* eslint-enable lingui/no-unlocalized-strings */

export type AppScreens = keyof typeof AppScreens;

export type MagicLinkState = {
  email: string;
};

export type OTPState = {
  type: OTPMethods;
  methodId: string;
  otpDestination: string;
};

export type PasswordState = {
  email: string;
  type: 'new' | 'passwordless' | 'password';
};

export type CryptoState = {
  walletAddress: string;
  walletOption: Wallets;
  walletChallenge: string;
};

export type ResetPasswordState = {
  token: string;
};

export type FormState = {
  magicLinkState: MagicLinkState;
  otpState: OTPState;
  cryptoState: CryptoState;
  passwordState: PasswordState;
  resetPasswordState: ResetPasswordState;
};

export type AppState = {
  screen: AppScreens;
  formState: FormState;
};

export type AppContext<TProjectConfiguration extends StytchProjectConfigurationInput> = {
  client: StytchClient<TProjectConfiguration>;
  config: StytchLoginConfig;
  callbacks?: Callbacks<TProjectConfiguration>;
  state: [AppState, React.Dispatch<Action>];
};

export const DEFAULT_STATE: AppState = {
  screen: AppScreens.Main,
  formState: {
    magicLinkState: {
      email: '',
    },
    otpState: {
      type: OTPMethods.Email,
      methodId: '',
      otpDestination: '',
    },
    cryptoState: {
      walletAddress: '',
      walletOption: Wallets.Metamask,
      walletChallenge: '',
    },
    passwordState: {
      email: '',
      type: 'new',
    },
    resetPasswordState: {
      token: '',
    },
  },
};

export const GlobalContext = React.createContext<AppContext<StytchProjectConfigurationInput>>({
  client: {} as StytchClient<StytchProjectConfigurationInput>,
  config: {} as StytchLoginConfig,
  state: [DEFAULT_STATE, () => null],
});

export type GlobalContextProviderProps<TProjectConfiguration extends StytchProjectConfigurationInput> = {
  children: React.ReactNode;
  client: StytchClient<TProjectConfiguration>;
  config: StytchLoginConfig;
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
