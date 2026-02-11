//
//  PasskeysClientTests.swift
//  StytchReactNativeModuleTests
//
//  Created by Jordan Haven on 11/3/23.
//
import Foundation
import XCTest
import AuthenticationServices
@testable import StytchReactNativeModule

internal protocol PublicKeyCredentialRegistration {
    func getCredential() -> PasskeysCredential<AttestationResponse>
}

internal protocol PublicKeyCredentialAssertion {
    func getCredential() -> PasskeysCredential<AssertionResponse>
}

internal class MockPublicKeyCredentialRegistration : NSObject, ASAuthorizationPublicKeyCredentialRegistration, PublicKeyCredentialRegistration {
    var rawAttestationObject: Data?
    var rawClientDataJSON: Data
    var credentialID: Data
    func copy(with zone: NSZone? = nil) -> Any {
        return self
    }
    static var supportsSecureCoding: Bool = true
    func encode(with coder: NSCoder) {}
    required init?(coder: NSCoder) {
        self.rawAttestationObject = Data("rawAttestationObject".utf8)
        self.rawClientDataJSON = Data("rawClientDataJSON".utf8)
        self.credentialID = Data("credentialID".utf8)
    }
    func getCredential() -> PasskeysCredential<AttestationResponse> {
        return PasskeysCredential<AttestationResponse>(
            id: credentialID,
            rawId: credentialID,
            response: .init(
                clientDataJSON: rawClientDataJSON,
                attestationObject: rawAttestationObject!
            )
        )
    }
}

internal class MockPublicKeyCredentialAssertion : NSObject, ASAuthorizationPublicKeyCredentialAssertion, PublicKeyCredentialAssertion {
    var rawAuthenticatorData: Data!
    var userID: Data!
    var signature: Data!
    var rawClientDataJSON: Data
    var credentialID: Data
    func copy(with zone: NSZone? = nil) -> Any {
        return self
    }
    static var supportsSecureCoding: Bool = true
    func encode(with coder: NSCoder) {}
    required init?(coder: NSCoder) {
        self.rawAuthenticatorData = Data("rawAuthenticatorData".utf8)
        self.userID = Data("userID".utf8)
        self.signature = Data("signature".utf8)
        self.rawClientDataJSON = Data("rawClientDataJSON".utf8)
        self.credentialID = Data("credentialID".utf8)
    }
    func getCredential() -> PasskeysCredential<AssertionResponse> {
        PasskeysCredential<AssertionResponse>(
            id: credentialID,
            rawId: credentialID,
            response: .init(
                clientDataJSON: rawClientDataJSON,
                authenticatorData: rawAuthenticatorData,
                signature: signature,
                userHandle: userID
            )
        )
    }
}

internal class MockCoder : NSCoder {}

let MOCK_PASSKEY_CREATION_JSON = """
{
  "challenge": "c29tZS1jaGFsbGVuZ2Utc3RyaW5n",
  "rp": {
    "name": "Some application name",
    "id": "some.domain.com"
  },
  "user": {
    "id": "some-user-id",
    "name": "Some User Name",
    "displayName": "Some User Display Name"
  },
  "pubKeyCredParams": [
    {
      "type": "public-key",
      "alg": -7
    },
    {
      "type": "public-key",
      "alg": -257
    }
  ],
  "timeout": 1800000,
  "attestation": "none",
  "excludeCredentials": [],
  "authenticatorSelection": {
    "authenticatorAttachment": "platform",
    "requireResidentKey": true,
    "residentKey": "required",
    "userVerification": "required"
  }
}
""";

let MOCK_PASSKEY_RETRIEVE_JSON = """
{
    "rpId": "some.domain.com",
    "challenge": "c29tZS1jaGFsbGVuZ2Utc3RyaW5n"
}
""";

final class PasskeysClientTests: XCTestCase {
    func test_Register_delegatesToPasskeysProvider() async throws {
        class MockPasskeysProvider: PasskeysProvider {
            var didRegisterCredential = false
            var didAssertCredential = false
            func registerCredential(domain: String, challenge: Data, username: String, userId: String) async throws -> ASAuthorizationPublicKeyCredentialRegistration {
                didRegisterCredential = true
                return MockPublicKeyCredentialRegistration(coder: MockCoder())!
            }
            
            func assertCredential(domain: String, challenge: Data, requestBehavior: RequestBehavior) async throws -> ASAuthorizationPublicKeyCredentialAssertion {
                didAssertCredential = true
                return MockPublicKeyCredentialAssertion(coder: MockCoder())!
            }
        }
        let mockPasskeysProvider = MockPasskeysProvider()
        let passkeysClient: PasskeysClientInterface = PasskeysClient(passkeysProvider: mockPasskeysProvider)
        _ = try await passkeysClient.register(publicKeyCredentialOptions: MOCK_PASSKEY_CREATION_JSON)
        XCTAssert(mockPasskeysProvider.didRegisterCredential == true)
        XCTAssert(mockPasskeysProvider.didAssertCredential == false)
    }

    func test_Register_throwsIfMissingAttestationObject() async throws {
        class MockPasskeysProvider: PasskeysProvider {
            func registerCredential(domain: String, challenge: Data, username: String, userId: String) async throws -> ASAuthorizationPublicKeyCredentialRegistration {
                let registration = MockPublicKeyCredentialRegistration(coder: MockCoder())!
                registration.rawAttestationObject = nil
                return registration
            }
            
            func assertCredential(domain: String, challenge: Data, requestBehavior: RequestBehavior) async throws -> ASAuthorizationPublicKeyCredentialAssertion {
                return MockPublicKeyCredentialAssertion(coder: MockCoder())!
            }
        }
        let mockPasskeysProvider = MockPasskeysProvider()
        let passkeysClient: PasskeysClientInterface = PasskeysClient(passkeysProvider: mockPasskeysProvider)
        var error: Error?
        do {
            _ = try await passkeysClient.register(publicKeyCredentialOptions: MOCK_PASSKEY_CREATION_JSON)
        } catch let exception {
            error = exception
        }
        XCTAssert((error as! StytchSDKError).toNSString() == "passkeys_missing_attestation_object")
    }

    func test_Register_encodesTheExpectedJSONString() async throws {
        class MockPasskeysProvider: PasskeysProvider {
            func registerCredential(domain: String, challenge: Data, username: String, userId: String) async throws -> ASAuthorizationPublicKeyCredentialRegistration {
                return MockPublicKeyCredentialRegistration(coder: MockCoder())!
            }
            
            func assertCredential(domain: String, challenge: Data, requestBehavior: RequestBehavior) async throws -> ASAuthorizationPublicKeyCredentialAssertion {
                return MockPublicKeyCredentialAssertion(coder: MockCoder())!
            }
        }
        let mockPasskeysProvider = MockPasskeysProvider()
        let passkeysClient: PasskeysClientInterface = PasskeysClient(passkeysProvider: mockPasskeysProvider)
        let expectedCredential = try MockPublicKeyCredentialRegistration(coder: MockCoder())!.getCredential().asJson(encoder: .init())
        let expectedCredentialJSON = try JSONDecoder().decode(JSON.self, from: Data(expectedCredential.utf8))
        let registerString = try await passkeysClient.register(publicKeyCredentialOptions: MOCK_PASSKEY_CREATION_JSON)
        let registerJSON = try JSONDecoder().decode(JSON.self, from: Data(registerString.utf8))
        XCTAssertEqualJSON(registerJSON, expectedCredentialJSON)
    }

    func test_Authenticate_delegatesToPasskeysProvider() async throws {
        class MockPasskeysProvider: PasskeysProvider {
            var didRegisterCredential = false
            var didAssertCredential = false
            func registerCredential(domain: String, challenge: Data, username: String, userId: String) async throws -> ASAuthorizationPublicKeyCredentialRegistration {
                didRegisterCredential = true
                return MockPublicKeyCredentialRegistration(coder: MockCoder())!
            }
            
            func assertCredential(domain: String, challenge: Data, requestBehavior: RequestBehavior) async throws -> ASAuthorizationPublicKeyCredentialAssertion {
                didAssertCredential = true
                return MockPublicKeyCredentialAssertion(coder: MockCoder())!
            }
        }
        let mockPasskeysProvider = MockPasskeysProvider()
        let passkeysClient: PasskeysClientInterface = PasskeysClient(passkeysProvider: mockPasskeysProvider)
        let _ = try await passkeysClient.authenticate(publicKeyCredentialOptions: MOCK_PASSKEY_RETRIEVE_JSON)
        XCTAssert(mockPasskeysProvider.didRegisterCredential == false)
        XCTAssert(mockPasskeysProvider.didAssertCredential == true)
    }

    func test_Authtenticate_encodesTheExpectedJSONString() async throws {
        class MockPasskeysProvider: PasskeysProvider {
            func registerCredential(domain: String, challenge: Data, username: String, userId: String) async throws -> ASAuthorizationPublicKeyCredentialRegistration {
                return MockPublicKeyCredentialRegistration(coder: MockCoder())!
            }
            
            func assertCredential(domain: String, challenge: Data, requestBehavior: RequestBehavior) async throws -> ASAuthorizationPublicKeyCredentialAssertion {
                return MockPublicKeyCredentialAssertion(coder: MockCoder())!
            }
        }
        let mockPasskeysProvider = MockPasskeysProvider()
        let passkeysClient: PasskeysClientInterface = PasskeysClient(passkeysProvider: mockPasskeysProvider)
        let expectedCredential = try MockPublicKeyCredentialAssertion(coder: MockCoder())!.getCredential().asJson(encoder: .init())
        let expectedCredentialJSON = try JSONDecoder().decode(JSON.self, from: Data(expectedCredential.utf8))
        let authenticateString = try await passkeysClient.authenticate(publicKeyCredentialOptions: MOCK_PASSKEY_RETRIEVE_JSON)
        let authenticateJSON = try JSONDecoder().decode(JSON.self, from: Data(authenticateString.utf8))
        XCTAssertEqualJSON(authenticateJSON, expectedCredentialJSON)
    }
}
