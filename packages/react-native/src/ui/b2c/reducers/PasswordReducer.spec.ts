import {
  MOCK_AUTHENTICATE_RETURN_VALUE_WITH_EMAIL_ID,
  MOCK_ERROR_RESPONSE,
  MOCK_STRENGTH_CHECK_RESPONSE,
} from '../../../mocks';
import { PasswordAction } from '../actions';
import { Screen } from '../screens';
import { DEFAULT_UI_STATE } from '../states';
import { PasswordReducer } from './PasswordReducer';

describe('PasswordReducer', () => {
  it('passwords/authenticate sets expected state', () => {
    const action: PasswordAction = { type: 'passwords/authenticate' };
    const result = PasswordReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: true,
      },
    });
  });
  it('passwords/create sets expected state', () => {
    const action: PasswordAction = { type: 'passwords/create' };
    const result = PasswordReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: true,
      },
    });
  });
  it('passwords/resetByEmail sets expected state', () => {
    const action: PasswordAction = { type: 'passwords/resetByEmail' };
    const result = PasswordReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: true,
      },
    });
  });
  it('passwords/resetByEmailStart sets expected state', () => {
    const action: PasswordAction = { type: 'passwords/resetByEmailStart', resetType: 'forgot' };
    const result = PasswordReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: true,
      },
      userState: {
        ...DEFAULT_UI_STATE.userState,
        password: {
          ...DEFAULT_UI_STATE.userState.password,
          resetType: 'forgot',
        },
      },
    });
  });
  it('passwords/strengthCheck sets expected state', () => {
    const action: PasswordAction = { type: 'passwords/strengthCheck' };
    const result = PasswordReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject(DEFAULT_UI_STATE);
  });
  it('passwords/authenticate/error sets expected state', () => {
    const action: PasswordAction = { type: 'passwords/authenticate/error', error: MOCK_ERROR_RESPONSE };
    const result = PasswordReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: MOCK_ERROR_RESPONSE,
      },
    });
  });
  it('passwords/create/error sets expected state', () => {
    const action: PasswordAction = { type: 'passwords/create/error', error: MOCK_ERROR_RESPONSE };
    const result = PasswordReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: MOCK_ERROR_RESPONSE,
      },
    });
  });
  it('passwords/resetByEmail/error sets expected state', () => {
    const action: PasswordAction = { type: 'passwords/resetByEmail/error', error: MOCK_ERROR_RESPONSE };
    const result = PasswordReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: MOCK_ERROR_RESPONSE,
      },
    });
  });
  it('passwords/resetByEmailStart/error sets expected state', () => {
    const action: PasswordAction = { type: 'passwords/resetByEmailStart/error', error: MOCK_ERROR_RESPONSE };
    const result = PasswordReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: MOCK_ERROR_RESPONSE,
      },
    });
  });
  it('passwords/strengthCheck/error sets expected state', () => {
    const action: PasswordAction = { type: 'passwords/strengthCheck/error', error: MOCK_ERROR_RESPONSE };
    const result = PasswordReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: MOCK_ERROR_RESPONSE,
      },
    });
  });
  it('passwords/create/success sets expected state', () => {
    const action: PasswordAction = {
      type: 'passwords/create/success',
      response: MOCK_AUTHENTICATE_RETURN_VALUE_WITH_EMAIL_ID,
    };
    const result = PasswordReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      history: [Screen.Main],
      screen: Screen.Success,
    });
  });
  it('passwords/authenticate/success sets expected state', () => {
    const action: PasswordAction = {
      type: 'passwords/authenticate/success',
      response: MOCK_AUTHENTICATE_RETURN_VALUE_WITH_EMAIL_ID,
    };
    const result = PasswordReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      history: [Screen.Main],
      screen: Screen.Success,
    });
  });
  it('passwords/resetByEmail/success sets expected state', () => {
    const action: PasswordAction = {
      type: 'passwords/resetByEmail/success',
      response: MOCK_AUTHENTICATE_RETURN_VALUE_WITH_EMAIL_ID,
    };
    const result = PasswordReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      history: [Screen.Main],
      screen: Screen.Success,
    });
  });
  it('passwords/resetByEmailStart/success sets expected state', () => {
    const action: PasswordAction = {
      type: 'passwords/resetByEmailStart/success',
      response: MOCK_AUTHENTICATE_RETURN_VALUE_WITH_EMAIL_ID,
    };
    const result = PasswordReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      history: [Screen.Main],
      screen: Screen.PasswordResetSent,
    });
  });
  it('passwords/strengthCheck/success sets expected state', () => {
    const action: PasswordAction = { type: 'passwords/strengthCheck/success', response: MOCK_STRENGTH_CHECK_RESPONSE };
    const result = PasswordReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
      userState: {
        ...DEFAULT_UI_STATE.userState,
        password: {
          ...DEFAULT_UI_STATE.userState.password,
          passwordStrengthCheckResponse: MOCK_STRENGTH_CHECK_RESPONSE,
        },
      },
    });
  });
});
