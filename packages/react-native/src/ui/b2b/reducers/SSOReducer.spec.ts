import { B2BSSOAction } from '../actions';
import { DEFAULT_UI_STATE } from '../states';
import { SSOReducer } from './SSOReducer';
import { MOCK_ERROR_RESPONSE } from '../../../mocks';
import { MOCK_FULLY_AUTHED_MEMBER_SESSION } from '../mocks';

describe('SSOReducer', () => {
  it('sso/start/success sets expected state', () => {
    const action: B2BSSOAction = { type: 'sso/start/success' };
    const result = SSOReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
    });
  });
  it('sso/authenticate/success sets expected state', () => {
    const action: B2BSSOAction = { type: 'sso/authenticate/success', response: MOCK_FULLY_AUTHED_MEMBER_SESSION };
    const result = SSOReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
    });
  });
  it('sso/start/error sets expected state', () => {
    const action: B2BSSOAction = { type: 'sso/start/error', error: MOCK_ERROR_RESPONSE };
    const result = SSOReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: action.error,
      },
    });
  });
  it('sso/authenticate/error sets expected state', () => {
    const action: B2BSSOAction = { type: 'sso/authenticate/error', error: MOCK_ERROR_RESPONSE };
    const result = SSOReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: action.error,
      },
    });
  });
});
