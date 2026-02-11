import { OAuthAction } from '../actions';
import { DEFAULT_UI_STATE } from '../states';
import { Screen } from '../screens';
import { MOCK_ERROR_RESPONSE, MOCK_OAUTH_AUTHENTICATE_RESPONSE, MOCK_OAUTH_START_RESPONSE } from '../../../mocks';
import { OAuthReducer } from './OAuthReducer';

describe('OAuthReducer', () => {
  it('oauth/start sets expected state', () => {
    const action: OAuthAction = { type: 'oauth/start' };
    const result = OAuthReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: true,
      },
    });
  });
  it('oauth/authenticate sets expected state', () => {
    const action: OAuthAction = { type: 'oauth/authenticate' };
    const result = OAuthReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: true,
      },
    });
  });
  it('oauth/start/success sets expected state', () => {
    const action: OAuthAction = { type: 'oauth/start/success', response: MOCK_OAUTH_START_RESPONSE };
    const result = OAuthReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
    });
  });
  it('oauth/start/error sets expected state', () => {
    const action: OAuthAction = { type: 'oauth/start/error', error: MOCK_ERROR_RESPONSE };
    const result = OAuthReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: MOCK_ERROR_RESPONSE,
      },
    });
  });
  it('oauth/authenticate/error sets expected state', () => {
    const action: OAuthAction = { type: 'oauth/authenticate/error', error: MOCK_ERROR_RESPONSE };
    const result = OAuthReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: MOCK_ERROR_RESPONSE,
      },
    });
  });
  it('oauth/authenticate/success sets expected state', () => {
    const action: OAuthAction = { type: 'oauth/authenticate/success', response: MOCK_OAUTH_AUTHENTICATE_RESPONSE };
    const result = OAuthReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      history: [Screen.Main],
      screen: Screen.Success,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
    });
  });
});
