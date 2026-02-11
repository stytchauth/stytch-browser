import AuthenticationServices
import CryptoKit

@objc protocol SignInWithAppleProvider: ASAuthorizationControllerDelegate {
    func generateNonce() throws -> String
    func createRequest(nonce: String)
    func performRequests() async throws -> SignInWithAppleResponse
}

@objc public final class SignInWithApple: NSObject {
    let provider: SignInWithAppleProvider

    init(provider: SignInWithAppleProvider) {
        self.provider = provider
    }

    @objc public convenience override init() {
        self.init(provider: DefaultProvider())
    }

    @objc public func start() async throws -> SignInWithAppleResponse {
        let nonce = try provider.generateNonce()
        do {
            provider.createRequest(nonce: nonce)
            return try await provider.performRequests()
        } catch {
            throw StytchSDKError(message: .signInWithAppleMisconfigured)
        }
    }

    class DefaultProvider: NSObject, SignInWithAppleProvider {
        var controller: ASAuthorizationController?
        var delegate: SignInWithApple.Delegate?

        func generateNonce() throws -> String {
            try randomBytes(count: 32).toHexString()
        }

        func createRequest(nonce: String) {
            let provider: ASAuthorizationAppleIDProvider = .init()
            let request = provider.createRequest()
            request.requestedScopes = [.email, .fullName]
            request.nonce = Data(SHA256.hash(data: Data(nonce.utf8))).base64EncodedString()
            controller = ASAuthorizationController(authorizationRequests: [request])
            delegate = .init(nonce: nonce)
            controller?.delegate = delegate
        }

        func performRequests() async throws -> SignInWithAppleResponse {
            return try await withCheckedThrowingContinuation { continuation in
                delegate?.continuation = continuation
                controller?.performRequests()
            }
        }

        private func randomBytes(count: Int) throws -> [UInt8] {
            var buffer = [UInt8](repeating: 0, count: Int(count))

            guard SecRandomCopyBytes(kSecRandomDefault, buffer.count, &buffer) == errSecSuccess else {
                throw StytchSDKError(message: .randomNumberGenerationFailed)
            }

            return .init(buffer)
        }
    }
}

@objc public final class SignInWithAppleResponse: NSObject {
    @objc public let idToken: String
    @objc public let name: Name?
    @objc public let nonce: String

    init(idToken: String, name: Name?, nonce: String) {
        self.idToken = idToken
        self.name = name
        self.nonce = nonce
    }
}

@objc public final class Name: NSObject {
    @objc public let firstName: String?
    @objc public let lastName: String?

    init(_ components: PersonNameComponents?) {
        self.firstName = components?.givenName
        self.lastName = components?.familyName
    }
}

extension SignInWithApple {
    final class Delegate: NSObject, ASAuthorizationControllerDelegate {
        var continuation: CheckedContinuation<SignInWithAppleResponse, Error>?
        private let nonce: String

        init(nonce: String) {
            self.nonce = nonce
        }

        func authorizationController(controller _: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
            guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential else {
                continuation?.resume(throwing: StytchSDKError(message: .oauthAppleCredentialInvalid))
                return
            }
            guard let idToken = credential.identityToken, let token = String(data: idToken, encoding: .utf8) else {
                continuation?.resume(throwing: StytchSDKError(message: .oauthAppleMissingIdToken))
                return
            }

            var fullName: Name? = nil

            if let credentialFullName = credential.fullName {
                fullName = .init(credentialFullName)
            }

            continuation?.resume(returning: .init(idToken: token, name: fullName, nonce: nonce))
        }

        func authorizationController(controller _: ASAuthorizationController, didCompleteWithError error: Error) {
            continuation?.resume(throwing: error)
        }
    }
}

private extension Sequence where Element: CVarArg {
    func toHexString() -> String {
        reduce(into: "") { $0 += String(format: "%02x", $1) }
    }
}
