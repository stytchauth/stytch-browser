import { AuthenticateResponse, ResponseCommon, SDKDeviceHistory } from '../public';
import { StytchProjectConfigurationInput } from './typeConfig';

export type BiometricsRegisterOptions = {
  /**
   * The text rendered when raising the biometric prompt.
   */
  prompt: string;
  /**
   * The text rendered on the cancel button when raising the biometric prompt. Defaults to "Cancel".
   */
  cancelButtonText?: string;
  /**
   * On Android devices, allow the private key data to be stored as cleartext in the application sandbox.
   */
  allowFallbackToCleartext?: boolean;
  /**
   * Allows user to enter their device credentials as a fallback for failed biometric authentication.
   */
  allowDeviceCredentials?: boolean;
  /**
   * Specify the desired session duration, in minutes
   */
  sessionDurationMinutes?: number;
};

export type BiometricsRegisterStartResponse = ResponseCommon & {
  /**
   * A unique ID that identifies a specific biometric registration.
   */
  biometric_registration_id: string;
  /**
   * The challenge to be signed by the device.
   */
  challenge: string;
};

export type BiometricsRegisterCompleteResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = AuthenticateResponse<TProjectConfiguration> & {
  /**
   * A unique ID that identifies a specific biometric registration.
   */
  biometric_registration_id: string;
};

export type BiometricsAuthenticateOptions = {
  /**
   * The text rendered when raising the biometric prompt.
   */
  prompt: string;
  /**
   * Set the session lifetime to be this many minutes from now.
   * This value must be a minimum of 5 and may not exceed the `maximum session duration minutes` value set in the {@link https://stytch.com/dashboard/sdk-configuration SDK Configuration} page of the Stytch dashboard.
   * A successful authentication will continue to extend the session this many minutes.
   */
  sessionDurationMinutes: number;
  /**
   * The text rendered on the cancel button when raising the biometric prompt. Defaults to "Cancel".
   */
  cancelButtonText?: string;
  /**
   * Allows user to enter their device credentials as a fallback for failed biometric authentication.
   */
  allowDeviceCredentials?: boolean;
  /**
   * The text rendered on the fallback prompt after biometrics has failed and allowDeviceCredentials is true. Defaults to "Enter Passcode". This only appears on iOS devices.
   */
  fallbackTitle?: string;
};

export type BiometricsAuthenticateStartResponse = ResponseCommon & {
  /**
   * The challenge to be signed by the device.
   */
  challenge: string;
  /**
   * A unique ID that identifies a specific biometric registration.
   */
  biometric_registration_id: string;
};

// BiometricsAuthenticateResponse
export type BiometricsAuthenticateCompleteResponse<
  TProjectConfiguration extends StytchProjectConfigurationInput = Stytch.DefaultProjectConfiguration,
> = AuthenticateResponse<TProjectConfiguration> & {
  /**
   * A unique ID that identifies a specific biometric registration.
   */
  biometric_registration_id: string;
  /**
   * The device history of the user.
   */
  user_device?: SDKDeviceHistory;
};

export type BiometricsDeleteResponse = ResponseCommon & {
  /**
   * A unique ID that identifies a specific biometric registration.
   */
  biometric_registration_id: string;
  /**
   * Globally unique UUID that identifies a specific user in the Stytch API.
   */
  user_id: string;
};

/**
 * Type of biometric authentication available on the device. iOS supports 'TouchID' or 'FaceID', and Android supports 'Biometrics'.
 */
export type BiometryType = 'TouchID' | 'FaceID' | 'Biometrics';

export type BiometricsGetSensorResponse = {
  /**
   * Type of biometric authentication available on the device.
   */
  biometryType: BiometryType;
};

export interface IHeadlessBiometricsClient<TProjectConfiguration extends StytchProjectConfigurationInput> {
  /**
   * Indicates if there is an existing biometric registration on the device.
   *
   * @returns true if there is a biometric registration on the device, otherwise false.
   */
  isRegistrationAvailable: () => Promise<boolean>;
  /**
   * Indicates whether or not the Keystore is available on the device.
   *
   * @returns true if the keystore is available, otherwise false.
   */
  isKeystoreAvailable: () => Promise<boolean>;
  /**
   * Adds a biometric registration for the current user.
   *
   * @param options - {@link BiometricsRegisterOptions}
   *
   * @returns A {@link BiometricsRegisterCompleteResponse} indicating the biometric registration has been successful.
   *
   * @throws A `StytchSDKError` when the Stytch React Native module returns an error.
   */
  register: (options: BiometricsRegisterOptions) => Promise<BiometricsRegisterCompleteResponse<TProjectConfiguration>>;
  /**
   * Updates the session by using a biometric registration.
   *
   * @param options - {@link BiometricsAuthenticateOptions}
   *
   * @returns A {@link BiometricsRegisterCompleteResponse} indicating the authentication has been successful.
   *
   * @throws A `StytchSDKError` when the Stytch React Native module returns an error.
   */
  authenticate: (
    options: BiometricsAuthenticateOptions,
  ) => Promise<BiometricsAuthenticateCompleteResponse<TProjectConfiguration>>;
  /**
   * Attempts to remove the biometric registration from the user and device.
   *
   * @returns A {@link BiometricsDeleteResponse} indicating whether the deletion has been successful.
   */
  removeRegistration: () => Promise<BiometricsDeleteResponse>;
  /**
   * Checks the type of biometrics that is available on the device.
   *
   * @param allowDeviceCredentials Allows user to enter their device credentials as a fallback for failed biometric authentication.
   *
   * @returns A {@link BiometricsGetSensorResponse} containing a {@link BiometryType}.
   *
   * @throws A `StytchSDKError` when the Stytch React Native module returns an error.
   */
  getSensor: (allowDeviceCredentials?: boolean) => Promise<BiometricsGetSensorResponse>;
  /**
   * Gets the current biometric_registration_id saved on device, if it exists
   */
  getBiometricRegistrationId: () => Promise<string | undefined>;
  /**
   * Deletes the local biometric keys from the device, if any
   *
   * @returns true if keys were found and deleted from the device, false if no keys were present
   */
  deleteDeviceRegistration: () => Promise<boolean>;
}
