import { B2BNavigationAction } from '../actions';
import { Screen } from '../screens';
import { UIState } from '../states';

export const NavigationReducer = (state: UIState, action: B2BNavigationAction): UIState => {
  switch (action.type) {
    case 'navigate/goBack': {
      const newScreen = state.history.at(-1) ?? Screen.Main;
      return {
        ...state,
        screen: newScreen,
        history: state.history.slice(0, -1),
        screenState: {
          ...state.screenState,
          error: undefined,
        },
      };
    }
    case 'navigate/to':
      return {
        ...state,
        screen: action.screen,
        history: state.history.concat([state.screen]),
        screenState: {
          ...state.screenState,
          error: action.error,
        },
      };
    case 'navigate/reset':
      return {
        ...state,
        history: [],
        screen: Screen.Main,
        screenState: {
          isSubmitting: false,
        },
        memberState: {
          emailAddress: {
            didFinish: false,
          },
          password: {},
        },
        discoveryState: {
          email: '',
          discoveredOrganizations: [],
        },
        primaryAuthState: {},
        ssoDiscoveryState: {
          connections: [],
        },
      };
  }
};
