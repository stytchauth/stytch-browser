import { B2BUpdateScreenStateAction } from '../actions';
import { UIState } from '../states';

export const UpdateScreenStateReducer = (state: UIState, action: B2BUpdateScreenStateAction): UIState => {
  switch (action.type) {
    case 'error/clear':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          error: undefined,
        },
      };
  }
};
