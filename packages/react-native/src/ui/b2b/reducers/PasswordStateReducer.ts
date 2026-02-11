import { B2BPasswordAction } from '../actions';
import { Screen } from '../screens';
import { UIState } from '../states';

export const PasswordStateReducer = (state: UIState, action: B2BPasswordAction): UIState => {
  switch (action.type) {
    case 'passwords/strengthCheck':
    case 'passwords/authenticate':
    case 'passwords/resetByEmail':
    case 'passwords/resetByEmailStart':
    case 'passwords/resetBySession':
    case 'passwords/discovery/resetByEmailStart':
    case 'passwords/discovery/resetByEmail':
    case 'passwords/discovery/authenticate':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: true,
          error: undefined,
        },
      };
    case 'passwords/authenticate/start':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
        history: state.history.concat([state.screen]),
        screen: Screen.PasswordAuthenticate,
      };
    case 'passwords/authenticate/success':
    case 'passwords/resetByEmail/success':
    case 'passwords/resetByEmailStart/success':
    case 'passwords/resetPassword/success':
    case 'passwords/discovery/resetByEmail/success':
    case 'passwords/discovery/authenticate/success':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
      };
    case 'passwords/resetPassword':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
        authenticationState: {
          ...state.authenticationState,
          token: action.token,
          tokenType: action.tokenType,
        },
        history: state.history.concat([state.screen]),
        screen: Screen.PasswordResetForm,
      };
    case 'passwords/resetBySession/success':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
        history: state.history.concat([state.screen]),
        screen: Screen.Success,
      };
    case 'passwords/strengthCheck/success':
      return {
        ...state,
        memberState: {
          ...state.memberState,
          password: {
            ...state.memberState.password,
            passwordStrengthCheckResponse: action.response,
          },
        },
      };
    case 'passwords/strengthCheck/error':
    case 'passwords/authenticate/error':
    case 'passwords/resetByEmail/error':
    case 'passwords/resetByEmailStart/error':
    case 'passwords/resetBySession/error':
    case 'passwords/resetPassword/error':
    case 'passwords/discovery/resetByEmailStart/error':
    case 'passwords/discovery/resetByEmail/error':
    case 'passwords/discovery/authenticate/error':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
          error: action.error,
        },
      };
    case 'passwords/discovery/resetByEmailStart/success':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
        history: state.history.concat([state.screen]),
        screen: Screen.PasswordSetNewConfirmation,
      };
  }
};
