//
//  KeyMigrationHelper.swift
//  StytchReactNativeModule
//
//  Created by Jordan Haven on 11/29/23.
//

import Foundation

@objc public class KeyMigrationHelper : NSObject {
    private let defaults: UserDefaults = .init(suiteName: "StytchMigrations") ?? .standard
    
    @objc public func didMigrateKeys() -> Bool {
        return defaults.data(forKey: "keyMigration1") != nil
    }
    
    @objc public func run() {
        let status = SecItemUpdate(
            [
                kSecAttrService: AES_SERVICE,
                kSecAttrAccount: AES_ACCOUNT,
                kSecClass: kSecClassGenericPassword
            ] as CFDictionary,
            [kSecAttrAccessible: kSecAttrAccessibleAfterFirstUnlock] as CFDictionary
        )
        defaults.set(true, forKey: "keyMigration1")
    }
}
