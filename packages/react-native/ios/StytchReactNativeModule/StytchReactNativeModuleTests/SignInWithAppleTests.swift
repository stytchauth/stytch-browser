import AuthenticationServices
import CryptoKit
import XCTest
@testable import StytchReactNativeModule

class SignInWithAppleTests: XCTestCase {
    class MockProvider: NSObject, SignInWithAppleProvider {
        var generateNonceCalled = false
        var generateNonceValue: String?
        var createRequestCalled = false
        var createRequestValue: Any?
        var performRequestsCalled = false
        var performRequestsValue: SignInWithAppleResponse?

        func generateNonce() throws -> String {
            generateNonceCalled = true
            generateNonceValue = "mock-nonce"
            return generateNonceValue!
        }

        func createRequest(nonce: String) {
            createRequestCalled = true
        }

        func performRequests() async throws -> SignInWithAppleResponse {
            performRequestsCalled = true
            let mockName = try PersonNameComponents("Mock Name")
            performRequestsValue = SignInWithAppleResponse(idToken: "mock-token", name: .init(mockName), nonce: "mock-nonce")
            return performRequestsValue!
        }
    }

    func testStartMethodSuccess() async throws {
        let mockProvider = MockProvider()
        let signInWithApple = SignInWithApple(provider: mockProvider)

        _ = try await signInWithApple.start()

        XCTAssertTrue(mockProvider.generateNonceCalled)
        XCTAssertTrue(mockProvider.generateNonceValue == "mock-nonce")
        XCTAssertTrue(mockProvider.createRequestCalled)
        XCTAssertTrue(mockProvider.createRequestValue == nil)
        XCTAssertTrue(mockProvider.performRequestsCalled)
        XCTAssertTrue(((mockProvider.performRequestsValue?.isEqual(
            SignInWithAppleResponse(idToken: "mock-token", name: .init(try PersonNameComponents("Mock Name")), nonce: "mock-nonce")
        )) != nil))
    }
}
