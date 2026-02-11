import { B2BDeeplinkAction } from '../actions';
import { UIState } from '../states';

export const DeeplinkReducer = (state: UIState, action: B2BDeeplinkAction): UIState => {
  switch (action.type) {
    case 'deeplink/handlerRegistered':
      return {
        ...state,
        deeplinkState: {
          ...state.deeplinkState,
          handlerRegistered: true,
        },
      };
    case 'deeplink/parse':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: true,
        },
        deeplinkState: {
          ...state.deeplinkState,
          isParsingDeeplink: true,
          deeplinksHandled: state.deeplinkState.deeplinksHandled.concat([action.url]),
        },
      };
    case 'deeplink/parse/ignored':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
        deeplinkState: {
          ...state.deeplinkState,
          isParsingDeeplink: false,
        },
      };
    case 'deeplink/parse/error':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
          error: action.error,
        },
        deeplinkState: {
          ...state.deeplinkState,
          isParsingDeeplink: false,
        },
      };
    case 'deeplink/parse/success':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
        deeplinkState: {
          ...state.deeplinkState,
          isParsingDeeplink: false,
        },
      };
  }
};
