package com.stytch.reactnativemodules

import android.util.Base64
import org.json.JSONException
import org.json.JSONObject
import java.io.IOException
import java.nio.charset.StandardCharsets
import java.security.GeneralSecurityException
import java.security.Key
import java.security.KeyStore
import java.security.MessageDigest
import java.util.*
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec
import kotlin.math.min

object AESHelper {
    private const val EXPO_AES_CIPHER = "AES/GCM/NoPadding"
    const val EXPO_KEYSTORE_ALIAS = "$EXPO_AES_CIPHER:key_v1"
    private const val CRYPTO_ES_AES_CIPHER = "AES/CBC/PKCS7Padding"
    private const val CIPHERTEXT_PROPERTY = "ct"
    private const val IV_PROPERTY = "iv"
    private const val GCM_AUTHENTICATION_TAG_LENGTH_PROPERTY = "tlen"
    private const val IV_LENGTH = 16
    private const val KEY_SIZE = 256
    private const val IV_SIZE = 128
    private const val KDF_DIGEST = "MD5"

    @Throws(GeneralSecurityException::class, JSONException::class)
    fun decryptExpoItemFromJSON(encryptedItem: JSONObject, secretKeyEntry: KeyStore.SecretKeyEntry): String {
        val ciphertext = encryptedItem.getString(CIPHERTEXT_PROPERTY)
        val ivString = encryptedItem.getString(IV_PROPERTY)
        val authenticationTagLength = encryptedItem.getInt(GCM_AUTHENTICATION_TAG_LENGTH_PROPERTY)
        val ciphertextBytes: ByteArray = Base64.decode(ciphertext, Base64.DEFAULT)
        val ivBytes: ByteArray = Base64.decode(ivString, Base64.DEFAULT)
        val gcmSpec = GCMParameterSpec(authenticationTagLength, ivBytes)
        val cipher: Cipher = Cipher.getInstance(EXPO_AES_CIPHER)
        cipher.init(Cipher.DECRYPT_MODE, secretKeyEntry.secretKey, gcmSpec)
        return String(cipher.doFinal(ciphertextBytes), StandardCharsets.UTF_8)
    }

    @Throws(GeneralSecurityException::class)
    fun decryptRNItemWithKey(encryptedItem: String, key: Key): String {
        val bytes = Base64.decode(encryptedItem, Base64.DEFAULT)
        val iv = readIv(bytes)
        val cipher = Cipher.getInstance(CRYPTO_ES_AES_CIPHER)
        cipher.init(Cipher.DECRYPT_MODE, key, iv)
        return String(cipher.doFinal(bytes, IV_LENGTH, bytes.size - IV_LENGTH), StandardCharsets.UTF_8)
    }

    @Throws(IOException::class)
    private fun readIv(bytes: ByteArray): IvParameterSpec {
        val iv = ByteArray(IV_LENGTH)
        if (IV_LENGTH >= bytes.size) throw IOException("Insufficient length of input data for IV extracting.")
        System.arraycopy(bytes, 0, iv, 0, IV_LENGTH)
        return IvParameterSpec(iv)
    }

    /**
     * Conforming with CryptoJS AES method
     */
    // see https://gist.github.com/thackerronak/554c985c3001b16810af5fc0eb5c358f
    /**
     * Decrypt
     * Thanks Artjom B. for this: http://stackoverflow.com/a/29152379/4405051
     * @param password passphrase
     * @param cipherText encrypted string
     */
    fun decryptCryptoAES(password: String, cipherText: String): String {
        val ctBytes = Base64.decode(cipherText.toByteArray(), Base64.NO_WRAP)
        val saltBytes = Arrays.copyOfRange(ctBytes, 8, 16)
        val cipherTextBytes = Arrays.copyOfRange(ctBytes, 16, ctBytes.size)
        val (key, iv) = EvpKDF(password.toByteArray(), saltBytes)
        val cipher = Cipher.getInstance(CRYPTO_ES_AES_CIPHER)
        val keyS = SecretKeySpec(key, "AES")
        cipher.init(Cipher.DECRYPT_MODE, keyS, IvParameterSpec(iv))
        val plainText = cipher.doFinal(cipherTextBytes)
        return String(plainText)
    }

    private fun EvpKDF(password: ByteArray, salt: ByteArray): Pair<ByteArray, ByteArray> {
        val keySize = KEY_SIZE / 32
        val ivSize = IV_SIZE / 32
        val targetKeySize = keySize + ivSize
        val derivedBytes = ByteArray(targetKeySize * 4)
        var numberOfDerivedWords = 0
        var block: ByteArray? = null
        val hash = MessageDigest.getInstance(KDF_DIGEST)
        val resultKey = ByteArray(KEY_SIZE / 8)
        val resultIv = ByteArray(IV_SIZE / 8)
        while (numberOfDerivedWords < targetKeySize) {
            if (block != null) {
                hash.update(block)
            }
            hash.update(password)
            block = hash.digest(salt)
            hash.reset()
            System.arraycopy(
                block!!,
                0,
                derivedBytes,
                numberOfDerivedWords * 4,
                min(block.size, (targetKeySize - numberOfDerivedWords) * 4),
            )
            numberOfDerivedWords += block.size / 4
        }
        System.arraycopy(derivedBytes, 0, resultKey, 0, keySize * 4)
        System.arraycopy(derivedBytes, keySize * 4, resultIv, 0, ivSize * 4)
        return Pair(resultKey, resultIv) // key + iv
    }
}
