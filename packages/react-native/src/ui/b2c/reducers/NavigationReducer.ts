import { NavigationAction } from '../actions';
import { Screen } from '../screens';
import { UIState } from '../states';

export const NavigationReducer = (state: UIState, action: NavigationAction): UIState => {
  switch (action.type) {
    case 'navigate/goBack': {
      const newScreen = state.history.pop() ?? Screen.Main;
      return {
        ...state,
        screen: newScreen,
        screenState: {
          ...state.screenState,
          error: undefined,
        },
      };
    }
  }
};
