import { PasswordAction } from '../actions';
import { Screen } from '../screens';
import { UIState } from '../states';

export const PasswordReducer = (state: UIState, action: PasswordAction): UIState => {
  switch (action.type) {
    case 'passwords/strengthCheck':
      return state;
    case 'passwords/authenticate':
    case 'passwords/create':
    case 'passwords/resetByEmail':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: true,
          error: undefined,
        },
      };
    case 'passwords/resetByEmailStart':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: true,
          error: undefined,
        },
        userState: {
          ...state.userState,
          password: {
            ...state.userState.password,
            resetType: action.resetType,
          },
        },
      };
    case 'passwords/authenticate/error':
    case 'passwords/create/error':
    case 'passwords/resetByEmail/error':
    case 'passwords/resetByEmailStart/error':
    case 'passwords/strengthCheck/error':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
          error: action.error,
        },
      };
    case 'passwords/create/success':
    case 'passwords/authenticate/success':
    case 'passwords/resetByEmail/success':
      return {
        ...state,
        history: state.history.concat([state.screen]),
        screen: Screen.Success,
        screenState: {
          isSubmitting: false,
        },
      };
    case 'passwords/resetByEmailStart/success':
      return {
        ...state,
        history: state.history.concat([state.screen]),
        screen: Screen.PasswordResetSent,
        screenState: {
          isSubmitting: false,
        },
      };
    case 'passwords/strengthCheck/success':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
          error: undefined,
        },
        userState: {
          ...state.userState,
          password: {
            ...state.userState.password,
            passwordStrengthCheckResponse: action.response,
          },
        },
      };
  }
};
