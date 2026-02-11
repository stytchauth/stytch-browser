import { B2BUpdateMemberStateAction } from '../actions';
import { UIState } from '../states';

export const UpdateMemberStateReducer = (state: UIState, action: B2BUpdateMemberStateAction): UIState => {
  switch (action.type) {
    case 'member/emailAddress':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          error: undefined,
        },
        memberState: {
          ...state.memberState,
          emailAddress: {
            ...state.memberState.emailAddress,
            emailAddress: action.emailAddress,
            isValid: action.isValid,
          },
        },
      };
    case 'member/emailAddress/didFinish':
      return {
        ...state,
        memberState: {
          ...state.memberState,
          emailAddress: {
            ...state.memberState.emailAddress,
            didFinish: true,
          },
        },
      };
    case 'member/phoneNumber':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          error: undefined,
        },
        mfaState: {
          ...state.mfaState,
          smsOtp: {
            ...state.mfaState.smsOtp,
            enrolledNumber: {
              countryCode: action.countryCode,
              phoneNumber: action.phoneNumber,
            },
          },
        },
      };
    case 'member/password':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          error: undefined,
        },
        memberState: {
          ...state.memberState,
          password: {
            ...state.memberState.password,
            password: action.password,
          },
        },
      };
  }
};
