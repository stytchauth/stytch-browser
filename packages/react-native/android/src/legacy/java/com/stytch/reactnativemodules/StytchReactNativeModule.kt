package com.stytch.reactnativemodules

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import kotlinx.coroutines.Dispatchers

class StytchReactNativeModule(reactContext: ReactApplicationContext): ReactContextBaseJavaModule(reactContext) {
    private var implementation: StytchReactNativeModuleImpl = StytchReactNativeModuleImpl(reactContext)

    override fun getName(): String = StytchReactNativeModuleImpl.NAME

    override fun getConstants(): Map<String?, Any?>? = implementation.deviceInfoConstants.toMap()

    // Biometrics
    @ReactMethod
    fun getSensor(params: ReadableMap, promise: Promise) = implementation.getSensor(params, promise)

    @ReactMethod
    fun isKeystoreAvailable(promise: Promise) = implementation.isKeystoreAvailable(promise)

    @ReactMethod
    fun createKeys(params: ReadableMap, promise: Promise) = implementation.createKeys(params, promise, Dispatchers.Main)

    @ReactMethod
    fun biometricKeysExist(promise: Promise) = implementation.biometricKeysExist(promise)

    @ReactMethod
    fun deleteKeys(promise: Promise) = implementation.deleteKeys(promise)

    @ReactMethod
    fun createSignature(params: ReadableMap, promise: Promise) = implementation.createSignature(params, promise)

    @ReactMethod
    fun getBiometricKey(params: ReadableMap, promise: Promise) =
        implementation.getBiometricKey(params, promise, Dispatchers.Main)

    @ReactMethod
    fun getBiometricRegistrationId(promise: Promise) = implementation.getBiometricRegistrationId(promise)

    // OAuth
    @ReactMethod
    fun signInWithAppleStart(promise: Promise) = implementation.signInWithAppleStart(promise)

    @ReactMethod
    fun googleOneTapStart(clientId: String, autoSelectEnabled: Boolean, promise: Promise) =
        implementation.googleOneTapStart(clientId, autoSelectEnabled, promise)

    // ConsoleLogger
    @ReactMethod
    fun consoleLog(message: String) = implementation.consoleLog(message)

    // Misc
    @ReactMethod
    fun resetSecureStorageOnFreshInstall(publicToken: String) =
        implementation.resetSecureStorageOnFreshInstall(publicToken)

    @ReactMethod
    fun disableUrlCache() = implementation.disableUrlCache()

    @ReactMethod
    fun configureDfp(publicToken: String, dfppaDomain: String) =
        implementation.configureDfp(publicToken, dfppaDomain)

    @ReactMethod
    fun getTelemetryId(promise: Promise) = implementation.getTelemetryId(promise, Dispatchers.Main)

    @ReactMethod
    fun initializeRecaptcha(siteKey: String, promise: Promise) =
        implementation.initializeRecaptcha(siteKey, promise, Dispatchers.Main)

    @ReactMethod
    fun executeRecaptcha(promise: Promise) = implementation.executeRecaptcha(promise, Dispatchers.Main)

    @ReactMethod
    fun migrateKeychainItems() = implementation.migrateKeychainItems()

    @ReactMethod
    fun loadFontsForUI() = implementation.loadFontsForUI()

    @ReactMethod
    fun copyToClipboard(text: String) = implementation.copyToClipboard(text)

    // Storage
    @ReactMethod
    fun getData(key: String, promise: Promise) = implementation.getData(key, promise, Dispatchers.Main)

    @ReactMethod
    fun setData(key: String, value: String, promise: Promise) =
        implementation.setData(key, value, promise, Dispatchers.Main)

    @ReactMethod
    fun clearData(key: String, promise: Promise) = implementation.clearData(key, promise)

    @ReactMethod
    fun didMigrate(promise: Promise) = implementation.didMigrate(promise, Dispatchers.Main)

    @ReactMethod
    fun migrate(publicToken: String, promise: Promise) = implementation.migrate(publicToken, promise, Dispatchers.Main)

    @ReactMethod
    fun getUserAgent(promise: Promise) = implementation.getUserAgent(promise)

    // PKCE
    @ReactMethod
    fun generateCodeChallenge(promise: Promise) = implementation.generateCodeChallenge(promise)

    // Passkeys
    @ReactMethod
    fun isPasskeysSupported(promise: Promise) = implementation.isPasskeysSupported(promise)

    @ReactMethod
    fun registerPasskey(params: ReadableMap, promise: Promise) =
        implementation.registerPasskey(params, promise, Dispatchers.Main)

    @ReactMethod
    fun authenticatePasskey(params: ReadableMap, promise: Promise) =
        implementation.authenticatePasskey(params, promise, Dispatchers.Main)

    // SMS Autoretriever
    @ReactMethod
    fun startRetriever(promise: Promise) = implementation.startSmsRetriever(promise)
}
