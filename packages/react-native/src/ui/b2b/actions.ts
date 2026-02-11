import { StringLiteralFromEnum } from '@stytch/core';
import {
  AuthFlowType,
  B2BAuthenticateResponse,
  B2BAuthenticateResponseWithMFA,
  B2BDiscoveryIntermediateSessionsExchangeResponse,
  B2BDiscoveryOrganizationsCreateResponse,
  B2BDiscoveryOTPEmailAuthenticateResponse,
  B2BDiscoveryOTPEmailSendResponse,
  B2BMagicLinkLoginOrSignupResponse,
  B2BMagicLinksAuthenticateResponse,
  B2BMagicLinksDiscoveryAuthenticateResponse,
  B2BMagicLinksEmailDiscoverySendResponse,
  B2BMFAProducts,
  B2BOAuthAuthenticateResponse,
  B2BOAuthDiscoveryAuthenticateResponse,
  B2BOrganizationsGetBySlugResponse,
  B2BOTPsEmailAuthenticateResponse,
  B2BOTPsEmailLoginOrSignupResponse,
  B2BPasswordAuthenticateResponse,
  B2BPasswordDiscoveryAuthenticateResponse,
  B2BPasswordDiscoveryResetByEmailResponse,
  B2BPasswordResetByEmailResponse,
  B2BPasswordResetByEmailStartResponse,
  B2BPasswordResetBySessionResponse,
  B2BPasswordStrengthCheckResponse,
  B2BSMSSendResponse,
  B2BSSODiscoverConnectionsResponse,
  B2BTOTPCreateResponse,
  DiscoveredOrganization,
  SSOAuthenticateResponse,
} from '@stytch/core/public';

import { ErrorResponse } from '../shared/types';
import { Screen } from './screens';

export type B2BUpdateMemberStateAction =
  | { type: 'member/emailAddress'; emailAddress: string; isValid: boolean }
  | { type: 'member/emailAddress/didFinish' }
  | { type: 'member/phoneNumber'; countryCode: string; phoneNumber?: string }
  | { type: 'member/password'; password: string };

export type B2BUpdateDiscoveryStateAction =
  | { type: 'discovery/setDiscoveredOrganizations'; email: string; discoveredOrganizations: DiscoveredOrganization[] }
  | { type: 'discovery/selectDiscoveredOrganization'; organization: DiscoveredOrganization }
  | { type: 'discovery/organizations/create' }
  | { type: 'discovery/organizations/create/success'; response: B2BDiscoveryOrganizationsCreateResponse }
  | { type: 'discovery/organizations/create/error'; error?: ErrorResponse }
  | { type: 'discovery/intermediateSessions/exchange' }
  | {
      type: 'discovery/intermediateSessions/exchange/success';
      response: B2BDiscoveryIntermediateSessionsExchangeResponse;
    }
  | { type: 'discovery/intermediateSessions/exchange/error'; error?: ErrorResponse };

export type B2BUpdateAuthenticationStateAction =
  | { type: 'authentication/flowType'; authFlowType: AuthFlowType }
  | { type: 'authentication/methodId'; methodId: string }
  | { type: 'authentication/token'; token: string };

export type B2BUpdateScreenStateAction = { type: 'error/clear' };

export type B2BNavigationAction =
  | { type: 'navigate/goBack' }
  | { type: 'navigate/to'; screen: Screen; error?: ErrorResponse }
  | { type: 'navigate/reset' };

export type B2BDeeplinkAction =
  | { type: 'deeplink/handlerRegistered' }
  | { type: 'deeplink/parse'; url: string }
  | { type: 'deeplink/parse/success' }
  | { type: 'deeplink/parse/error'; error?: ErrorResponse }
  | { type: 'deeplink/parse/ignored' };

export type B2BMFAAction =
  | { type: 'mfa/primaryAuthenticate' }
  | {
      type: 'mfa/primaryAuthenticate/success';
      response: B2BAuthenticateResponseWithMFA;
      includedMfaMethods: readonly StringLiteralFromEnum<B2BMFAProducts>[] | undefined;
      resetTokenType?: string;
    }
  | { type: 'mfa/recoveryCode/authenticate' }
  | { type: 'mfa/recoveryCode/authenticate/success'; response: B2BAuthenticateResponse }
  | { type: 'mfa/recoveryCode/authenticate/error'; error?: ErrorResponse }
  | { type: 'mfa/recoveryCode/download/error'; error?: ErrorResponse }
  | { type: 'mfa/recoveryCode/navigateToEntry' }
  | { type: 'mfa/recoveryCode/saveAcknowledge' }
  | { type: 'mfa/smsOtp/authenticate' }
  | { type: 'mfa/smsOtp/authenticateSuccess'; response: B2BAuthenticateResponse }
  | { type: 'mfa/smsOtp/authenticateError'; error?: ErrorResponse }
  | { type: 'mfa/smsOtp/navigateToEntry' }
  | { type: 'mfa/smsOtp/send' }
  | {
      type: 'mfa/smsOtp/send/success';
      response: B2BSMSSendResponse;
      phoneNumber: string;
      countryCode: string;
      formattedPhoneNumber: string;
    }
  | { type: 'mfa/smsOtp/send/error'; error?: ErrorResponse }
  | { type: 'mfa/startEnrollment'; method: B2BMFAProducts }
  | { type: 'mfa/totp/authenticate' }
  | { type: 'mfa/totp/authenticate/success'; response: B2BAuthenticateResponse }
  | { type: 'mfa/totp/authenticate/error'; error?: ErrorResponse }
  | { type: 'mfa/totp/create' }
  | { type: 'mfa/totp/create/success'; response: B2BTOTPCreateResponse; memberId: string; organizationId: string }
  | { type: 'mfa/totp/create/error'; error?: ErrorResponse }
  | { type: 'mfa/totp/navigateToEntry' }
  | { type: 'mfa/totp/showCode'; method?: 'qr' | 'manual' };

export type B2BPasswordAction =
  | { type: 'passwords/strengthCheck' }
  | { type: 'passwords/strengthCheck/error'; error?: ErrorResponse }
  | { type: 'passwords/strengthCheck/success'; response: B2BPasswordStrengthCheckResponse }
  | { type: 'passwords/authenticate/start' }
  | { type: 'passwords/authenticate' }
  | { type: 'passwords/authenticate/error'; error?: ErrorResponse }
  | { type: 'passwords/authenticate/success'; response: B2BPasswordAuthenticateResponse }
  | { type: 'passwords/resetByEmailStart' }
  | { type: 'passwords/resetByEmailStart/error'; error?: ErrorResponse }
  | { type: 'passwords/resetByEmailStart/success'; response?: B2BPasswordResetByEmailStartResponse }
  | { type: 'passwords/resetByEmail' }
  | { type: 'passwords/resetByEmail/error'; error?: ErrorResponse }
  | { type: 'passwords/resetByEmail/success'; response: B2BPasswordResetByEmailResponse }
  | { type: 'passwords/resetBySession' }
  | { type: 'passwords/resetBySession/error'; error?: ErrorResponse }
  | { type: 'passwords/resetBySession/success'; response: B2BPasswordResetBySessionResponse }
  | { type: 'passwords/resetPassword'; token: string; tokenType: string }
  | { type: 'passwords/resetPassword/success' }
  | { type: 'passwords/resetPassword/error'; error?: ErrorResponse }
  | { type: 'passwords/discovery/resetByEmailStart' }
  | { type: 'passwords/discovery/resetByEmailStart/error'; error?: ErrorResponse }
  | { type: 'passwords/discovery/resetByEmailStart/success'; response?: B2BPasswordResetByEmailStartResponse }
  | { type: 'passwords/discovery/resetByEmail' }
  | { type: 'passwords/discovery/resetByEmail/error'; error?: ErrorResponse }
  | { type: 'passwords/discovery/resetByEmail/success'; response?: B2BPasswordDiscoveryResetByEmailResponse }
  | { type: 'passwords/discovery/authenticate' }
  | { type: 'passwords/discovery/authenticate/error'; error?: ErrorResponse }
  | { type: 'passwords/discovery/authenticate/success'; response?: B2BPasswordDiscoveryAuthenticateResponse };

export type B2BMagicLinksAction =
  | { type: 'magicLinks/authenticate' }
  | { type: 'magicLinks/authenticate/success'; response: B2BMagicLinksAuthenticateResponse }
  | { type: 'magicLinks/authenticate/error'; error?: ErrorResponse }
  | { type: 'magicLinks/discovery/authenticate' }
  | { type: 'magicLinks/discovery/authenticate/success'; response: B2BMagicLinksDiscoveryAuthenticateResponse }
  | { type: 'magicLinks/discovery/authenticate/error'; error?: ErrorResponse }
  | { type: 'magicLinks/email/loginOrSignup' }
  | { type: 'magicLinks/email/loginOrSignup/success'; response: B2BMagicLinkLoginOrSignupResponse }
  | { type: 'magicLinks/email/loginOrSignup/error'; error?: ErrorResponse }
  | { type: 'magicLinks/email/discovery/send' }
  | { type: 'magicLinks/email/discovery/send/success'; response: B2BMagicLinksEmailDiscoverySendResponse }
  | { type: 'magicLinks/email/discovery/send/error'; error?: ErrorResponse };

export type B2BEmailOTPAction =
  | { type: 'emailOTP/authenticate' }
  | { type: 'emailOTP/authenticate/success'; response: B2BOTPsEmailAuthenticateResponse }
  | { type: 'emailOTP/authenticate/error'; error?: ErrorResponse }
  | { type: 'emailOTP/discovery/authenticate' }
  | { type: 'emailOTP/discovery/authenticate/success'; response: B2BDiscoveryOTPEmailAuthenticateResponse }
  | { type: 'emailOTP/discovery/authenticate/error'; error?: ErrorResponse }
  | { type: 'emailOTP/email/loginOrSignup' }
  | { type: 'emailOTP/email/loginOrSignup/success'; response: B2BOTPsEmailLoginOrSignupResponse }
  | { type: 'emailOTP/email/loginOrSignup/error'; error?: ErrorResponse }
  | { type: 'emailOTP/email/discovery/send' }
  | { type: 'emailOTP/email/discovery/send/success'; response: B2BDiscoveryOTPEmailSendResponse }
  | { type: 'emailOTP/email/discovery/send/error'; error?: ErrorResponse };

export type B2BOAuthAction =
  | { type: 'oauth/authenticate' }
  | { type: 'oauth/authenticate/success'; response: B2BOAuthAuthenticateResponse }
  | { type: 'oauth/authenticate/error'; error?: ErrorResponse }
  | { type: 'oauth/discovery/authenticate' }
  | { type: 'oauth/discovery/authenticate/success'; response: B2BOAuthDiscoveryAuthenticateResponse }
  | { type: 'oauth/discovery/authenticate/error'; error?: ErrorResponse }
  | { type: 'oauth/start' }
  | { type: 'oauth/start/success' }
  | { type: 'oauth/start/error'; error?: ErrorResponse };

export type B2BSSOAction =
  | { type: 'sso/start' }
  | { type: 'sso/start/success' }
  | { type: 'sso/start/error'; error?: ErrorResponse }
  | { type: 'sso/authenticate' }
  | { type: 'sso/authenticate/success'; response: SSOAuthenticateResponse }
  | { type: 'sso/authenticate/error'; error?: ErrorResponse }
  | { type: 'sso/discovery' }
  | { type: 'sso/discovery/success'; response: B2BSSODiscoverConnectionsResponse }
  | { type: 'sso/discovery/error'; error?: ErrorResponse };

export type B2BOrganizationAction =
  | { type: 'organization/getBySlug' }
  | { type: 'organization/getBySlug/success'; response: B2BOrganizationsGetBySlugResponse }
  | { type: 'organization/getBySlug/error'; error?: ErrorResponse };

export type B2BUIAction =
  | B2BUpdateMemberStateAction
  | B2BUpdateDiscoveryStateAction
  | B2BUpdateAuthenticationStateAction
  | B2BUpdateScreenStateAction
  | B2BNavigationAction
  | B2BDeeplinkAction
  | B2BMFAAction
  | B2BPasswordAction
  | B2BMagicLinksAction
  | B2BOAuthAction
  | B2BSSOAction
  | B2BOrganizationAction
  | B2BEmailOTPAction;
