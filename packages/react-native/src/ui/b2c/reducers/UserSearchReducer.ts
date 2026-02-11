import { UserSearchAction } from '../actions';
import { Screen } from '../screens';
import { UIState } from '../states';

export const UserSearchReducer = (state: UIState, action: UserSearchAction): UIState => {
  switch (action.type) {
    case 'userSearch':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: true,
          error: undefined,
        },
      };
    case 'userSearch/success': {
      let nextScreen: Screen;
      let newHistory: Screen[];
      switch (action.result) {
        case 'new':
          nextScreen = Screen.NewUser;
          newHistory = state.history.concat([state.screen]);
          break;
        case 'password':
          nextScreen = Screen.ReturningUser;
          newHistory = state.history.concat([state.screen]);
          break;
        case 'passwordless':
          nextScreen = state.screen;
          newHistory = state.history;
      }
      return {
        ...state,
        history: newHistory,
        screen: nextScreen,
        screenState: {
          isSubmitting: false,
        },
        userState: {
          ...state.userState,
          userType: action.result,
        },
      };
    }
    case 'userSearch/error':
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
