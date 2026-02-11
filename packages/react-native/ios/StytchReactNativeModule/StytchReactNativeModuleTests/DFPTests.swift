import XCTest
import WebKit
@testable import StytchReactNativeModule


class DFPClientTests: XCTestCase {
    var dfpClient: DFPClient!
    var mockWebView: MockWebView!

    class MockWebView: WKWebView {
        var loadFileURLCalled = false

        override func loadFileURL(_ URL: URL, allowingReadAccessTo readAccessURL: URL) -> WKNavigation? {
            loadFileURLCalled = true
            return nil
        }
    }

    override func setUpWithError() throws {
        try super.setUpWithError()
        let configuration: WKWebViewConfiguration = .init()
        mockWebView = .init(frame: .zero, configuration: configuration)
        dfpClient = .init(fileUrl: .init(string: "example.com"))
    }

    override func tearDownWithError() throws {
        mockWebView = nil
        dfpClient = nil
        try super.tearDownWithError()
    }

    func testDFPClientInitialization() {
        XCTAssertNotNil(dfpClient)
        XCTAssertNotNil(dfpClient.fileUrl)
    }

    @MainActor
    func testNilFileUrlFailure() async throws {
        dfpClient.fileUrl = nil

        let result = try await dfpClient.getTelemetryId(publicToken: "mock-public-token")

        XCTAssertEqual(result, "unable to load DFP file")
        XCTAssertFalse(mockWebView.loadFileURLCalled)
    }
}
