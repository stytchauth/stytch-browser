package com.stytch.reactnativemodules

import android.content.Context
import android.content.SharedPreferences
import android.os.Build
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyPermanentlyInvalidatedException
import android.security.keystore.KeyProperties
import androidx.annotation.RequiresApi
import androidx.annotation.VisibleForTesting
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.biometric.BiometricPrompt.PromptInfo
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.google.crypto.tink.KeyTemplates
import com.google.crypto.tink.integration.android.AndroidKeysetManager
import com.google.crypto.tink.subtle.Base64
import com.google.crypto.tink.subtle.EllipticCurves.generateKeyPair
import org.bouncycastle.crypto.Signer
import org.bouncycastle.crypto.generators.Ed25519KeyPairGenerator
import org.bouncycastle.crypto.params.Ed25519KeyGenerationParameters
import org.bouncycastle.crypto.params.Ed25519PrivateKeyParameters
import org.bouncycastle.crypto.params.Ed25519PublicKeyParameters
import org.bouncycastle.crypto.signers.Ed25519Signer
import java.security.InvalidAlgorithmParameterException
import java.security.KeyStore
import java.security.SecureRandom
import java.util.concurrent.Executor
import java.util.concurrent.Executors
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.IvParameterSpec
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlin.coroutines.suspendCoroutine

internal const val CIPHER_IV_KEY = "biometrics_cipher_iv"
internal const val PRIVATE_KEY = "biometrics_private_key"
internal const val PREF_ALLOW_DEV_CRED = "allow_device_credentials"
internal const val BIOMETRIC_KEY_NAME = "stytch_biometric_key"
internal const val BIOMETRIC_REGISTRATION_ID_KEY_NAME = "biometrics_registration_id"

data class GetSensorResult(val biometryType: String)

fun GetSensorResult.toWritableMap(): WritableMap {
    return Arguments.createMap().apply {
        putString("biometryType", biometryType)
    }
}

data class CreateKeysResult(val publicKey: String, val privateKey: String)

fun CreateKeysResult.toWritableMap(): WritableMap {
    return Arguments.createMap().apply {
        putString("publicKey", publicKey)
        putString("privateKey", privateKey)
    }
}

data class DeleteKeysResult(val keysDeleted: Boolean)

fun DeleteKeysResult.toWritableMap(): WritableMap {
    return Arguments.createMap().apply {
        putBoolean("keysDeleted", keysDeleted)
    }
}

data class CreateSignatureResult(val signature: String)

fun CreateSignatureResult.toWritableMap(): WritableMap {
    return Arguments.createMap().apply {
        putString("signature", signature)
    }
}

data class BiometricKeysExistResult(val keysExist: Boolean)

fun BiometricKeysExistResult.toWritableMap(): WritableMap {
    return Arguments.createMap().apply {
        putBoolean("keysExist", keysExist)
    }
}

data class IsKeystoreAvailableResult(val isKeystoreAvailable: Boolean)

fun IsKeystoreAvailableResult.toWritableMap(): WritableMap {
    return Arguments.createMap().apply {
        putBoolean("isKeystoreAvailable", isKeystoreAvailable)
    }
}

data class GetBiometricKeyResult(val publicKey: String, val privateKey: String)

fun GetBiometricKeyResult.toWritableMap(): WritableMap {
    return Arguments.createMap().apply {
        putString("publicKey", publicKey)
        putString("privateKey", privateKey)
    }
}

data class GetBiometricsRegistrationId(val biometricRegistrationId: String)

fun GetBiometricsRegistrationId.toWritableMap(): WritableMap {
    return Arguments.createMap().apply {
        putString("biometricRegistrationId", biometricRegistrationId)
    }
}

interface BiometricPromptProvider {
    fun getBiometricPrompt(
        fragmentActivity: FragmentActivity,
        executor: Executor,
        authCallback: BiometricPrompt.AuthenticationCallback,
    ): BiometricPrompt
    fun getCryptoObject(cipher: Cipher): BiometricPrompt.CryptoObject
    fun getKeysetManager(context: Context): AndroidKeysetManager
}

private class BiometricPromptProviderImpl : BiometricPromptProvider {
    override fun getBiometricPrompt(
        fragmentActivity: FragmentActivity,
        executor: Executor,
        authCallback: BiometricPrompt.AuthenticationCallback,
    ): BiometricPrompt = BiometricPrompt(fragmentActivity, executor, authCallback)

    override fun getCryptoObject(cipher: Cipher): BiometricPrompt.CryptoObject = BiometricPrompt.CryptoObject(cipher)

    override fun getKeysetManager(context: Context): AndroidKeysetManager {
        return AndroidKeysetManager.Builder()
            .withSharedPref(context, "tink-self-test", PREF_FILE_NAME)
            .withKeyTemplate(KeyTemplates.get("AES256_GCM"))
            .withMasterKeyUri(MASTER_KEY_URI)
            .build()
    }
}

class StytchReactNativeBiometrics(
    private val context: ReactApplicationContext,
    private val biometricPromptProvider: BiometricPromptProvider = BiometricPromptProviderImpl(),
    private val sharedPreferences: SharedPreferences,
    private val keyStore: KeyStore
) {

    @VisibleForTesting
    internal var iV: ByteArray
        get() {
            return sharedPreferences.getString(CIPHER_IV_KEY, null)?.let {
                Base64.decode(it)
            } ?: throw MissingCipherIv
        }
        set(iv) {
            val editor = sharedPreferences.edit()
            editor.putString(CIPHER_IV_KEY, Base64.encode(iv))
            editor.apply()
        }

    @VisibleForTesting
    internal var registerAllowDeviceCredentials: Boolean
        get() {
            return sharedPreferences.getBoolean(PREF_ALLOW_DEV_CRED, false)
        }
        set(allowDeviceCredentials) {
            val editor = sharedPreferences.edit()
            editor.putBoolean(PREF_ALLOW_DEV_CRED, allowDeviceCredentials)
            editor.apply()
        }

    @VisibleForTesting
    internal var privateKeyEncoded: String?
        get() {
            return sharedPreferences.getString(PRIVATE_KEY, null)
        }
        set(privateKey) {
            val editor = sharedPreferences.edit()
            editor.putString(PRIVATE_KEY, privateKey)
            editor.apply()
        }

    @VisibleForTesting
    internal var registrationId: String?
        get() {
            return sharedPreferences.getString(BIOMETRIC_REGISTRATION_ID_KEY_NAME, null)
        }
        set(registrationId) {
            if (registrationId.isNullOrBlank()) {
                throw BiometricRegistrationIdIsNullOrBlank
            }
            val editor = sharedPreferences.edit()
            editor.putString(BIOMETRIC_REGISTRATION_ID_KEY_NAME, registrationId)
            editor.apply()
        }

    @VisibleForTesting
    internal var cipher = Cipher.getInstance(
        KeyProperties.KEY_ALGORITHM_AES + "/" +
            KeyProperties.BLOCK_MODE_CBC + "/" +
            KeyProperties.ENCRYPTION_PADDING_PKCS7,
    )

    fun getSensor(
        allowDeviceCredentials: Boolean,
        biometricManager: BiometricManager = BiometricManager.from(context),
    ): GetSensorResult {
        return when (
            biometricManager.canAuthenticate(
                getAllowedAuthenticators(
                    allowDeviceCredentials,
                ),
            )
        ) {
            BiometricManager.BIOMETRIC_SUCCESS -> {
                // devices with FaceId and no fingerprints will sometimes return true here, but fail
                // to generate the secret key because the factors are not strong enough. Check that.
                // see: https://issuetracker.google.com/issues/147374428
                try {
                    val secretKey = getSecretKey(allowDeviceCredentials)
                    GetSensorResult(biometryType = "Biometrics")
                } catch (_: IllegalStateException) {
                    throw NoBiometricsEnrolled
                } catch (_: InvalidAlgorithmParameterException) {
                    throw NoBiometricsEnrolled
                } catch (_: KeyPermanentlyInvalidatedException) {
                    // we were handling this in native Android, but not in RN. If a key was invalidated
                    // Biometrics are available, but we have to delete the old one
                    deleteBiometricKey()
                    GetSensorResult(biometryType = "Biometrics")
                }
            }
            BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE,
            BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE,
            BiometricManager.BIOMETRIC_ERROR_SECURITY_UPDATE_REQUIRED,
            BiometricManager.BIOMETRIC_ERROR_UNSUPPORTED,
            BiometricManager.BIOMETRIC_STATUS_UNKNOWN,
            -> throw BiometricsUnavailable
            BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> throw NoBiometricsEnrolled
            else -> GetSensorResult(biometryType = "None")
        }
    }

    @VisibleForTesting
    internal fun isUsingKeystore(): Boolean {
        return try {
            val ksm = biometricPromptProvider.getKeysetManager(context)
            return ksm.isUsingKeystore
        } catch (_: Exception) {
            // An error has occurred while loading the Android keystore, so we cannot use it
            false
        }
    }

    suspend fun createKeys(
        promptMessage: String,
        cancelButtonText: String,
        allowDeviceCredentials: Boolean,
        allowFallbackToCleartext: Boolean,
    ): CreateKeysResult = suspendCoroutine { continuation ->
        try {
            if (!isUsingKeystore() && !allowFallbackToCleartext) {
                throw KeystoreUnavailable
            }
            if (biometricKeyExists()) {
                deleteBiometricKey()
            }

            // We will need to compare the values of register(allowDeviceCredentials) and authenticate(allowDeviceCredentials)
            registerAllowDeviceCredentials = allowDeviceCredentials

            cipher.init(Cipher.ENCRYPT_MODE, getSecretKey(allowDeviceCredentials))

            // Create a CryptoObject to hide the private key encryption cipher behind a biometric prompt
            val cryptoObject = biometricPromptProvider.getCryptoObject(cipher)
            val authCallback: BiometricPrompt.AuthenticationCallback =
                object : BiometricPrompt.AuthenticationCallback() {
                    override fun onAuthenticationError(errorCode: Int, err: CharSequence) {
                        super.onAuthenticationError(errorCode, err)
                        val error = handleAuthenticationError(errorCode, err.toString())
                        continuation.resumeWithException(error)
                    }

                    override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                        super.onAuthenticationSucceeded(result)
                        try {
                            val keyPair = generateKeyPair()
                            val publicKeyString = keyPair.first
                            val privateKeyString = keyPair.second
                            result.cryptoObject?.cipher?.let { cipher ->
                                iV = cipher.iv
                                val privateKeyBytes = Base64.decode(privateKeyString)
                                if (privateKeyBytes.size != 32) {
                                    throw InvalidPrivateKeyLength
                                }
                                val encryptedPrivateKey = cipher.doFinal(privateKeyBytes)
                                privateKeyEncoded = Base64.encode(encryptedPrivateKey)
                                continuation.resume(
                                    CreateKeysResult(
                                        publicKey = publicKeyString,
                                        privateKey = privateKeyString,
                                    ),
                                )
                            } ?: continuation.resumeWithException(BiometricsFailed)
                        } catch (e: Exception) {
                            continuation.resumeWithException(e)
                        }
                    }
                }
            val fragmentActivity = context.currentActivity!! as FragmentActivity
            val executor: Executor = Executors.newSingleThreadExecutor()
            val biometricPrompt = biometricPromptProvider.getBiometricPrompt(fragmentActivity, executor, authCallback)
            biometricPrompt.authenticate(
                getPromptInfo(
                    promptMessage,
                    cancelButtonText,
                    allowDeviceCredentials,
                ),
                cryptoObject,
            )
        } catch (_: KeyPermanentlyInvalidatedException) {
            continuation.resumeWithException(KeyInvalidated)
        }
    }

    fun deleteKeys(): DeleteKeysResult {
        return if (biometricKeyExists()) {
            deleteBiometricKey()
            DeleteKeysResult(keysDeleted = true)
        } else {
            DeleteKeysResult(keysDeleted = false)
        }
    }

    fun createSignature(
        payload: String,
        privateKey: String,
        biometricRegistrationId: String,
    ): CreateSignatureResult {
        if (!biometricKeyExists()) {
            throw MissingPublicKey
        }
        val challenge = Base64.decode(payload)
        val privateKeyDecoded = Base64.decode(privateKey)
        val signature = signChallenge(challenge, privateKeyDecoded)
        val signatureString = Base64.encode(signature)

        // We store the biometric registration ID to SharedPreferences since we need it to remove the biometric registration
        registrationId = biometricRegistrationId

        return CreateSignatureResult(signature = signatureString)
    }

    fun biometricKeysExist(): BiometricKeysExistResult {
        return BiometricKeysExistResult(keysExist = biometricKeyExists())
    }

    fun isKeystoreAvailable(): IsKeystoreAvailableResult {
        return IsKeystoreAvailableResult(isKeystoreAvailable = isUsingKeystore())
    }

    @VisibleForTesting
    internal fun getIvParameterSpec() = IvParameterSpec(iV)

    suspend fun getBiometricKey(
        promptMessage: String,
        cancelButtonText: String,
        allowDeviceCredentials: Boolean,
    ): GetBiometricKeyResult = suspendCoroutine { continuation ->
        if (!biometricKeyExists()) {
            throw NoBiometricsRegistration
        }

        // Calling register(allowDeviceCredentials: false) and authenticate(allowDeviceCredentials: true) is not allowed
        if (!registerAllowDeviceCredentials && allowDeviceCredentials) {
            throw DeviceCredentialsNotAllowed
        }

        // Initialization vector (IV) used when encrypting needed for decryption
        cipher.init(
            Cipher.DECRYPT_MODE,
            getSecretKey(allowDeviceCredentials),
            getIvParameterSpec(),
        )

        // Create a CryptoObject to hide the private key decryption cipher behind a biometric prompt
        val cryptoObject = biometricPromptProvider.getCryptoObject(cipher)
        val authCallback: BiometricPrompt.AuthenticationCallback =
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationError(errorCode: Int, err: CharSequence) {
                    super.onAuthenticationError(errorCode, err)
                    val error = handleAuthenticationError(errorCode, err.toString())
                    continuation.resumeWithException(error)
                }

                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    try {
                        result.cryptoObject?.cipher?.let { cipher ->
                            val privateKey = cipher.doFinal(Base64.decode(privateKeyEncoded))
                            val publicKey = getPublicKeyFromPrivateKey(privateKey)
                            val publicKeyString = Base64.encode(publicKey)
                            val privateKeyString = Base64.encode(privateKey)
                            continuation.resume(
                                GetBiometricKeyResult(
                                    publicKey = publicKeyString,
                                    privateKey = privateKeyString,
                                ),
                            )
                        } ?: continuation.resumeWithException(BiometricsFailed)
                    } catch (e: Exception) {
                        continuation.resumeWithException(e)
                    }
                }
            }
        val fragmentActivity = context.currentActivity!! as FragmentActivity
        val executor: Executor = Executors.newSingleThreadExecutor()
        val biometricPrompt = biometricPromptProvider.getBiometricPrompt(
            fragmentActivity,
            executor,
            authCallback,
        )
        biometricPrompt.authenticate(
            getPromptInfo(promptMessage, cancelButtonText, allowDeviceCredentials),
            cryptoObject,
        )
    }

    fun getBiometricRegistrationId(): GetBiometricsRegistrationId {
        // The biometric registration ID is stored in SharedPreferences
        registrationId?.let {
            return GetBiometricsRegistrationId(biometricRegistrationId = it)
        } ?: throw NoBiometricsRegistration
    }

    @VisibleForTesting
    internal fun getPromptInfo(
        promptMessage: String,
        cancelButtonText: String,
        allowDeviceCredentials: Boolean,
    ): PromptInfo {
        return PromptInfo.Builder().apply {
            setTitle(promptMessage)
            setAllowedAuthenticators(getAllowedAuthenticators(allowDeviceCredentials))
            if (!allowDeviceCredentials || isCurrentSDK29OrEarlier) {
                setNegativeButtonText(cancelButtonText)
            }
        }.build()
    }

    @VisibleForTesting
    internal fun getAllowedAuthenticators(allowDeviceCredentials: Boolean): Int {
        return if (allowDeviceCredentials && !isCurrentSDK29OrEarlier) {
            BiometricManager.Authenticators.BIOMETRIC_STRONG or BiometricManager.Authenticators.DEVICE_CREDENTIAL
        } else {
            BiometricManager.Authenticators.BIOMETRIC_STRONG
        }
    }

    @VisibleForTesting
    internal val isCurrentSDK29OrEarlier: Boolean
        get() = Build.VERSION.SDK_INT <= Build.VERSION_CODES.Q

    @VisibleForTesting
    internal val isCurrentSDK30OrEarlier: Boolean
        get() = Build.VERSION.SDK_INT <= Build.VERSION_CODES.R


    /**
     * Generates an Ed25519 public-private key pair.
     *
     * @returns a Pair of Base64 encoded strings containing the public key and private key.
     */
    @VisibleForTesting
    internal fun generateKeyPair(): Pair<String, String> {
        val generator = Ed25519KeyPairGenerator()
        generator.init(Ed25519KeyGenerationParameters(SecureRandom()))
        val keyPair = generator.generateKeyPair()
        val publicKey = (keyPair.public as Ed25519PublicKeyParameters).encoded
        val privateKey = (keyPair.private as Ed25519PrivateKeyParameters).encoded
        return Pair(Base64.encode(publicKey), Base64.encode(privateKey))
    }

    @VisibleForTesting
    internal fun signChallenge(challenge: ByteArray, privateKey: ByteArray): ByteArray {
        val signer: Signer = Ed25519Signer()
        val privateKeyParams = Ed25519PrivateKeyParameters(privateKey)
        signer.init(true, privateKeyParams)
        signer.update(challenge, 0, challenge.size)
        return signer.generateSignature()
    }

    @VisibleForTesting
    internal fun getPublicKeyFromPrivateKey(privateKey: ByteArray): ByteArray {
        val privateKeyRebuild = Ed25519PrivateKeyParameters(privateKey, 0)
        val publicKeyRebuild = privateKeyRebuild.generatePublicKey()
        return publicKeyRebuild.encoded
    }

    /**
     * Generates a new master key to use for encryption/decryption of the private key.
     */
    @VisibleForTesting
    internal fun generateSecretKey(allowDeviceCredentials: Boolean): SecretKey {
        val keyGenerator =
            KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
        val spec: KeyGenParameterSpec = KeyGenParameterSpec.Builder(
            BIOMETRIC_KEY_NAME,
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT,
        ).apply {
            setBlockModes(KeyProperties.BLOCK_MODE_CBC)
            setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_PKCS7)
            setUserAuthenticationRequired(true)
            if (!isCurrentSDK30OrEarlier) {
                setUserAuthenticationParameters(
                    0,
                    getUserAuthenticationParameters(allowDeviceCredentials),
                )
            }
        }.build()
        keyGenerator.init(spec)
        return keyGenerator.generateKey()
    }

    @RequiresApi(Build.VERSION_CODES.R)
    @VisibleForTesting
    internal fun getUserAuthenticationParameters(allowDeviceCredentials: Boolean): Int {
        return if (allowDeviceCredentials && !isCurrentSDK30OrEarlier) {
            KeyProperties.AUTH_BIOMETRIC_STRONG or KeyProperties.AUTH_DEVICE_CREDENTIAL
        } else {
            KeyProperties.AUTH_BIOMETRIC_STRONG
        }
    }

    /**
     * Gets the master key from Android Keystore.
     */
    @VisibleForTesting
    internal fun getSecretKey(allowDeviceCredentials: Boolean): SecretKey {
        val keyStore = KeyStore.getInstance("AndroidKeyStore")
        keyStore.load(null)
        val key = keyStore.getKey(BIOMETRIC_KEY_NAME, null) as? SecretKey
        return key ?: generateSecretKey(allowDeviceCredentials)
    }

    @VisibleForTesting
    internal fun biometricKeyExists(): Boolean = !privateKeyEncoded.isNullOrBlank()

    @VisibleForTesting
    internal fun deleteBiometricKey() {
        // First we delete the master key in the Android Keystore
        keyStore.deleteEntry(BIOMETRIC_KEY_NAME)
        // Then we delete the encrypted private key and initialization vector (IV) from SharedPreferences
        val editor = sharedPreferences.edit()
        editor.remove(PRIVATE_KEY)
        editor.remove(CIPHER_IV_KEY)
        editor.apply()
    }

    @VisibleForTesting
    internal fun handleAuthenticationError(errorCode: Int, err: String): Throwable {
        return when (errorCode) {
            BiometricPrompt.ERROR_HW_NOT_PRESENT,
            BiometricPrompt.ERROR_HW_UNAVAILABLE,
            BiometricPrompt.ERROR_NO_SPACE,
            BiometricPrompt.ERROR_SECURITY_UPDATE_REQUIRED,
            BiometricPrompt.ERROR_VENDOR,
            -> BiometricsUnavailable
            BiometricPrompt.ERROR_LOCKOUT,
            BiometricPrompt.ERROR_LOCKOUT_PERMANENT,
            BiometricPrompt.ERROR_TIMEOUT,
            -> UserLockedOut
            BiometricPrompt.ERROR_NO_BIOMETRICS,
            BiometricPrompt.ERROR_NO_DEVICE_CREDENTIAL,
            -> NoBiometricsEnrolled
            BiometricPrompt.ERROR_CANCELED,
            BiometricPrompt.ERROR_UNABLE_TO_PROCESS,
            -> BiometricsUnavailable
            BiometricPrompt.ERROR_NEGATIVE_BUTTON,
            BiometricPrompt.ERROR_USER_CANCELED,
            -> UserCancellation
            else -> RuntimeException("Unknown Biometric Sensor Error")
        }
    }
}
