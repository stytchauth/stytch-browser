require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'StytchReactNativeModule'
  s.version        = package['version']
  s.summary        = package['summary']
  s.description    = package['description']
  s.author         = package['author']['name']
  s.license        = package['license']
  s.homepage       = package['homepage']
  s.source         = { :git => '' }
  s.platform       = :ios, '13.4'
  s.source_files   = 'ios/*.{h,m,mm,swift}'
  s.dependency     'React-Core'
  
  s.default_subspec = 'Base'
  install_modules_dependencies(s)

  s.subspec 'Base' do |ss|
    ss.source_files   = ['ios/*.{h,m,mm,swift}']
    ss.pod_target_xcconfig = {
      'OTHER_LDFLAGS' => '-lObjC',
      'DEFINES_MODULE' => 'YES',
    }
    ss.resources = ["ios/fonts/*.ttf"]
    ss.dependency 'StytchReactNativeModule/Recaptcha'
    ss.dependency 'StytchReactNativeModule/DFP'
  end

  s.subspec 'Recaptcha' do |ss|
    ss.vendored_frameworks = 'recaptcha/RecaptchaEnterprise.xcframework'
    ss.preserve_path = 'recaptcha/RecaptchaEnterprise.xcframework'
  end

  s.subspec 'DFP' do |ss|
    ss.vendored_frameworks = 'ios/StytchDFP.xcframework'
    ss.preserve_path = 'ios/StytchDFP.xcframework'
  end
end