//
//  StytchReactNativeModuleTests.swift
//  StytchReactNativeModuleTests
//
//  Created by Jordan Haven on 11/2/23.
//

import XCTest
import LocalAuthentication.LAContext
@testable import StytchReactNativeModule

class StytchReactNativeModuleTests: XCTestCase {
    let module = StytchReactNativeModule()
    
    // Cache tests
    func test_setNSURLCache_setsTheDefinedCache() {
        let newCache: URLCache = .init(memoryCapacity: 0, diskCapacity: 0, directory: nil)
        module.setNSURLCache(newCache)
        XCTAssertTrue(URLCache.shared.memoryCapacity == 0)
        XCTAssertTrue(URLCache.shared.diskCapacity == 0)
    }
    // end Cache tests
    
    // Biometrics tests
    func test_getSensor_resolvesWhenSensorIsAvailable() {
        class MockLAContextAvailable: LAContext {
            override var biometryType: LABiometryType {
                .touchID
            }
            override func canEvaluatePolicy(_ policy: LAPolicy, error: NSErrorPointer) -> Bool {
                true
            }
        }
        var didResolve = false
        var didReject = false
        let expectation = XCTestExpectation(description: "Wait for promise to finish")
        var resolvedValue: [String: String]? = nil
        let resolve: RCTPromiseResolveBlock = { value in
            didResolve = true
            resolvedValue = value as? Dictionary
            expectation.fulfill()
        }
        let reject: RCTPromiseRejectBlock = { _, _, _ in
            didReject = true
            expectation.fulfill()
        }
        module.getSensor(MockLAContextAvailable(), parameters: [:], resolver: resolve, rejecter: reject)
        wait(for: [expectation], timeout: 10)
        XCTAssert(didReject == false)
        XCTAssert(didResolve == true)
        let expectedValue = ["biometryType": "TouchID"]
        XCTAssertTrue(resolvedValue == expectedValue)
    }

    func test_getSensor_rejectsWhenSensorIsUnavailable() {
        class MockLAContextUnavailable: LAContext {
            override func canEvaluatePolicy(_ policy: LAPolicy, error: NSErrorPointer) -> Bool {
                false
            }
        }
        var didResolve = false
        var didReject = false
        let expectation = XCTestExpectation(description: "Wait for promise to finish")
        let resolve: RCTPromiseResolveBlock = { _ in
            didResolve = true
            expectation.fulfill()
        }
        let reject: RCTPromiseRejectBlock = { _, _, _ in
            didReject = true
            expectation.fulfill()
        }
        module.getSensor(MockLAContextUnavailable(), parameters: [:], resolver: resolve, rejecter: reject)
        wait(for: [expectation], timeout: 10)
        XCTAssert(didReject == true)
        XCTAssert(didResolve == false)
    }
    
    // TODO: getBiometricKey(). Intentionally left blank for now as it's interacting directly with system components
    
    // TODO: createKeys(). Intentionally left blank for now as it's interacting directly with system components
    
    // TODO: deleteKeys(). Intentionally left blank for now as it's interacting directly with system components
    
    // TODO: createSignature(). Intentionally left blank for now as it's interacting directly with system components
    
    // TODO: biometricKeysExist(). Intentionally left blank for now as it's interacting directly with system components
    
    func test_isKeystoreAvailable_returnsTrue() {
        var didResolve = false
        var didReject = false
        let expectation = XCTestExpectation(description: "Wait for promise to finish")
        var resolvedValue: [String: Bool]? = nil
        let resolve: RCTPromiseResolveBlock = { value in
            didResolve = true
            resolvedValue = value as? Dictionary
            expectation.fulfill()
        }
        let reject: RCTPromiseRejectBlock = { _, _, _ in
            didReject = true
            expectation.fulfill()
        }
        module.isKeystoreAvailable(resolve, rejecter:reject)
        wait(for: [expectation], timeout: 10)
        XCTAssert(didReject == false)
        XCTAssert(didResolve == true)
        let expectedValue = ["isKeystoreAvailable": true]
        XCTAssertTrue(resolvedValue == expectedValue)
    }
    
    func test_getBiometricKeyService_returnsExpected() {
        XCTAssertTrue(module.getBiometricKeyService() == "com.stytchrnbiometrics.biometricKey")
    }
    
    func test_getBiometricRegistrationIdKeyName_returnsExpected() {
        XCTAssertTrue(module.getBiometricRegistrationIdKeyName() == "com.stytchrnbiometrics.biometricRegistrationId")
    }
    
    func test_getAllowDeviceCredentialsKeyName_returnsExpected() {
        XCTAssertTrue(module.getAllowDeviceCredentialsKeyName() == "com.stytchrnbiometrics.allowDeviceCredentials")
    }

    // TODO: doesBiometricKeyExist(). Intentionally left blank for now as it's interacting directly with system components

    // TODO: deleteBiometricKey(). Intentionally left blank for now as it's interacting directly with system components

    func test_getBiometryType_returnsAsExpected() {
        class FaceOnlyContext: LAContext {
            override var biometryType: LABiometryType {
                .faceID
            }
        }
        class TouchContext: LAContext {
            override var biometryType: LABiometryType {
                .touchID
            }
        }
        var result = module.getBiometryType(FaceOnlyContext())
        XCTAssertTrue(result == "FaceID")
        result = module.getBiometryType(TouchContext())
        XCTAssertTrue(result == "TouchID")
    }

    func test_keychainErrorToString_returnsExpected() {
        XCTAssertTrue(module.keychainError(toString: errSecSuccess) == "success")
        XCTAssertTrue(module.keychainError(toString: errSecDuplicateItem) == "error item already exists")
        XCTAssertTrue(module.keychainError(toString: errSecItemNotFound) == "error item not found")
        XCTAssertTrue(module.keychainError(toString: errSecAuthFailed) == "error item authentication failed")
        XCTAssertTrue(module.keychainError(toString: errSecIO) == errSecIO.description) // default, no mapping
    }

    // TODO: getBiometricRegistrationId(). Intentionally left blank for now as it's interacting directly with system components
    // end Biometrics tests

    // Sign In With Apple tests
    // TODO: signInWithAppleStart. Intentionally left blank for now as it's interacting directly with system components
    // end Sign In With Apple tests

    // TODO: resetSecureStorageOnFreshInstall. Intentionally left blank for now as it's interacting directly with system components

    // Storage tests
    class MockStorageClient: StorageClientInterface {
        override public func getData(key: String) -> String? {
            ""
        }
        override public func setData(key: String, value: String?) -> Bool {
            true
        }
        override public func migrate(publicToken: String) -> Bool {
            true
        }
        override public func didMigrate() -> Bool {
            true
        }
    }
    func test_getData_resolves() {
        let mockStorageClient = MockStorageClient()
        module.setStorageClient(mockStorageClient)
        var didResolve = false
        var didReject = false
        let expectation = XCTestExpectation(description: "Wait for promise to finish")
        let resolve: RCTPromiseResolveBlock = { _ in
            didResolve = true
            expectation.fulfill()
        }
        let reject: RCTPromiseRejectBlock = { _, _, _ in
            didReject = true
            expectation.fulfill()
        }
        module.getData("", resolver:resolve, rejecter:reject)
        wait(for: [expectation], timeout: 10)
        XCTAssert(didReject == false)
        XCTAssert(didResolve == true)
    }
    
    func test_setData_resolves() {
        let mockStorageClient = MockStorageClient()
        module.setStorageClient(mockStorageClient)
        var didResolve = false
        var didReject = false
        let expectation = XCTestExpectation(description: "Wait for promise to finish")
        let resolve: RCTPromiseResolveBlock = { _ in
            didResolve = true
            expectation.fulfill()
        }
        let reject: RCTPromiseRejectBlock = { _, _, _ in
            didReject = true
            expectation.fulfill()
        }
        module.setData("", value: "", resolver:resolve, rejecter:reject)
        wait(for: [expectation], timeout: 10)
        XCTAssert(didReject == false)
        XCTAssert(didResolve == true)
    }

    func test_clearData_resolves() {
        let mockStorageClient = MockStorageClient()
        module.setStorageClient(mockStorageClient)
        var didResolve = false
        var didReject = false
        let expectation = XCTestExpectation(description: "Wait for promise to finish")
        let resolve: RCTPromiseResolveBlock = { _ in
            didResolve = true
            expectation.fulfill()
        }
        let reject: RCTPromiseRejectBlock = { _, _, _ in
            didReject = true
            expectation.fulfill()
        }
        module.clearData("", resolver: resolve, rejecter: reject)
        wait(for: [expectation], timeout: 10)
        XCTAssert(didReject == false)
        XCTAssert(didResolve == true)
    }
    
    func test_didMigrate_resolves() {
        let mockStorageClient = MockStorageClient()
        module.setStorageClient(mockStorageClient)
        var didResolve = false
        var didReject = false
        let expectation = XCTestExpectation(description: "Wait for promise to finish")
        let resolve: RCTPromiseResolveBlock = { _ in
            didResolve = true
            expectation.fulfill()
        }
        let reject: RCTPromiseRejectBlock = { _, _, _ in
            didReject = true
            expectation.fulfill()
        }
        module.didMigrate(resolve, rejecter: reject)
        wait(for: [expectation], timeout: 10)
        XCTAssert(didReject == false)
        XCTAssert(didResolve == true)
    }
    

    func test_migrate_resolves() {
        let mockStorageClient = MockStorageClient()
        module.setStorageClient(mockStorageClient)
        var didResolve = false
        var didReject = false
        let expectation = XCTestExpectation(description: "Wait for promise to finish")
        let resolve: RCTPromiseResolveBlock = { _ in
            didResolve = true
            expectation.fulfill()
        }
        let reject: RCTPromiseRejectBlock = { _, _, _ in
            didReject = true
            expectation.fulfill()
        }
        module.migrate("", resolver: resolve, rejecter: reject)
        wait(for: [expectation], timeout: 10)
        XCTAssert(didReject == false)
        XCTAssert(didResolve == true)
    }
    // end Storage tests

    // Device Info tests
    func test_constantsToExport_returnsExpected() {
        let expectedConstants: [AnyHashable: NSDictionary] = [
            "DEVICE_INFO": .init(dictionary: [
                "bundleId": Bundle.main.bundleIdentifier!,
                "deviceId": module.getDeviceId()!,
                "systemName": UIDevice.current.systemName,
                "systemVersion": UIDevice.current.systemVersion,
                "timezone": TimeZone.current.identifier
            ])
        ]
        let exportedConstants: NSDictionary = module.constantsToExport()! as NSDictionary
        XCTAssertTrue(exportedConstants.isEqual(to: expectedConstants))
    }

    func test_getDeviceId_returnsExpected() {
        var sysinfo = utsname()
        uname(&sysinfo)
        let simulatorName = ProcessInfo().environment["SIMULATOR_MODEL_IDENTIFIER"]
        let sysInfoName = String(bytes: Data(bytes: &sysinfo.machine, count: Int(_SYS_NAMELEN)), encoding: .ascii)?.trimmingCharacters(in: .controlCharacters)
        let expectedDeviceId = simulatorName ?? sysInfoName
        let deviceId = module.getDeviceId()
        XCTAssertTrue(deviceId == expectedDeviceId)
    }

    func test_getUserAgent_returnsExpected() {
        class MockWebView: WKWebView {
            override func value(forKey key: String) -> Any? {
                if (key == "userAgent") {
                    return "My Mock User Agent"
                } else {
                    return "something else"
                }
            }
        }
        let mockWebView: WKWebView = MockWebView()
        let userAgent = module.getUserAgent(mockWebView)
        XCTAssertTrue(userAgent == "My Mock User Agent")
    }

    func test_getUserAgent_resolvesOnSuccess() {
        var didResolve = false
        var didReject = false
        let expectation = XCTestExpectation(description: "Wait for promise to finish")
        let resolve: RCTPromiseResolveBlock = { _ in
            didResolve = true
            expectation.fulfill()
        }
        let reject: RCTPromiseRejectBlock = { _, _, _ in
            didReject = true
            expectation.fulfill()
        }
        class MockWebView: WKWebView {
            override func value(forKey key: String) -> Any? {
                return ""
            }
        }
        module.getUserAgent(resolve, rejecter: reject)
        wait(for: [expectation], timeout: 10)
        XCTAssert(didReject == false)
        XCTAssert(didResolve == true)
    }
    // end Device Info tests

    // PKCE tests
    func test_generateCodeChallenge_resolvesOnError() {
        var didResolve = false
        var didReject = false
        var resolvedValue: NSDictionary? = [:]
        let expectation = XCTestExpectation(description: "Wait for promise to finish")
        let resolve: RCTPromiseResolveBlock = { value in
            didResolve = true
            resolvedValue = value as! NSDictionary?
            expectation.fulfill()
        }
        let reject: RCTPromiseRejectBlock = { _, _, _ in
            didReject = true
            expectation.fulfill()
        }
        class MockPKCEManager: PKCEManager {
            override func generateCodeChallenge() throws -> NSDictionary {
                throw PKCEManagerError.randomNumberGenerationFailed
            }
        }
        let mockPKCEManager = MockPKCEManager()
        module.setPKCEManager(mockPKCEManager)
        module.generateCodeChallenge(resolve, rejecter: reject)
        wait(for: [expectation], timeout: 10)
        XCTAssert(didReject == false)
        XCTAssert(didResolve == true)
        XCTAssertTrue(resolvedValue == nil)
    }
    
    func test_generateCodeChallenge_resolvesOnSuccess() {
        var didResolve = false
        var didReject = false
        var resolvedValue: NSDictionary? = [:]
        let expectation = XCTestExpectation(description: "Wait for promise to finish")
        let resolve: RCTPromiseResolveBlock = { value in
            didResolve = true
            resolvedValue = value as! NSDictionary?
            expectation.fulfill()
        }
        let reject: RCTPromiseRejectBlock = { _, _, _ in
            didReject = true
            expectation.fulfill()
        }
        class MockPKCEManager: PKCEManager {
            override func generateCodeChallenge() throws -> NSDictionary {
                return ["code_challenge": "", "code_verifier": ""]
            }
        }
        let mockPKCEManager = MockPKCEManager()
        module.setPKCEManager(mockPKCEManager)
        module.generateCodeChallenge(resolve, rejecter: reject)
        wait(for: [expectation], timeout: 10)
        XCTAssert(didReject == false)
        XCTAssert(didResolve == true)
        XCTAssertTrue(resolvedValue == ["code_challenge": "", "code_verifier": ""])
    }
    // end PKCE tests

    // CAPTCHA tests
    func test_initializeRecaptcha_resolves() {
        class MockCaptchaProvider : CAPTCHAProvider {
            override func initializeRecaptcha(siteKey: String) async throws {}
        }
        let mockCaptchaProvider = MockCaptchaProvider()
        var didResolve = false
        var didReject = false
        var resolvedValue: [String:Bool]? = nil
        let expectation = XCTestExpectation(description: "Wait for promise to finish")
        let resolve: RCTPromiseResolveBlock = { value in
            didResolve = true
            resolvedValue = value as? Dictionary
            expectation.fulfill()
        }
        let reject: RCTPromiseRejectBlock = { _, _, _ in
            didReject = true
            expectation.fulfill()
        }
        module.setCaptchaClient(mockCaptchaProvider)
        module.initializeRecaptcha("", resolver: resolve, rejecter: reject)
        wait(for: [expectation], timeout: 10)
        XCTAssert(didReject == false)
        XCTAssert(didResolve == true)
        let expectedValue = ["configured": true]
        XCTAssert(resolvedValue == expectedValue)
    }

    func test_executeRecaptcha_resolves() {
        class MockCaptchaProvider : CAPTCHAProvider {
            override func executeRecaptcha() async throws -> String {
                return "recaptcha-token"
            }
        }
        let mockCaptchaProvider = MockCaptchaProvider()
        var didResolve = false
        var didReject = false
        var resolvedValue: [String:String]? = nil
        let expectation = XCTestExpectation(description: "Wait for promise to finish")
        let resolve: RCTPromiseResolveBlock = { value in
            didResolve = true
            resolvedValue = value as? Dictionary
            expectation.fulfill()
        }
        let reject: RCTPromiseRejectBlock = { _, _, _ in
            didReject = true
            expectation.fulfill()
        }
        module.setCaptchaClient(mockCaptchaProvider)
        module.executeRecaptcha(resolve, rejecter: reject)
        wait(for: [expectation], timeout: 10)
        XCTAssert(didReject == false)
        XCTAssert(didResolve == true)
        let expectedValue = ["captchaToken": "recaptcha-token"]
        XCTAssert(resolvedValue == expectedValue)
    }
    // end CAPTCHA tests

    // DFP tests
    func test_DFP_getTelemetryId_rejectsOnError() {
        class MockDFPClient : DFPClient {
            override func getTelemetryId(publicToken: String) async throws -> String? {
                throw StytchSDKError.init(message: .biometricsUnavailable) // just throw any error, we're not testing the type
            }
        }
        let mockDfpClient = MockDFPClient()
        var didResolve = false
        var didReject = false
        let expectation = XCTestExpectation(description: "Wait for promise to finish")
        let resolve: RCTPromiseResolveBlock = { value in
            didResolve = true
            expectation.fulfill()
        }
        let reject: RCTPromiseRejectBlock = { _, _, _ in
            didReject = true
            expectation.fulfill()
        }
        module.setDFPClient(mockDfpClient)
        module.getTelemetryId("public-token", submitURL: "", resolver: resolve, rejecter: reject)
        wait(for: [expectation], timeout: 10)
        XCTAssert(didReject == true)
        XCTAssert(didResolve == false)
    }

    func test_DFP_getTelemetryId_resolvesOnSuccess() {
        class MockDFPClient : DFPClient {
            override func getTelemetryId(publicToken: String) async throws -> String? {
                return await withCheckedContinuation { continuation in
                    continuation.resume(returning: "dfp-telemetry-id")
                }
            }
        }
        let mockDfpClient = MockDFPClient()
        var didResolve = false
        var didReject = false
        var resolvedValue: [String:String]? = nil
        let expectation = XCTestExpectation(description: "Wait for promise to finish")
        let resolve: RCTPromiseResolveBlock = { value in
            didResolve = true
            resolvedValue = value as? Dictionary
            expectation.fulfill()
        }
        let reject: RCTPromiseRejectBlock = { _, _, _ in
            didReject = true
            expectation.fulfill()
        }
        module.setDFPClient(mockDfpClient)
        module.getTelemetryId("public-token", submitURL: "", resolver: resolve, rejecter: reject)
        wait(for: [expectation], timeout: 10)
        XCTAssert(didReject == false)
        XCTAssert(didResolve == true)
        let expectedValue = ["telemetryId": "dfp-telemetry-id"]
        XCTAssert(resolvedValue == expectedValue)
    }
    // end DFP tests

    // Passkeys tests
    @objc public final class MockErroringPasskeysClient: PasskeysClientInterface {
        @objc override public func register(publicKeyCredentialOptions: String) async throws -> String {
            throw StytchSDKError.init(message: .passkeysUnsupported)
        }
        
        @objc override public func authenticate(publicKeyCredentialOptions: String) async throws -> String {
            throw StytchSDKError.init(message: .passkeysUnsupported)
        }
    }

    @objc public final class MockSuccessfulPasskeysClient: PasskeysClientInterface {
        @objc override public func register(publicKeyCredentialOptions: String) async throws -> String {
            return "successful-register-response"
        }
        
        @objc override public func authenticate(publicKeyCredentialOptions: String) async throws -> String {
            return "successful-authenticate-response"
        }
    }

    func test_Passkeys_RegisterRejectsWhenError() {
        let mockPasskeysClient: PasskeysClientInterface = MockErroringPasskeysClient()
        let params: [AnyHashable : Any] = [:]
        var didResolve = false
        var didReject = false
        let expectation = XCTestExpectation(description: "Wait for promise to finish")
        let resolve: RCTPromiseResolveBlock = { _ in
            didResolve = true
            expectation.fulfill()
        }
        let reject: RCTPromiseRejectBlock = { _, _, _ in
            didReject = true
            expectation.fulfill()
        }
        module.registerPasskey(params, resolver: resolve, rejecter: reject, client: mockPasskeysClient)
        wait(for: [expectation], timeout: 10)
        XCTAssert(didReject == true)
        XCTAssert(didResolve == false)
    }

    func test_Passkeys_RegisterResolvesWhenSuccess() {
        let mockPasskeysClient: PasskeysClientInterface = MockSuccessfulPasskeysClient()
        let params: [AnyHashable : Any] = [:]
        var didResolve = false
        var didReject = false
        let expectation = XCTestExpectation(description: "Wait for promise to finish")
        let resolve: RCTPromiseResolveBlock = { _ in
            didResolve = true
            expectation.fulfill()
        }
        let reject: RCTPromiseRejectBlock = { _, _, _ in
            didReject = true
            expectation.fulfill()
        }
        module.registerPasskey(params, resolver: resolve, rejecter: reject, client: mockPasskeysClient)
        wait(for: [expectation], timeout: 10)
        XCTAssert(didReject == false)
        XCTAssert(didResolve == true)
    }
    
    func test_Passkeys_AuthenticateRejectsWhenError() {
        let mockPasskeysClient: PasskeysClientInterface = MockErroringPasskeysClient()
        let params: [AnyHashable : Any] = [:]
        var didResolve = false
        var didReject = false
        let expectation = XCTestExpectation(description: "Wait for promise to finish")
        let resolve: RCTPromiseResolveBlock = { _ in
            didResolve = true
            expectation.fulfill()
        }
        let reject: RCTPromiseRejectBlock = { _, _, _ in
            didReject = true
            expectation.fulfill()
        }
        module.authenticatePasskey(params, resolver: resolve, rejecter: reject, client: mockPasskeysClient)
        wait(for: [expectation], timeout: 10)
        XCTAssert(didReject == true)
        XCTAssert(didResolve == false)
    }

    func test_Passkeys_AuthenticateResolvesWhenSuccess() {
        let mockPasskeysClient: PasskeysClientInterface = MockSuccessfulPasskeysClient()
        let params: [AnyHashable : Any] = [:]
        var didResolve = false
        var didReject = false
        let expectation = XCTestExpectation(description: "Wait for promise to finish")
        let resolve: RCTPromiseResolveBlock = { _ in
            didResolve = true
            expectation.fulfill()
        }
        let reject: RCTPromiseRejectBlock = { _, _, _ in
            didReject = true
            expectation.fulfill()
        }
        module.authenticatePasskey(params, resolver: resolve, rejecter: reject, client: mockPasskeysClient)
        wait(for: [expectation], timeout: 10)
        XCTAssert(didReject == false)
        XCTAssert(didResolve == true)
    }
    // end Passkeys tests

    // KeyMigration tests
    func test_keyMigration_runs_if_necessary() {
        class KMH : KeyMigrationHelper {
            private var didMigrate = false
            override func didMigrateKeys() -> Bool {
                return didMigrate
            }
            override func run() {
                didMigrate = true
            }
        }
        let helper = KMH()
        var didResolve = false
        var didReject = false
        let expectation = XCTestExpectation(description: "Wait for promise to finish")
        let resolve: RCTPromiseResolveBlock = { _ in
            didResolve = true
            expectation.fulfill()
        }
        let reject: RCTPromiseRejectBlock = { _, _, _ in
            didReject = true
            expectation.fulfill()
        }
        module.setKeyMigrationHelper(helper)
        XCTAssert(helper.didMigrateKeys() == false)
        module.migrateKeychainItems(resolve, rejecter: reject)
        wait(for: [expectation], timeout: 10)
        XCTAssert(didReject == false)
        XCTAssert(didResolve == true)
        XCTAssert(helper.didMigrateKeys() == true)
    }

    func test_keyMigration_doesnt_run_if_not_necessary() {
        class KMH : KeyMigrationHelper {
            private var didMigrate = true
            override func didMigrateKeys() -> Bool {
                return didMigrate
            }
            override func run() {
                didMigrate = false // just toggling for checking if this runs
            }
        }
        let helper = KMH()
        var didResolve = false
        var didReject = false
        let expectation = XCTestExpectation(description: "Wait for promise to finish")
        let resolve: RCTPromiseResolveBlock = { _ in
            didResolve = true
            expectation.fulfill()
        }
        let reject: RCTPromiseRejectBlock = { _, _, _ in
            didReject = true
            expectation.fulfill()
        }
        module.setKeyMigrationHelper(helper)
        XCTAssert(helper.didMigrateKeys() == true)
        module.migrateKeychainItems(resolve, rejecter: reject)
        wait(for: [expectation], timeout: 10)
        XCTAssert(didReject == false)
        XCTAssert(didResolve == true)
        XCTAssert(helper.didMigrateKeys() == true) // this should still be true
    }
    // end KeyMigration tests
}
