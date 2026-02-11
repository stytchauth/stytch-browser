import { B2BErrorType } from '../../shared/types';
import { B2BMagicLinksAction } from '../actions';
import { Screen } from '../screens';
import { UIState } from '../states';

export const MagicLinksReducer = (state: UIState, action: B2BMagicLinksAction): UIState => {
  switch (action.type) {
    case 'magicLinks/authenticate':
    case 'magicLinks/discovery/authenticate':
    case 'magicLinks/email/loginOrSignup':
    case 'magicLinks/email/discovery/send':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: true,
          error: undefined,
        },
      };
    case 'magicLinks/authenticate/success':
    case 'magicLinks/discovery/authenticate/success':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
          error: undefined,
        },
      };
    case 'magicLinks/email/discovery/send/success':
    case 'magicLinks/email/loginOrSignup/success':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
        history: state.history.concat([state.screen]),
        screen: Screen.EmailConfirmation,
      };
    case 'magicLinks/authenticate/error':
      return {
        ...state,
        screen: Screen.Error,
        history: state.history.concat([state.screen]),
        screenState: {
          ...state.screenState,
          isSubmitting: false,
          error: { ...action.error, internalError: B2BErrorType.EmailMagicLink },
        },
      };
    case 'magicLinks/discovery/authenticate/error':
      return {
        ...state,
        screen: Screen.Error,
        history: state.history.concat([state.screen]),
        screenState: {
          ...state.screenState,
          isSubmitting: false,
          error: { ...action.error, internalError: B2BErrorType.DiscoveryEmailMagicLink },
        },
      };
    case 'magicLinks/email/loginOrSignup/error':
    case 'magicLinks/email/discovery/send/error':
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
