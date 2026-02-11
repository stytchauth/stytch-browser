package com.stytch.reactnativemodules

/**
 * A base error class for all errors returned by the Stytch SDK
 */
internal sealed class StytchError(
    override val message: String,
    override val cause: Throwable? = null,
) : Exception()

// Biometrics errors
internal object NoBiometricsRegistration : StytchError("no_biometrics_registration")
internal object BiometricsUnavailable : StytchError("biometrics_unavailable")
internal object KeyInvalidated : StytchError("key_invalidated")
internal object KeystoreUnavailable : StytchError("keystore_unavailable")
internal object NoBiometricsEnrolled : StytchError("no_biometrics_enrolled")
internal object UserCancellation : StytchError("user_cancellation")
internal object UserLockedOut : StytchError("user_locked_out")
internal object DeviceCredentialsNotAllowed : StytchError("device_credentials_not_allowed")
internal object MissingPublicKey : StytchError("missing_public_key")
internal object BiometricsFailed : StytchError("biometrics_failed")
internal object MissingCipherIv: StytchError("missing_cipher_iv")
internal object InvalidPrivateKeyLength : StytchError("invalid_private_key_length")
internal object BiometricRegistrationIdIsNullOrBlank : StytchError("biometric_registration_id_is_null_or_blank")

// OAuth
internal object MissingAuthorizationCredentialIDToken : StytchError("missing_authorization_credential_id_token")
internal object InvalidAuthorizationCredential : StytchError("invalid_authorization_credential")
internal object NoCredentialsPresent: StytchError("no_credentials_present")

// Passkeys
internal object PasskeysUnsupported : StytchError("passkeys_unsupported")

// DFP
internal object DFPNotConfigured : StytchError("dfp_not_configured")