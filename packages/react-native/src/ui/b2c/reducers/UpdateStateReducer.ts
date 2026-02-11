import { UpdateStateAction } from '../actions';
import { UIState } from '../states';

export const UpdateStateReducer = (state: UIState, action: UpdateStateAction): UIState => {
  switch (action.type) {
    case 'updateState/user/emailAddress':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          error: undefined,
        },
        userState: {
          ...state.userState,
          emailAddress: {
            emailAddress: action.emailAddress,
            isValid: action.isValid,
          },
        },
      };
    case 'updateState/user/phoneNumber':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          error: undefined,
        },
        userState: {
          ...state.userState,
          phoneNumber: {
            countryCode: action.countryCode,
            phoneNumber: action.phoneNumber,
            formattedPhoneNumber: action.formattedPhoneNumber,
          },
        },
      };
    case 'updateState/user/password':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          error: undefined,
        },
        userState: {
          ...state.userState,
          password: {
            ...state.userState.password,
            password: action.password,
          },
        },
      };
    case 'updateState/authentication/methodId':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          error: undefined,
        },
        authenticationState: {
          ...state.authenticationState,
          methodId: action.methodId,
        },
      };
    case 'updateState/authentication/token':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          error: undefined,
        },
        authenticationState: {
          ...state.authenticationState,
          token: action.token,
        },
      };
    case 'updateState/error/clear':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          error: undefined,
        },
      };
  }
};
