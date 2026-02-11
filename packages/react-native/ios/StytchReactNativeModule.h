//
//  StytchReactNativeModule.h
//
//  Created by Brandon Hines on 4/3/18.
//

#import <React/RCTBridgeModule.h>
#if __has_include("StytchReactNativeModule/StytchReactNativeModule-Swift.h")
#import "StytchReactNativeModule/StytchReactNativeModule-Swift.h"
#endif
#import <LocalAuthentication/LocalAuthentication.h>
#import <WebKit/WebKit.h>
#ifdef RCT_NEW_ARCH_ENABLED
#import <StytchReactNativeTurboModule/StytchReactNativeTurboModule.h>
#endif

@class PasskeysClientInterface;
@class StorageClientInterface;
@class PKCEManager;
@class DFPClient;
@class CAPTCHAProvider;
@class KeyMigrationHelper;
@class FontLoader;

@interface StytchReactNativeModule : NSObject <RCTBridgeModule>
@end

#ifdef RCT_NEW_ARCH_ENABLED
@interface StytchReactNativeModule () <NativeStytchReactNativeModuleSpec>
@end
#endif
