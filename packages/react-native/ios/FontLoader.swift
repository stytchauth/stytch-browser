
import Foundation
import CoreText

@objc public class FontLoader : NSObject {
    private (set) var fontsWereLoaded = false
    @objc public func loadFontsForUI() {
        if fontsWereLoaded {
            return
        }
        fontsWereLoaded = true
        
        let fonts = [
            "IBMPlexMono_Regular",
            "Roboto_Regular",
            "IBMPlexSans_Bold",
            "IBMPlexSans_BoldItalic",
            "IBMPlexSans_ExtraLight",
            "IBMPlexSans_ExtraLightItalic",
            "IBMPlexSans_Italic",
            "IBMPlexSans_Light",
            "IBMPlexSans_LightItalic",
            "IBMPlexSans_Medium",
            "IBMPlexSans_MediumItalic",
            "IBMPlexSans_MediumItalic",
            "IBMPlexSans_SemiBold",
            "IBMPlexSans_SemiBoldItalic",
            "IBMPlexSans_Thin",
            "IBMPlexSans_ThinItalic",
        ]
        
        for font in fonts {
            let path = Bundle.main.path(forResource: font, ofType: "ttf")
            let data = FileManager.default.contents(atPath: path!)
            let provider = CGDataProvider(data: data! as CFData)
            let font = CGFont(provider!)
            var error: Unmanaged<CFError>?
            CTFontManagerRegisterGraphicsFont(font!, &error)
        }
    }
}
