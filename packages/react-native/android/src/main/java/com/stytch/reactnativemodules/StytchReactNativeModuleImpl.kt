package com.stytch.reactnativemodules

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.os.Build
import android.util.Base64
import android.webkit.WebSettings
import androidx.annotation.VisibleForTesting
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.security.KeyStore
import java.security.MessageDigest
import java.util.TimeZone
import kotlin.random.Random


internal const val PREF_FILE_NAME = "stytch_secured_pref"
internal const val MASTER_KEY_ALIAS = "stytch_master_key"
internal const val MASTER_KEY_URI = "android-keystore://$MASTER_KEY_ALIAS"
private const val CODE_CHALLENGE_BYTE_COUNT = 32
private const val HEX_RADIX = 16

class StytchReactNativeModuleImpl(private val reactContext: ReactApplicationContext) {
    private val keyStore = KeyStore.getInstance("AndroidKeyStore")
    private val sharedPreferences = reactContext.getSharedPreferences(PREF_FILE_NAME, Context.MODE_PRIVATE)
    private val clipboardService: ClipboardManager by lazy {
        reactContext.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
    }
    @VisibleForTesting
    internal var biometrics: StytchReactNativeBiometrics =
        StytchReactNativeBiometrics(reactContext, sharedPreferences = sharedPreferences, keyStore = keyStore)

    @VisibleForTesting
    internal var googleOneTap: StytchReactNativeGoogleOneTap =
        StytchReactNativeGoogleOneTap(reactContext)

    @VisibleForTesting
    internal var storageClient: StytchReactNativeStorageClient =
        StytchReactNativeStorageClient(reactContext, sharedPreferences, keyStore)

    @VisibleForTesting
    internal var dfp: StytchReactNativeDFPProvider =
        StytchReactNativeDFPProvider(reactContext)

    @VisibleForTesting
    internal var captcha: StytchReactNativeCaptchaProvider =
        StytchReactNativeCaptchaProvider(reactContext)

    @VisibleForTesting
    internal var passkeys: StytchReactNativePasskeys =
        StytchReactNativePasskeys()

    internal var smsRetriever: StytchReactNativeSMSRetriever =
        StytchReactNativeSMSRetriever(reactContext)

    val deviceInfoConstants = hashMapOf<String, Any>(
        "DEVICE_INFO" to hashMapOf<String, String>(
            "systemName" to "Android",
            "systemVersion" to Build.VERSION.RELEASE,
            "bundleId" to reactContext.packageName,
            "deviceId" to Build.BOARD,
            "timezone" to TimeZone.getDefault().id,
        )
    )

    // region Biometrics methods
    fun getSensor(params: ReadableMap, promise: Promise) {
        try {
            val allowDeviceCredentials = params.getBoolean("allowDeviceCredentials")
            val result = biometrics.getSensor(allowDeviceCredentials)
            promise.resolve(result.toWritableMap())
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    fun createKeys(
        params: ReadableMap,
        promise: Promise,
        dispatcher: CoroutineDispatcher,
    ) {
        CoroutineScope(dispatcher).launch {
            runCatching {
                val promptMessage = params.getString("promptMessage")!!
                val cancelButtonText = params.getString("cancelButtonText")!!
                val allowDeviceCredentials = params.getBoolean("allowDeviceCredentials")
                val allowFallbackToCleartext = params.getBoolean("allowFallbackToCleartext")
                val result = biometrics.createKeys(
                    promptMessage,
                    cancelButtonText,
                    allowDeviceCredentials,
                    allowFallbackToCleartext,
                )
                promise.resolve(result.toWritableMap())
            }.onFailure {
                promise.reject(it)
            }
        }
    }

    fun deleteKeys(promise: Promise) {
        try {
            val result = biometrics.deleteKeys()
            promise.resolve(result.toWritableMap())
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    fun createSignature(params: ReadableMap, promise: Promise) {
        try {
            val payload = params.getString("payload")!!
            val privateKey = params.getString("privateKey")!!
            val biometricRegistrationId = params.getString("biometricRegistrationId")!!
            val result = biometrics.createSignature(payload, privateKey, biometricRegistrationId)
            promise.resolve(result.toWritableMap())
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    fun biometricKeysExist(promise: Promise) {
        try {
            val result = biometrics.biometricKeysExist()
            promise.resolve(result.toWritableMap())
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    fun isKeystoreAvailable(promise: Promise) {
        try {
            val result = biometrics.isKeystoreAvailable()
            promise.resolve(result.toWritableMap())
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    fun getBiometricKey(
        params: ReadableMap,
        promise: Promise,
        dispatcher: CoroutineDispatcher,
    ) {
        CoroutineScope(dispatcher).launch {
            runCatching {
                val promptMessage = params.getString("promptMessage")!!
                val cancelButtonText = params.getString("cancelButtonText")!!
                val allowDeviceCredentials = params.getBoolean("allowDeviceCredentials")
                val result =
                    biometrics.getBiometricKey(promptMessage, cancelButtonText, allowDeviceCredentials)
                promise.resolve(result.toWritableMap())
            }.onFailure {
                promise.reject(it)
            }
        }
    }

    fun getBiometricRegistrationId(promise: Promise) {
        try {
            val result = biometrics.getBiometricRegistrationId()
            promise.resolve(result.toWritableMap())
        } catch (e: Exception) {
            promise.reject(e)
        }
    }
    // endregion

    // region OAuth methods
    fun signInWithAppleStart(promise: Promise) {
        // NOOP
        promise.resolve(null)
    }

    fun googleOneTapStart(clientId: String, autoSelectEnabled: Boolean = false, promise: Promise) {
        CoroutineScope(Dispatchers.Main).launch {
            runCatching {
                when (val result = googleOneTap.start(clientId, autoSelectEnabled)) {
                    is HandleIntentResult.Success -> promise.resolve(result.toWritableMap())
                    is HandleIntentResult.Error -> promise.reject(result.exception)
                }
            }.onFailure {
                promise.reject(it)
            }
        }
    }
    // endregion

    // ConsoleLogger
    fun consoleLog(message: String) {
        println(message)
    }

    // region Storage Client
    fun getData(
        key: String,
        promise: Promise,
        dispatcher: CoroutineDispatcher,
    ) {
        CoroutineScope(dispatcher).launch {
            runCatching {
                promise.resolve(storageClient.getData(key))
            }.onFailure {
                promise.reject(it)
            }
        }
    }

    fun setData(
        key: String,
        value: String?,
        promise: Promise,
        dispatcher: CoroutineDispatcher,
    ) {
        CoroutineScope(dispatcher).launch {
            runCatching {
                promise.resolve(storageClient.setData(key, value))
            }.onFailure {
                promise.reject(it)
            }
        }
    }

    fun clearData(key: String, promise: Promise) {
        setData(key, null, promise, Dispatchers.Main)
    }

    fun didMigrate(promise: Promise, dispatcher: CoroutineDispatcher) {
        CoroutineScope(dispatcher).launch {
            runCatching {
                promise.resolve(storageClient.didMigrate())
            }.onFailure {
                promise.reject(it)
            }
        }
    }

    fun migrate(publicToken: String, promise: Promise, dispatcher: CoroutineDispatcher) {
        CoroutineScope(dispatcher).launch {
            runCatching {
                promise.resolve(storageClient.migrate(publicToken))
            }.onFailure {
                promise.reject(it)
            }
        }
    }
    // endregion

    // region PKCE
    fun generateCodeChallenge(promise: Promise) {
        try {
            val randomGenerator = Random(System.currentTimeMillis())
            val randomBytes: ByteArray = randomGenerator.nextBytes(CODE_CHALLENGE_BYTE_COUNT)
            val codeVerifier = randomBytes.toHexString()
            val codeChallenge = encryptCodeChallenge(codeVerifier)
            val result = Arguments.createMap().apply {
                putString("code_challenge", codeChallenge)
                putString("code_verifier", codeVerifier)
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }
    fun encryptCodeChallenge(codeChallenge: String): String {
        return convertToBase64UrlEncoded(getSha256(codeChallenge))
    }
    private fun getSha256(hexString: String): String {
        // convert hexString to bytes
        val bytes = hexString.toByteArray()
        val md = MessageDigest.getInstance("SHA-256")
        val digest = md.digest(bytes)
        return digest.fold("") { str, byte -> str + "%02x".format(byte) }
    }
    private fun convertToBase64UrlEncoded(value: String): String {
        val base64String = value.hexStringToByteArray().toBase64EncodedString()
        return base64String
            .replace("+", "-")
            .replace("/", "_")
            .replace("=", "")
    }
    // endregion

    //region Passkeys
    fun isPasskeysSupported(promise: Promise) {
        val result = passkeys.isSupported
        if (result.isSupported) {
            promise.resolve(result.toWritableMap())
        } else {
            promise.reject(PasskeysUnsupported)
        }
    }

    fun registerPasskey(params: ReadableMap, promise: Promise, dispatcher: CoroutineDispatcher) {
        CoroutineScope(dispatcher).launch {
            runCatching {
                val result = passkeys.register(
                    reactContext.currentActivity!!,
                    params.getString("publicKeyCredentialOptions")!!
                )
                promise.resolve(result.toWritableMap())
            }.onFailure {
                promise.reject(it)
            }
        }
    }

    fun authenticatePasskey(params: ReadableMap, promise: Promise, dispatcher: CoroutineDispatcher) {
        CoroutineScope(dispatcher).launch {
            runCatching {
                val result = passkeys.authenticate(
                    reactContext.currentActivity!!,
                    params.getString("publicKeyCredentialOptions")!!
                )
                promise.resolve(result.toWritableMap())
            }.onFailure {
                promise.reject(it)
            }
        }
    }
    //endregion

    // region Misc methods
    fun resetSecureStorageOnFreshInstall(publicToken: String) {
        // NOOP
    }

    fun disableUrlCache() {
        // NOOP
    }

    fun migrateKeychainItems() {
        // NOOP
    }

    fun loadFontsForUI() {
        // NOOP
    }

    fun configureDfp(publicToken: String, dfppaDomain: String) {
        dfp.configure(publicToken, dfppaDomain)
    }

    fun getTelemetryId(
        promise: Promise,
        dispatcher: CoroutineDispatcher,
    ) {
        CoroutineScope(dispatcher).launch {
            runCatching {
                val telemetryId = dfp.getTelemetryId()
                val result = Arguments.createMap().apply {
                    putString("telemetryId", telemetryId)
                }
                promise.resolve(result)
            }.onFailure {
                promise.reject(it)
            }
        }
    }

    fun initializeRecaptcha(
        siteKey: String,
        promise: Promise,
        dispatcher: CoroutineDispatcher,
    ) {
        CoroutineScope(dispatcher).launch {
            runCatching {
                captcha.initializeRecaptcha(siteKey)
                val result = Arguments.createMap().apply {
                    putBoolean("success", true)
                }
                promise.resolve(result)
            }.onFailure {
                promise.reject(it)
            }
        }
    }

    fun executeRecaptcha(
        promise: Promise,
        dispatcher: CoroutineDispatcher,
    ) {
        CoroutineScope(dispatcher).launch {
            runCatching {
                val captchaToken = captcha.executeRecaptcha()
                val result = Arguments.createMap().apply {
                    putString("captchaToken", captchaToken)
                }
                promise.resolve(result)
            }.onFailure {
                promise.reject(it)
            }
        }
    }
    // endregion

    fun getUserAgent(promise: Promise) {
        val userAgent = reactContext.currentActivity?.let {
            WebSettings.getDefaultUserAgent(it)
        } ?: "Unknown userAgent"
        val result = Arguments.createMap().apply {
            putString("userAgent", userAgent)
        }
        promise.resolve(result)
    }

    fun startSmsRetriever(promise: Promise) {
        smsRetriever.start { code ->
            smsRetriever.finish()
            promise.resolve(code)
        }
    }

    fun copyToClipboard(text: String, promise: Promise? = null) {
        try {
            val clipdata = ClipData.newPlainText(null, text)
            clipboardService.setPrimaryClip(clipdata)
            promise?.resolve(null)
        } catch (e: Exception) {
            promise?.reject(e)
        }
    }

    init {
        keyStore.load(null)
        if (!keyStore.containsAlias(MASTER_KEY_ALIAS)) {
            // If an app is restored on device, the encrypted shared preference files will be restored, but the key
            // to decrypt them will NOT. If, on startup, we detect that there is no master key, we should clean
            // up any potentially restored preference files
            // NOTE: this is a slightly different flow than if the key is corrupted, which is checked in the
            // `getOrGenerateNewAES256KeysetManager` method
            reactContext.clearPreferences(PREF_FILE_NAME)
        }
    }

    companion object {
        const val NAME = "StytchReactNativeModule"
    }
}

private fun ByteArray.toHexString(): String =
    joinToString(separator = "") { byte -> "%02x".format(byte) }

private fun String.hexStringToByteArray(): ByteArray =
    chunked(2).map { it.toInt(HEX_RADIX).toByte() }.toByteArray()

private fun ByteArray.toBase64EncodedString(): String =
    Base64.encodeToString(this, Base64.NO_WRAP)