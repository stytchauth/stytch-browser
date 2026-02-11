import { AppScreens, AppState, CryptoState, OTPState, PasswordState } from './GlobalContextProvider';

export type Action =
  | { type: 'transition'; screen: AppScreens }
  | { type: 'set_magic_link_email'; email: string }
  | { type: 'update_otp_state'; otpState: OTPState }
  | { type: 'update_crypto_state'; cryptoState: CryptoState }
  | { type: 'update_password_state'; passwordState: PasswordState };

export const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'transition':
      return {
        ...state,
        screen: action.screen,
      };
    case 'set_magic_link_email': {
      return {
        ...state,
        formState: {
          ...state.formState,
          magicLinkState: { email: action.email },
        },
      };
    }
    case 'update_otp_state': {
      return {
        ...state,
        formState: {
          ...state.formState,
          otpState: action.otpState,
        },
      };
    }
    case 'update_crypto_state': {
      return {
        ...state,
        formState: {
          ...state.formState,
          cryptoState: action.cryptoState,
        },
      };
    }
    case 'update_password_state': {
      return {
        ...state,
        formState: {
          ...state.formState,
          passwordState: action.passwordState,
        },
      };
    }

    default:
      throw new Error();
  }
};
