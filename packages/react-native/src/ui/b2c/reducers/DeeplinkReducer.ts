import { DeeplinkAction } from '../actions';
import { Screen } from '../screens';
import { UIState } from '../states';

export const DeeplinkReducer = (state: UIState, action: DeeplinkAction): UIState => {
  switch (action.type) {
    case 'deeplink/parse':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: true,
        },
      };
    case 'deeplink/parse/ignored':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
      };
    case 'deeplink/parse/error':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
          error: action.error,
        },
      };
    case 'deeplink/parse/success': {
      let newScreen: Screen;
      switch (action.tokenType) {
        case 'magic_links':
        case 'oauth':
          newScreen = Screen.Success;
          break;
        case 'reset_password':
          newScreen = Screen.SetPassword;
          break;
      }
      return {
        ...state,
        history: state.history.concat([state.screen]),
        screen: newScreen,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
        authenticationState: {
          ...state.authenticationState,
          token: action.token,
        },
      };
    }
  }
};
