import {
  MagicLinksAuthenticateResponse,
  MagicLinksLoginOrCreateResponse,
  OAuthAuthenticateResponse,
  OAuthStartResponse,
  OTPsAuthenticateResponse,
  OTPsLoginOrCreateResponse,
  PasswordAuthenticateResponse,
  PasswordCreateResponse,
  PasswordResetByEmailResponse,
  PasswordResetByEmailStartResponse,
  PasswordStrengthCheckResponse,
  StytchProjectConfigurationInput,
  TokenType,
} from '@stytch/core/public';

import { ErrorResponse, PasswordResetType } from '../shared/types';

export type UpdateStateAction =
  | { type: 'updateState/user/emailAddress'; emailAddress: string; isValid: boolean }
  | { type: 'updateState/user/phoneNumber'; countryCode: string; phoneNumber?: string; formattedPhoneNumber?: string }
  | { type: 'updateState/user/password'; password: string }
  | { type: 'updateState/authentication/methodId'; methodId: string }
  | { type: 'updateState/authentication/token'; token: string }
  | { type: 'updateState/error/clear' };

// User Search
export type UserSearchAction =
  | { type: 'userSearch' }
  | { type: 'userSearch/success'; result: 'new' | 'password' | 'passwordless' }
  | { type: 'userSearch/error'; error?: ErrorResponse };

// OAuth
export type OAuthAction =
  | { type: 'oauth/start' }
  | { type: 'oauth/start/success'; response: OAuthStartResponse }
  | { type: 'oauth/start/error'; error?: ErrorResponse }
  | { type: 'oauth/authenticate' }
  | { type: 'oauth/authenticate/success'; response: OAuthAuthenticateResponse<StytchProjectConfigurationInput> }
  | { type: 'oauth/authenticate/error'; error?: ErrorResponse };

// EML
export type EMLAction =
  | { type: 'eml/loginOrCreate' }
  | { type: 'eml/loginOrCreate/success'; response: MagicLinksLoginOrCreateResponse }
  | { type: 'eml/loginOrCreate/error'; error?: ErrorResponse }
  | { type: 'eml/authenticate' }
  | { type: 'eml/authenticate/success'; response: MagicLinksAuthenticateResponse<StytchProjectConfigurationInput> }
  | { type: 'eml/authenticate/error'; error?: ErrorResponse };

// OTP
export type OTPAction =
  | { type: 'otp/email/loginOrCreate' }
  | { type: 'otp/email/loginOrCreate/success'; response: OTPsLoginOrCreateResponse }
  | { type: 'otp/email/loginOrCreate/error'; error?: ErrorResponse }
  | { type: 'otp/sms/loginOrCreate' }
  | { type: 'otp/sms/loginOrCreate/success'; response: OTPsLoginOrCreateResponse }
  | { type: 'otp/sms/loginOrCreate/error'; error?: ErrorResponse }
  | { type: 'otp/whatsapp/loginOrCreate' }
  | { type: 'otp/whatsapp/loginOrCreate/success'; response: OTPsLoginOrCreateResponse }
  | { type: 'otp/whatsapp/loginOrCreate/error'; error?: ErrorResponse }
  | { type: 'otp/authenticate' }
  | { type: 'otp/authenticate/success'; response: OTPsAuthenticateResponse<StytchProjectConfigurationInput> }
  | { type: 'otp/authenticate/error'; error?: ErrorResponse };

// Passwords
export type PasswordAction =
  | { type: 'passwords/strengthCheck' }
  | { type: 'passwords/strengthCheck/success'; response: PasswordStrengthCheckResponse }
  | { type: 'passwords/strengthCheck/error'; error?: ErrorResponse }
  | { type: 'passwords/create' }
  | { type: 'passwords/create/success'; response: PasswordCreateResponse<StytchProjectConfigurationInput> }
  | { type: 'passwords/create/error'; error?: ErrorResponse }
  | { type: 'passwords/authenticate' }
  | { type: 'passwords/authenticate/success'; response: PasswordAuthenticateResponse<StytchProjectConfigurationInput> }
  | { type: 'passwords/authenticate/error'; error?: ErrorResponse }
  | { type: 'passwords/resetByEmailStart'; resetType: PasswordResetType }
  | { type: 'passwords/resetByEmailStart/success'; response: PasswordResetByEmailStartResponse }
  | { type: 'passwords/resetByEmailStart/error'; error?: ErrorResponse }
  | { type: 'passwords/resetByEmail' }
  | { type: 'passwords/resetByEmail/success'; response: PasswordResetByEmailResponse<StytchProjectConfigurationInput> }
  | { type: 'passwords/resetByEmail/error'; error?: ErrorResponse };

// Deeplinks
export type DeeplinkAction =
  | { type: 'deeplink/parse' }
  | { type: 'deeplink/parse/success'; tokenType: TokenType; token: string }
  | { type: 'deeplink/parse/error'; error?: ErrorResponse }
  | { type: 'deeplink/parse/ignored' };

// Navigation
export type NavigationAction = { type: 'navigate/goBack' };

export type B2CUIAction =
  | UpdateStateAction
  | UserSearchAction
  | OAuthAction
  | EMLAction
  | OTPAction
  | PasswordAction
  | DeeplinkAction
  | NavigationAction;
