import { MOCK_ERROR_RESPONSE } from '../../../mocks';
import { B2BOrganizationAction } from '../actions';
import { MOCK_OAUTH_AUTH_RESPONSE, MOCK_ORGANIZATION } from '../mocks';
import { DEFAULT_UI_STATE } from '../states';
import { OrganizationReducer } from './OrganizationReducer';

describe('OrganizationReducer', () => {
  it('oauth/authenticate/success sets expected state', () => {
    const action: B2BOrganizationAction = {
      type: 'organization/getBySlug/success',
      response: MOCK_OAUTH_AUTH_RESPONSE,
    };
    const result = OrganizationReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
      },
      authenticationState: {
        ...DEFAULT_UI_STATE.authenticationState,
        organization: MOCK_ORGANIZATION,
      },
    });
  });
  it('oauth/authenticate/error sets expected state', () => {
    const action: B2BOrganizationAction = { type: 'organization/getBySlug/error', error: MOCK_ERROR_RESPONSE };
    const result = OrganizationReducer(DEFAULT_UI_STATE, action);
    expect(result).toMatchObject({
      ...DEFAULT_UI_STATE,
      screenState: {
        ...DEFAULT_UI_STATE.screenState,
        isSubmitting: false,
        error: action.error,
      },
    });
  });
});
