import Foundation
import CommonCrypto
import CryptoKit

private extension StringProtocol {
    var bytes: [UInt8] { .init(utf8) }
}
extension Data {
    var bytes: [UInt8] {
        return [UInt8](self)
    }
}

private let AES_KEY_SIZE = 256
private let AES_IV_SIZE = 128

public struct AESHelper {
    public static func decryptWithPassword(ciphertext: String, password: String) -> String? {
        // Extract the key and iv from the "password"
        guard let derivedBytes = try? deriveKeyIvAndCypher(ciphertext: ciphertext, password: password) else {
            return nil
        }
        // decrypt the cipher text
        guard let decrypted = try? QCCAESPadCBCDecrypt(key: derivedBytes.key, iv: derivedBytes.iv, ciphertext: derivedBytes.ctBytes) else {
            return nil
        }
        // return it
        return String(bytes: decrypted, encoding: .utf8)
    }

    private static func deriveKeyIvAndCypher(ciphertext: String, password: String) throws -> (key: [UInt8], iv: [UInt8], ctBytes: [UInt8]) {
        let ctBytes = Data(base64Encoded: ciphertext)!
        let saltBytes = Array(ctBytes[8..<16])
        let cipherTextBytes = Array(ctBytes[16..<ctBytes.count])
        let (key, iv) = try EvpKDF(password: password.bytes, salt: saltBytes)
        return (key, iv, cipherTextBytes)
    }

    private static func EvpKDF(password: [UInt8], salt: [UInt8]) throws -> (key: [UInt8], iv: [UInt8]) {
        let keySize = AES_KEY_SIZE / 32
        let ivSize = AES_IV_SIZE / 32
        let targetKeySize = keySize + ivSize
        var key = [UInt8](repeating: 0, count: AES_KEY_SIZE / 8)
        var iv = [UInt8](repeating: 0, count: AES_IV_SIZE / 8)
        var derivedBytes = [UInt8](repeating: 0, count: targetKeySize * 4)
        var numberOfDerivedWords = 0
        var block: [UInt8]? = nil
        while (numberOfDerivedWords < targetKeySize) {
            var hash = Insecure.MD5.init()
            if (block != nil) {
                hash.update(data: block!)
            }
            hash.update(data: password)
            hash.update(data: salt)
            block = Data(hash.finalize()).bytes
            let byteLengthToCopy = min(block!.count, (targetKeySize - numberOfDerivedWords) * 4)
            let startPosition = numberOfDerivedWords * 4
            let endPosition = (startPosition + byteLengthToCopy)

            derivedBytes.replaceSubrange(startPosition..<endPosition, with: block!)
            numberOfDerivedWords += block!.count / 4
        }
        key = Array(derivedBytes[0..<keySize * 4])
        let ivEndPosition = ((keySize * 4) + (ivSize * 4))
        iv = Array(derivedBytes[keySize * 4..<ivEndPosition])
        return (key, iv)
    }

    // https://developer.apple.com/forums/thread/687212
    /// Decrypts data that was encrypted using AES with PKCS#7 padding in CBC mode.
    ///
    /// - note: PKCS#7 padding is also known as PKCS#5 padding.
    ///
    /// - Parameters:
    ///   - key: The key to encrypt with; must be a supported size (128, 192, 256).
    ///   - iv: The initialisation vector; must be of size 16.
    ///   - ciphertext: The encrypted data; it’s length must be an even multiple of
    ///     16.
    /// - Returns: The decrypted data.
    private static func QCCAESPadCBCDecrypt(key: [UInt8], iv: [UInt8], ciphertext: [UInt8]) throws -> [UInt8] {
        // The key size must be 128, 192, or 256.
        //
        // The IV size must match the block size.
        //
        // The ciphertext must be a multiple of the block size.
        guard
            [kCCKeySizeAES128, kCCKeySizeAES192, kCCKeySizeAES256].contains(key.count),
            iv.count == kCCBlockSizeAES128,
            ciphertext.count.isMultiple(of: kCCBlockSizeAES128)
        else {
            throw QCCError(code: kCCParamError)
        }

        // Padding can expand the data on encryption, but on decryption the data can
        // only shrink so we use the ciphertext size as our plaintext size.

        var plaintext = [UInt8](repeating: 0, count: ciphertext.count)
        var plaintextCount = 0

        let err = CCCrypt(
            CCOperation(kCCDecrypt),
            CCAlgorithm(kCCAlgorithmAES),
            CCOptions(kCCOptionPKCS7Padding),
            key, key.count,
            iv,
            ciphertext, ciphertext.count,
            &plaintext, plaintext.count,
            &plaintextCount
        )

        guard err == kCCSuccess else {
            throw QCCError(code: err)
        }

        // Trim any unused bytes off the plaintext.
        assert(plaintextCount <= plaintext.count)

        plaintext.removeLast(plaintext.count - plaintextCount)

        return plaintext
    }
}

/// Wraps `CCCryptorStatus` for use in Swift.
struct QCCError: Error {
    var code: CCCryptorStatus
}

extension QCCError {
    init(code: Int) {
        self.init(code: CCCryptorStatus(code))
    }
}
