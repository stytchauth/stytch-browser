package com.stytch.reactnativemodules

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Base64
import androidx.annotation.VisibleForTesting
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetCredentialResponse
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.google.android.gms.auth.api.identity.BeginSignInRequest
import com.google.android.gms.auth.api.identity.Identity
import com.google.android.gms.auth.api.identity.SignInClient
import com.google.android.gms.common.api.ApiException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.android.libraries.identity.googleid.GoogleIdTokenParsingException
import kotlinx.coroutines.withContext
import java.security.MessageDigest
import kotlin.random.Random

const val ONETAP_INTENT_ID = 555
private const val HEX_RADIX = 16
private const val CODE_CHALLENGE_BYTE_COUNT = 32

sealed interface HandleIntentResult {
    data class Success(val idToken: String, val nonce: String) : HandleIntentResult
    data class Error(val exception: Exception) : HandleIntentResult
}

fun HandleIntentResult.Success.toWritableMap(): WritableMap {
    return Arguments.createMap().apply {
        putString("idToken", idToken)
        putString("nonce", nonce)
    }
}
interface GoogleCredentialManagerProvider {
    suspend fun getSignInWithGoogleCredential(
        activity: Activity,
        clientId: String,
        autoSelectEnabled: Boolean,
        nonce: String,
    ): GetCredentialResponse

    fun createTokenCredential(credentialData: Bundle): GoogleIdTokenCredential
}

internal class GoogleCredentialManagerProviderImpl : GoogleCredentialManagerProvider {
    override suspend fun getSignInWithGoogleCredential(
        activity: Activity,
        clientId: String,
        autoSelectEnabled: Boolean,
        nonce: String,
    ): GetCredentialResponse {
        val credentialManager = CredentialManager.create(activity)
        val option: GetGoogleIdOption =
            GetGoogleIdOption
                .Builder()
                .setServerClientId(clientId)
                .setNonce(nonce)
                .setAutoSelectEnabled(autoSelectEnabled)
                .build()
        val request: GetCredentialRequest =
            GetCredentialRequest
                .Builder()
                .addCredentialOption(option)
                .setPreferImmediatelyAvailableCredentials(true)
                .build()
        return credentialManager.getCredential(activity, request)
    }

    override fun createTokenCredential(credentialData: Bundle): GoogleIdTokenCredential =
        GoogleIdTokenCredential.createFrom(credentialData)
}

class StytchReactNativeGoogleOneTap(
    private val context: ReactApplicationContext,
    private val googleOneTapProvider: GoogleCredentialManagerProvider = GoogleCredentialManagerProviderImpl(),
) {
    @VisibleForTesting
    internal lateinit var nonce: String

    suspend fun start(clientId: String, autoSelectEnabled: Boolean = false): HandleIntentResult {
        val activity = context.currentActivity!!
        try {
            nonce = generateNonce()

            val credentialResponse =
                googleOneTapProvider.getSignInWithGoogleCredential(
                    activity = activity,
                    clientId = clientId,
                    autoSelectEnabled = autoSelectEnabled,
                    nonce = nonce,
                )
            val credential = credentialResponse.credential
            if (credential.type != GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
                return HandleIntentResult.Error(InvalidAuthorizationCredential)
            }
            val googleIdTokenCredential =
                googleOneTapProvider.createTokenCredential(credential.data)
            return HandleIntentResult.Success(
                idToken = googleIdTokenCredential.idToken,
                nonce = nonce
            )
        } catch (e: GoogleIdTokenParsingException) {
            return HandleIntentResult.Error(MissingAuthorizationCredentialIDToken)
        } catch (e: ApiException) {
            return HandleIntentResult.Error(NoCredentialsPresent)
        }
    }

    private fun ByteArray.toBase64EncodedString(): String =
        Base64.encodeToString(this, Base64.NO_WRAP)

    private fun ByteArray.toHexString(): String =
        joinToString(separator = "") { byte -> "%02x".format(byte) }

    private fun String.hexStringToByteArray(): ByteArray = chunked(2).map {
        it.toInt(HEX_RADIX).toByte()
    }.toByteArray()

    @VisibleForTesting
    internal fun generateNonce(): String {
        val randomGenerator = Random(System.currentTimeMillis())
        val randomBytes: ByteArray = randomGenerator.nextBytes(CODE_CHALLENGE_BYTE_COUNT)
        return convertToBase64UrlEncoded(getSha256(randomBytes.toHexString()))
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
}
