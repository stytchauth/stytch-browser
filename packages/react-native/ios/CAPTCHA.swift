import Foundation
import RecaptchaEnterprise

@objc public class CAPTCHAProvider: NSObject {
    @objc public func initializeRecaptcha(siteKey: String) async throws -> Void {}
    
    @objc public func executeRecaptcha() async throws -> String {""}
}

@objc public final class CAPTCHA: CAPTCHAProvider {
    internal var recaptcha: RecaptchaProtocol
    internal var recaptchaClient: RecaptchaClientProtocol!
    
    @objc public override init() {
        self.recaptcha = RecaptchaImpl()
    }
    
    init(recaptcha: RecaptchaProtocol = RecaptchaImpl()) {
        self.recaptcha = recaptcha
    }

    @objc override public func initializeRecaptcha(siteKey: String) async throws -> Void {
        recaptchaClient = try await recaptcha.getClient(withSiteKey: siteKey)
    }
    
    @objc override public func executeRecaptcha() async throws -> String {
        return try await recaptchaClient.execute(withAction: RecaptchaAction.login)
    }
}

public protocol RecaptchaProtocol {
    func getClient(withSiteKey siteKey: String) async throws -> RecaptchaClientProtocol
}

public protocol RecaptchaClientProtocol {
    func execute(withAction action: RecaptchaAction) async throws -> String
}

public class RecaptchaImpl: RecaptchaProtocol {
    public func getClient(withSiteKey siteKey: String) async throws -> RecaptchaClientProtocol {
        let recaptchaClient = try await Recaptcha.fetchClient(withSiteKey: siteKey)
        return RecaptchaClientImpl(recaptchaClient: recaptchaClient)
    }
}

class RecaptchaClientImpl: RecaptchaClientProtocol {
    private var recaptchaClient: RecaptchaClient
    
    init(recaptchaClient: RecaptchaClient) {
        self.recaptchaClient = recaptchaClient
    }
    
    func execute(withAction action: RecaptchaAction) async throws -> String {
        return try await recaptchaClient.execute(withAction: action)
    }
}
