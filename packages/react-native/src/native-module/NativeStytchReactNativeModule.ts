import { TurboModule, TurboModuleRegistry } from 'react-native';
// We cant import types for request/response: https://github.com/facebook/react-native/issues/38769

type DeviceInfoType = {
  systemName: string;
  systemVersion: string;
  bundleId: string;
  deviceId: string;
  timezone: string;
};

type StytchReactNativeModuleConstants = {
  DEVICE_INFO: DeviceInfoType;
};

export interface Spec extends TurboModule {
  readonly getConstants: () => StytchReactNativeModuleConstants;

  // Biometrics
  getSensor(options: { allowDeviceCredentials: boolean }): Promise<{
    biometryType: 'TouchID' | 'FaceID' | 'Biometrics';
  }>;
  isKeystoreAvailable(): Promise<{
    isKeystoreAvailable: boolean;
  }>;
  createKeys(createKeysOptions: {
    allowFallbackToCleartext: boolean;
    promptMessage: string;
    cancelButtonText: string;
    allowDeviceCredentials: boolean;
  }): Promise<{
    publicKey: string;
    privateKey: string;
  }>;
  biometricKeysExist(): Promise<{
    keysExist: boolean;
  }>;
  deleteKeys(): Promise<{
    keysDeleted: boolean;
  }>;
  createSignature(createSignatureOptions: {
    payload: string;
    privateKey: string;
    biometricRegistrationId: string;
  }): Promise<{
    signature: string;
  }>;
  getBiometricKey(getBiometricKeyOptions: {
    promptMessage: string;
    cancelButtonText: string;
    allowDeviceCredentials: boolean;
    fallbackTitle: string;
  }): Promise<{
    publicKey: string;
    privateKey: string;
  }>;
  getBiometricRegistrationId(): Promise<{
    biometricRegistrationId: string;
  }>;

  // OAuth
  signInWithAppleStart(): Promise<{
    idToken: string;
    nonce: string;
    name:
      | {
          firstName: string;
          lastName: string;
        }
      | undefined;
  } | null>;
  googleOneTapStart(
    clientId: string,
    autoSelectEnabled: boolean,
  ): Promise<{
    idToken: string;
    nonce: string;
  }>;

  // ConsoleLogger
  consoleLog(message: string): void;

  // Misc
  resetSecureStorageOnFreshInstall(publicToken: string): void;
  disableUrlCache(): void;
  configureDfp(publicToken: string, dfppaDomain: string): void;
  getTelemetryId(): Promise<{
    telemetryId: string;
  }>;
  initializeRecaptcha(siteKey: string): Promise<{
    success: boolean;
  }>;
  executeRecaptcha(): Promise<{
    captchaToken: string;
  }>;
  migrateKeychainItems(): void;
  loadFontsForUI(): void;
  copyToClipboard(text: string): void;

  // Storage
  getData(key: string): Promise<string | null>;
  setData(key: string, value: string): Promise<boolean>;
  clearData(key: string): Promise<boolean>;
  didMigrate(): Promise<boolean>;
  migrate(publicToken: string): Promise<boolean>;

  // DeviceInfo
  getUserAgent(): Promise<{
    userAgent: string;
  }>;

  // PKCE
  generateCodeChallenge(): Promise<{
    code_challenge: string;
    code_verifier: string;
  }>;

  // Passkeys
  registerPasskey(options: { publicKeyCredentialOptions: string }): Promise<{
    publicKeyCredential: string;
  }>;
  authenticatePasskey(options: { publicKeyCredentialOptions: string }): Promise<{
    publicKeyCredential: string;
  }>;

  // SMS Autoretriever
  startRetriever(): Promise<string | undefined>;
}

export default TurboModuleRegistry.get<Spec>('StytchReactNativeModule');
