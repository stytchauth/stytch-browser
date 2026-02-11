//
//  SessionMigrationHelper.swift
//  StytchReactNativeModule
//
//  Created by Jordan Haven on 5/24/23.
//

import Foundation
import React

private enum MigrationType {
    case ReactNative(String)
    case Expo(String)
    case None
}

protocol SessionMigrationProtocol {
    func getExistingSessionData(key: String) -> String?
}

public final class SessionMigrationHelper: SessionMigrationProtocol {
    public func getExistingSessionData(key: String) -> String? {
        let rnData = maybeGetExistingRNSession()
        if (rnData != nil) {
            let rnSession = maybeExtractExistingRNSession(rnSessionString: rnData!)
            if (rnSession != nil) {
                return rnSession
            }
        }

        let encryptedExpoSession = maybeGetExistingEncryptedExpoSession(key: key)
        if (encryptedExpoSession != nil) {
            return decryptExistingExpoSession(encryptedExpoSession: encryptedExpoSession!, key: key)
        }

        return nil
    }

    private func maybeGetExistingRNSession() -> String? {
        // Get RN Data from KeyChain. When saving session data, we don't pass a service, so it uses the bundle identifier by default
        let query: [CFString : Any] = [
            kSecClass: kSecClassGenericPassword,
            kSecAttrService: Bundle.main.bundleIdentifier,
            kSecReturnAttributes: true,
            kSecReturnData: true,
            kSecMatchLimit: kSecMatchLimitOne,
        ]
        var result: CFTypeRef?
        let osStatus = SecItemCopyMatching(query as CFDictionary, &result)
        guard
            osStatus == errSecSuccess,
            result != nil,
            let dict = result as? [CFString: Any],
            let data = dict[kSecValueData] as? Data else {
            return nil
        }
        return String(data: data, encoding: .utf8)
    }

    private func maybeExtractExistingRNSession(rnSessionString: String) -> String? {
        // make sure this is an RN Session (ie: is it a JSONObject). If yes, return it, else nil
        do {
            let jsonData = rnSessionString.data(using: .utf8)!
            try JSONSerialization.jsonObject(with: jsonData)
            return rnSessionString
        } catch {
            return nil
        }
    }

    private func maybeGetExistingEncryptedExpoSession(key: String) -> String? {
        // check for session data from async-secure-store
        let safeFileName = RCTMD5Hash(key)
        var storageDirectoryPath: URL?;
        #if TARGET_OS_TV
            storageDirectoryPath = FileManager.default.urls(
                for: .cachesDirectory,
                in: .userDomainMask
            ).first ?? nil
        #else
            storageDirectoryPath = FileManager.default.urls(
                for: .applicationSupportDirectory,
                in: .userDomainMask
            ).first ?? nil
            if (storageDirectoryPath != nil) {
                storageDirectoryPath?.appendPathComponent(Bundle.main.bundleIdentifier!)
            }
        #endif
        if (storageDirectoryPath == nil) {
            return nil
        }
        storageDirectoryPath!.appendPathComponent("RCTAsyncLocalStorage_V1")
        let filePath = storageDirectoryPath!.appendingPathComponent(safeFileName)
        do {
            return try String(contentsOf: filePath, encoding:.utf8)
        } catch {
            return nil
        }
    }

    private func decryptExistingExpoSession(encryptedExpoSession: String, key: String) -> String? {
        let encryptionKeyName = "\(key)_secret_key"
        let encodedKey = encryptionKeyName.data(using:.utf8)
        // get encryptionKey from KeyChain (expo-secure-store)
        let query: [CFString : Any] = [
            kSecClass: kSecClassGenericPassword,
            kSecAttrService: "app",
            kSecAttrGeneric: encodedKey,
            kSecAttrAccount: encodedKey,
            kSecReturnAttributes: true,
            kSecReturnData: true,
            kSecMatchLimit: kSecMatchLimitOne,
        ]
        var result: CFTypeRef?
        let osStatus = SecItemCopyMatching(query as CFDictionary, &result)
        guard
            osStatus == errSecSuccess,
            result != nil,
            let dict = result as? [CFString: Any],
            let data = dict[kSecValueData] as? Data,
            let aesKeyString = String(data: data, encoding: .utf8) else {
            return nil
        }
        // AES decrypt encryptedExpoSession with encryptionKey
        return AESHelper.decryptWithPassword(ciphertext: encryptedExpoSession, password: aesKeyString)
    }
}
