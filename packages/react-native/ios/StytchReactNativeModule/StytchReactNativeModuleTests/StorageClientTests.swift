import XCTest
@testable import StytchReactNativeModule

final class StorageClientTests: XCTestCase {
    class MockSessionMigrationHelper: SessionMigrationProtocol {
        func getExistingSessionData(key: String) -> String? {
            return "mock_session_data"
        }
    }

    var storageClient: StorageClient!

    override func setUpWithError() throws {
        storageClient = StorageClient(sessionMigrationHelper: MockSessionMigrationHelper())
    }

    override func tearDownWithError() throws {
        storageClient = nil
    }

    func testGetSetData() async throws {
        let key = "mock_key"
        let value = "mock_value"

        XCTAssertTrue(storageClient.setData(key: key, value: value))
        XCTAssertEqual(storageClient.getData(key: key), value)
    }

    func testSetDataWithNilValue() async throws {
        let key = "mock_key"

        XCTAssertTrue(storageClient.setData(key: key, value: "mock_value"))
        XCTAssertTrue(storageClient.setData(key: key, value: nil))
        XCTAssertNil(storageClient.getData(key: key))
    }

    func testGetNonExistentData() {
        XCTAssertNil(storageClient.getData(key: "non_existent_key"))
    }

    func testDidMigrate() {
        XCTAssertTrue(storageClient.setData(key: "didMigrate", value: nil))
        XCTAssertFalse(storageClient.didMigrate())

        XCTAssertTrue(storageClient.migrate(publicToken: "mock_public_token"))
        XCTAssertTrue(storageClient.didMigrate())
    }

    func testMigrate() {
        let publicToken = "mock_public_token"

        XCTAssertTrue(storageClient.migrate(publicToken: publicToken))
        XCTAssertEqual(storageClient.getData(key: "stytch_sdk_state_\(publicToken)"), "mock_session_data")
    }

    func testEncryptionDecryption() {
        let key = "mock_key"
        let value = "mock_value"

        XCTAssertTrue(storageClient.setData(key: key, value: value))
        XCTAssertEqual(
            storageClient.decryptData(encryptedData: storageClient.defaults.data(forKey: storageClient.storageKey(name: key))),
            value
        )
    }
}
