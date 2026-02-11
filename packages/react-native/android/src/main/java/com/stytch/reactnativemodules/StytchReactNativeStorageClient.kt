package com.stytch.reactnativemodules

import android.content.Context
import android.content.SharedPreferences
import android.os.Build
import android.util.Base64
import androidx.annotation.VisibleForTesting
import com.facebook.react.bridge.ReactApplicationContext
import com.google.crypto.tink.Aead
import com.google.crypto.tink.KeyTemplates
import com.google.crypto.tink.aead.AeadConfig
import com.google.crypto.tink.integration.android.AndroidKeysetManager
import com.google.crypto.tink.shaded.protobuf.ByteString
import com.google.crypto.tink.shaded.protobuf.InvalidProtocolBufferException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.security.InvalidKeyException
import java.security.KeyStore

class StytchReactNativeStorageClient(
    context: ReactApplicationContext,
    private val sharedPreferences: SharedPreferences,
    keyStore: KeyStore
) {
    private var aead: Aead? = null
    private val sessionMigrationHelper = SessionMigrationHelper(context, keyStore)

    init {
        AeadConfig.register()
        try {
            aead = getOrGenerateNewAES256KeysetManager(context)
                .keysetHandle
                .getPrimitive(Aead::class.java)
        } catch (_: Exception) {
        }
    }

    private fun getOrGenerateNewAES256KeysetManager(context: Context): AndroidKeysetManager {
        return try {
            AndroidKeysetManager.Builder()
                .withSharedPref(context, "", PREF_FILE_NAME)
                .withKeyTemplate(KeyTemplates.get("AES256_GCM"))
                .withMasterKeyUri(MASTER_KEY_URI)
                .build()
        } catch (_: InvalidProtocolBufferException) {
            // Possible that the signing key was changed, or the app was reinstalled. This causes the preferences file
            // to be unreadable, so we need to destroy and recreate it
            context.clearPreferences(PREF_FILE_NAME)
            getOrGenerateNewAES256KeysetManager(context)
        } catch (_: InvalidKeyException) {
            // Possible that the signing key was changed, or the app was reinstalled. This causes the preferences file
            // to be unreadable, so we need to destroy and recreate it
            context.clearPreferences(PREF_FILE_NAME)
            getOrGenerateNewAES256KeysetManager(context)
        }
    }

    suspend fun getData(key: String): String? = withContext(Dispatchers.IO) {
        try {
            val encryptedString = sharedPreferences.getString(key, null)
            decryptString(encryptedString)
        } catch (ex: Exception) {
            null
        }
    }

    suspend fun setData(key: String, value: String?): Boolean = withContext(Dispatchers.IO) {
        try {
            if (value == null) {
                with(sharedPreferences.edit()) {
                    putString(key, null)
                    apply()
                }
                return@withContext true
            }
            val encryptedData = encryptString(value)
            with(sharedPreferences.edit()) {
                putString(key, encryptedData)
                apply()
            }
            true
        } catch (ex: Exception) {
            false
        }
    }

    suspend fun didMigrate(): Boolean = getData("didMigrate")?.let { true } ?: false

    suspend fun migrate(publicToken: String): Boolean {
        val key = "stytch_sdk_state_$publicToken"
        sessionMigrationHelper.getExistingSessionData(key)?.let { sessionData ->
            setData(key, sessionData)
        }
        return setData("didMigrate", "true")
    }

    @VisibleForTesting
    internal fun decryptString(encryptedText: String?): String? {
        // prevent decryption if value is null
        encryptedText ?: return null
        val aead = aead ?: return null
        val ciphertext: ByteArray = encryptedText.toBase64DecodedByteArray()
        val plaintext: ByteArray = aead.decrypt(ciphertext, null)
        return String(plaintext, Charsets.UTF_8)
    }

    @VisibleForTesting
    internal fun encryptString(plainText: String): String? {
        val aead = aead ?: throw Exception()
        val plainBytes: ByteArray = plainText.toByteArray(Charsets.UTF_8)
        val pStr: ByteString = ByteString.copyFrom(plainBytes)
        val cipherText: ByteArray = aead.encrypt(pStr.toByteArray(), null)
        return cipherText.toBase64EncodedString()
    }

    @VisibleForTesting
    internal fun String.toBase64DecodedByteArray(): ByteArray = Base64.decode(this, Base64.NO_WRAP)

    @VisibleForTesting
    internal fun ByteArray.toBase64EncodedString(): String = Base64.encodeToString(this, Base64.NO_WRAP)
}


internal fun Context.clearPreferences(preferencesName: String) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        deleteSharedPreferences(preferencesName)
    } else {
        val file = File(applicationInfo.dataDir, "shared_prefs/$preferencesName.xml")
        file.exists() && file.delete()
    }
}
