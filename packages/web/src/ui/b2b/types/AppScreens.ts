import { Values } from '../../../utils/types';

/* eslint-disable lingui/no-unlocalized-strings */

export const AppScreens = {
  Main: 'Main',
  EmailConfirmation: 'Email Confirmation',
  LoggedIn: 'Logged In',
  Discovery: 'Discovery',
  Error: 'Error',
  PasswordEmailForm: 'Password Email',
  PasswordAuthenticate: 'Password Authenticate',
  PasswordResetForm: 'Password Reset Form',
  PasswordResetVerifyConfirmation: 'Password Reset Verify Confirmation',
  PasswordForgotForm: 'Password Forgot Form',
  PasswordSetNewConfirmation: 'Password Set New Confirmation',
  MFAEnrollmentSelection: 'MFA Enrollment Selection',
  RecoveryCodeEntry: 'Recovery Code Entry',
  RecoveryCodeSave: 'Recovery Code Save',
  SMSOTPEnrollment: 'SMS OTP Enrollment',
  SMSOTPEntry: 'SMS OTP Entry',
  TOTPEnrollmentManual: 'TOTP Enrollment Manual',
  TOTPEnrollmentQRCode: 'TOTP Enrollment QR Code',
  TOTPEntry: 'TOTP Entry',
  EmailMethodSelection: 'Email Method Selection',
  EmailOTPEntry: 'Email OTP Entry',
  SSODiscoveryEmail: 'SSO Discovery Email',
  SSODiscoveryFallback: 'SSO Discovery Fallback',
  SSODiscoveryMenu: 'SSO Discovery Menu',
} as const;
export type AppScreens = Values<typeof AppScreens>;

export const MainScreenComponent = {
  EmailForm: 'EmailForm',
  EmailDiscoveryForm: 'EmailDiscoveryForm',
  OAuthButtons: 'OAuthButtons',
  SSOButtons: 'SSOButtons',
  PasswordsEmailForm: 'PasswordsEmailForm',
  PasswordEmailCombined: 'PasswordEmailCombined',
  PasswordEmailCombinedDiscovery: 'PasswordEmailCombinedDiscovery',
  Divider: 'Divider',
} as const;
export type MainScreenComponent = Values<typeof MainScreenComponent>;

export type ButtonComponent = typeof MainScreenComponent.SSOButtons | typeof MainScreenComponent.OAuthButtons;
