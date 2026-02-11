import { B2BUpdateMemberStateAction } from '../actions';
import { DEFAULT_UI_STATE } from '../states';
import { UpdateMemberStateReducer } from './UpdateMemberStateReducer';

describe('UpdateMemberStateReducer', () => {
  it('member/emailAddress sets expected state', () => {
    const action: B2BUpdateMemberStateAction = {
      type: 'member/emailAddress',
      emailAddress: 'my@email.com',
      isValid: true,
    };
    const result = UpdateMemberStateReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      memberState: {
        ...DEFAULT_UI_STATE.memberState,
        emailAddress: {
          emailAddress: 'my@email.com',
          isValid: true,
        },
      },
    });
  });
  it('member/phoneNumber sets expected state', () => {
    const action: B2BUpdateMemberStateAction = {
      type: 'member/phoneNumber',
      countryCode: '44',
      phoneNumber: '1234567890',
    };
    const result = UpdateMemberStateReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      mfaState: {
        ...DEFAULT_UI_STATE.mfaState,
        smsOtp: {
          ...DEFAULT_UI_STATE.mfaState.smsOtp,
          enrolledNumber: {
            countryCode: '44',
            phoneNumber: '1234567890',
          },
        },
      },
    });
  });
  it('member/password sets expected state', () => {
    const action: B2BUpdateMemberStateAction = {
      type: 'member/password',
      password: 'my cool password',
    };
    const result = UpdateMemberStateReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      memberState: {
        ...DEFAULT_UI_STATE.memberState,
        password: {
          ...DEFAULT_UI_STATE.memberState.password,
          password: 'my cool password',
        },
      },
    });
  });
});
