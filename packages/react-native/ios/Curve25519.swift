//
//  Created by Spencer Lichtenberg on 10/7/22.
//  Copyright © 2022 Facebook. All rights reserved.
//

import Foundation
import CryptoKit

@objc public final class Curve25519: NSObject {
    @objc public func generateKeypair() -> Keypair {
        .init(privateKey: .init())
    }

    @objc public func signature(forPayload data: Data, privateKey: Data) throws -> Data {
        try CryptoKit.Curve25519.Signing.PrivateKey(rawRepresentation: privateKey)
            .signature(for: data)
    }

    @objc public func derivePublicKey(privateKey: Data) throws -> Data {
        try CryptoKit.Curve25519.Signing.PrivateKey(rawRepresentation: privateKey)
            .publicKey.rawRepresentation
    }
}

@objc public final class Keypair: NSObject {
    @objc public let publicKey: Data
    @objc public let privateKey: Data

    init(privateKey: CryptoKit.Curve25519.Signing.PrivateKey) {
        self.publicKey = privateKey.publicKey.rawRepresentation
        self.privateKey = privateKey.rawRepresentation
    }
}
