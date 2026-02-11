import {
  MOCK_AUTHENTICATE_RETURN_VALUE_WITH_METHOD_ID,
  MOCK_ERROR_RESPONSE,
  MOCK_RESPONSE_COMMON,
} from '../../../mocks';
import { EMLAction } from '../actions';
import { Screen } from '../screens';
import { DEFAULT_UI_STATE } from '../states';
import { EMLReducer } from './EMLReducer';

describe('EMLReducer', () => {
  it('eml/loginOrCreate sets expected state', () => {
    const action: EMLAction = { type: 'eml/loginOrCreate' };
    const result = EMLReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: true,
      },
    });
  });
  it('eml/authenticate sets expected state', () => {
    const action: EMLAction = { type: 'eml/authenticate' };
    const result = EMLReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: true,
      },
    });
  });
  it('eml/loginOrCreate/success sets expected state', () => {
    const action: EMLAction = { type: 'eml/loginOrCreate/success', response: MOCK_RESPONSE_COMMON };
    const result = EMLReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      history: [Screen.Main],
      screen: Screen.EMLConfirmation,
    });
  });
  it('eml/loginOrCreate/error sets expected state', () => {
    const action: EMLAction = { type: 'eml/loginOrCreate/error', error: MOCK_ERROR_RESPONSE };
    const result = EMLReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: MOCK_ERROR_RESPONSE,
      },
    });
  });
  it('eml/authenticate/success sets expected state', () => {
    const action: EMLAction = {
      type: 'eml/authenticate/success',
      response: MOCK_AUTHENTICATE_RETURN_VALUE_WITH_METHOD_ID,
    };
    const result = EMLReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      history: [Screen.Main],
      screen: Screen.Success,
    });
  });
  it('eml/authenticate/error sets expected state', () => {
    const action: EMLAction = { type: 'eml/authenticate/error', error: MOCK_ERROR_RESPONSE };
    const result = EMLReducer(DEFAULT_UI_STATE, action);
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
