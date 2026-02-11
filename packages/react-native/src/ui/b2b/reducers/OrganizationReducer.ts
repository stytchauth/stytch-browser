import { AuthFlowType } from '@stytch/core/public';

import { B2BOrganizationAction } from '../actions';
import { UIState } from '../states';

export const OrganizationReducer = (state: UIState, action: B2BOrganizationAction): UIState => {
  switch (action.type) {
    case 'organization/getBySlug':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: true,
          error: undefined,
        },
      };
    case 'organization/getBySlug/success':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
        authenticationState: {
          ...state.authenticationState,
          authFlowType: AuthFlowType.Organization,
          organization: action.response.organization,
        },
      };
    case 'organization/getBySlug/error':
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
