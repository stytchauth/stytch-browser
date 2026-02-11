import { OTPAction } from '../actions';
import { DEFAULT_UI_STATE } from '../states';
import { Screen } from '../screens';
import { MOCK_AUTHENTICATE_RETURN_VALUE_WITH_METHOD_ID, MOCK_ERROR_RESPONSE } from '../../../mocks';
import { OTPReducer } from './OTPReducer';

describe('OTPReducer', () => {
  it('otp/authenticate sets expected state', () => {
    const action: OTPAction = { type: 'otp/authenticate' };
    const result = OTPReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: true,
      },
    });
  });
  it('otp/email/loginOrCreate sets expected state', () => {
    const action: OTPAction = { type: 'otp/email/loginOrCreate' };
    const result = OTPReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: true,
      },
    });
  });
  it('otp/sms/loginOrCreate sets expected state', () => {
    const action: OTPAction = { type: 'otp/sms/loginOrCreate' };
    const result = OTPReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: true,
      },
    });
  });
  it('otp/whatsapp/loginOrCreate sets expected state', () => {
    const action: OTPAction = { type: 'otp/whatsapp/loginOrCreate' };
    const result = OTPReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: true,
      },
    });
  });
  it('otp/email/loginOrCreate/success sets expected state', () => {
    const action: OTPAction = {
      type: 'otp/email/loginOrCreate/success',
      response: MOCK_AUTHENTICATE_RETURN_VALUE_WITH_METHOD_ID,
    };
    const result = OTPReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      history: [Screen.Main],
      screen: Screen.OTPConfirmation,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
      authenticationState: {
        ...DEFAULT_UI_STATE.authenticationState,
        methodId: MOCK_AUTHENTICATE_RETURN_VALUE_WITH_METHOD_ID.method_id,
        otpMethod: 'email',
      },
    });
  });
  it('otp/sms/loginOrCreate/success sets expected state', () => {
    const action: OTPAction = {
      type: 'otp/sms/loginOrCreate/success',
      response: MOCK_AUTHENTICATE_RETURN_VALUE_WITH_METHOD_ID,
    };
    const result = OTPReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      history: [Screen.Main],
      screen: Screen.OTPConfirmation,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
      authenticationState: {
        ...DEFAULT_UI_STATE.authenticationState,
        methodId: MOCK_AUTHENTICATE_RETURN_VALUE_WITH_METHOD_ID.method_id,
        otpMethod: 'sms',
      },
    });
  });
  it('otp/whatsapp/loginOrCreate/success sets expected state', () => {
    const action: OTPAction = {
      type: 'otp/whatsapp/loginOrCreate/success',
      response: MOCK_AUTHENTICATE_RETURN_VALUE_WITH_METHOD_ID,
    };
    const result = OTPReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      history: [Screen.Main],
      screen: Screen.OTPConfirmation,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
      authenticationState: {
        ...DEFAULT_UI_STATE.authenticationState,
        methodId: MOCK_AUTHENTICATE_RETURN_VALUE_WITH_METHOD_ID.method_id,
        otpMethod: 'whatsapp',
      },
    });
  });
  it('otp/authenticate/error sets expected state', () => {
    const action: OTPAction = { type: 'otp/authenticate/error', error: MOCK_ERROR_RESPONSE };
    const result = OTPReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        error: MOCK_ERROR_RESPONSE,
      },
    });
  });
  it('otp/email/loginOrCreate/error sets expected state', () => {
    const action: OTPAction = { type: 'otp/email/loginOrCreate/error', error: MOCK_ERROR_RESPONSE };
    const result = OTPReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        error: MOCK_ERROR_RESPONSE,
      },
    });
  });
  it('otp/sms/loginOrCreate/error sets expected state', () => {
    const action: OTPAction = { type: 'otp/sms/loginOrCreate/error', error: MOCK_ERROR_RESPONSE };
    const result = OTPReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        error: MOCK_ERROR_RESPONSE,
      },
    });
  });
  it('otp/whatsapp/loginOrCreate/error sets expected state', () => {
    const action: OTPAction = { type: 'otp/whatsapp/loginOrCreate/error', error: MOCK_ERROR_RESPONSE };
    const result = OTPReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        error: MOCK_ERROR_RESPONSE,
      },
    });
  });
  it('otp/authenticate/success sets expected state', () => {
    const action: OTPAction = {
      type: 'otp/authenticate/success',
      response: MOCK_AUTHENTICATE_RETURN_VALUE_WITH_METHOD_ID,
    };
    const result = OTPReducer(DEFAULT_UI_STATE, action);
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
