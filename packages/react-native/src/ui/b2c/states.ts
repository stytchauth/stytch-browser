import { PasswordStrengthCheckResponse } from '@stytch/core/public';
import { ErrorResponse, PasswordResetType } from '../shared/types';
import { Screen } from './screens';

export interface ScreenState {
  isSubmitting: boolean;
  error?: ErrorResponse;
}

export interface PhoneNumberState {
  countryCode: string;
  phoneNumber?: string | undefined;
  formattedPhoneNumber?: string | undefined;
}

export interface EmailAddressState {
  emailAddress?: string;
  isValid?: boolean;
}

export interface PasswordState {
  password?: string;
  passwordStrengthCheckResponse?: PasswordStrengthCheckResponse;
  resetType?: PasswordResetType;
}

export interface UserState {
  userType?: 'new' | 'password' | 'passwordless';
  emailAddress: EmailAddressState;
  phoneNumber: PhoneNumberState;
  password: PasswordState;
}

export interface AuthenticationState {
  otpMethod: 'email' | 'sms' | 'whatsapp' | undefined;
  methodId?: string;
  token?: string;
}

export interface UIState {
  screen: Screen;
  history: Screen[];
  screenState: ScreenState;
  userState: UserState;
  authenticationState: AuthenticationState;
}

export const DEFAULT_UI_STATE: UIState = {
  history: [],
  screen: Screen.Main,
  screenState: {
    isSubmitting: false,
  },
  userState: {
    emailAddress: {},
    phoneNumber: {
      countryCode: '+1',
    },
    password: {},
  },
  authenticationState: {
    otpMethod: undefined,
  },
};
