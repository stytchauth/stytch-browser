import { B2BDeeplinkAction } from '../actions';
import { DEFAULT_UI_STATE } from '../states';
import { DeeplinkReducer } from './DeeplinkReducer';
import { MOCK_ERROR_RESPONSE } from '../../../mocks';

describe('DeeplinkReducer', () => {
  it('deeplink/parse sets expected state', () => {
    const action: B2BDeeplinkAction = { type: 'deeplink/parse', url: 'some-deeplink-url' };
    const result = DeeplinkReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      deeplinkState: {
        ...DEFAULT_UI_STATE.deeplinkState,
        isParsingDeeplink: true,
        deeplinksHandled: ['some-deeplink-url'],
      },
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: true,
      },
    });
  });
  it('deeplink/parse/ignored sets expected state', () => {
    const action: B2BDeeplinkAction = { type: 'deeplink/parse/ignored' };
    const result = DeeplinkReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
    });
  });
  it('deeplink/parse/error sets expected state', () => {
    const action: B2BDeeplinkAction = { type: 'deeplink/parse/error', error: MOCK_ERROR_RESPONSE };
    const result = DeeplinkReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: MOCK_ERROR_RESPONSE,
      },
    });
  });
  it('deeplink/parse/success sets expected state', () => {
    const action: B2BDeeplinkAction = { type: 'deeplink/parse/success' };
    const result = DeeplinkReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
    });
  });
});
