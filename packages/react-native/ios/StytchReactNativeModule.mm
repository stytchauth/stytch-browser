#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import "StytchReactNativeModule.h"
#import <LocalAuthentication/LocalAuthentication.h>
#import <Security/Security.h>
#import <React/RCTConvert.h>
#import <sys/utsname.h>
#import <React/RCTUtils.h>
#import <os/log.h>
#if __has_include("StytchReactNativeModule/StytchReactNativeModule-Swift.h")
#import "StytchReactNativeModule/StytchReactNativeModule-Swift.h"
#else
#import "StytchReactNativeModule-Swift.h"
#endif
#import <React/RCTHTTPRequestHandler.h>
#import <React/RCTBridge.h>
#import <React/RCTLog.h>
#import <RecaptchaEnterprise/RecaptchaEnterprise.h>
#ifdef RCT_NEW_ARCH_ENABLED
#import <StytchReactNativeTurboModule/StytchReactNativeTurboModule.h>
#endif
@implementation StytchReactNativeModule
StorageClientInterface *storageClient;
PKCEManager *globalPKCEManager;
CAPTCHAProvider *captchaProvider;
DFPClient *dfpProvider;
KeyMigrationHelper *keyMigrationHelper;
FontLoader *fontLoader;

- (NSDictionary *)constantsToExport {
    return @{ @"DEVICE_INFO": @{
        @"deviceId": [self getDeviceId],
        @"bundleId": [[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleIdentifier"],
        @"systemName": [[UIDevice currentDevice] systemName],
        @"systemVersion": [[UIDevice currentDevice] systemVersion],
        @"timezone":  [[NSTimeZone localTimeZone] name]
    }};
}

- (NSDictionary *)getConstants {
    return [self constantsToExport];
}

+ (BOOL) requiresMainQueueSetup {
    return YES;
}

RCT_EXPORT_MODULE(StytchReactNativeModule);

RCT_EXPORT_METHOD(disableUrlCache) {
    NSURLCache *noCache = [[NSURLCache alloc] initWithMemoryCapacity:0 diskCapacity:0 directoryURL:nil];
    [NSURLCache setSharedURLCache:noCache];
}

- (void)getSensorShared:(BOOL)allowDeviceCredentials resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    LAContext *context = [[LAContext alloc] init];
    NSError *la_error = nil;
    LAPolicy laPolicy = LAPolicyDeviceOwnerAuthenticationWithBiometrics;
    if (allowDeviceCredentials == TRUE) {
        laPolicy = LAPolicyDeviceOwnerAuthentication;
    }
    BOOL canEvaluatePolicy = [context canEvaluatePolicy:laPolicy error:&la_error];
    if (canEvaluatePolicy) {
        NSString *biometryType = [self getBiometryType:context];
        NSDictionary *result = @{
            @"biometryType": biometryType
        };
        resolve(result);
    } else {
        [self handleError: [[StytchSDKError alloc] initWithMessage: ErrorTypeBiometricsUnavailable] reject:reject];
    }
}

#ifdef RCT_NEW_ARCH_ENABLED
RCT_EXPORT_METHOD(getSensor: (JS::NativeStytchReactNativeModule::SpecGetSensorOptions &)options resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    BOOL allowDeviceCredentials = options.allowDeviceCredentials();
    [self getSensorShared:allowDeviceCredentials resolve:resolve reject:reject];
}
#else
RCT_EXPORT_METHOD(getSensor: (NSDictionary *)params resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    BOOL allowDeviceCredentials = [RCTConvert BOOL:params[@"allowDeviceCredentials"]];
    [self getSensorShared:allowDeviceCredentials resolve:resolve reject:reject];
}
#endif


- (void)getBiometricKeyShared:(BOOL)allowDeviceCredentials promptMessage:(NSString *)promptMessage fallbackTitle:(NSString *)fallbackTitle cancelButtonText:(NSString *)cancelButtonText resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    BOOL biometricKeyExists = [self doesBiometricKeyExist];
    if (!biometricKeyExists) {
        [self handleError: [[StytchSDKError alloc] initWithMessage: ErrorTypeNoBiometricsRegistration] reject:reject];
        return;
    }
    
    NSString *allowDeviceCredentialsKeyName = [self getAllowDeviceCredentialsKeyName];
    BOOL keyAllowsDeviceCredentials = [[NSUserDefaults standardUserDefaults] boolForKey: allowDeviceCredentialsKeyName];
    
    if (!keyAllowsDeviceCredentials && allowDeviceCredentials) {
        [self handleError: [[StytchSDKError alloc] initWithMessage: ErrorTypeDeviceCredentialsNotAllowed] reject:reject];
        return;
    }
    
    LAContext *context = [[LAContext alloc] init];
    context.localizedReason = promptMessage;
    context.localizedCancelTitle = cancelButtonText;
    context.localizedFallbackTitle = allowDeviceCredentials ? fallbackTitle : @"";
    
    LAPolicy policy;
    if (allowDeviceCredentials) {
        policy = LAPolicyDeviceOwnerAuthentication;
    } else {
        policy = LAPolicyDeviceOwnerAuthenticationWithBiometrics;
    }
    
    [context evaluatePolicy: policy
            localizedReason:context.localizedReason
                      reply:^(BOOL success, NSError * _Nullable error) {
        if (success) {
            NSString *biometricKeyService = [self getBiometricKeyService];
            NSDictionary *query = @{
                (id)kSecClass: (id)kSecClassGenericPassword,
                (id)kSecAttrService: biometricKeyService,
                (id)kSecReturnData: @YES,
                (id)kSecUseAuthenticationContext: context
            };
            NSError *error;
            CFTypeRef privateKey = nil;
            OSStatus _ = SecItemCopyMatching((CFDictionaryRef)query, &privateKey);
            NSData *privateKeyData = (__bridge_transfer NSData *)privateKey;
            NSData *publicKey = [[[Curve25519 alloc] init] derivePublicKeyWithPrivateKey:privateKeyData error:&error];
            
            if (publicKey != nil) {
                NSString *publicKeyString = [publicKey base64EncodedStringWithOptions:0];
                NSString *privateKeyString = [privateKeyData base64EncodedStringWithOptions:0];
                
                NSDictionary *result = @{
                    @"privateKey": privateKeyString,
                    @"publicKey": publicKeyString
                };
                resolve(result);
            } else {
                [self handleError: [[StytchSDKError alloc] initWithMessage: ErrorTypeMissingPublicKey] reject:reject];
                return;
            }
        } else {
            // handles error with local authentication framework (face/touch id)
            switch (error.code) {
                case LAErrorUserCancel:
                    [self handleError: [[StytchSDKError alloc] initWithMessage: ErrorTypeUserCancellation] reject:reject];
                    break;
                case LAErrorBiometryLockout:
                    [self handleError: [[StytchSDKError alloc] initWithMessage: ErrorTypeUserLockedOut] reject:reject];
                    break;
                case LAErrorBiometryNotEnrolled:
                    [self handleError: [[StytchSDKError alloc] initWithMessage: ErrorTypeNoBiometricsEnrolled] reject:reject];
                    break;
                default:
                    [self handleError: [[StytchSDKError alloc] initWithMessage: ErrorTypeBiometricsUnavailable] reject:reject];
                    break;
            }
        }
    }];
}

#ifdef RCT_NEW_ARCH_ENABLED
RCT_EXPORT_METHOD(getBiometricKey: (JS::NativeStytchReactNativeModule::SpecGetBiometricKeyGetBiometricKeyOptions &)getBiometricKeyOptions resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    BOOL allowDeviceCredentials = getBiometricKeyOptions.allowDeviceCredentials();
    NSString *promptMessage = getBiometricKeyOptions.promptMessage();
    NSString *fallbackTitle = getBiometricKeyOptions.fallbackTitle();
    NSString *cancelButtonText = getBiometricKeyOptions.cancelButtonText();
    [self getBiometricKeyShared:allowDeviceCredentials promptMessage:promptMessage fallbackTitle:fallbackTitle cancelButtonText:cancelButtonText resolve:resolve reject:reject];
}
#else
RCT_EXPORT_METHOD(getBiometricKey: (NSDictionary *)params resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    BOOL allowDeviceCredentials = [RCTConvert BOOL:params[@"allowDeviceCredentials"]];
    NSString *promptMessage = [RCTConvert NSString:params[@"promptMessage"]];
    NSString *fallbackTitle = [RCTConvert NSString:params[@"fallbackTitle"]];
    NSString *cancelButtonText = [RCTConvert NSString:params[@"cancelButtonText"]];
    [self getBiometricKeyShared:allowDeviceCredentials promptMessage:promptMessage fallbackTitle:fallbackTitle cancelButtonText:cancelButtonText resolve:resolve reject:reject];
}
#endif

- (void)createKeysShared:(BOOL)allowDeviceCredentials promptMessage:(NSString *)promptMessage cancelButtonText:(NSString *)cancelButtonText resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    dispatch_async(dispatch_get_global_queue( DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        LAContext *context = [[LAContext alloc] init];
        context.localizedReason = promptMessage;
        context.localizedCancelTitle = cancelButtonText;
        
        LAPolicy policy;
        if (allowDeviceCredentials) {
            policy = LAPolicyDeviceOwnerAuthentication;
        } else {
            policy = LAPolicyDeviceOwnerAuthenticationWithBiometrics;
        }
        
        [context evaluatePolicy: policy
                localizedReason:context.localizedReason
                          reply:^(BOOL success, NSError * _Nullable error) {
            if (success) {
                CFErrorRef error = NULL;
                
                SecAccessControlCreateFlags secCreateFlag = kSecAccessControlBiometryCurrentSet;
                
                if (allowDeviceCredentials == TRUE) {
                    secCreateFlag = kSecAccessControlUserPresence;
                }
                
                SecAccessControlRef sacObject = SecAccessControlCreateWithFlags(kCFAllocatorDefault,
                                                                                kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly,
                                                                                secCreateFlag, &error);
                if (sacObject == NULL || error != NULL) {
                    [self handleError: (__bridge NSError *)(error) reject:reject];
                    return;
                }
                
                Keypair* keys = [[[Curve25519 alloc] init] generateKeypair];
                
                NSString *biometricKeyService = [self getBiometricKeyService];
                NSDictionary *keyAttributes = @{
                    (id)kSecClass: (id)kSecClassGenericPassword,
                    (id)kSecAttrService: biometricKeyService,
                    (id)kSecAttrAccessControl: (__bridge_transfer id)sacObject,
                    (id)kSecValueData: (id)keys.privateKey
                };
                
                [self deleteBiometricKey];
                CFTypeRef storage_error = nil;
                OSStatus _ = SecItemAdd((CFDictionaryRef)keyAttributes, &storage_error);
                
                if (keys.publicKey != nil && storage_error == nil) {
                    NSString *publicKeyString = [keys.publicKey base64EncodedStringWithOptions:0];
                    NSString *privateKeyString = [keys.privateKey base64EncodedStringWithOptions:0];
                    
                    NSString *allowDeviceCredentialsKeyName = [self getAllowDeviceCredentialsKeyName];
                    [[NSUserDefaults standardUserDefaults] setBool: allowDeviceCredentials forKey: allowDeviceCredentialsKeyName];
                    
                    NSDictionary *result = @{
                        @"publicKey": publicKeyString,
                        @"privateKey": privateKeyString
                    };
                    resolve(result);
                } else {
                    [self handleError: [[StytchSDKError alloc] initWithMessage: ErrorTypeMissingPublicKey] reject:reject];
                }
            }
            else {
                // handles error with local authentication framework (face/touch id)
                switch (error.code) {
                    case LAErrorUserCancel:
                        [self handleError: [[StytchSDKError alloc] initWithMessage: ErrorTypeUserCancellation] reject:reject];
                        break;
                    case LAErrorBiometryLockout:
                        [self handleError: [[StytchSDKError alloc] initWithMessage: ErrorTypeUserLockedOut] reject:reject];
                        break;
                    case LAErrorBiometryNotEnrolled:
                        [self handleError: [[StytchSDKError alloc] initWithMessage: ErrorTypeNoBiometricsEnrolled] reject:reject];
                        break;
                    default:
                        [self handleError: [[StytchSDKError alloc] initWithMessage: ErrorTypeBiometricsUnavailable] reject:reject];
                        break;
                }
            }
        }];
    });
}
#ifdef RCT_NEW_ARCH_ENABLED
RCT_EXPORT_METHOD(createKeys: (JS::NativeStytchReactNativeModule::SpecCreateKeysCreateKeysOptions &)createKeysOptions resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    BOOL allowDeviceCredentials = createKeysOptions.allowDeviceCredentials();
    NSString *promptMessage = createKeysOptions.promptMessage();
    NSString *cancelButtonText = createKeysOptions.cancelButtonText();
    [self createKeysShared:allowDeviceCredentials promptMessage:promptMessage cancelButtonText:cancelButtonText resolve:resolve reject:reject];
}
#else
RCT_EXPORT_METHOD(createKeys: (NSDictionary *)params resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    BOOL allowDeviceCredentials = [RCTConvert BOOL:params[@"allowDeviceCredentials"]];
    NSString *promptMessage = [RCTConvert NSString:params[@"promptMessage"]];
    NSString *cancelButtonText = [RCTConvert NSString:params[@"cancelButtonText"]];
    [self createKeysShared:allowDeviceCredentials promptMessage:promptMessage cancelButtonText:cancelButtonText resolve:resolve reject:reject];
}
#endif

RCT_EXPORT_METHOD(deleteKeys: (RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_global_queue( DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        BOOL biometricKeyExists = [self doesBiometricKeyExist];
        
        if (biometricKeyExists) {
            OSStatus status = [self deleteBiometricKey];
            if (status == noErr) {
                NSString *biometricRegistrationIdKeyName = [self getBiometricRegistrationIdKeyName];
                [[NSUserDefaults standardUserDefaults] removeObjectForKey: biometricRegistrationIdKeyName];
                NSDictionary *result = @{
                    @"keysDeleted": @(YES),
                };
                resolve(result);
                return;
            }
        }
        NSDictionary *result = @{
            @"keysDeleted": @(NO),
        };
        resolve(result);
    });
}

- (void)createSignatureShared:(NSString *)payload biometricRegistrationId:(NSString *)biometricRegistrationId privateKeyString:(NSString *)privateKeyString resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        if (biometricRegistrationId == nil || [[biometricRegistrationId stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceCharacterSet]] length] == 0 ) {
            [self handleError:[[StytchSDKError alloc] initWithMessage: ErrorTypeBiometricRegistrationIdIsNullOrBlank] reject:reject];
            return;
        }
        
        NSString *biometricRegistrationIdKeyName = [self getBiometricRegistrationIdKeyName];
        
        [[NSUserDefaults standardUserDefaults] setObject: biometricRegistrationId forKey: biometricRegistrationIdKeyName];
        
        NSError *error;
        NSData *dataToSign = [[NSData alloc] initWithBase64EncodedString:payload options:0];
        NSData *privateKey = [[NSData alloc] initWithBase64EncodedString:privateKeyString options:0];
        
        NSData *signature = [[[Curve25519 alloc] init] signatureForPayload:dataToSign privateKey:privateKey error:&error];
        
        if (signature != nil) {
            NSString *signatureString = [signature base64EncodedStringWithOptions:0];
            NSDictionary *result = @{
                @"signature": signatureString
            };
            resolve(result);
        } else {
            [self handleError:error reject:reject];
        }
    });
}
#ifdef RCT_NEW_ARCH_ENABLED
RCT_EXPORT_METHOD(createSignature: (JS::NativeStytchReactNativeModule::SpecCreateSignatureCreateSignatureOptions &)createSignatureOptions resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    NSString *payload = createSignatureOptions.payload();
    NSString *biometricRegistrationId = createSignatureOptions.biometricRegistrationId();
    NSString *privateKeyString = createSignatureOptions.privateKey();
    [self createSignatureShared:payload biometricRegistrationId:biometricRegistrationId privateKeyString:privateKeyString resolve:resolve reject:reject];
}
#else
RCT_EXPORT_METHOD(createSignature: (NSDictionary *)params resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *payload = [RCTConvert NSString:params[@"payload"]];
    NSString *biometricRegistrationId = [RCTConvert NSString:params[@"biometricRegistrationId"]];
    NSString *privateKeyString = [RCTConvert NSString:params[@"privateKey"]];
    [self createSignatureShared:payload biometricRegistrationId:biometricRegistrationId privateKeyString:privateKeyString resolve:resolve reject:reject];
}
#endif

RCT_EXPORT_METHOD(biometricKeysExist: (RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_global_queue( DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSDictionary *result = @{
            @"keysExist": [NSNumber numberWithBool:[self doesBiometricKeyExist]]
        };
        resolve(result);
    });
}

RCT_EXPORT_METHOD(isKeystoreAvailable: (RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_global_queue( DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        NSDictionary *result = @{
            @"isKeystoreAvailable": @(YES)
        };
        resolve(result);
    });
}

- (NSString *) getBiometricKeyService {
    return @"com.stytchrnbiometrics.biometricKey";
}

- (NSString *) getBiometricRegistrationIdKeyName {
    return @"com.stytchrnbiometrics.biometricRegistrationId";
}

- (NSString *) getAllowDeviceCredentialsKeyName {
    return @"com.stytchrnbiometrics.allowDeviceCredentials";
}

- (BOOL) doesBiometricKeyExist {
    NSString *biometricKeyService = [self getBiometricKeyService];
    LAContext *context = [[LAContext alloc] init];
    context.interactionNotAllowed = true;
    NSDictionary *searchQuery = @{
        (id)kSecClass: (id)kSecClassGenericPassword,
        (id)kSecAttrService: biometricKeyService,
        (id)kSecUseAuthenticationContext: context
    };
    
    OSStatus status = SecItemCopyMatching((__bridge CFDictionaryRef)searchQuery, nil);
    return status == errSecSuccess || status == errSecInteractionNotAllowed;
}

-(OSStatus) deleteBiometricKey {
    NSString *biometricKeyService = [self getBiometricKeyService];
    NSDictionary *deleteQuery = @{
        (id)kSecClass: (id)kSecClassGenericPassword,
        (id)kSecAttrService: biometricKeyService,
    };
    
    OSStatus status = SecItemDelete((__bridge CFDictionaryRef)deleteQuery);
    return status;
}

- (NSString *)getBiometryType:(LAContext *)context
{
    if (@available(iOS 11, *)) {
        return (context.biometryType == LABiometryTypeFaceID) ? @"FaceID" : @"TouchID";
    }
    
    return @"TouchID";
}

- (NSString *)keychainErrorToString:(OSStatus)error {
    NSString *message = [NSString stringWithFormat:@"%ld", (long)error];
    
    switch (error) {
        case errSecSuccess:
            message = @"success";
            break;
            
        case errSecDuplicateItem:
            message = @"error item already exists";
            break;
            
        case errSecItemNotFound :
            message = @"error item not found";
            break;
            
        case errSecAuthFailed:
            message = @"error item authentication failed";
            break;
            
        default:
            break;
    }
    
    return message;
}

RCT_EXPORT_METHOD(getBiometricRegistrationId: (RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    NSString *biometricRegistrationIdKeyName = [self getBiometricRegistrationIdKeyName];
    NSString *biometricRegistrationId = [[NSUserDefaults standardUserDefaults] stringForKey: biometricRegistrationIdKeyName];
    NSDictionary *result;
    if (biometricRegistrationId) {
        result = @{
            @"biometricRegistrationId": biometricRegistrationId
        };
    } else {
        result = @{};
    }
    resolve(result);
}

RCT_EXPORT_METHOD(signInWithAppleStart: (RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    [[[SignInWithApple alloc] init] startWithCompletionHandler:^(SignInWithAppleResponse * _Nullable response, NSError * _Nullable error) {
        if (error) {
            [self handleError: error reject:reject];
        } else if (response) {
            NSMutableDictionary *fullName = [NSMutableDictionary dictionary];
            
            if (response.name != nil) {
                if (response.name.firstName != nil) {
                    [fullName setObject:response.name.firstName forKey:@"firstName"];
                }
                
                if (response.name.lastName != nil) {
                    [fullName setObject:response.name.lastName forKey:@"lastName"];
                }
            }
            
            NSDictionary *result = @{
                @"idToken": response.idToken,
                @"nonce": response.nonce,
                @"name": fullName
            };
            resolve(result);
        }
    }];
}

RCT_EXPORT_METHOD(resetSecureStorageOnFreshInstall: (NSString *)publicToken) {
    NSString *installIdDefaultsKey = @"stytch_install_id_defaults_key";
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];
    NSString *installId = [defaults stringForKey:installIdDefaultsKey];
    NSString *stateAccount = [@[@"stytch_sdk_state_", publicToken] componentsJoinedByString:@""];
    NSArray *services = @[
        [self getBiometricKeyService],
        @"code_challenge",
        @"code_verifier",
    ];
    if (!installId) {
        [defaults setObject: [[NSUUID UUID] UUIDString] forKey:installIdDefaultsKey];
        SecItemDelete((__bridge CFDictionaryRef)@{
            (id)kSecClass: (id)kSecClassGenericPassword,
            (id)kSecAttrAccount: stateAccount,
        });
        for (NSString *service in services) {
            NSDictionary *deleteQuery = @{
                (id)kSecClass: (id)kSecClassGenericPassword,
                (id)kSecAttrService: service,
            };
            SecItemDelete((__bridge CFDictionaryRef)deleteQuery);
        }
    }
}

RCT_EXPORT_METHOD(getData:(NSString *)key resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    if (storageClient == nil) {
        storageClient = [[StorageClient alloc] init];
    }
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        @try {
            NSString *result = [storageClient getDataWithKey:key];
            resolve(result);
        }
        @catch (NSError *error) {
            [self handleError:error reject:reject];
        }
    });
}

RCT_EXPORT_METHOD(setData:(NSString *)key value:(NSString *)value resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    if (storageClient == nil) {
        storageClient = [[StorageClient alloc] init];
    }
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        @try {
            BOOL result = [storageClient setDataWithKey:key value:value];
            NSNumber *resultNum = [NSNumber numberWithBool:result];
            resolve(resultNum);
        }
        @catch (NSError *error) {
            [self handleError:error reject:reject];
        }
    });
}

RCT_EXPORT_METHOD(clearData:(NSString *)key resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    if (storageClient == nil) {
        storageClient = [[StorageClient alloc] init];
    }
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        @try {
            BOOL result = [storageClient setDataWithKey:key value:nil];
            NSNumber *resultNum = [NSNumber numberWithBool:result];
            resolve(resultNum);
        }
        @catch (NSError *error) {
            [self handleError:error reject:reject];
        }
    });
}

RCT_EXPORT_METHOD(didMigrate:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    if (storageClient == nil) {
        storageClient = [[StorageClient alloc] init];
    }
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        @try {
            BOOL result = [storageClient didMigrate];
            NSNumber *resultNum = [NSNumber numberWithBool:result];
            resolve(resultNum);
        }
        @catch (NSError *error) {
            [self handleError:error reject:reject];
        }
    });
}

RCT_EXPORT_METHOD(migrate:(NSString *)publicToken resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    if (storageClient == nil) {
        storageClient = [[StorageClient alloc] init];
    }
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        @try {
            BOOL result = [storageClient migrateWithPublicToken:publicToken];
            NSNumber *resultNum = [NSNumber numberWithBool:result];
            resolve(resultNum);
        }
        @catch (NSError *error) {
            [self handleError:error reject:reject];
        }
    });
}

- (NSString *) getDeviceId {
    struct utsname systemInfo;
    uname(&systemInfo);
    NSString* deviceId = [NSString stringWithCString:systemInfo.machine
                                            encoding:NSUTF8StringEncoding];
#if TARGET_IPHONE_SIMULATOR
    deviceId = [NSString stringWithFormat:@"%s", getenv("SIMULATOR_MODEL_IDENTIFIER")];
#endif
    return deviceId;
}

- (NSString *) getUserAgent:(WKWebView *)webView {
    return [webView valueForKey:@"userAgent"];
}

RCT_EXPORT_METHOD(getUserAgent:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_main_queue(), ^{
        // From what I can tell, none of the methods in here throw, so we could probably get rid of the try/catch,
        // but leaving it out of an abundance of caution
        @try {
            WKWebView *webView = [WKWebView new];
            NSString* userAgent = [self getUserAgent:webView];
            NSDictionary *result = @{
                @"userAgent": userAgent
            };
            resolve(result);
        }
        @catch (NSError *error) {
            [self handleError:error reject:reject];
        }
    });
}

RCT_EXPORT_METHOD(generateCodeChallenge:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        // From what I can tell, none of the methods in here throw, so we could probably get rid of the try/catch,
        // but leaving it out of an abundance of caution
        @try {
            if (globalPKCEManager == nil) {
                globalPKCEManager = [[PKCEManager alloc] init];
            }
            NSDictionary *result = [globalPKCEManager generateCodeChallengeAndReturnError:nil];
            resolve(result);
        }
        @catch (NSError *error) {
            [self handleError:error reject:reject];
        }
    });
}

RCT_EXPORT_METHOD(initializeRecaptcha:
                  (NSString *)siteKey
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        @try {
            if (captchaProvider == nil) {
                captchaProvider = [[CAPTCHA alloc] init];
            }
            [captchaProvider initializeRecaptchaWithSiteKey:siteKey completionHandler:^(NSError * _Nullable error) {
                NSDictionary *result = @{
                    @"configured": @true
                };
                resolve(result);
            }];
        }
        @catch (NSError *error) {
            [self handleError:error reject:reject];
        }
    });
    
}

RCT_EXPORT_METHOD(executeRecaptcha:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        @try {
            [captchaProvider executeRecaptchaWithCompletionHandler:^(NSString * _Nullable captchaToken, NSError * _Nullable error) {
                NSDictionary *result = @{
                    @"captchaToken": captchaToken
                };
                resolve(result);
            }];
        }
        @catch (NSError *error) {
            [self handleError:error reject:reject];
        }
    });
}

RCT_EXPORT_METHOD(configureDfp:(NSString *)publicToken dfppaDomain:(NSString *)submitURL) {
    if (dfpProvider == nil) {
        dfpProvider = [[DFPClient alloc] init];
    }
    [dfpProvider configureWithPublicToken:publicToken dfppaDomain:submitURL];
}

RCT_EXPORT_METHOD(getTelemetryId: (RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    if (dfpProvider == nil) {
        return [self handleError:[[StytchSDKError alloc] initWithMessage: ErrorTypeDfpNotConfigured] reject:reject];
    }
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        @try {
            [dfpProvider getTelemetryIdWithCompletionHandler:^(NSString * _Nonnull telemetryId) {
                NSDictionary *result = @{
                    @"telemetryId": telemetryId
                };
                resolve(result);
            }];
        }
        @catch (NSError *error) {
            [self handleError:error reject:reject];
        }
    });
}

- (void)registerPasskeyShared:(NSString *)publicKeyCredentialOptions resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    PasskeysClientInterface *passkeysClient = [[PasskeysClient alloc] initWithPasskeysProvider:[[ASPasskeysProvider alloc] init]];
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        [passkeysClient registerWithPublicKeyCredentialOptions:publicKeyCredentialOptions completionHandler:^(NSString * _Nullable response, NSError * _Nullable error) {
            if (error) {
                [self handleError: error reject:reject];
            } else if (response) {
                NSDictionary *result = @{
                    @"publicKeyCredential": response
                };
                resolve(result);
            }
        }];
    });
}

#ifdef RCT_NEW_ARCH_ENABLED
RCT_EXPORT_METHOD(registerPasskey: (JS::NativeStytchReactNativeModule::SpecRegisterPasskeyOptions &)options resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    NSString *publicKeyCredentialOptions = options.publicKeyCredentialOptions();
    [self registerPasskeyShared:publicKeyCredentialOptions resolve:resolve reject:reject];
}
#else
RCT_EXPORT_METHOD(registerPasskey: (NSDictionary *)params resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *publicKeyCredentialOptions = [RCTConvert NSString:params[@"publicKeyCredentialOptions"]];
    [self registerPasskeyShared:publicKeyCredentialOptions resolve:resolve reject:reject];
}
#endif

- (void)authenticatePasskeyShared:(NSString *)publicKeyCredentialOptions resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    PasskeysClientInterface *passkeysClient = [[PasskeysClient alloc] initWithPasskeysProvider:[[ASPasskeysProvider alloc] init]];
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        [passkeysClient authenticateWithPublicKeyCredentialOptions:publicKeyCredentialOptions completionHandler:^(NSString * _Nullable response, NSError * _Nullable error) {
            if (error) {
                [self handleError: error reject:reject];
            } else if (response) {
                NSDictionary *result = @{
                    @"publicKeyCredential": response
                };
                resolve(result);
            }
        }];
    });
}

#ifdef RCT_NEW_ARCH_ENABLED
RCT_EXPORT_METHOD(authenticatePasskey: (JS::NativeStytchReactNativeModule::SpecAuthenticatePasskeyOptions &)options resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    NSString *publicKeyCredentialOptions = options.publicKeyCredentialOptions();
    [self authenticatePasskeyShared:publicKeyCredentialOptions resolve:resolve reject:reject];
}
#else
RCT_EXPORT_METHOD(authenticatePasskey: (NSDictionary *)params resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    NSString *publicKeyCredentialOptions = [RCTConvert NSString:params[@"publicKeyCredentialOptions"]];
    [self authenticatePasskeyShared:publicKeyCredentialOptions resolve:resolve reject:reject];
}
#endif

RCT_EXPORT_METHOD(migrateKeychainItems) {
    if (keyMigrationHelper == nil) {
        keyMigrationHelper = [[KeyMigrationHelper alloc] init];
    }
    BOOL didMigrate = [keyMigrationHelper didMigrateKeys];
    if (didMigrate == false) {
        [keyMigrationHelper run];
    }
}

- (void) handleError:(NSError *)error reject:(RCTPromiseRejectBlock)reject {
    NSString *message;
    if ([error isKindOfClass:[StytchSDKError class]]) {
        StytchSDKError *stytchError = (StytchSDKError *)error;
        // Convert enum to NSString using NSStringFromErrorType
        message = [stytchError toNSString];
        reject(@"StytchSDKError", message, error);
    } else {
        reject(error.domain, error.description, error);
    }
}

RCT_EXPORT_METHOD(loadFontsForUI) {
    if (fontLoader == nil) {
        fontLoader = [[FontLoader alloc] init];
    }
    [fontLoader loadFontsForUI];
}

RCT_EXPORT_METHOD(copyToClipboard:(NSString *)content)
{
  UIPasteboard *clipboard = [UIPasteboard generalPasteboard];
  clipboard.string = (content ? : @"");
}

static os_log_t StytchConsoleLogger(void) {
  static os_log_t logger;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    logger = os_log_create("com.stytch.rn", "JS");
  });
  return logger;
}

RCT_EXPORT_METHOD(consoleLog:(NSString *)message) {
  os_log_with_type(StytchConsoleLogger(), OS_LOG_TYPE_DEFAULT, "%{public}s", message.UTF8String);
}

RCT_EXPORT_METHOD(startRetriever:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    // NOOP
    resolve(nil);
}

RCT_EXPORT_METHOD(googleOneTapStart:(NSString *)clientId autoSelectEnabled:(BOOL)autoSelectEnabled resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject) {
    // NOOP
    resolve(nil);
}

#ifdef RCT_NEW_ARCH_ENABLED
using namespace facebook::react;
- (std::shared_ptr<TurboModule>)getTurboModule:(const ObjCTurboModule::InitParams &)params
{
  return std::make_shared<NativeStytchReactNativeModuleSpecJSI>(params);
}
#endif

@end
