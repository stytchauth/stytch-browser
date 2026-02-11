import { UpdateStateAction } from '../actions';
import { DEFAULT_UI_STATE } from '../states';
import { UpdateStateReducer } from './UpdateStateReducer';

describe('UpdateStateReducer', () => {
  it('updateState/user/emailAddress sets expected state', () => {
    const action: UpdateStateAction = {
      type: 'updateState/user/emailAddress',
      emailAddress: 'my@email.com',
      isValid: true,
    };
    const result = UpdateStateReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      userState: {
        ...DEFAULT_UI_STATE.userState,
        emailAddress: {
          emailAddress: 'my@email.com',
          isValid: true,
        },
      },
    });
  });
  it('updateState/user/phoneNumber sets expected state', () => {
    const action: UpdateStateAction = {
      type: 'updateState/user/phoneNumber',
      countryCode: '44',
      phoneNumber: '1234567890',
    };
    const result = UpdateStateReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      userState: {
        ...DEFAULT_UI_STATE.userState,
        phoneNumber: {
          countryCode: '44',
          phoneNumber: '1234567890',
        },
      },
    });
  });
  it('updateState/user/password sets expected state', () => {
    const action: UpdateStateAction = {
      type: 'updateState/user/password',
      password: 'my cool password',
    };
    const result = UpdateStateReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      userState: {
        ...DEFAULT_UI_STATE.userState,
        password: {
          ...DEFAULT_UI_STATE.userState.password,
          password: 'my cool password',
        },
      },
    });
  });
  it('updateState/authentication/methodId sets expected state', () => {
    const action: UpdateStateAction = { type: 'updateState/authentication/methodId', methodId: 'method-id' };
    const result = UpdateStateReducer(DEFAULT_UI_STATE, action);
    expect(result.authenticationState.methodId).toEqual('method-id');
  });
  it('updateState/authentication/token sets expected state', () => {
    const action: UpdateStateAction = { type: 'updateState/authentication/token', token: 'token' };
    const result = UpdateStateReducer(DEFAULT_UI_STATE, action);
    expect(result.authenticationState.token).toEqual('token');
  });
  it('updateState/error/clear clears the error', () => {
    const action: UpdateStateAction = { type: 'updateState/error/clear' };
    const result = UpdateStateReducer(
      {
        ...DEFAULT_UI_STATE,
        screenState: {
          ...DEFAULT_UI_STATE.screenState,
          error: { internalError: 'something went wrong' },
        },
      },
      action,
    );
    expect(result.screenState.error).toBeUndefined();
  });
});
