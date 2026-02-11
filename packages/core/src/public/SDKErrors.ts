/* eslint-disable @typescript-eslint/no-explicit-any */

import { StytchAPIErrorType } from './StytchAPIErrorType';

/**
 * An Error class thrown when the SDK is unable to reach the Stytch servers,
 * or when the Stytch servers return a value the SDK cannot understand.
 * Usually - it means that you're offline!
 */
export class SDKAPIUnreachableError extends Error {
  details: string;

  constructor(message: string, details: string) {
    super(message + '\n' + details);
    this.message = message + '\n' + details;
    this.name = 'SDKAPIUnreachableError';
    this.details = details;
    Object.setPrototypeOf(this, SDKAPIUnreachableError.prototype);
  }
}

/**
 * An Error class thrown when the provided input fails client-side validation -
 * for example if a field that was expected to be a number is instead a string.
 */
export class StytchSDKUsageError extends Error {
  constructor(methodName: string, message: string) {
    super();
    this.name = 'StytchSDKUsageError';
    this.message = `Invalid call to ${methodName}\n` + message;
  }
}

// Example invalid schema error
// {
//   body: [
//     {
//       keyword: 'type',
//       dataPath: '.session_duration_minutes',
//       schemaPath: '#/properties/session_duration_minutes/type',
//       params: { type: 'number' },
//       message: 'should be number',
//     },
//   ],
// };
// Taken from ajv/lib/ajv.d.ts
interface ErrorObject {
  keyword: string;
  dataPath: string;
  schemaPath: string;
  message?: string;
}

/**
 * An Error class thrown when the provided input does not adhere to the Stytch API schema -
 * for example if a field that was expected to be a number is instead a string.
 */
export class StytchSDKSchemaError extends Error {
  constructor(schemaError: { body?: ErrorObject[] }) {
    super();
    this.name = 'StytchSDKSchemaError';

    const messages = schemaError.body?.map((err) => `${err.dataPath}: ${err.message}`).join('\n');

    this.message = `[400] Request does not match expected schema\n${messages}`;
  }
}

interface APIError {
  status_code: number;
  request_id?: string;
  error_type: StytchAPIErrorType;
  error_message: string;
  error_url: string;
  error_details?: object;
}

/**
 * An Error class wrapping a well-formed JSON error from the Stytch API.
 * The Stytch error should match one listed at {@link https://stytch.com/docs/api/errors}
 */
export class StytchSDKAPIError extends Error {
  error_type: StytchAPIErrorType;
  error_message: string;
  error_url: string;
  request_id?: string;
  status_code: number;
  error_details?: object;

  constructor(details: APIError) {
    super();
    this.name = 'StytchSDKAPIError';

    const { status_code, error_type, error_message, error_url, request_id, error_details } = details;
    this.error_type = error_type;
    this.error_message = error_message;
    this.error_url = error_url;
    this.request_id = request_id;
    this.status_code = status_code;
    this.error_details = error_details;

    this.message =
      `[${status_code}] ${error_type}\n` +
      `${error_message}\n` +
      `See ${error_url} for more information.\n` +
      // Web-Backend doesn't have request IDs yet, so if a request fails there it won't have one.
      // We should figure out how returning tracing info should work
      (request_id ? `request_id: ${request_id}\n` : '') +
      (this.error_details ? `Details: \n` + JSON.stringify(this.error_details) + '\n' : '');
  }
}

/**
 * If the SDK throws an error with an error type included in this array, the local session and
 * user state will be cleared locally.
 */
export const UNRECOVERABLE_ERROR_TYPES: StytchAPIErrorType[] = [
  'unauthorized_credentials',
  'user_unauthenticated',
  'invalid_secret_authentication',
  'session_not_found',
];

/**
 * An Error class representing an error within Stytch.
 */
export class StytchError extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
  }
}

/**
 * An Error class thrown when the SDK is unable to reach the Stytch servers,
 * or when the Stytch servers return a value the SDK cannot understand.
 * Usually - it means that you're offline!
 */
export class StytchAPIUnreachableError extends StytchError {
  constructor(details: string) {
    super('StytchAPIUnreachableError', details);
    Object.setPrototypeOf(this, StytchAPIUnreachableError.prototype);
  }
}

/**
 * An Error class thrown when the provided input does not adhere to the Stytch API schema -
 * for example if a field that was expected to be a number is instead a string.
 */
export class StytchAPISchemaError extends StytchError {
  constructor(schemaError: { body?: ErrorObject[] }) {
    const messages = schemaError.body?.map((err) => `${err.dataPath}: ${err.message}`).join('\n');
    super('StytchAPISchemaError', `Request does not match expected schema\n${messages}`);
  }
}

/**
 * An Error class wrapping a well-formed JSON error from the Stytch API.
 * The Stytch error should match one listed at {@link https://stytch.com/docs/api/errors}
 */
export class StytchAPIError extends StytchError {
  error_type: string;
  error_message: string;
  error_url: string;
  request_id?: string;
  status_code: number;
  error_details?: object;

  constructor(details: APIError) {
    const { status_code, error_type, error_message, error_url, request_id, error_details } = details;
    super(
      'StytchAPIError',
      `[${status_code}] ${error_type}\n` +
        `${error_message}\n` +
        `See ${error_url} for more information.\n` +
        // Web-Backend doesn't have request IDs yet, so if a request fails there it won't have one.
        // We should figure out how returning tracing info should work
        (request_id ? `request_id: ${request_id}\n` : '') +
        (error_details ? `Details: \n` + JSON.stringify(error_details) + '\n' : ''),
    );
    this.error_type = error_type;
    this.error_message = error_message;
    this.error_url = error_url;
    this.request_id = request_id;
    this.status_code = status_code;
    this.error_details = error_details;
  }

  static from(err: unknown): StytchAPIError {
    if (err instanceof StytchAPIError) {
      return err;
    }
    if (err && typeof err === 'object') {
      const maybe = err as Partial<APIError>;
      if (
        typeof maybe.status_code === 'number' &&
        typeof maybe.error_type === 'string' &&
        typeof maybe.error_message === 'string' &&
        typeof maybe.error_url === 'string'
      ) {
        return new StytchAPIError({
          status_code: maybe.status_code,
          error_type: maybe.error_type,
          error_message: maybe.error_message,
          error_url: maybe.error_url,
          request_id: typeof maybe.request_id === 'string' ? maybe.request_id : undefined,
          error_details: typeof maybe.error_details === 'object' ? maybe.error_details : undefined,
        });
      }
    }
    const message = err instanceof Error ? err.message : 'Unknown error: ' + String(err);
    return new StytchAPIError({
      status_code: 400,
      error_type: 'unknown_error',
      error_message: message,
      error_url: '',
      request_id: undefined,
      error_details: undefined,
    });
  }
}

export type StytchSDKErrorOptions = {
  url?: string;
};

/**
 * An Error class used in the Stytch SDK.
 */
export class StytchSDKError extends StytchError {
  options?: StytchSDKErrorOptions;

  constructor(name: string, description: string, options?: StytchSDKErrorOptions) {
    super(name, description);
    this.options = options;
  }
}

export type StytchSDKUIError = {
  message: string;
};

/**
 * Thrown when you attempt to perform an action that requires a session, but no local session exists
 */
export class NoCurrentSessionError extends StytchSDKError {
  constructor() {
    super(
      'NoCurrentSessionError',
      'There is no session currently available. Make sure the user is authenticated with a valid session.',
    );
  }
}

/**
 * Thrown when an unrecognized error is thrown
 */
export class InternalError extends StytchSDKError {
  nativeStack?: unknown;

  constructor(error: any) {
    super(
      error.name ? error.name : 'Internal Error',
      error.message ? error.message : 'An internal error has occurred. Please contact Stytch if this occurs.',
    );
    this.nativeStack = error.nativeStackAndroid || error.nativeStackIOS;
  }
}

/**
 * Thrown when no biometric registration exists
 */
export class NoBiometricsRegistrationError extends StytchSDKError {
  constructor() {
    super(
      'NoBiometricsRegistrationError',
      'There is no biometric registration available. Authenticate with another method and add a new biometric registration first.',
    );
  }
}

/**
 * Thrown when biometrics are unavailable on the device
 */
export class BiometricsUnavailableError extends StytchSDKError {
  constructor() {
    super('BiometricsUnavailableError', 'Biometrics is not available on the device.');
  }
}

/**
 * Thrown when the biometrics enrollment has changed, and the underlying key is no longer usable
 */
export class KeyInvalidatedError extends StytchSDKError {
  constructor() {
    super('KeyInvalidatedError', 'The biometrics enrollment on the device has changed.');
  }
}

/**
 * Thrown when the Keystore is determined to be unavailable
 */
export class KeystoreUnavailableError extends StytchSDKError {
  constructor() {
    super(
      'KeystoreUnavailableError',
      'The Android keystore is unavailable on the device. Consider setting allowFallbackToCleartext to true.',
    );
  }
}

/**
 * Thrown when there is no biometric factor enrolled on device
 */
export class NoBiometricsEnrolledError extends StytchSDKError {
  constructor() {
    super(
      'NoBiometricsEnrolledError',
      'There is no biometric factor enrolled on the device. Add a biometric factor in the device settings.',
    );
  }
}

/**
 * Thrown when there is no biometric factor enrolled on device
 */
export class BiometricsAlreadyEnrolledError extends StytchSDKError {
  constructor() {
    super(
      'BiometricsAlreadyEnrolledError',
      'There is already a biometric factor enrolled on this device. Fully authenticate with all factors and remove the existing registration before attempting to register again.',
    );
  }
}

/**
 * Thrown when the user has cancelled the prompt
 */
export class UserCancellationError extends StytchSDKError {
  constructor() {
    super('UserCancellationError', 'The user canceled the prompt. Ask the user to try again.');
  }
}

/**
 * Thrown when the user has been locked out of biometrics
 */
export class UserLockedOutError extends StytchSDKError {
  constructor() {
    super(
      'UserLockedOutError',
      'The user has been locked out due to too many failed attempts. Ask the user to try again later.',
    );
  }
}

/**
 * Thrown when biometrics register/authenticate calls are made with mismatched `allowDeviceCredentials` parameter
 */
export class DeviceCredentialsNotAllowedError extends StytchSDKError {
  constructor() {
    super(
      'DeviceCredentialsNotAllowedError',
      'The device credentials allowment is mismatched. Change the allowDeviceCredentials parameter to be the same in both the register and authenticate methods.',
    );
  }
}

/**
 * Thrown when no Google client ID is found for the project
 */
export class MissingGoogleClientIDError extends StytchSDKError {
  constructor() {
    super('MissingGoogleClientIDError', 'No Google client ID was found in the project.');
  }
}

/**
 * Thrown when there was an error generating or retrieving a PKCE keypair
 */
export class MissingPKCEError extends StytchSDKError {
  constructor() {
    super('MissingPKCEError', 'Make sure this flow is completed on the same device on which it was started.');
  }
}

/**
 * Thrown when a native OAuth flow is missing the id_token
 */
export class MissingAuthorizationCredentialIDTokenError extends StytchSDKError {
  constructor() {
    super('MissingAuthorizationCredentialIDTokenError', 'The authorization credential is missing an ID token.');
  }
}

/**
 * Thrown when a native OAuth flow returns an invalid credential
 */
export class InvalidAuthorizationCredentialError extends StytchSDKError {
  constructor() {
    super(
      'InvalidAuthorizationCredentialError',
      'The authorization credential is invalid. Verify that OAuth is set up correctly in the developer console, and call the start flow method.',
    );
  }
}

/**
 * Thrown when a Google OneTap flow is not completed successfully
 */
export class NoCredentialsPresentError extends StytchSDKError {
  constructor() {
    super('NoCredentialsPresentError', 'The user did not provide credentials for a Google OneTap attempt');
  }
}

/**
 * Thrown when a public key was not found
 */
export class MissingPublicKeyError extends StytchSDKError {
  constructor() {
    super('MissingPublicKeyError', 'Failed to retrieve the public key. Add a new biometric registration.');
  }
}

/**
 * Thrown when the challenge string failed to be signed
 */
export class ChallengeSigningFailedError extends StytchSDKError {
  constructor() {
    super('ChallengeSigningFailedError', 'Failed to sign the challenge with the key.');
  }
}

/**
 * Thrown when the SDK has not been configured
 */
export class SDKNotConfiguredError extends StytchSDKError {
  constructor() {
    super(
      'SDKNotConfiguredError',
      'Stytch client is not confiured. You must call the configure method before using the SDK',
    );
  }
}

/**
 * Thrown when the code challenge failed to be generated
 */
export class FailedCodeChallengeError extends StytchSDKError {
  constructor() {
    super('FailedCodeChallengeError', 'Failed to create a code challenge');
  }
}

/**
 * Thrown when Passkeys are unsupported on a device
 */
export class PasskeysUnsupportedError extends StytchSDKError {
  constructor() {
    super('PasskeysUnsupportedError', 'Passkeys are not supported on this device');
  }
}

/**
 * Thrown when user data failed to be decrypted
 */
export class FailedToDecryptDataError extends StytchSDKError {
  constructor() {
    super('FailedToDecryptDataError', 'Failed to decrypt user data');
  }
}

/**
 * Thrown when Biometrics failed
 */
export class BiometricsFailedError extends StytchSDKError {
  constructor() {
    super('BiometricsFailedError', 'Biometric authentication failed');
  }
}

/**
 * Thrown when a start URL was invalid
 */
export class InvalidStartUrlError extends StytchSDKError {
  constructor() {
    super('InvalidStartUrlError', 'The start URL was invalid or improperly formatted.');
  }
}

/**
 * Thrown when a redirect url was invalid
 */
export class InvalidRedirectSchemeError extends StytchSDKError {
  constructor() {
    super(
      'InvalidRedirectSchemeError',
      'The scheme from the given redirect urls was invalid. Possible reasons include: nil scheme, non-custom scheme (using http or https), or differing schemes for login/signup urls.',
    );
  }
}

/**
 * Thrown when the underlying web authentication service failed to return a URL.
 */
export class MissingUrlError extends StytchSDKError {
  constructor() {
    super('MissingUrlError', 'The underlying web authentication service failed to return a URL.');
  }
}

/**
 * Thrown when the public key credential type was not of the expected type.
 */
export class InvalidCredentialTypeError extends StytchSDKError {
  constructor() {
    super('InvalidCredentialTypeError', 'The public key credential type was not of the expected type.');
  }
}

/**
 * Thrown when the public key credential is missing the attestation object
 */
export class MissingAttestationObjectError extends StytchSDKError {
  constructor() {
    super('MissingAttestationObjectError', 'The public key credential is missing the attestation object.');
  }
}

/**
 * Thrown when we received JSON data that could not be converted to a string
 */
export class JSONDataNotConvertibleToStringError extends StytchSDKError {
  constructor() {
    super('JSONDataNotConvertibleToStringError', 'JSON data unable to be converted to String type.');
  }
}

/**
 * Thrown when RNG fails
 */
export class RandomNumberGenerationFailed extends StytchSDKError {
  constructor() {
    super('RandomNumberGenerationFailed', 'Random number generation failed');
  }
}

/**
 * Thrown when there was an invalid encoding used for a Passkeys request
 */
export class PasskeysInvalidEncoding extends StytchSDKError {
  constructor() {
    super('PasskeysInvalidEncoding', 'Invalid passkey encoding');
  }
}

/**
 * Thrown when Passkeys support is misconfigured
 */
export class PasskeysMisconfigured extends StytchSDKError {
  constructor() {
    super(
      'PasskeysMisconfigured',
      'Passkeys are misconfigured. Verify that you have added the correct associated domain for your application, and that the signing information is correct.',
    );
  }
}

/**
 * Thrown when there was an invalid encoding used for a Passkeys request
 */
export class SignInWithAppleMisconfigured extends StytchSDKError {
  constructor() {
    super(
      'SignInWithAppleMisconfigured',
      'Sign In With Apple is misconfigured. Verify that you have correctly configured Apple OAuth in the Stytch Dashboard and added the Sign In With Apple capability to your project.',
    );
  }
}

export class MissingCipherIv extends StytchSDKError {
  constructor() {
    super(
      'MissingCipherIv',
      'The expected cipher Iv was not found when attempting to decrypt an existing biometric key.',
    );
  }
}

export class InvalidPrivateKeyLength extends StytchSDKError {
  constructor() {
    super('InvalidPrivateKeyLength', `The private key was of an incorrect length.`);
  }
}

export class BiometricRegistrationIdIsNullOrBlank extends StytchSDKError {
  constructor() {
    super(
      'BiometricRegistrationIdIsNullOrBlank',
      'Attempted to set a blank or null biometric registration ID. This is not allowed, and indicates no registration was created on the server. Consider deleting any local keys that may have been generated.',
    );
  }
}

export class DFPNotConfigured extends StytchSDKError {
  constructor() {
    super(
      'DFPNotConfigured',
      'You have attempted to retrieve a telemetry ID before the DFP client has been configured.',
    );
  }
}

/**
 * Thrown when a client attempts to start an OAuth flow but does not pass all required fields
 */
export class IDPOAuthFlowMissingParamError extends StytchSDKError {
  constructor(details: string) {
    super('IDPOAuthFlowMissingParamError', details);
  }
}

export function errorToStytchError(error: any): StytchSDKError {
  if (error instanceof StytchSDKError) return error;

  switch (error.message) {
    case 'no_current_session':
      return new NoCurrentSessionError();
    case 'no_biometrics_registration':
      return new NoBiometricsRegistrationError();
    case 'biometrics_unavailable':
      return new BiometricsUnavailableError();
    case 'key_invalidated':
      return new KeyInvalidatedError();
    case 'device_hardware_error':
      return new BiometricsUnavailableError();
    case 'biometrics_not_available':
      return new BiometricsUnavailableError();
    case 'no_biometrics_enrolled':
      return new NoBiometricsEnrolledError();
    case 'keystore_unavailable':
      return new KeystoreUnavailableError();
    case 'no_biometric_key':
      return new KeyInvalidatedError();
    case 'device_credentials_not_allowed':
      return new DeviceCredentialsNotAllowedError();
    case 'user_cancellation':
      return new UserCancellationError();
    case 'user_locked_out':
      return new UserLockedOutError();
    case 'google_onetap_missing_id_token':
      return new MissingAuthorizationCredentialIDTokenError();
    case 'google_onetap_missing_member':
      return new InvalidAuthorizationCredentialError();
    case 'oauth_apple_missing_id_token':
      return new MissingAuthorizationCredentialIDTokenError();
    case 'oauth_apple_credential_invalid':
      return new InvalidAuthorizationCredentialError();
    case 'missing_public_key':
      return new MissingPublicKeyError();
    case 'challenge_signing_failed':
      return new ChallengeSigningFailedError();
    case 'missing_authorization_credential_id_token':
      return new MissingAuthorizationCredentialIDTokenError();
    case 'invalid_authorization_credential':
      return new InvalidAuthorizationCredentialError();
    case 'no_credentials_present':
      return new NoCredentialsPresentError();
    case 'sdk_not_configured':
      return new SDKNotConfiguredError();
    case 'failed_code_challenge':
      return new FailedCodeChallengeError();
    case 'passkeys_unsupported':
      return new PasskeysUnsupportedError();
    case 'failed_to_decrypt_data':
      return new FailedToDecryptDataError();
    case 'biometrics_failed':
      return new BiometricsFailedError();
    case 'invalid_start_url':
      return new InvalidStartUrlError();
    case 'invalid_redirect_scheme':
      return new InvalidRedirectSchemeError();
    case 'missing_url':
      return new MissingUrlError();
    case 'invalid_credential_type':
      return new InvalidCredentialTypeError();
    case 'missing_attestation_object':
      return new MissingAttestationObjectError();
    case 'json_data_not_convertible_to_string':
      return new JSONDataNotConvertibleToStringError();
    case 'random_number_generation_failed':
      return new RandomNumberGenerationFailed();
    case 'passkeys_invalid_encoding':
      return new PasskeysInvalidEncoding();
    case 'passkeys_misconfigured':
      return new PasskeysMisconfigured();
    case 'signinwithapple_misconfigured':
      return new SignInWithAppleMisconfigured();
    case 'missing_cipher_iv':
      return new MissingCipherIv();
    case 'invalid_private_key_length':
      return new InvalidPrivateKeyLength();
    case 'biometric_registration_id_is_null_or_blank':
      return new BiometricRegistrationIdIsNullOrBlank();
    case 'dfp_not_configured':
      return new DFPNotConfigured();
    default:
      return new InternalError(error);
  }
}
