import Foundation
import CryptoKit

extension Data {
    init?(base64UrlEncoded: String) {
        var base64 = base64UrlEncoded
            .replacingOccurrences(of: "-", with: "+")
            .replacingOccurrences(of: "_", with: "/")

        while !base64.count.isMultiple(of: 4) {
            base64.append("=")
        }

        self.init(base64Encoded: base64)
    }

    func base64UrlEncoded() -> String {
        base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }
}

private extension Sequence where Element: CVarArg {
    func toHexString() -> String {
        reduce(into: "") { $0 += String(format: "%02x", $1) }
    }
}

class RNG: NSObject {
    open func dataWithRandomBytesOfCount(byteCount: UInt) throws -> Data {
        var buffer = [UInt8](repeating: 0, count: Int(byteCount))
        guard SecRandomCopyBytes(kSecRandomDefault, buffer.count, &buffer) == errSecSuccess else {
            throw PKCEManagerError.randomNumberGenerationFailed
        }
        return .init(buffer)
    }
}

enum PKCEManagerError: Swift.Error {
    case randomNumberGenerationFailed
}

@objc public class PKCEManager: NSObject {
    let rng: RNG
    
    @objc override public init() {
        self.rng = RNG()
    }

    init(rng: RNG) {
        self.rng = rng
    }

    @objc public func generateCodeChallenge() throws -> NSDictionary {
        let codeVerifier = try rng.dataWithRandomBytesOfCount(byteCount: 32).toHexString()
        let codeChallenge =  Data(SHA256.hash(data: Data(codeVerifier.utf8))).base64UrlEncoded()
        let dictionary: NSDictionary = [
            "code_challenge": codeChallenge,
            "code_verifier": codeVerifier,
        ]
        return dictionary
    }
}
