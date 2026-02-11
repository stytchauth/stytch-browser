import Foundation

/// Error class representing an error within the Stytch SDK.
@objc public class StytchSDKError: NSError {
    @objc public let message: ErrorType
    
    @objc public init(message: ErrorType) {
        self.message = message
        var userInfo: [String: Any] = [:]
        super.init(domain: "StytchSDKError", code: message.rawValue, userInfo: [NSLocalizedDescriptionKey: userInfo])
        userInfo[NSLocalizedDescriptionKey] = toNSString()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented. StytchSDKError instances should not be encoded or decoded.")
    }
    
    @objc public enum ErrorType: Int {
        case missingPKCE
        case passkeysUnsupported
        case randomNumberGenerationFailed
        case oauthAppleCredentialInvalid
        case oauthAppleMissingIdToken
        case passkeysInvalidEncoding
        case passkeysMissingAttestationObject
        case jsonDataNotConvertibleToString
        case passkeysInvalidCredentialType
        case noBiometricsRegistration
        case deviceCredentialsNotAllowed
        case biometricsUnavailable
        case missingPublicKey
        case userCancellation
        case userLockedOut
        case noBiometricsEnrolled
        case passkeysMisconfigured
        case signInWithAppleMisconfigured
        case biometricRegistrationIdIsNullOrBlank
        case dfpNotConfigured
    }
    
    @objc public func toNSString() -> NSString {
        switch (message) {
        case .missingPKCE:
            return "missing_pkce";
        case .passkeysUnsupported:
            return "passkeys_unsupported";
        case .randomNumberGenerationFailed:
            return "random_number_generation_failed";
        case .oauthAppleCredentialInvalid:
            return "oauth_apple_credential_invalid";
        case .oauthAppleMissingIdToken:
            return "oauth_apple_missing_id_token";
        case .passkeysInvalidEncoding:
            return "passkeys_invalid_encoding";
        case .passkeysMissingAttestationObject:
            return "passkeys_missing_attestation_object";
        case .jsonDataNotConvertibleToString:
            return "json_data_not_convertible_to_string";
        case .passkeysInvalidCredentialType:
            return "passkeys_invalid_credential_type";
        case .noBiometricsRegistration:
            return "no_biometrics_registration";
        case .deviceCredentialsNotAllowed:
            return "device_credentials_not_allowed";
        case .biometricsUnavailable:
            return "biometrics_unavailable";
        case .missingPublicKey:
            return "missing_public_key";
        case .userCancellation:
            return "user_cancellation";
        case .userLockedOut:
            return "user_locked_out";
        case .noBiometricsEnrolled:
            return "no_biometrics_enrolled";
        case .passkeysMisconfigured:
            return "passkeys_misconfigured"
        case .signInWithAppleMisconfigured:
            return "signinwithapple_misconfigured"
        case .biometricRegistrationIdIsNullOrBlank:
            return "biometric_registration_id_is_null_or_blank"
        case .dfpNotConfigured:
            return "dfp_not_configured"
        }
    }
}
