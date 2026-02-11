import { MOCK_ERROR_RESPONSE } from '../../../mocks';
import { DeeplinkAction } from '../actions';
import { Screen } from '../screens';
import { DEFAULT_UI_STATE } from '../states';
import { DeeplinkReducer } from './DeeplinkReducer';

describe('DeeplinkReducer', () => {
  it('deeplink/parse sets expected state', () => {
    const action: DeeplinkAction = { type: 'deeplink/parse' };
    const result = DeeplinkReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: true,
      },
    });
  });
  it('deeplink/parse/ignored sets expected state', () => {
    const action: DeeplinkAction = { type: 'deeplink/parse/ignored' };
    const result = DeeplinkReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
    });
  });
  it('deeplink/parse/error sets expected state', () => {
    const action: DeeplinkAction = { type: 'deeplink/parse/error', error: MOCK_ERROR_RESPONSE };
    const result = DeeplinkReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: MOCK_ERROR_RESPONSE,
      },
    });
  });
  describe('deeplink/parse/success sets expected state', () => {
    it('for MagicLinks', () => {
      const action: DeeplinkAction = { type: 'deeplink/parse/success', tokenType: 'magic_links', token: 'my-token' };
      const result = DeeplinkReducer(DEFAULT_UI_STATE, action);
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        history: [Screen.Main],
        screen: Screen.Success,
        screenState: {
          ...DEFAULT_UI_STATE.screenState,
          isSubmitting: false,
        },
        authenticationState: {
          token: 'my-token',
        },
      });
    });
    it('for OAuth', () => {
      const action: DeeplinkAction = { type: 'deeplink/parse/success', tokenType: 'oauth', token: 'my-token' };
      const result = DeeplinkReducer(DEFAULT_UI_STATE, action);
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        history: [Screen.Main],
        screen: Screen.Success,
        screenState: {
          ...DEFAULT_UI_STATE.screenState,
          isSubmitting: false,
        },
        authenticationState: {
          token: 'my-token',
        },
      });
    });
    it('for Password Reset', () => {
      const action: DeeplinkAction = { type: 'deeplink/parse/success', tokenType: 'reset_password', token: 'my-token' };
      const result = DeeplinkReducer(DEFAULT_UI_STATE, action);
      expect(result).toMatchObject({
        ...DEFAULT_UI_STATE,
        history: [Screen.Main],
        screen: Screen.SetPassword,
        screenState: {
          ...DEFAULT_UI_STATE.screenState,
          isSubmitting: false,
        },
        authenticationState: {
          token: 'my-token',
        },
      });
    });
  });
});
