import { OAuthAction } from '../actions';
import { Screen } from '../screens';
import { UIState } from '../states';

export const OAuthReducer = (state: UIState, action: OAuthAction): UIState => {
  switch (action.type) {
    case 'oauth/start':
    case 'oauth/authenticate':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: true,
          error: undefined,
        },
      };
    case 'oauth/start/error':
    case 'oauth/authenticate/error':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
          error: action.error,
        },
      };
    case 'oauth/start/success':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
          error: undefined,
        },
      };
    case 'oauth/authenticate/success':
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
