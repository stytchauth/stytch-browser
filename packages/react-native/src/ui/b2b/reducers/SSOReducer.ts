import { B2BSSOAction } from '../actions';
import { Screen } from '../screens';
import { UIState } from '../states';

export const SSOReducer = (state: UIState, action: B2BSSOAction): UIState => {
  switch (action.type) {
    case 'sso/start':
    case 'sso/authenticate':
    case 'sso/discovery':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: true,
          error: undefined,
        },
      };
    case 'sso/start/success':
    case 'sso/authenticate/success':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
          error: undefined,
        },
      };
    case 'sso/start/error':
    case 'sso/authenticate/error':
    case 'sso/discovery/error':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
          error: action.error,
        },
      };
    case 'sso/discovery/success': {
      const connections = action.response.connections;
      const screen = connections.length ? Screen.SSODiscoveryMenu : Screen.SSODiscoveryFallback;
      const history = state.history.concat([state.screen]);
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
          error: undefined,
        },
        screen: screen,
        history: history,
        ssoDiscoveryState: {
          connections: connections,
        },
      };
    }
  }
};
