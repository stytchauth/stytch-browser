import { EMLAction } from '../actions';
import { Screen } from '../screens';
import { UIState } from '../states';

export const EMLReducer = (state: UIState, action: EMLAction): UIState => {
  switch (action.type) {
    case 'eml/loginOrCreate':
    case 'eml/authenticate':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: true,
          error: undefined,
        },
      };
    case 'eml/loginOrCreate/success':
      return {
        ...state,
        history: state.history.concat([state.screen]),
        screen: Screen.EMLConfirmation,
        screenState: {
          isSubmitting: false,
        },
      };
    case 'eml/loginOrCreate/error':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
          error: action.error,
        },
      };
    case 'eml/authenticate/success':
      return {
        ...state,
        history: state.history.concat([state.screen]),
        screen: Screen.Success,
        screenState: {
          isSubmitting: false,
        },
      };
    case 'eml/authenticate/error':
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
