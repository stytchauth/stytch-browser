import {
  DEFAULT_SESSION_DURATION_MINUTES,
  IConsumerSubscriptionService,
  IDFPProtectedAuthProvider,
  INetworkClient,
} from '@stytch/core';
import {
  BiometricsAlreadyEnrolledError,
  BiometricsAuthenticateCompleteResponse,
  BiometricsAuthenticateOptions,
  BiometricsAuthenticateStartResponse,
  BiometricsDeleteResponse,
  BiometricsRegisterCompleteResponse,
  BiometricsRegisterOptions,
  BiometricsRegisterStartResponse,
  errorToStytchError,
  IHeadlessBiometricsClient,
  KeystoreUnavailableError,
  NoBiometricsRegistrationError,
  NoCurrentSessionError,
  StytchProjectConfigurationInput,
} from '@stytch/core/public';

import StytchReactNativeModule from './native-module';

export class HeadlessBiometricsClient<TProjectConfiguration extends StytchProjectConfigurationInput>
  implements IHeadlessBiometricsClient<TProjectConfiguration>
{
  private nativeModule: StytchReactNativeModule;

  register: (options: BiometricsRegisterOptions) => Promise<BiometricsRegisterCompleteResponse<TProjectConfiguration>>;

  authenticate: (
    options: BiometricsAuthenticateOptions,
  ) => Promise<BiometricsAuthenticateCompleteResponse<TProjectConfiguration>>;

  constructor(
    private _subscriptionService: IConsumerSubscriptionService<TProjectConfiguration>,
    private _networkClient: INetworkClient,
    private dfpProtectedAuth: IDFPProtectedAuthProvider,
  ) {
    this.nativeModule = new StytchReactNativeModule();
    this.register = this._subscriptionService.withUpdateSession(async (options: BiometricsRegisterOptions) => {
      if (await this.isRegistrationAvailable()) {
        throw new BiometricsAlreadyEnrolledError();
      }

      const { prompt, cancelButtonText, allowFallbackToCleartext, allowDeviceCredentials } = options;

      // check for unexpired session token
      const session = this._subscriptionService.getSession();
      if (!session || Date.parse(session.expires_at) < Date.now()) {
        throw new NoCurrentSessionError();
      }

      if (!(await this.isKeystoreAvailable()) && !allowFallbackToCleartext) {
        throw new KeystoreUnavailableError();
      }

      try {
        // create new biometrics keypair
        const newKeypair = await this.nativeModule.Biometrics.createKeys({
          allowFallbackToCleartext: !!allowFallbackToCleartext,
          promptMessage: prompt,
          cancelButtonText: cancelButtonText || 'Cancel',
          allowDeviceCredentials: !!allowDeviceCredentials,
        });

        // start the registration with Stytch by passing in the public key
        // this will return a challenge
        const registrationStartResponse = await this._networkClient.fetchSDK<BiometricsRegisterStartResponse>({
          url: '/biometrics/register/start',
          method: 'POST',
          body: {
            public_key: newKeypair.publicKey,
          },
        });

        // Challenge the user to authenticate with biometrics
        const createSignatureResponse = await this.nativeModule.Biometrics.createSignature({
          payload: registrationStartResponse.challenge,
          privateKey: newKeypair.privateKey,
          biometricRegistrationId: registrationStartResponse.biometric_registration_id,
        });

        // Send the signature back to Stytch to complete the registration
        return await this._networkClient.fetchSDK<BiometricsRegisterCompleteResponse<TProjectConfiguration>>({
          url: '/biometrics/register',
          method: 'POST',
          body: {
            signature: createSignatureResponse.signature,
            biometric_registration_id: registrationStartResponse.biometric_registration_id,
            session_duration_minutes: options.sessionDurationMinutes ?? DEFAULT_SESSION_DURATION_MINUTES,
          },
        });
      } catch (err) {
        if (await this.isRegistrationAvailable()) {
          await this.removeRegistration();
        }
        throw errorToStytchError(err);
      }
    });

    this.authenticate = this._subscriptionService.withUpdateSession(async (options: BiometricsAuthenticateOptions) => {
      const { dfp_telemetry_id, captcha_token } = await this.dfpProtectedAuth.getDFPTelemetryIDAndCaptcha();
      const { prompt, sessionDurationMinutes, cancelButtonText, allowDeviceCredentials, fallbackTitle } = options;
      try {
        const biometricKeys = await this.nativeModule.Biometrics.getBiometricKey({
          promptMessage: prompt,
          cancelButtonText: cancelButtonText || 'Cancel',
          allowDeviceCredentials: !!allowDeviceCredentials,
          fallbackTitle: fallbackTitle || 'Enter Passcode',
        });

        const authenticationStartResponse = await this._networkClient.fetchSDK<BiometricsAuthenticateStartResponse>({
          url: '/biometrics/authenticate/start',
          method: 'POST',
          body: {
            public_key: biometricKeys.publicKey,
          },
        });

        const createSignatureResponse = await this.nativeModule.Biometrics.createSignature({
          payload: authenticationStartResponse.challenge,
          privateKey: biometricKeys.privateKey,
          biometricRegistrationId: authenticationStartResponse.biometric_registration_id,
        });

        return this._networkClient.retriableFetchSDK<BiometricsAuthenticateCompleteResponse<TProjectConfiguration>>({
          url: '/biometrics/authenticate',
          method: 'POST',
          body: {
            signature: createSignatureResponse.signature,
            biometric_registration_id: authenticationStartResponse.biometric_registration_id,
            session_duration_minutes: sessionDurationMinutes,
            dfp_telemetry_id,
            captcha_token,
          },
          retryCallback: this.dfpProtectedAuth.retryWithCaptchaAndDFP,
        });
      } catch (err) {
        throw errorToStytchError(err);
      }
    });
  }

  isRegistrationAvailable = async () => {
    try {
      const keysExistResponse = await this.nativeModule.Biometrics.biometricKeysExist();
      return keysExistResponse.keysExist;
    } catch {
      return false;
    }
  };

  isKeystoreAvailable = async () => {
    try {
      const keystoreAvailableResponse = await this.nativeModule.Biometrics.isKeystoreAvailable();
      return keystoreAvailableResponse.isKeystoreAvailable;
    } catch {
      return false;
    }
  };

  removeRegistration = async () => {
    const factorExists = await this.isRegistrationAvailable();
    if (!factorExists) {
      throw new NoBiometricsRegistrationError();
    }

    const session = this._subscriptionService.getSession();
    // if session exists, try to delete the factor from Stytch system
    if (session) {
      try {
        const biometricRegistrationId = await this.nativeModule.Biometrics.getBiometricRegistrationId();
        const result = await this._networkClient.fetchSDK<BiometricsDeleteResponse>({
          url: `/users/biometric_registrations/${biometricRegistrationId.biometricRegistrationId}`,
          method: 'DELETE',
        });
        await this.nativeModule.Biometrics.deleteKeys();
        return result;
      } catch (err) {
        const sdkError = errorToStytchError(err);
        throw sdkError;
      }
    } else {
      throw new NoCurrentSessionError();
    }
  };

  deleteDeviceRegistration = async () => {
    try {
      const deleteKeysResponse = await this.nativeModule.Biometrics.deleteKeys();
      return deleteKeysResponse.keysDeleted;
    } catch {
      return false;
    }
  };

  getSensor = async (allowDeviceCredentials?: boolean) => {
    try {
      const sensorResponse = await this.nativeModule.Biometrics.getSensor(!!allowDeviceCredentials);
      return { ...sensorResponse };
    } catch (err) {
      const sdkError = errorToStytchError(err);
      throw sdkError;
    }
  };

  getBiometricRegistrationId = async () => {
    try {
      const biometricRegistrationResponse = await this.nativeModule.Biometrics.getBiometricRegistrationId();
      return biometricRegistrationResponse.biometricRegistrationId;
    } catch {
      return undefined;
    }
  };
}
