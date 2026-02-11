import React, { useContext } from 'react';
import { useEvent } from '../hooks/useEvent';
import { StytchUIClient } from '../../StytchUIClient';
import { DeepRequired } from '../../utils';
import { MessageDescriptor } from '@lingui/core';

import {
  StytchLoginConfig,
  Products,
  OTPMethods,
  Wallets,
  StyleConfig,
  Callbacks,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';
import { reducer, Action } from './reducer';

export enum AppScreens {
  Main = 'Main',
  PasskeyRegistrationStart = 'Register New Passkey',
  PasskeyRegistrationSuccess = 'Passkey Registration Success',
  PasskeyConfirmation = 'Passkey Confirmation',
  PasswordCreateOrLogin = 'Password',
  PasswordResetForm = 'Password Reset Form',
  PasswordForgot = 'Password Forgot',
  PasswordBreached = 'Password Breached',
  PasswordSetNew = 'Password Set New',
  PasswordDedupe = 'Password Dedupe',
  PasswordConfirmation = 'Password Confirmation',
  EmailConfirmation = 'Email Confirmation',
  OTPAuthenticate = 'OTP Authenticate',
  OTPConfirmation = 'OTP Confirmation',
  CryptoConnect = 'Crypto Connect',
  CryptoSignMessage = 'Crypto Sign Message',
  CryptoOtherScreen = 'Crypto Other Screen',
  CryptoSetupWallet = 'Crypto Setup Wallet',
  CryptoError = 'Crypto Error',
  CryptoConfirmation = 'Crypto Confirmation',
  IDPConsent = 'IDP Consent',
}

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
  errorDescriptor: MessageDescriptor | undefined;
};

export type AppState = {
  screen: AppScreens;
  formState: FormState;
};

export type AppContext<TProjectConfiguration extends StytchProjectConfigurationInput> = {
  client: StytchUIClient<TProjectConfiguration>;
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
    errorDescriptor: undefined,
  },
};

export const DEFAULT_CONFIG: StytchLoginConfig = {
  products: [Products.emailMagicLinks],
  emailMagicLinksOptions: {
    loginRedirectURL: '',
    loginExpirationMinutes: 30,
    signupRedirectURL: '',
    signupExpirationMinutes: 30,
    createUserAsPending: false,
  },
};

export const DEFAULT_STYLE_CONFIG: Omit<DeepRequired<StyleConfig>, 'inputs'> = {
  container: {
    backgroundColor: '#FFFFFF',
    borderColor: '#ADBCC5',
    borderRadius: '8px',
    width: '400px',
  },
  colors: {
    primary: '#19303D',
    secondary: '#5C727D',
    success: '#0C5A56',
    warning: '#FFD94A',
    error: '#8B1214',
    accent: '#ECFAFF',
  },
  buttons: {
    primary: {
      backgroundColor: '#19303D',
      textColor: '#FFFFFF',
      borderColor: '#19303D',
      borderRadius: '4px',
    },
    secondary: {
      backgroundColor: '#FFFFFF',
      textColor: '#19303D',
      borderColor: '#19303D',
      borderRadius: '4px',
    },
    disabled: {
      backgroundColor: '#F3F5F6',
      textColor: '#8296A1',
      borderColor: '#F3F5F6',
      borderRadius: '4px',
    },
  },
  fontFamily: 'Arial, Helvetica, sans-serif',
  hideHeaderText: false,
  logo: {
    logoImageUrl: '',
  },
};

export const GlobalContext = React.createContext<AppContext<StytchProjectConfigurationInput>>({
  client: {} as StytchUIClient<StytchProjectConfigurationInput>,
  config: DEFAULT_CONFIG,
  state: [DEFAULT_STATE, () => null],
});

export type GlobalContextProviderProps<TProjectConfiguration extends StytchProjectConfigurationInput> = {
  children: React.ReactNode;
  client: StytchUIClient<TProjectConfiguration>;
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

  return (
    <GlobalContext.Provider
      value={{ client: client as StytchUIClient<TProjectConfiguration>, state, config, callbacks }}
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
