import { B2BNavigationAction } from '../actions';
import { Screen } from '../screens';
import { DEFAULT_UI_STATE } from '../states';
import { NavigationReducer } from './NavigationReducer';

describe('NavigationReducer', () => {
  describe('navigate/goBack sets expected state', () => {
    it('when there is no history', () => {
      const action: B2BNavigationAction = { type: 'navigate/goBack' };
      const result = NavigationReducer(
        {
          ...DEFAULT_UI_STATE,
          history: [],
          screen: Screen.Success, // just for testing, could be any screen
        },
        action,
      );
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        history: [],
        screen: Screen.Main,
      });
    });
    it('when there is a history', () => {
      const action: B2BNavigationAction = { type: 'navigate/goBack' };
      const result = NavigationReducer(
        {
          ...DEFAULT_UI_STATE,
          history: [Screen.Main, Screen.Success],
          screen: Screen.Success, // just for testing, could be any screen
        },
        action,
      );
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        history: [Screen.Main],
        screen: Screen.Success,
      });
    });
  });
});
