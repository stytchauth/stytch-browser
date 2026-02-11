import { B2BEmailOTPAction } from '../actions';
import { DEFAULT_UI_STATE } from '../states';
import { EmailOTPReducer } from './EmailOTPReducer';
import { MOCK_ERROR_RESPONSE } from '../../../mocks';
import { MOCK_AUTHED_WITH_METHOD_ID, MOCK_AUTHED_WITH_METHOD_ID_AND_DO } from '../mocks';
import { Screen } from '../screens';

describe('EmailOTPReducer', () => {
  it('emailOTP/authenticate/success sets expected state', () => {
    const action: B2BEmailOTPAction = {
      type: 'emailOTP/authenticate/success',
      response: MOCK_AUTHED_WITH_METHOD_ID,
    };
    const result = EmailOTPReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
    });
  });
  it('emailOTP/discovery/authenticate/success sets expected state', () => {
    const action: B2BEmailOTPAction = {
      type: 'emailOTP/discovery/authenticate/success',
      response: MOCK_AUTHED_WITH_METHOD_ID_AND_DO,
    };
    const result = EmailOTPReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
    });
  });
  it('emailOTP/email/discovery/send/success sets expected state', () => {
    const action: B2BEmailOTPAction = {
      type: 'emailOTP/email/discovery/send/success',
      response: MOCK_AUTHED_WITH_METHOD_ID_AND_DO,
    };
    const result = EmailOTPReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
      history: DEFAULT_UI_STATE.history.concat([DEFAULT_UI_STATE.screen]),
      screen: Screen.EmailOTPEntry,
    });
  });
  it('emailOTP/email/loginOrSignup/success sets expected state', () => {
    const action: B2BEmailOTPAction = {
      type: 'emailOTP/email/loginOrSignup/success',
      response: MOCK_AUTHED_WITH_METHOD_ID_AND_DO,
    };
    const result = EmailOTPReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
      history: DEFAULT_UI_STATE.history.concat([DEFAULT_UI_STATE.screen]),
      screen: Screen.EmailOTPEntry,
    });
  });
  it('emailOTP/authenticate/error sets expected state', () => {
    const action: B2BEmailOTPAction = { type: 'emailOTP/authenticate/error', error: MOCK_ERROR_RESPONSE };
    const result = EmailOTPReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: MOCK_ERROR_RESPONSE,
      },
    });
  });
  it('emailOTP/discovery/authenticate/error sets expected state', () => {
    const action: B2BEmailOTPAction = { type: 'emailOTP/discovery/authenticate/error', error: MOCK_ERROR_RESPONSE };
    const result = EmailOTPReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: MOCK_ERROR_RESPONSE,
      },
    });
  });
  it('emailOTP/email/loginOrSignup/error sets expected state', () => {
    const action: B2BEmailOTPAction = { type: 'emailOTP/email/loginOrSignup/error', error: MOCK_ERROR_RESPONSE };
    const result = EmailOTPReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: MOCK_ERROR_RESPONSE,
      },
    });
  });
  it('emailOTP/email/discovery/send/error sets expected state', () => {
    const action: B2BEmailOTPAction = { type: 'emailOTP/email/discovery/send/error', error: MOCK_ERROR_RESPONSE };
    const result = EmailOTPReducer(DEFAULT_UI_STATE, action);
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
