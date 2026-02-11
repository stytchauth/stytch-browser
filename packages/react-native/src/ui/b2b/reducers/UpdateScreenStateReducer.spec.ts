import { B2BUpdateScreenStateAction } from '../actions';
import { DEFAULT_UI_STATE } from '../states';
import { UpdateScreenStateReducer } from './UpdateScreenStateReducer';

describe('UpdateScreenStateReducer', () => {
  it('error/clear clears the error', () => {
    const action: B2BUpdateScreenStateAction = { type: 'error/clear' };
    const result = UpdateScreenStateReducer(
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
