import Foundation
import XCTest
import RecaptchaEnterprise
@testable import StytchReactNativeModule

class RecaptchaSuccessMock: RecaptchaProtocol {
    func getClient(withSiteKey siteKey: String) async throws -> RecaptchaClientProtocol {
        return RecaptchaClientSuccessMock()
    }
}

class RecaptchaFailureMock: RecaptchaProtocol {
    func getClient(withSiteKey siteKey: String) async throws -> RecaptchaClientProtocol {
        throw RecaptchaErrorMock()
    }
}

class RecaptchaFailureMock2: RecaptchaProtocol {
    func getClient(withSiteKey siteKey: String) async throws -> RecaptchaClientProtocol {
        return RecaptchaClientFailureMock()
    }
}

class RecaptchaClientSuccessMock: RecaptchaClientProtocol {
    func execute(withAction action: RecaptchaAction) async throws -> String {
        return "mock_token"
    }
}

class RecaptchaClientFailureMock: RecaptchaClientProtocol {
    func execute(withAction action: RecaptchaAction) async throws -> String {
        throw RecaptchaErrorMock()
    }
}

struct RecaptchaErrorMock: Error {}

class CAPTCHATests: XCTestCase {
    var captcha: CAPTCHA!
        
        override func setUp() {
            super.setUp()
        }
        
        override func tearDown() {
            captcha = nil
            super.tearDown()
        }
        
        func testInitializeRecaptcha_Success() async throws {
            captcha = CAPTCHA(recaptcha: RecaptchaSuccessMock())
            try await captcha.initializeRecaptcha(siteKey: "mock_site_key")
            XCTAssertNotNil(captcha.recaptchaClient)
        }
        
        func testInitializeRecaptchaThrowsError() async {
            captcha = CAPTCHA(recaptcha: RecaptchaFailureMock())
            let expectation = expectation(description: "initializeRecaptcha should throw error")
            
            do {
                try await captcha.initializeRecaptcha(siteKey: "mock_site_key")
            } catch {
                expectation.fulfill()
            }
            
            await fulfillment(of: [expectation], timeout: 10)
        }
    
        func testExecuteRecaptcha_Success() async throws {
            captcha = CAPTCHA(recaptcha: RecaptchaSuccessMock())
            try await captcha.initializeRecaptcha(siteKey: "mock_site_key")
            
            let token = try await captcha.executeRecaptcha()
            
            XCTAssertTrue(token == "mock_token")
        }
        
        func testExecuteRecaptcha_Failure() async throws {
            captcha = CAPTCHA(recaptcha: RecaptchaFailureMock2())
            try await captcha.initializeRecaptcha(siteKey: "mock_site_key")
            
            let expectation = expectation(description: "executeRecaptcha should throw error")
            
            do {
                let token = try await captcha.executeRecaptcha()
            } catch {
                expectation.fulfill()
            }
            
            await fulfillment(of: [expectation], timeout: 10)
        }
}
