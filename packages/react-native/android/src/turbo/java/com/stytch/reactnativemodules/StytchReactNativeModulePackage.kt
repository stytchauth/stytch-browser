package com.stytch.reactnativemodules

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class StytchReactNativeModulePackage : BaseReactPackage() {
    override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
        if (name == StytchReactNativeModuleImpl.NAME) {
            return StytchReactNativeModule(reactContext)
        } else {
            return null
        }
    }

    override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
        return ReactModuleInfoProvider {
            val isTurboModule = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
            hashMapOf(
                StytchReactNativeModuleImpl.NAME to ReactModuleInfo(
                    StytchReactNativeModuleImpl.NAME,
                    StytchReactNativeModuleImpl.NAME,
                    false,  // canOverrideExistingModule
                    false,  // needsEagerInit
                    // hasConstants
                    false,  // isCxxModule
                    isTurboModule // isTurboModule
                )
            )
        }
    }
}
