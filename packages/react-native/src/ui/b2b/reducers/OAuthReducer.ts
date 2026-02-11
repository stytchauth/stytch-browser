import { B2BOAuthAction } from '../actions';
import { UIState } from '../states';

export const OAuthReducer = (state: UIState, action: B2BOAuthAction): UIState => {
  switch (action.type) {
    case 'oauth/start':
    case 'oauth/authenticate':
    case 'oauth/discovery/authenticate':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: true,
          error: undefined,
        },
      };
    case 'oauth/start/success':
    case 'oauth/authenticate/success':
    case 'oauth/discovery/authenticate/success':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
          error: undefined,
        },
      };
    case 'oauth/start/error':
    case 'oauth/authenticate/error':
    case 'oauth/discovery/authenticate/error':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
          error: action.error,
        },
      };
  }
};
