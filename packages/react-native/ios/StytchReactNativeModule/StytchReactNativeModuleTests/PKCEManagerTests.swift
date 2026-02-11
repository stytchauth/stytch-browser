import Foundation
import XCTest
@testable import StytchReactNativeModule

class MockFailingRNG: RNG {
    override func dataWithRandomBytesOfCount(byteCount: UInt) throws -> Data {
        throw PKCEManagerError.randomNumberGenerationFailed
    }
}

class MockPassingRNG: RNG {
    override func dataWithRandomBytesOfCount(byteCount: UInt) throws -> Data {
        return Data("random-number".utf8)
    }
}

final class PKCEManagerTests: XCTestCase {
    func test_generateCodeChallenge_propagatesErrors() {
        let rng = MockFailingRNG()
        let pkceManager = PKCEManager(rng: rng)
        var error: Error? = nil
        do {
            _ = try pkceManager.generateCodeChallenge()
        } catch let exception {
            error = exception
        }
        XCTAssert(error is PKCEManagerError)
    }

    func test_generateCodeChallenge_returnsAsExpected() {
        let rng = MockPassingRNG()
        let pkceManager = PKCEManager(rng: rng)
        let codeChallenge = try? pkceManager.generateCodeChallenge()
        let expected: NSDictionary = [
            "code_challenge": "WXQoepCygA3LjJwFAB4vi1NJ1pMUvqhSSm7mgOttdV4",
            "code_verifier": "72616e646f6d2d6e756d626572"
        ]
        XCTAssertTrue(codeChallenge == expected)
    }
}
