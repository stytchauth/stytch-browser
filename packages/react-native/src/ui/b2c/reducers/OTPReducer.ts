import { OTPAction } from '../actions';
import { Screen } from '../screens';
import { UIState } from '../states';

export const OTPReducer = (state: UIState, action: OTPAction): UIState => {
  switch (action.type) {
    case 'otp/authenticate':
    case 'otp/email/loginOrCreate':
    case 'otp/sms/loginOrCreate':
    case 'otp/whatsapp/loginOrCreate':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: true,
          error: undefined,
        },
      };
    case 'otp/email/loginOrCreate/success':
      return {
        ...state,
        history: state.history.concat([state.screen]),
        screen: Screen.OTPConfirmation,
        screenState: {
          isSubmitting: false,
        },
        authenticationState: {
          ...state.authenticationState,
          methodId: action.response.method_id,
          otpMethod: 'email',
        },
      };
    case 'otp/sms/loginOrCreate/success':
      return {
        ...state,
        history: state.history.concat([state.screen]),
        screen: Screen.OTPConfirmation,
        screenState: {
          isSubmitting: false,
        },
        authenticationState: {
          ...state.authenticationState,
          methodId: action.response.method_id,
          otpMethod: 'sms',
        },
      };
    case 'otp/whatsapp/loginOrCreate/success':
      return {
        ...state,
        history: state.history.concat([state.screen]),
        screen: Screen.OTPConfirmation,
        screenState: {
          isSubmitting: false,
        },
        authenticationState: {
          ...state.authenticationState,
          methodId: action.response.method_id,
          otpMethod: 'whatsapp',
        },
      };
    case 'otp/authenticate/error':
    case 'otp/email/loginOrCreate/error':
    case 'otp/sms/loginOrCreate/error':
    case 'otp/whatsapp/loginOrCreate/error':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
          error: action.error,
        },
      };
    case 'otp/authenticate/success':
      return {
        ...state,
        history: state.history.concat([state.screen]),
        screen: Screen.Success,
        screenState: {
          isSubmitting: false,
        },
      };
  }
};
