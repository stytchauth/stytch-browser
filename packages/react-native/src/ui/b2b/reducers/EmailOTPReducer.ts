import { B2BEmailOTPAction } from '../actions';
import { Screen } from '../screens';
import { UIState } from '../states';

export const EmailOTPReducer = (state: UIState, action: B2BEmailOTPAction): UIState => {
  switch (action.type) {
    case 'emailOTP/authenticate':
    case 'emailOTP/discovery/authenticate':
    case 'emailOTP/email/loginOrSignup':
    case 'emailOTP/email/discovery/send':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: true,
          error: undefined,
        },
      };
    case 'emailOTP/authenticate/success':
    case 'emailOTP/discovery/authenticate/success':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
          error: undefined,
        },
      };
    case 'emailOTP/email/discovery/send/success':
    case 'emailOTP/email/loginOrSignup/success':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
        history: state.history.concat([state.screen]),
        screen: Screen.EmailOTPEntry,
      };
    case 'emailOTP/authenticate/error':
    case 'emailOTP/discovery/authenticate/error':
    case 'emailOTP/email/loginOrSignup/error':
    case 'emailOTP/email/discovery/send/error':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
          error: action.error,
        },
      };
  }
};
