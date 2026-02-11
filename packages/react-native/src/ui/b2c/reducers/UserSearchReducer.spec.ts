import { MOCK_ERROR_RESPONSE } from '../../../mocks';
import { UserSearchAction } from '../actions';
import { Screen } from '../screens';
import { DEFAULT_UI_STATE } from '../states';
import { UserSearchReducer } from './UserSearchReducer';

describe('UserSearchReducer', () => {
  it('userSearch sets expected state', () => {
    const action: UserSearchAction = { type: 'userSearch' };
    const result = UserSearchReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: true,
      },
    });
  });
  it('userSearch/success with new sets expected state', () => {
    const action: UserSearchAction = { type: 'userSearch/success', result: 'new' };
    const result = UserSearchReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      history: [Screen.Main],
      screen: Screen.NewUser,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
      userState: {
        ...DEFAULT_UI_STATE.userState,
        userType: 'new',
      },
    });
  });
  it('userSearch/success with password sets expected state', () => {
    const action: UserSearchAction = { type: 'userSearch/success', result: 'password' };
    const result = UserSearchReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      history: [Screen.Main],
      screen: Screen.ReturningUser,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
      userState: {
        ...DEFAULT_UI_STATE.userState,
        userType: 'password',
      },
    });
  });
  it('userSearch/success with passwordless sets expected state', () => {
    const action: UserSearchAction = { type: 'userSearch/success', result: 'passwordless' };
    const result = UserSearchReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
      userState: {
        ...DEFAULT_UI_STATE.userState,
        userType: 'passwordless',
      },
    });
  });
  it('userSearch/error sets expected state', () => {
    const action: UserSearchAction = { type: 'userSearch/error', error: MOCK_ERROR_RESPONSE };
    const result = UserSearchReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: MOCK_ERROR_RESPONSE,
      },
    });
  });
});
