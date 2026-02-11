import { StringLiteralFromEnum } from '@stytch/core';
import {
  AuthFlowType,
  DiscoveredOrganization,
  OrganizationBySlugMatch,
  PrimaryRequired,
  SSOActiveConnection,
} from '@stytch/core/public';

import { MfaState } from '../MfaState';
import { AppScreens } from './AppScreens';
import { ErrorType } from './ErrorType';

export type EmailState = {
  userSuppliedEmail: string;
};

export type DiscoveryState = {
  email: string;
  discoveredOrganizations: DiscoveredOrganization[];
};

export type PasswordState = {
  email: string;
};

export type OtpState = {
  codeExpiration: Date | null;
};

export type SSODiscoveryState = {
  connections: SSOActiveConnection[];
};

export type FormState = {
  emailState: EmailState;
  discoveryState: DiscoveryState;
  passwordState: PasswordState;
  otpState: OtpState;
  ssoDiscoveryState: SSODiscoveryState;
};

export type FlowState = { type: StringLiteralFromEnum<AuthFlowType>; organization: null | OrganizationBySlugMatch };
type PrimaryAuthState = {
  primaryAuthMethods?: PrimaryRequired['allowed_auth_methods'];
  email?: string;
  emailVerified?: boolean;
};

export type AppState = {
  screen: AppScreens;
  screenHistory: AppScreens[];
  formState: FormState;
  flowState: FlowState;
  mfa: MfaState;
  primary: PrimaryAuthState;
  error: { type: ErrorType; canGoBack: boolean };
};
