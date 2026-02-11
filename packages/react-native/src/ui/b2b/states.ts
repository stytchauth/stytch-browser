import {
  B2BPasswordStrengthCheckResponse,
  B2BMFAProducts,
  PrimaryRequired,
  DiscoveredOrganization,
  AuthFlowType,
  OrganizationBySlugMatch,
  SSOActiveConnection,
} from '@stytch/core/public';
import { ErrorResponse, PasswordResetType } from '../shared/types';
import { Screen } from './screens';

export interface ScreenState {
  isSubmitting: boolean;
  error?: ErrorResponse;
}

export interface EmailAddressState {
  emailAddress?: string;
  isValid?: boolean;
  didFinish: boolean;
}

export interface PasswordState {
  password?: string;
  passwordStrengthCheckResponse?: B2BPasswordStrengthCheckResponse;
  resetType?: PasswordResetType;
}

export interface MemberState {
  emailAddress: EmailAddressState;
  password: PasswordState;
}

export interface AuthenticationState {
  otpMethod?: 'sms';
  authFlowType: AuthFlowType;
  methodId?: string;
  token?: string;
  tokenType?: string;
  organization: OrganizationBySlugMatch | null;
}

export type DiscoveryState = {
  email: string;
  discoveredOrganizations: DiscoveredOrganization[];
};

export interface MfaState {
  primaryInfo: {
    enrolledMfaMethods: B2BMFAProducts[];
    memberId: string;
    memberPhoneNumber: string | null;
    organizationId: string;
    organizationMfaOptionsSupported: B2BMFAProducts[];
    postAuthScreen: Screen;
  } | null;
  isEnrolling: boolean;
  smsOtp: {
    isSending: boolean;
    sendError: ErrorResponse | undefined;
    codeExpiration: Date | null;
    formattedDestination: string | null;
    enrolledNumber: {
      phoneNumber: string | undefined;
      countryCode: string;
    } | null;
  };
  totp: {
    isCreating: boolean;
    createError: ErrorResponse | undefined;
    enrollment: {
      secret: string;
      qrCode: string;
      recoveryCodes: string[];
      method: 'qr' | 'manual';
    } | null;
  };
}

export const DEFAULT_MFA_STATE = {
  primaryInfo: null,
  isEnrolling: false,
  smsOtp: {
    isSending: false,
    sendError: undefined,
    codeExpiration: null,
    formattedDestination: null,
    enrolledNumber: {
      phoneNumber: undefined,
      countryCode: '+1',
    },
  },
  totp: {
    isCreating: false,
    createError: undefined,
    enrollment: null,
  },
} as const satisfies MfaState;

type PrimaryAuthState = {
  primaryAuthMethods?: PrimaryRequired['allowed_auth_methods'];
  email?: string;
  emailVerified?: boolean;
};

type DeeplinkState = {
  handlerRegistered: boolean;
  isParsingDeeplink: boolean;
  deeplinksHandled: string[];
};

type SSODiscoveryState = {
  connections: SSOActiveConnection[];
};

export interface UIState {
  screen: Screen;
  history: Screen[];
  screenState: ScreenState;
  memberState: MemberState;
  discoveryState: DiscoveryState;
  authenticationState: AuthenticationState;
  mfaState: MfaState;
  primaryAuthState: PrimaryAuthState;
  deeplinkState: DeeplinkState;
  ssoDiscoveryState: SSODiscoveryState;
}

export const DEFAULT_UI_STATE: UIState = {
  history: [],
  screen: Screen.Main,
  screenState: {
    isSubmitting: false,
  },
  memberState: {
    emailAddress: {
      didFinish: false,
    },
    password: {},
  },
  discoveryState: {
    email: '',
    discoveredOrganizations: [],
  },
  authenticationState: {
    authFlowType: AuthFlowType.Organization,
    organization: null,
  },
  mfaState: DEFAULT_MFA_STATE,
  primaryAuthState: {},
  deeplinkState: {
    handlerRegistered: false,
    isParsingDeeplink: false,
    deeplinksHandled: [],
  },
  ssoDiscoveryState: {
    connections: [],
  },
};
