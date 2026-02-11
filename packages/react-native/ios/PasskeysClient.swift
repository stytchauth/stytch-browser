import Foundation
import AuthenticationServices

@objc public class PasskeysClientInterface: NSObject {
    @objc public func register(
        publicKeyCredentialOptions: String
    ) async throws -> String {""}

    @objc public func authenticate(
        publicKeyCredentialOptions: String
    ) async throws -> String {""}
}

@objc public enum RequestBehavior: Int {
    /// Prefer credentials that are immediately available on the local device.
    case preferImmediatelyAvailableCredentials
    /// When a user selects a textfield with the `.username` textContentType, an existing local passkey will be suggested to the user.
    case autoFill
    /// Credentials that are on nearby devices can be used.
    case includeNearbyAvailableCredentials

    /// The RequestBehavior parameter's default value for this platform
    public static let defaultPlatformValue: RequestBehavior = .includeNearbyAvailableCredentials
}

@objc public protocol PasskeysProvider {
    @available(iOS 16.0, *)
    func registerCredential(
        domain: String,
        challenge: Data,
        username: String,
        userId: String
    ) async throws -> ASAuthorizationPublicKeyCredentialRegistration

    @available(iOS 16.0, *)
    func assertCredential(
        domain: String,
        challenge: Data,
        requestBehavior: RequestBehavior
    ) async throws -> ASAuthorizationPublicKeyCredentialAssertion
}

@objc public final class ASPasskeysProvider: NSObject, PasskeysProvider {
    @available(iOS 16.0, *)
    public func registerCredential(
        domain: String,
        challenge: Data,
        username: String,
        userId: String
    ) async throws -> ASAuthorizationPublicKeyCredentialRegistration {
        let platformProvider: ASAuthorizationPlatformPublicKeyCredentialProvider = .init(relyingPartyIdentifier: domain)

        let request = platformProvider.createCredentialRegistrationRequest(
            challenge: challenge,
            name: username,
            userID: .init(userId.utf8) // WebAuthN backend currently relies on session auth, so isn't a pending user id
        )
        let controller = ASAuthorizationController(authorizationRequests: [request])
        let delegate = PasskeysDelegate()
        controller.delegate = delegate

        let credential: ASAuthorizationCredential = try await withCheckedThrowingContinuation { continuation in
            delegate.continuation = continuation
            controller.performRequests()
        }

        guard
            let credential = credential as? ASAuthorizationPublicKeyCredentialRegistration
        else {
            throw StytchSDKError(message: .passkeysInvalidCredentialType)
        }

        return credential
    }

    @available(iOS 16.0, *)
    public func assertCredential(
        domain: String,
        challenge: Data,
        requestBehavior: RequestBehavior = RequestBehavior.defaultPlatformValue
    ) async throws -> ASAuthorizationPublicKeyCredentialAssertion {
        let platformProvider: ASAuthorizationPlatformPublicKeyCredentialProvider = .init(relyingPartyIdentifier: domain)

        let request = platformProvider.createCredentialAssertionRequest(challenge: challenge)

        let controller = ASAuthorizationController(authorizationRequests: [request])
        let delegate = PasskeysDelegate()
        controller.delegate = delegate

        let credential: ASAuthorizationCredential = try await withCheckedThrowingContinuation { continuation in
            delegate.continuation = continuation
            switch requestBehavior {
                case .autoFill:
                    controller.performAutoFillAssistedRequests()
                case .preferImmediatelyAvailableCredentials:
                    controller.performRequests(options: .preferImmediatelyAvailableCredentials)
                case .includeNearbyAvailableCredentials:
                    controller.performRequests()
            }
        }

        guard
            let credential = credential as? ASAuthorizationPublicKeyCredentialAssertion
        else {
            throw StytchSDKError(message: .passkeysInvalidCredentialType)
        }

        return credential
    }
}

@objc public final class PasskeysClient: PasskeysClientInterface {
    
    let passkeysProvider: PasskeysProvider
    
    @objc public init(passkeysProvider: PasskeysProvider = ASPasskeysProvider()) {
        self.passkeysProvider = passkeysProvider
    }
    
    @objc override public func register(
        publicKeyCredentialOptions: String
    ) async throws -> String {
        if #available(iOS 16.0, *) {
            let options = try JSONDecoder().decode(
                PublicKeyCredentialCreationOptions.self,
                from: publicKeyCredentialOptions.data(using: .utf8)!
            )
            guard
                let challenge: Data = .init(base64UrlEncoded: options.challenge)
            else {
                throw StytchSDKError(message: .passkeysInvalidEncoding)
            }
            
            let credential: ASAuthorizationPublicKeyCredentialRegistration
            do {
                credential = try await passkeysProvider.registerCredential(
                    domain: options.rp.id,
                    challenge: challenge,
                    username: options.user.displayName,
                    userId: options.user.id
                )
            } catch {
                throw StytchSDKError(message: .passkeysMisconfigured)
            }
            guard
                let attestationObject = credential.rawAttestationObject
            else {
                throw StytchSDKError(message: .passkeysMissingAttestationObject)
            }
            
            let publicCredentials = PasskeysCredential<AttestationResponse>(
                id: credential.credentialID,
                rawId: credential.credentialID,
                response: .init(
                    clientDataJSON: credential.rawClientDataJSON,
                    attestationObject: attestationObject
                )
            )
            return try publicCredentials.asJson(encoder: .init())
        }
        throw StytchSDKError(message: .passkeysUnsupported)
    }
        
    @objc override public func authenticate(
        publicKeyCredentialOptions: String
    ) async throws -> String {
        if #available(iOS 16.0, *) {
            let options = try JSONDecoder().decode(
                PublicKeyCredentialRequestOptions.self,
                from: publicKeyCredentialOptions.data(using: .utf8)!
            )
            guard
                let challenge: Data = .init(base64UrlEncoded: options.challenge)
            else {
                throw StytchSDKError(message: .passkeysInvalidEncoding)
            }
            let credential: ASAuthorizationPublicKeyCredentialAssertion
            do {
                credential = try await passkeysProvider.assertCredential(
                    domain: options.rpId,
                    challenge: challenge,
                    requestBehavior: RequestBehavior.defaultPlatformValue
                )
            } catch {
                throw StytchSDKError(message: .passkeysMisconfigured)
            }
            
            let publicCredentials = PasskeysCredential<AssertionResponse>(
                id: credential.credentialID,
                rawId: credential.credentialID,
                response: .init(
                    clientDataJSON: credential.rawClientDataJSON,
                    authenticatorData: credential.rawAuthenticatorData,
                    signature: credential.signature,
                    userHandle: credential.userID
                )
            )
            
            return try publicCredentials.asJson(encoder: .init())
        }
        throw StytchSDKError(message: .passkeysUnsupported)
    }
}
    
internal struct PasskeysCredential<Response: CredentialResponse>: Encodable {
    private enum CodingKeys: CodingKey {
        case type
        case id
        case rawId
        case response
    }
    
    let type: String = "public-key"
    let id: Data
    let rawId: Data
    let response: Response
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(type, forKey: .type)
        try container.encode(id.base64UrlEncoded(), forKey: .id)
        try container.encode(rawId.base64UrlEncoded(), forKey: .rawId)
        try container.encode(response, forKey: .response)
    }
    
    func wrapped() throws -> CredentialContainer {
        .init(publicKeyCredential: try asJson(encoder: .init()))
    }
    
    struct CredentialContainer: Encodable {
        let publicKeyCredential: String
    }
}

internal struct AttestationResponse: CredentialResponse {
    let clientDataJSON: Data
    let attestationObject: Data
    
    private enum CodingKeys: CodingKey {
        case clientDataJSON
        case attestationObject
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(clientDataJSON.base64UrlEncoded(), forKey: .clientDataJSON)
        try container.encode(attestationObject.base64UrlEncoded(), forKey: .attestationObject)
    }
}

internal struct AssertionResponse: CredentialResponse {
    let clientDataJSON: Data
    let authenticatorData: Data
    let signature: Data
    let userHandle: Data
    
    private enum CodingKeys: CodingKey {
        case clientDataJSON
        case authenticatorData
        case signature
        case userHandle
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(clientDataJSON.base64UrlEncoded(), forKey: .clientDataJSON)
        try container.encode(authenticatorData.base64UrlEncoded(), forKey: .authenticatorData)
        try container.encode(signature.base64UrlEncoded(), forKey: .signature)
        try container.encode(userHandle.base64UrlEncoded(), forKey: .userHandle)
    }
}

final class PasskeysDelegate: NSObject, ASAuthorizationControllerDelegate {
    var continuation: CheckedContinuation<ASAuthorizationCredential, Error>?
    
    func authorizationController(
        controller _: ASAuthorizationController,
        didCompleteWithAuthorization authorization: ASAuthorization
    ) {
        continuation?.resume(returning: authorization.credential)
    }
    
    func authorizationController(
        controller _: ASAuthorizationController,
        didCompleteWithError error: Error
    ) {
        continuation?.resume(throwing: error)
    }
}

internal protocol CredentialResponse: Encodable {}

extension Encodable {
    func base64EncodedString(encoder: JSONEncoder) throws -> String {
        (try encoder.encode(self)).base64EncodedString()
    }
    
    func asJson(encoder: JSONEncoder) throws -> String {
        guard let jsonString = String(data: try encoder.encode(self), encoding: .utf8) else {
            throw StytchSDKError(message: .jsonDataNotConvertibleToString)
        }
        return jsonString
    }
}

struct PublicKeyCredentialCreationOptions: Decodable {
    let rp: RP
    let challenge: String
    let user: User
    
    struct RP: Decodable {
        let id: String
        let name: String
    }
    
    struct User: Decodable {
        let displayName: String
        let id: String
    }
}

struct PublicKeyCredentialRequestOptions: Decodable {
    let rpId: String
    let challenge: String
}
