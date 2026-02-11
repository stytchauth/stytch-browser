export enum Platform {
  iOS,
  Android,
}

export type BiometryType = 'TouchID' | 'FaceID' | 'Biometrics';

export interface GetSensorResult {
  biometryType: BiometryType;
}

export interface IsKeystoreAvailableResult {
  isKeystoreAvailable: boolean;
}

export interface CreateKeysOptions {
  allowFallbackToCleartext: boolean;
  promptMessage: string;
  cancelButtonText: string;
  allowDeviceCredentials: boolean;
}

export interface CreateKeysResult {
  publicKey: string;
  privateKey: string;
}

export interface BiometricKeysExistResult {
  keysExist: boolean;
}

export interface DeleteKeysResult {
  keysDeleted: boolean;
}

export interface CreateSignatureOptions {
  payload: string;
  privateKey: string;
  biometricRegistrationId: string;
}

export interface CreateSignatureResult {
  signature: string;
}

export interface GetBiometricRegistrationIdResult {
  biometricRegistrationId: string;
}

export interface GetBiometricKeyOptions {
  promptMessage: string;
  cancelButtonText: string;
  allowDeviceCredentials: boolean;
  fallbackTitle: string;
}

export interface GetBiometricKeyResult {
  publicKey: string;
  privateKey: string;
}

export interface GoogleOneTapStartResponse {
  idToken: string;
  nonce: string;
}

export interface SignInWithAppleResponse {
  idToken: string;
  nonce: string;
  name:
    | {
        firstName: string;
        lastName: string;
      }
    | undefined;
}

export interface DeviceInfoResponse {
  systemName: string;
  systemVersion: string;
  platform: Platform;
  bundleId: string;
  deviceId: string;
  timezone: string;
}

export interface DeviceInfoUserAgentResponse {
  userAgent: string;
}

export interface PasskeysRegisterOptions {
  publicKeyCredentialOptions: string;
}

export interface PasskeysRegisterResponse {
  publicKeyCredential: string;
}

export interface PasskeysAuthenticateOptions {
  publicKeyCredentialOptions: string;
}

export interface PasskeysAuthenticateResponse {
  publicKeyCredential: string;
}

export interface GetTelemetryIdResponse {
  telemetryId: string;
}

export interface InitializeRecaptchaResponse {
  success: boolean;
}

export interface ExecuteRecaptchaResponse {
  captchaToken: string;
}

declare global {
  var __turboModuleProxy: unknown;
}
