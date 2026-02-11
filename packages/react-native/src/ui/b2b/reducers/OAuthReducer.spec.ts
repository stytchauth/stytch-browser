import { MOCK_ERROR_RESPONSE } from '../../../mocks';
import { B2BOAuthAction } from '../actions';
import { MOCK_AUTHED_WITH_METHOD_ID_AND_DO, MOCK_OAUTH_AUTH_RESPONSE } from '../mocks';
import { DEFAULT_UI_STATE } from '../states';
import { OAuthReducer } from './OAuthReducer';

describe('OAuthReducer', () => {
  it('oauth/authenticate/success sets expected state', () => {
    const action: B2BOAuthAction = { type: 'oauth/authenticate/success', response: MOCK_OAUTH_AUTH_RESPONSE };
    const result = OAuthReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
    });
  });
  it('oauth/discovery/authenticate/success sets expected state', () => {
    const action: B2BOAuthAction = {
      type: 'oauth/discovery/authenticate/success',
      response: MOCK_AUTHED_WITH_METHOD_ID_AND_DO,
    };
    const result = OAuthReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
    });
  });
  it('oauth/authenticate/error sets expected state', () => {
    const action: B2BOAuthAction = { type: 'oauth/authenticate/error', error: MOCK_ERROR_RESPONSE };
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
  it('oauth/discovery/authenticate/error sets expected state', () => {
    const action: B2BOAuthAction = { type: 'oauth/discovery/authenticate/error', error: MOCK_ERROR_RESPONSE };
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
});
