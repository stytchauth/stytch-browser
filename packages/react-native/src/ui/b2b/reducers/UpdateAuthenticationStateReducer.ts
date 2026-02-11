import { B2BUpdateAuthenticationStateAction } from '../actions';
import { UIState } from '../states';

export const UpdateAuthenticationStateReducer = (
  state: UIState,
  action: B2BUpdateAuthenticationStateAction,
): UIState => {
  switch (action.type) {
    case 'authentication/methodId':
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
    case 'authentication/token':
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
    case 'authentication/flowType':
      return {
        ...state,
        authenticationState: {
          ...state.authenticationState,
          authFlowType: action.authFlowType,
        },
      };
  }
};
