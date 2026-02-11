import { B2BMagicLinksAction } from '../actions';
import { DEFAULT_UI_STATE } from '../states';
import { MagicLinksReducer } from './MagicLinksReducer';
import { MOCK_ERROR_RESPONSE } from '../../../mocks';
import { MOCK_AUTHED_WITH_METHOD_ID, MOCK_AUTHED_WITH_METHOD_ID_AND_DO } from '../mocks';
import { Screen } from '../screens';
import { B2BErrorType } from '../../shared/types';

describe('MagicLinksReducer', () => {
  it('magicLinks/authenticate/success sets expected state', () => {
    const action: B2BMagicLinksAction = {
      type: 'magicLinks/authenticate/success',
      response: MOCK_AUTHED_WITH_METHOD_ID,
    };
    const result = MagicLinksReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
    });
  });
  it('magicLinks/discovery/authenticate/success sets expected state', () => {
    const action: B2BMagicLinksAction = {
      type: 'magicLinks/discovery/authenticate/success',
      response: MOCK_AUTHED_WITH_METHOD_ID_AND_DO,
    };
    const result = MagicLinksReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
    });
  });
  it('magicLinks/email/discovery/send/success sets expected state', () => {
    const action: B2BMagicLinksAction = {
      type: 'magicLinks/email/discovery/send/success',
      response: MOCK_AUTHED_WITH_METHOD_ID_AND_DO,
    };
    const result = MagicLinksReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
      history: DEFAULT_UI_STATE.history.concat([DEFAULT_UI_STATE.screen]),
      screen: Screen.EmailConfirmation,
    });
  });
  it('magicLinks/email/loginOrSignup/success sets expected state', () => {
    const action: B2BMagicLinksAction = {
      type: 'magicLinks/email/loginOrSignup/success',
      response: MOCK_AUTHED_WITH_METHOD_ID_AND_DO,
    };
    const result = MagicLinksReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
      history: DEFAULT_UI_STATE.history.concat([DEFAULT_UI_STATE.screen]),
      screen: Screen.EmailConfirmation,
    });
  });
  it('magicLinks/authenticate/error sets expected state', () => {
    const action: B2BMagicLinksAction = { type: 'magicLinks/authenticate/error', error: MOCK_ERROR_RESPONSE };
    const result = MagicLinksReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screen: Screen.Error,
      history: [Screen.Main],
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: { internalError: B2BErrorType.EmailMagicLink },
      },
    });
  });
  it('magicLinks/discovery/authenticate/error sets expected state', () => {
    const action: B2BMagicLinksAction = { type: 'magicLinks/discovery/authenticate/error', error: MOCK_ERROR_RESPONSE };
    const result = MagicLinksReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screen: Screen.Error,
      history: [Screen.Main],
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: { internalError: B2BErrorType.DiscoveryEmailMagicLink },
      },
    });
  });
  it('magicLinks/email/loginOrSignup/error sets expected state', () => {
    const action: B2BMagicLinksAction = { type: 'magicLinks/email/loginOrSignup/error', error: MOCK_ERROR_RESPONSE };
    const result = MagicLinksReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: MOCK_ERROR_RESPONSE,
      },
    });
  });
  it('magicLinks/email/discovery/send/error sets expected state', () => {
    const action: B2BMagicLinksAction = { type: 'magicLinks/email/discovery/send/error', error: MOCK_ERROR_RESPONSE };
    const result = MagicLinksReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: MOCK_ERROR_RESPONSE,
      },
    });
  });
});
