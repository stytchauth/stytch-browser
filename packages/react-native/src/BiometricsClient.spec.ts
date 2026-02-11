import { HeadlessBiometricsClient } from './BiometricsClient';
import { StytchProjectConfigurationInput } from '@stytch/core/public';
import { createTestFixtures, MockDFPProtectedAuthWithCaptcha } from './testUtils';
import {
  BiometricsAlreadyEnrolledError,
  KeystoreUnavailableError,
  NoBiometricsRegistrationError,
  NoCurrentSessionError,
  UserCancellationError,
} from '@stytch/core/public';
import { MOCK_AUTHENTICATE_RETURN_VALUE, MOCK_REGISTRATION_ID, MOCK_CHALLENGE, MOCK_DFP_TELEMETRY_ID } from './mocks';

const MOCK_ERROR = new Error('mock_error');
const MOCK_REGISTER_OPTIONS = {
  prompt: 'mock_prompt',
  sessionDurationMinutes: 5,
};
const MOCK_REGISTER_START_RESPONSE = {
  biometric_registration_id: MOCK_REGISTRATION_ID,
  challenge: MOCK_CHALLENGE,
};
const MOCK_REGISTER_COMPLETE_RESPONSE = {
  biometric_registration_id: MOCK_REGISTRATION_ID,
};
const MOCK_AUTHENTICATE_OPTIONS = {
  prompt: 'mock_prompt',
  sessionDurationMinutes: 60,
};
const MOCK_AUTHENTICATE_START_RESPONSE = {
  challenge: MOCK_CHALLENGE,
  biometric_registration_id: MOCK_REGISTRATION_ID,
};
const MOCK_AUTHENTICATE_COMPLETE_RESPONSE = {
  biometric_registration_id: MOCK_REGISTRATION_ID,
};
const MOCK_DELETE_RESPONSE = {
  biometric_registration_id: MOCK_REGISTRATION_ID,
  user_id: 'mock_user_id',
};
const MOCK_GET_SENSOR_RESPONSE = {
  biometryType: 'Biometrics',
};

const biometricKeysExistMock = jest.fn();
const createKeysMock = jest.fn();
const deleteKeysMock = jest.fn();
const getSensorMock = jest.fn();
const createSignatureMock = jest.fn();
const getBiometricKeyMock = jest.fn();
const getBiometricRegistrationIdMock = jest.fn();
const keystoreAvailableMock = jest.fn();

jest.mock('./native-module', function () {
  return {
    __esModule: true,
    default: class {
      Biometrics = {
        biometricKeysExist: biometricKeysExistMock,
        createKeys: createKeysMock,
        deleteKeys: deleteKeysMock,
        getSensor: getSensorMock,
        createSignature: createSignatureMock,
        getBiometricKey: getBiometricKeyMock,
        getBiometricRegistrationId: getBiometricRegistrationIdMock,
        isKeystoreAvailable: keystoreAvailableMock,
      };
    },
  };
});

describe('HeadlessBiometricsClient', () => {
  const { networkClient, subscriptionService } = createTestFixtures();
  let client: HeadlessBiometricsClient<StytchProjectConfigurationInput>;

  beforeAll(() => {
    client = new HeadlessBiometricsClient(subscriptionService, networkClient, MockDFPProtectedAuthWithCaptcha());
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getSensor', () => {
    it('Calls the native module and passes through the response', async () => {
      getSensorMock.mockResolvedValueOnce(MOCK_GET_SENSOR_RESPONSE);
      await expect(client.getSensor()).resolves.toEqual(MOCK_GET_SENSOR_RESPONSE);
    });
    it('Calls the native module and returns false when an error is thrown', async () => {
      getSensorMock.mockRejectedValueOnce(MOCK_ERROR);
      await expect(client.getSensor()).rejects.toThrow(MOCK_ERROR);
    });
  });

  describe('isRegistrationAvailable', () => {
    it('Calls the native module and passes through the response', async () => {
      biometricKeysExistMock.mockResolvedValueOnce({
        keysExist: true,
      });
      await expect(client.isRegistrationAvailable()).resolves.toEqual(true);
    });
    it('Calls the native module and returns false when an error is thrown', async () => {
      biometricKeysExistMock.mockRejectedValueOnce(MOCK_ERROR);
      await expect(client.isRegistrationAvailable()).resolves.toEqual(false);
    });
  });

  describe('isKeystoreAvailable', () => {
    it('Calls the native module and passes through the response', async () => {
      keystoreAvailableMock.mockResolvedValueOnce({
        isKeystoreAvailable: true,
      });
      await expect(client.isKeystoreAvailable()).resolves.toEqual(true);
    });
    it('Calls the native module and returns false when an error is thrown', async () => {
      keystoreAvailableMock.mockRejectedValueOnce(MOCK_ERROR);
      await expect(client.isKeystoreAvailable()).resolves.toEqual(false);
    });
  });

  describe('register', () => {
    it('fails if session doesnt exist', async () => {
      subscriptionService.getSession.mockReturnValue(null);
      await expect(client.register(MOCK_REGISTER_OPTIONS)).rejects.toThrow(new NoCurrentSessionError());
    });

    it('fails if session is expired', async () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() - 1);
      subscriptionService.getSession.mockReturnValue({ expires_at: date });
      await expect(client.register(MOCK_REGISTER_OPTIONS)).rejects.toThrow(new NoCurrentSessionError());
    });

    it('fails if keystore is unavailable', async () => {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      subscriptionService.getSession.mockReturnValue({ expires_at: date });
      keystoreAvailableMock.mockResolvedValueOnce({ isKeystoreAvailable: false });
      await expect(client.register(MOCK_REGISTER_OPTIONS)).rejects.toThrow(new KeystoreUnavailableError());
    });

    it('propagates createKeys failures', async () => {
      biometricKeysExistMock.mockResolvedValueOnce({
        keysExist: false,
      });
      keystoreAvailableMock.mockResolvedValue({ isKeystoreAvailable: true });
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      subscriptionService.getSession.mockReturnValue({ expires_at: date });
      createKeysMock.mockRejectedValue(MOCK_ERROR);
      await expect(client.register(MOCK_REGISTER_OPTIONS)).rejects.toThrow(MOCK_ERROR);
    });

    describe('with successful keypair creation', () => {
      beforeEach(() => {
        biometricKeysExistMock.mockResolvedValueOnce({
          keysExist: false,
        });
        keystoreAvailableMock.mockResolvedValue({ isKeystoreAvailable: true });

        const date = new Date();
        date.setFullYear(date.getFullYear() + 1);
        subscriptionService.getSession.mockReturnValue({ expires_at: date });

        createKeysMock.mockResolvedValueOnce({
          publicKey: 'mock_public_key',
          privateKey: 'mock_private_key',
        });
      });

      describe('key creation and signature succeeds', () => {
        beforeEach(() => {
          createSignatureMock.mockResolvedValueOnce({
            signature: 'signed data',
          });
        });

        it('should succeed with keystore', async () => {
          networkClient.fetchSDK
            .mockResolvedValueOnce(MOCK_REGISTER_START_RESPONSE)
            .mockResolvedValueOnce(MOCK_REGISTER_COMPLETE_RESPONSE);

          const registerResponse = await client.register(MOCK_REGISTER_OPTIONS);
          expect(registerResponse).toEqual(MOCK_REGISTER_COMPLETE_RESPONSE);
          expect(networkClient.fetchSDK).toHaveBeenCalledWith({
            url: '/biometrics/register',
            method: 'POST',
            body: {
              signature: 'signed data',
              biometric_registration_id: MOCK_REGISTER_COMPLETE_RESPONSE.biometric_registration_id,
              session_duration_minutes: MOCK_REGISTER_OPTIONS.sessionDurationMinutes,
            },
          });
        });
      });
    });

    it('should succeed without keystore', async () => {
      biometricKeysExistMock.mockResolvedValueOnce({
        keysExist: false,
      });
      keystoreAvailableMock.mockResolvedValue({ isKeystoreAvailable: false });

      const date = new Date();
      date.setFullYear(date.getFullYear() + 1);
      subscriptionService.getSession.mockReturnValue({ expires_at: date });

      createKeysMock.mockResolvedValueOnce({
        publicKey: 'mock_public_key',
        privateKey: 'mock_private_key',
      });

      createSignatureMock.mockResolvedValueOnce({
        signature: 'signed data',
      });

      networkClient.fetchSDK
        .mockResolvedValueOnce(MOCK_REGISTER_START_RESPONSE)
        .mockResolvedValueOnce(MOCK_REGISTER_COMPLETE_RESPONSE);

      const registerResponse = await client.register({ prompt: 'prompt', allowFallbackToCleartext: true });
      expect(registerResponse).toEqual(MOCK_REGISTER_COMPLETE_RESPONSE);
    });

    it('throws BiometricsAlreadyEnrolledError if registration is already available', async () => {
      biometricKeysExistMock.mockResolvedValue({
        keysExist: true,
      });
      await expect(client.register(MOCK_REGISTER_OPTIONS)).rejects.toThrow(new BiometricsAlreadyEnrolledError());
    });
  });

  describe('authenticate', () => {
    it('handles errors when getting biometric key', async () => {
      getBiometricKeyMock.mockRejectedValue(MOCK_ERROR);

      await expect(client.authenticate(MOCK_AUTHENTICATE_OPTIONS)).rejects.toThrow(MOCK_ERROR);
    });

    describe('with successful public key retrieval', () => {
      beforeEach(() => {
        getBiometricKeyMock.mockResolvedValueOnce({ publicKey: 'mock_public_key', privateKey: 'mock_private_key' });

        createKeysMock.mockResolvedValueOnce({
          publicKey: 'mock_public_key',
          privateKey: 'mock_private_key',
        });
      });

      it('fails when authenticate/start endpoint doesnt return challenge', async () => {
        networkClient.fetchSDK.mockRejectedValueOnce(MOCK_ERROR);

        await expect(client.authenticate(MOCK_AUTHENTICATE_OPTIONS)).rejects.toThrow(MOCK_ERROR);
        expect(networkClient.fetchSDK).toHaveBeenCalledWith({
          url: '/biometrics/authenticate/start',
          method: 'POST',
          body: {
            public_key: 'mock_public_key',
          },
        });
      });

      describe('propogates signature failure errors appropriately', () => {
        beforeEach(() => {
          networkClient.fetchSDK.mockResolvedValueOnce(MOCK_AUTHENTICATE_START_RESPONSE);
        });

        it('calls createSignature with proper values', async () => {
          createSignatureMock.mockRejectedValueOnce(MOCK_ERROR);

          await expect(client.authenticate(MOCK_AUTHENTICATE_OPTIONS)).rejects.toThrow(MOCK_ERROR);
          expect(createSignatureMock).toHaveBeenCalledWith({
            payload: MOCK_CHALLENGE,
            privateKey: 'mock_private_key',
            biometricRegistrationId: MOCK_REGISTRATION_ID,
          });
        });

        it('handles user cancellation', async () => {
          createSignatureMock.mockRejectedValueOnce(new UserCancellationError());
          await expect(client.authenticate(MOCK_AUTHENTICATE_OPTIONS)).rejects.toThrow(new UserCancellationError());
        });

        it('handles failed signature', async () => {
          createSignatureMock.mockRejectedValueOnce(MOCK_ERROR);
          await expect(client.authenticate(MOCK_AUTHENTICATE_OPTIONS)).rejects.toThrow(MOCK_ERROR);
        });
      });

      describe('handles authenticateComplete call appropriately', () => {
        beforeEach(() => {
          createSignatureMock.mockResolvedValueOnce({ signature: 'mock_signature' });
        });

        it('calls authenticateComplete with correct payload', async () => {
          networkClient.fetchSDK.mockResolvedValueOnce(MOCK_AUTHENTICATE_START_RESPONSE);
          networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_AUTHENTICATE_COMPLETE_RESPONSE);

          await expect(client.authenticate(MOCK_AUTHENTICATE_OPTIONS)).resolves.toEqual(
            MOCK_AUTHENTICATE_COMPLETE_RESPONSE,
          );
          expect(networkClient.retriableFetchSDK).toHaveBeenCalledWith({
            url: '/biometrics/authenticate',
            method: 'POST',
            body: {
              signature: 'mock_signature',
              biometric_registration_id: MOCK_REGISTRATION_ID,
              session_duration_minutes: 60,
              captcha_token: undefined,
              dfp_telemetry_id: MOCK_DFP_TELEMETRY_ID,
            },
            retryCallback: expect.any(Function),
          });
        });

        it('propagates failure', async () => {
          networkClient.fetchSDK.mockResolvedValueOnce(MOCK_AUTHENTICATE_START_RESPONSE);
          networkClient.retriableFetchSDK.mockRejectedValueOnce(MOCK_ERROR);
          await expect(client.authenticate(MOCK_AUTHENTICATE_OPTIONS)).rejects.toThrow(MOCK_ERROR);
        });

        it('updates state and returns success', async () => {
          networkClient.fetchSDK.mockResolvedValueOnce(MOCK_AUTHENTICATE_START_RESPONSE);
          networkClient.retriableFetchSDK.mockResolvedValueOnce(MOCK_AUTHENTICATE_RETURN_VALUE);
          const authenticateResponse = await client.authenticate(MOCK_AUTHENTICATE_OPTIONS);
          expect(authenticateResponse).toEqual(MOCK_AUTHENTICATE_RETURN_VALUE);
          expect(subscriptionService.updateSession).toHaveBeenCalledWith(MOCK_AUTHENTICATE_RETURN_VALUE);
        });
      });
    });
  });

  describe('removeRegistration', () => {
    it('fails if factor doesnt exist', async () => {
      biometricKeysExistMock.mockResolvedValueOnce({
        keysExist: false,
      });

      await expect(client.removeRegistration()).rejects.toThrow(new NoBiometricsRegistrationError());
    });

    it('throws exception and does not delete keys if session doesnt exist', async () => {
      biometricKeysExistMock.mockResolvedValueOnce({
        keysExist: true,
      });
      subscriptionService.getSession.mockReturnValue(null);

      await expect(client.removeRegistration()).rejects.toThrow(new NoCurrentSessionError());

      expect(deleteKeysMock).not.toHaveBeenCalled();
    });

    it('throws exception and does not delete keys if public key doesnt exist', async () => {
      biometricKeysExistMock.mockResolvedValueOnce({
        keysExist: true,
      });
      getBiometricKeyMock.mockRejectedValueOnce(MOCK_ERROR);
      getBiometricRegistrationIdMock.mockRejectedValueOnce(MOCK_ERROR);
      subscriptionService.getSession.mockReturnValue({});

      await expect(client.removeRegistration()).rejects.toThrow(MOCK_ERROR);

      expect(deleteKeysMock).not.toHaveBeenCalled();
    });

    describe('tries to delete factor in Stytch system if session exists', () => {
      beforeEach(() => {
        biometricKeysExistMock.mockResolvedValueOnce({
          keysExist: true,
        });
        getBiometricKeyMock.mockResolvedValueOnce({
          publicKey: 'mock_public_key',
          privateKey: 'mock_private_key',
        });
        getBiometricRegistrationIdMock.mockResolvedValueOnce({
          biometricRegistrationId: 'mock_biometric_registration_id',
        });

        subscriptionService.getSession.mockReturnValue({});
      });

      it('calls delete endpoint appropriately', async () => {
        networkClient.fetchSDK.mockResolvedValueOnce(MOCK_DELETE_RESPONSE);

        await expect(client.removeRegistration()).resolves.toBe(MOCK_DELETE_RESPONSE);

        expect(networkClient.fetchSDK).toHaveBeenCalledWith({
          url: `/users/biometric_registrations/mock_biometric_registration_id`,
          method: 'DELETE',
        });
      });

      it('returns exception and does not delete keys if networkClient throws', async () => {
        networkClient.fetchSDK.mockRejectedValue(MOCK_ERROR);

        await expect(client.removeRegistration()).rejects.toThrow(MOCK_ERROR);

        expect(deleteKeysMock).not.toHaveBeenCalled();
      });
    });
  });

  describe('deleteDeviceRegistration', () => {
    it('Calls the native module and passes through the response', async () => {
      deleteKeysMock.mockResolvedValueOnce({
        keysDeleted: true,
      });

      await expect(client.deleteDeviceRegistration()).resolves.toEqual(true);
    });

    it('Calls the native module and returns false when an error is thrown', async () => {
      biometricKeysExistMock.mockRejectedValueOnce(MOCK_ERROR);

      await expect(client.deleteDeviceRegistration()).resolves.toEqual(false);
    });
  });

  describe('getBiometricRegistrationId', () => {
    it('returns the registration id if it exists', async () => {
      getBiometricRegistrationIdMock.mockResolvedValueOnce({ biometricRegistrationId: 'biometric_registration_id' });
      await expect(client.getBiometricRegistrationId()).resolves.toEqual('biometric_registration_id');
    });

    it('returns undefined if the promise is rejected', async () => {
      getBiometricRegistrationIdMock.mockRejectedValueOnce(Error('Something happened and the promise rejected'));
      await expect(client.getBiometricRegistrationId()).resolves.toEqual(undefined);
    });

    it('returns undefined if an error is encountered', async () => {
      getBiometricRegistrationIdMock.mockImplementation(() => {
        throw Error('Something bad happened');
      });
      await expect(client.getBiometricRegistrationId()).resolves.toEqual(undefined);
    });
  });
});
