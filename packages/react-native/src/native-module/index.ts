import { ProofkeyPair } from '@stytch/core';
import { NativeModules } from 'react-native';

import TurboModule from './NativeStytchReactNativeModule';
import {
  BiometricKeysExistResult,
  CreateKeysOptions,
  CreateKeysResult,
  CreateSignatureOptions,
  CreateSignatureResult,
  DeleteKeysResult,
  DeviceInfoResponse,
  DeviceInfoUserAgentResponse,
  ExecuteRecaptchaResponse,
  GetBiometricKeyOptions,
  GetBiometricKeyResult,
  GetBiometricRegistrationIdResult,
  GetSensorResult,
  GetTelemetryIdResponse,
  GoogleOneTapStartResponse,
  InitializeRecaptchaResponse,
  IsKeystoreAvailableResult,
  PasskeysAuthenticateOptions,
  PasskeysAuthenticateResponse,
  PasskeysRegisterOptions,
  PasskeysRegisterResponse,
  Platform,
  SignInWithAppleResponse,
} from './types';
const { StytchReactNativeModule: LegacyModule } = NativeModules;
const isTurboModuleEnabled = global.__turboModuleProxy != null;
const nativeModule = isTurboModuleEnabled ? TurboModule : LegacyModule;

export type { DeviceInfoResponse };

/**
 * Enum for touch id sensor type
 */
export const TouchID = 'TouchID';
/**
 * Enum for face id sensor type
 */
export const FaceID = 'FaceID';
/**
 * Enum for generic biometrics (this is the only value available on android)
 */
export const Biometrics = 'Biometrics';

export const BiometryTypes = {
  TouchID,
  FaceID,
  Biometrics,
};

export default class StytchReactNativeModule {
  Biometrics = {
    /**
     * Returns promise that resolves to an object with object.biometryType = Biometrics | TouchID | FaceID
     * @returns {Promise<Object>} Promise that resolves to an object with details about biometrics available
     */
    getSensor(allowDeviceCredentials: boolean): Promise<GetSensorResult> {
      return nativeModule.getSensor({
        allowDeviceCredentials,
      });
    },
    /**
     * Returns promise that resolves to an object with object.isKeystoreAvailable = true | false
     * @returns {Promise<Object>} Promise that resolves to object with details about keystore availability on device
     */
    isKeystoreAvailable(): Promise<IsKeystoreAvailableResult> {
      return nativeModule.isKeystoreAvailable();
    },
    /**
     * Creates a public private key pair,returns promise that resolves to
     * an object with object.publicKey, which is the public key of the newly generated key pair. If Keystore is unavailble on an Android
     * device, Promise will reject if allowFallbackToCleartext is false, and will continue with cleartext if true.
     * @param {Object} createKeysOptions
     * @param {boolean} createKeysOptions.allowFallbackToCleartext
     * @param {string} createKeysOptions.promptMessage
     * @param {string} createKeysOptions.cancelButtonText
     * @returns {Promise<Object>}  Promise that resolves to object with details about the newly generated public key
     */
    createKeys(createKeysOptions: CreateKeysOptions): Promise<CreateKeysResult> {
      return nativeModule.createKeys(createKeysOptions);
    },
    /**
     * Returns promise that resolves to an object with object.keysExists = true | false
     * indicating if the keys were found to exist or not
     * @returns {Promise<Object>} Promise that resolves to object with details aobut the existence of keys
     */
    biometricKeysExist(): Promise<BiometricKeysExistResult> {
      return nativeModule.biometricKeysExist();
    },

    /**
     * Returns promise that resolves to an object with true | false
     * indicating if the keys were properly deleted
     * @returns {Promise<Object>} Promise that resolves to an object with details about the deletion
     */
    deleteKeys(): Promise<DeleteKeysResult> {
      return nativeModule.deleteKeys();
    },

    /**
     * Signs the payload with the private key.
     * Returns promise that resolves to an object with object.signature,
     * which is a cryptographic signature of the payload, signed with the given private key
     * @param {Object} createSignatureOptions
     * @param {string} createSignatureOptions.privateKey
     * @param {string} createSignatureOptions.payload
     * @param {string} createSignatureOptions.biometricRegistrationId
     * @returns {Promise<Object>}  Promise that resolves to an object cryptographic signature details
     */
    createSignature(createSignatureOptions: CreateSignatureOptions): Promise<CreateSignatureResult> {
      return nativeModule.createSignature(createSignatureOptions);
    },

    /**
     * Gets the public and private keys from secure storage via a biometric prompt
     * @param {Object} createSignatureOptions
     * @param {string} createSignatureOptions.promptMessage
     * @param {string} createSignatureOptions.cancelButtonText
     * @returns {Promise<Object>}  Promise that resolves to an object cryptographic signature details
     */
    getBiometricKey(getBiometricKeyOptions: GetBiometricKeyOptions): Promise<GetBiometricKeyResult> {
      return nativeModule.getBiometricKey(getBiometricKeyOptions);
    },

    getBiometricRegistrationId(): Promise<GetBiometricRegistrationIdResult> {
      return nativeModule.getBiometricRegistrationId();
    },
  };

  OAuth = {
    signInWithAppleStart(): Promise<SignInWithAppleResponse> {
      return nativeModule.signInWithAppleStart();
    },
    googleOneTapStart(clientId: string, autoSelectEnabled: boolean): Promise<GoogleOneTapStartResponse> {
      return nativeModule.googleOneTapStart(clientId, autoSelectEnabled);
    },
  };

  ConsoleLogger = {
    consoleLog(message: string) {
      nativeModule.consoleLog(message);
    },
  };

  Misc = {
    resetSecureStorageOnFreshInstall(publicToken: string) {
      nativeModule.resetSecureStorageOnFreshInstall(publicToken);
    },
    disableUrlCache() {
      nativeModule.disableUrlCache();
    },
    configureDfp(publicToken: string, dfppaDomain: string) {
      nativeModule.configureDfp(publicToken, dfppaDomain);
    },
    getTelemetryId(): Promise<GetTelemetryIdResponse> {
      return nativeModule.getTelemetryId();
    },
    initializeRecaptcha(siteKey: string): Promise<InitializeRecaptchaResponse> {
      return nativeModule.initializeRecaptcha(siteKey);
    },
    executeRecaptcha(): Promise<ExecuteRecaptchaResponse> {
      return nativeModule.executeRecaptcha();
    },
    migrateKeychainItems() {
      nativeModule.migrateKeychainItems();
    },
    loadFontsForUI() {
      nativeModule.loadFontsForUI();
    },
    copyToClipboard(text: string) {
      nativeModule.copyToClipboard(text);
    },
  };

  Storage = {
    getData(key: string): Promise<string | null> {
      return nativeModule.getData(key);
    },
    setData(key: string, value: string): Promise<boolean> {
      return nativeModule.setData(key, value);
    },
    clearData(key: string): Promise<boolean> {
      return nativeModule.clearData(key);
    },
    didMigrate(): Promise<boolean> {
      return nativeModule.didMigrate();
    },
    migrate(publicToken: string): Promise<boolean> {
      return nativeModule.migrate(publicToken);
    },
  };

  DeviceInfo = {
    get(): DeviceInfoResponse {
      const { DEVICE_INFO } = nativeModule.getConstants();
      return {
        ...DEVICE_INFO,
        platform: ['ios', 'ipados'].includes(DEVICE_INFO.systemName.toLowerCase()) ? Platform.iOS : Platform.Android,
      };
    },
    getUserAgent(): Promise<DeviceInfoUserAgentResponse> {
      return nativeModule.getUserAgent();
    },
  };

  PKCE = {
    generateCodeChallenge(): Promise<ProofkeyPair> {
      return nativeModule.generateCodeChallenge();
    },
  };

  Passkeys = {
    register(options: PasskeysRegisterOptions): Promise<PasskeysRegisterResponse> {
      return nativeModule.registerPasskey(options);
    },
    authenticate(options: PasskeysAuthenticateOptions): Promise<PasskeysAuthenticateResponse> {
      return nativeModule.authenticatePasskey(options);
    },
  };

  SMS = {
    startRetriever(): Promise<string | undefined> {
      try {
        return nativeModule.startSmsRetriever();
      } catch {
        return Promise.resolve(undefined);
      }
    },
  };
}
