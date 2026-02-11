import Foundation
import StytchDFP

@objc public class DFPClient: NSObject {
    let stytchDFP = StytchDFP()

    @objc public func configure(publicToken: String, dfppaDomain: String?) {
        stytchDFP.configure(withPublicToken: publicToken, submitURL: dfppaDomain)
    }

    @MainActor
    @objc public func getTelemetryId() async -> String {
        await withCheckedContinuation { continuation in
            stytchDFP.getTelemetryID { telemetryId in
                continuation.resume(returning: telemetryId)
            }
        }
    }
}
