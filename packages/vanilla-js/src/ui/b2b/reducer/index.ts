import {
  AuthFlowType,
  DiscoveredOrganization,
  OrganizationBySlugMatch,
  SSOActiveConnection,
} from '@stytch/core/public';
import { AppState } from '../types/AppState';
import { ErrorType } from '../types/ErrorType';
import { AppScreens } from '../types/AppScreens';
import { MfaAction, mfaReducer } from './mfa';
import { pushHistory, replaceHistory } from './navigation';

export type Action =
  | { type: 'transition'; screen: AppScreens; history?: 'push' | 'reset' }
  | { type: 'navigate_back' }
  | { type: 'set_error_message_and_transition'; errorType: ErrorType; canGoBack: boolean }
  | { type: 'set_user_supplied_email'; email: string }
  | { type: 'set_organization'; organization: OrganizationBySlugMatch }
  | { type: 'set_password_state'; email: string }
  | {
      type: 'set_discovery_state';
      email: string;
      discoveredOrganizations: DiscoveredOrganization[];
    }
  | { type: 'select_discovered_organization'; discoveredOrganization: DiscoveredOrganization }
  | { type: 'send_email_otp'; codeExpiration: Date }
  | { type: 'set_sso_discovery_state'; connections: SSOActiveConnection[] }
  | { type: 'use_password_auth'; email: string }
  | MfaAction;

export const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'transition':
      return action.history === 'push' ? pushHistory(action.screen, state) : replaceHistory(action.screen, state);

    case 'navigate_back': {
      const screen = state.screenHistory.at(-1);

      if (!screen) {
        return state;
      }

      const screenHistory = state.screenHistory.slice(0, -1);

      return {
        ...state,
        screen,
        screenHistory,
      };
    }
    case 'set_error_message_and_transition':
      return {
        ...state,
        screen: AppScreens.Error,
        error: {
          type: action.errorType,
          canGoBack: action.canGoBack,
        },
      };
    case 'set_user_supplied_email': {
      return {
        ...state,
        formState: {
          ...state.formState,
          emailState: { userSuppliedEmail: action.email },
          passwordState: { email: action.email },
        },
      };
    }
    case 'set_organization': {
      return {
        ...state,
        flowState: {
          type: AuthFlowType.Organization,
          organization: action.organization,
        },
      };
    }
    case 'set_discovery_state': {
      const discoveredOrganizations = action.discoveredOrganizations;

      return {
        ...state,
        formState: {
          ...state.formState,
          discoveryState: {
            email: action.email,
            discoveredOrganizations,
          },
        },
        screen: AppScreens.Discovery,
      };
    }
    case 'select_discovered_organization': {
      const { membership, organization, primary_required } = action.discoveredOrganization;
      const email = membership.member?.email_address ?? state.formState.discoveryState.email;

      const primaryAuthMethods = primary_required ? primary_required.allowed_auth_methods : undefined;

      const newBaseState = {
        ...state,
        flowState: {
          type: AuthFlowType.Organization,
          organization,
        },
        formState: {
          ...state.formState,
          passwordState: { email },
        },
        primary: {
          primaryAuthMethods,
          email,
          emailVerified: membership.member?.email_address_verified,
        },
        screen: AppScreens.Main,
      };

      if (primaryAuthMethods?.length === 0) {
        return {
          ...newBaseState,
          screen: AppScreens.Error,
          error: {
            type: ErrorType.CannotJoinOrgDueToAuthPolicy,
            canGoBack: true,
          },
        };
      }

      return newBaseState;
    }
    case 'set_password_state': {
      return {
        ...state,
        formState: {
          ...state.formState,
          passwordState: { email: action.email },
        },
      };
    }
    case 'send_email_otp': {
      return pushHistory(AppScreens.EmailOTPEntry, {
        ...state,
        formState: {
          ...state.formState,
          otpState: { codeExpiration: action.codeExpiration },
        },
      });
    }
    case 'set_sso_discovery_state': {
      const connections = action.connections;

      if (!connections.length) {
        return pushHistory(AppScreens.SSODiscoveryFallback, state);
      }

      return pushHistory(AppScreens.SSODiscoveryMenu, {
        ...state,
        formState: {
          ...state.formState,
          ssoDiscoveryState: { connections: action.connections },
        },
      });
    }
    case 'use_password_auth': {
      return pushHistory(AppScreens.PasswordAuthenticate, {
        ...state,
        formState: { ...state.formState, passwordState: { email: action.email } },
      });
    }

    default:
      return mfaReducer(state, action);
  }
};
