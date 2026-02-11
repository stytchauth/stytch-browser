#import <Foundation/Foundation.h>

__attribute__((visibility("default"))) @interface StytchDFP : NSObject

typedef void (^TelemetryIDCompleteCallbackType)(NSString * _Nonnull telemetry_id); //Declare the block type

@property (nonatomic, readonly, strong) NSString * _Nonnull PublicToken;
@property (nonatomic, readonly, strong) NSString * _Nullable SubmitURL;
@property TelemetryIDCompleteCallbackType _Nonnull TelemetryIDCompleteCallback; //Declare the block property using the block type

- (void)getTelemetryID:(TelemetryIDCompleteCallbackType _Nonnull)callback;

- (void)configureWithPublicToken:(NSString * _Nonnull)publicToken
                       submitURL:(NSString * _Nullable)submitURL;

@end
