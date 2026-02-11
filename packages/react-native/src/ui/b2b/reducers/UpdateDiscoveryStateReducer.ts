import { AuthFlowType } from '@stytch/core/public';

import { B2BErrorType } from '../../shared/types';
import { B2BUpdateDiscoveryStateAction } from '../actions';
import { Screen } from '../screens';
import { UIState } from '../states';

export const UpdateDiscoveryStateReducer = (state: UIState, action: B2BUpdateDiscoveryStateAction): UIState => {
  switch (action.type) {
    case 'discovery/organizations/create':
    case 'discovery/intermediateSessions/exchange':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: true,
          error: undefined,
        },
      };
    case 'discovery/setDiscoveredOrganizations':
      return {
        ...state,
        discoveryState: {
          ...state.discoveryState,
          email: action.email,
          discoveredOrganizations: action.discoveredOrganizations,
        },
        screen: Screen.Discovery,
      };
    case 'discovery/selectDiscoveredOrganization': {
      const { membership, organization, primary_required } = action.organization;
      const email = membership.member?.email_address ?? state.memberState.emailAddress.emailAddress;
      const primaryAuthMethods = primary_required ? primary_required.allowed_auth_methods : undefined;
      const newBaseState: UIState = {
        ...state,
        authenticationState: {
          ...state.authenticationState,
          authFlowType: AuthFlowType.Organization,
          organization: organization,
        },
        primaryAuthState: {
          primaryAuthMethods: primaryAuthMethods,
          email: email,
          emailVerified: membership.member?.email_address_verified,
        },
        screen: Screen.Main,
      };

      if (primaryAuthMethods?.length === 0) {
        return {
          ...newBaseState,
          screen: Screen.Error,
          history: state.history.concat([state.screen]),
          screenState: {
            ...state.screenState,
            error: { internalError: B2BErrorType.CannotJoinOrgDueToAuthPolicy },
          },
        };
      }
      return newBaseState;
    }
    case 'discovery/intermediateSessions/exchange/success':
    case 'discovery/organizations/create/success':
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
        },
      };
    case 'discovery/intermediateSessions/exchange/error':
    case 'discovery/organizations/create/error': {
      const error =
        action.error?.apiError?.error_type == 'action_not_allowed_email_domain_is_claimed'
          ? { ...action.error, internalError: B2BErrorType.OrganizationDiscoveryClaimedDomain }
          : action.error;
      return {
        ...state,
        screenState: {
          ...state.screenState,
          isSubmitting: false,
          error: error,
        },
        history: state.history.concat([state.screen]),
        screen: Screen.Error,
      };
    }
  }
};
