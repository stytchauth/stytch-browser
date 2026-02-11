import { B2BPasswordAction } from '../actions';
import { DEFAULT_UI_STATE } from '../states';
import { PasswordStateReducer } from './PasswordStateReducer';
import { MOCK_ERROR_RESPONSE } from '../../../mocks';
import { MOCK_FULLY_AUTHED_RESPONSE, MOCK_MEMBER_NEEDS_MFA, MOCK_STRENGTH_CHECK_RESPONSE } from '../mocks';
import { Screen } from '../screens';

describe('PasswordStateReducer', () => {
  it('passwords/authenticate/success sets expected state', () => {
    const action: B2BPasswordAction = { type: 'passwords/authenticate/success', response: MOCK_MEMBER_NEEDS_MFA };
    const result = PasswordStateReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
    });
  });
  it('passwords/resetByEmail/success sets expected state', () => {
    const action: B2BPasswordAction = { type: 'passwords/resetByEmail/success', response: MOCK_MEMBER_NEEDS_MFA };
    const result = PasswordStateReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
    });
  });
  it('passwords/resetByEmailStart/success sets expected state', () => {
    const action: B2BPasswordAction = { type: 'passwords/resetByEmailStart/success', response: MOCK_MEMBER_NEEDS_MFA };
    const result = PasswordStateReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
    });
  });
  it('passwords/resetPassword/success sets expected state', () => {
    const action: B2BPasswordAction = { type: 'passwords/resetPassword/success' };
    const result = PasswordStateReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
    });
  });
  it('passwords/resetPassword sets expected state', () => {
    const action = {
      type: 'passwords/resetPassword',
      token: 'my-token',
      tokenType: 'discovery',
    } satisfies B2BPasswordAction;
    const result = PasswordStateReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      history: [Screen.Main],
      screen: Screen.PasswordResetForm,
      authenticationState: {
        ...DEFAULT_UI_STATE.authenticationState,
        token: action.token,
      },
    });
  });
  it('passwords/resetBySession/success sets expected state', () => {
    const action: B2BPasswordAction = {
      type: 'passwords/resetBySession/success',
      response: MOCK_FULLY_AUTHED_RESPONSE,
    };
    const result = PasswordStateReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
      history: DEFAULT_UI_STATE.history.concat([DEFAULT_UI_STATE.screen]),
      screen: Screen.Success,
    });
  });
  it('passwords/strengthCheck/success sets expected state', () => {
    const action: B2BPasswordAction = {
      type: 'passwords/strengthCheck/success',
      response: MOCK_STRENGTH_CHECK_RESPONSE,
    };
    const result = PasswordStateReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      memberState: {
        ...DEFAULT_UI_STATE.memberState,
        password: {
          ...DEFAULT_UI_STATE.memberState.password,
          passwordStrengthCheckResponse: action.response,
        },
      },
    });
  });
  it('passwords/strengthCheck/error sets expected state', () => {
    const action: B2BPasswordAction = { type: 'passwords/strengthCheck/error', error: MOCK_ERROR_RESPONSE };
    const result = PasswordStateReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: action.error,
      },
    });
  });
  it('passwords/authenticate/error sets expected state', () => {
    const action: B2BPasswordAction = { type: 'passwords/authenticate/error', error: MOCK_ERROR_RESPONSE };
    const result = PasswordStateReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: action.error,
      },
    });
  });
  it('passwords/resetByEmail/error sets expected state', () => {
    const action: B2BPasswordAction = { type: 'passwords/resetByEmail/error', error: MOCK_ERROR_RESPONSE };
    const result = PasswordStateReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: action.error,
      },
    });
  });
  it('passwords/resetByEmailStart/error sets expected state', () => {
    const action: B2BPasswordAction = { type: 'passwords/resetByEmailStart/error', error: MOCK_ERROR_RESPONSE };
    const result = PasswordStateReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: action.error,
      },
    });
  });
  it('passwords/resetBySession/error sets expected state', () => {
    const action: B2BPasswordAction = { type: 'passwords/resetBySession/error', error: MOCK_ERROR_RESPONSE };
    const result = PasswordStateReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: action.error,
      },
    });
  });
  it('passwords/resetPassword/error sets expected state', () => {
    const action: B2BPasswordAction = { type: 'passwords/resetPassword/error', error: MOCK_ERROR_RESPONSE };
    const result = PasswordStateReducer(DEFAULT_UI_STATE, action);
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
