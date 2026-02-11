import Foundation
import CryptoKit

@objc public class StorageClientInterface: NSObject {
    @objc public func getData(key: String) -> String? { nil }
    @objc public func setData(key: String, value: String?) -> Bool { false }
    @objc public func didMigrate() -> Bool { false }
    @objc public func migrate(publicToken: String) -> Bool { false }
}

public let STYTCH_KEY_PREFIX = "stytch_"
public let AES_SERVICE = "Stytch"
public let AES_ACCOUNT = "EncryptedUserDefaults"

@objc public final class StorageClient: StorageClientInterface {
    
    var sessionMigrationHelper: SessionMigrationProtocol

    internal let defaults: UserDefaults = .init(suiteName: "StytchPersistence") ?? .standard

    internal func storageKey(name: String) -> String {
        return "\(STYTCH_KEY_PREFIX)\(name)"
    }

    @objc override public func getData(key: String) -> String? {
        let encryptedData = defaults.data(forKey: storageKey(name: key))
        return decryptData(encryptedData: encryptedData)
    }

    @objc public convenience override init() {
        self.init(
            sessionMigrationHelper: SessionMigrationHelper()
        )
    }

    init(sessionMigrationHelper: SessionMigrationProtocol) {
        self.sessionMigrationHelper = sessionMigrationHelper
    }

    @objc override public func setData(key: String, value: String?) -> Bool {
        do {
            guard let value else {
                defaults.removeObject(forKey: storageKey(name: key))
                return true
            }
            let encryptedText = try encryptString(plainText: value)
            defaults.set(encryptedText, forKey: storageKey(name: key))
            return true
        } catch {
            return false
        }
    }

    @objc override public func didMigrate() -> Bool {
        return getData(key: "didMigrate") != nil
    }

    @objc override public func migrate(publicToken: String) -> Bool {
        let key = "stytch_sdk_state_\(publicToken)"
        let existingSessionData = sessionMigrationHelper.getExistingSessionData(key: key)
        if (existingSessionData != nil) {
            let _ = setData(key:key, value: existingSessionData)
        }
        return setData(key:"didMigrate", value:"true")
    }

    private func encryptString(plainText: String) throws -> Data? {
        let sealedBox = try AES.GCM.seal(
            Data(plainText.utf8),
            using: getOrGenerateAESKey()
        )
        return sealedBox.combined
    }

    internal func decryptData(encryptedData: Data?) -> String? {
        // prevent decryption if value is nil
        guard let encryptedData else { return nil }
        do {
            let sealedBox = try AES.GCM.SealedBox(combined: encryptedData)
            let decryptedData = try AES.GCM.open(sealedBox, using: getOrGenerateAESKey())
            return String(data: decryptedData, encoding: .utf8)
        } catch {
            return nil
        }
    }

    private func getOrGenerateAESKey() throws -> SymmetricKey {
        guard let keyData = retrieveKeyDataFromKeyChain() else {
            let data = SymmetricKey(size: .bits256).withUnsafeBytes {
                return Data(Array($0))
            }
            try persistKeyToKeyChain(data: data)
            return SymmetricKey(data: data)
        }
        return SymmetricKey(data: keyData)
    }
    
    private func persistKeyToKeyChain(data: Data) throws {
        let query = [
            kSecValueData: data,
            kSecClass: kSecClassGenericPassword,
            kSecAttrService: AES_SERVICE,
            kSecAttrAccount: AES_ACCOUNT,
            kSecAttrAccessible: kSecAttrAccessibleAfterFirstUnlock,
        ] as [CFString : Any] as CFDictionary
        // Add data in query to keychain
        let status = SecItemAdd(query, nil)
        if status != errSecSuccess {
            throw StorageClientError.unhandledError(status: status)
        }
    }

    private func retrieveKeyDataFromKeyChain() -> Data? {
        let query = [
            kSecAttrService: AES_SERVICE,
            kSecAttrAccount: AES_ACCOUNT,
            kSecClass: kSecClassGenericPassword,
            kSecAttrAccessible: kSecAttrAccessibleAfterFirstUnlock,
            kSecReturnData: true
        ] as [CFString : Any] as CFDictionary
        var result: AnyObject?
        SecItemCopyMatching(query, &result)
        return (result as? Data)
    }

    enum StorageClientError: Error {
        case unhandledError(status: OSStatus)
    }
}
