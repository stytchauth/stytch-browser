package com.stytch.reactnativemodules

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import kotlinx.coroutines.Dispatchers

class StytchReactNativeModule(reactContext: ReactApplicationContext) :
    NativeStytchReactNativeModuleSpec(reactContext) {
    private var implementation: StytchReactNativeModuleImpl = StytchReactNativeModuleImpl(reactContext)

    override fun getName(): String = StytchReactNativeModuleImpl.NAME

    override fun getTypedExportedConstants(): Map<String?, Any?>? = implementation.deviceInfoConstants.toMap()

    // Biometrics
    override fun getSensor(params: ReadableMap, promise: Promise) = implementation.getSensor(params, promise)

    override fun isKeystoreAvailable(promise: Promise) = implementation.isKeystoreAvailable(promise)

    override fun createKeys(params: ReadableMap, promise: Promise) = implementation.createKeys(params, promise, Dispatchers.Main)

    override fun biometricKeysExist(promise: Promise) = implementation.biometricKeysExist(promise)

    override fun deleteKeys(promise: Promise) = implementation.deleteKeys(promise)

    override fun createSignature(params: ReadableMap, promise: Promise) = implementation.createSignature(params, promise)

    override fun getBiometricKey(params: ReadableMap, promise: Promise) =
        implementation.getBiometricKey(params, promise, Dispatchers.Main)

    override fun getBiometricRegistrationId(promise: Promise) = implementation.getBiometricRegistrationId(promise)

    // OAuth
    override fun signInWithAppleStart(promise: Promise) = implementation.signInWithAppleStart(promise)

    override fun googleOneTapStart(clientId: String, autoSelectEnabled: Boolean, promise: Promise) =
        implementation.googleOneTapStart(clientId, autoSelectEnabled, promise)

    // ConsoleLogger
    override fun consoleLog(message: String) = implementation.consoleLog(message)

    // Misc
    override fun resetSecureStorageOnFreshInstall(publicToken: String) =
        implementation.resetSecureStorageOnFreshInstall(publicToken)

    override fun disableUrlCache() = implementation.disableUrlCache()

    override fun configureDfp(publicToken: String, dfppaDomain: String) =
        implementation.configureDfp(publicToken, dfppaDomain)

    override fun getTelemetryId(promise: Promise) = implementation.getTelemetryId(promise, Dispatchers.Main)

    override fun initializeRecaptcha(siteKey: String, promise: Promise) =
        implementation.initializeRecaptcha(siteKey, promise, Dispatchers.Main)

    override fun executeRecaptcha(promise: Promise) = implementation.executeRecaptcha(promise, Dispatchers.Main)

    override fun migrateKeychainItems() = implementation.migrateKeychainItems()

    override fun loadFontsForUI() = implementation.loadFontsForUI()

    override fun copyToClipboard(text: String) = implementation.copyToClipboard(text)

    // Storage
    override fun getData(key: String, promise: Promise) = implementation.getData(key, promise, Dispatchers.Main)

    override fun setData(key: String, value: String, promise: Promise) =
        implementation.setData(key, value, promise, Dispatchers.Main)

    override fun clearData(key: String, promise: Promise) = implementation.clearData(key, promise)

    override fun didMigrate(promise: Promise) = implementation.didMigrate(promise, Dispatchers.Main)

    override fun migrate(publicToken: String, promise: Promise) = implementation.migrate(publicToken, promise, Dispatchers.Main)

    override fun getUserAgent(promise: Promise) = implementation.getUserAgent(promise)

    // PKCE
    override fun generateCodeChallenge(promise: Promise) = implementation.generateCodeChallenge(promise)

    // Passkeys
    override fun registerPasskey(params: ReadableMap, promise: Promise) =
        implementation.registerPasskey(params, promise, Dispatchers.Main)

    override fun authenticatePasskey(params: ReadableMap, promise: Promise) =
        implementation.authenticatePasskey(params, promise, Dispatchers.Main)

    // SMS Autoretriever
    override fun startRetriever(promise: Promise) = implementation.startSmsRetriever(promise)
}