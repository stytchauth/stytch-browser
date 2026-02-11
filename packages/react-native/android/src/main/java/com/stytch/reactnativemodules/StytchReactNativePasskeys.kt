package com.stytch.reactnativemodules

import android.app.Activity
import android.os.Build
import androidx.annotation.ChecksSdkIntAtLeast
import androidx.credentials.CreatePublicKeyCredentialRequest
import androidx.credentials.CreatePublicKeyCredentialResponse
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetPublicKeyCredentialOption
import androidx.credentials.PublicKeyCredential
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap

data class PasskeysIsSupportedResponse(val isSupported: Boolean)
fun PasskeysIsSupportedResponse.toWritableMap(): WritableMap {
    return Arguments.createMap().apply {
        putBoolean("isSupported", isSupported)
    }
}

data class PasskeysRegisterResponse(val publicKeyCredential: String)
fun PasskeysRegisterResponse.toWritableMap(): WritableMap {
    return Arguments.createMap().apply {
        putString("publicKeyCredential", publicKeyCredential)
    }
}

data class PasskeysAuthenticateResponse(val publicKeyCredential: String)
fun PasskeysAuthenticateResponse.toWritableMap(): WritableMap {
    return Arguments.createMap().apply {
        putString("publicKeyCredential", publicKeyCredential)
    }
}

internal interface PasskeysProvider {
    suspend fun createCredential(activity: Activity, publicKeyCredentialCreationOptions: String): CreatePublicKeyCredentialResponse

    suspend fun getCredential(activity: Activity, publicKeyCredentialRequestOptions: String): PublicKeyCredential
}

private class PasskeysProviderImpl : PasskeysProvider {
    override suspend fun createCredential(
        activity: Activity,
        publicKeyCredentialCreationOptions: String,
    ): CreatePublicKeyCredentialResponse {
        val createPublicKeyCredentialRequest = CreatePublicKeyCredentialRequest(
            requestJson = publicKeyCredentialCreationOptions,
            preferImmediatelyAvailableCredentials = true,
        )
        val credentialManager = CredentialManager.create(activity)
        return credentialManager.createCredential(
            context = activity,
            request = createPublicKeyCredentialRequest,
        ) as CreatePublicKeyCredentialResponse // if this cast fails, it will be caught and rejected
    }

    override suspend fun getCredential(
        activity: Activity,
        publicKeyCredentialRequestOptions: String,
    ): PublicKeyCredential {
        val getPublicKeyCredentialOption = GetPublicKeyCredentialOption(
            requestJson = publicKeyCredentialRequestOptions,
        )
        val credentialManager = CredentialManager.create(activity)
        return credentialManager.getCredential(
            context = activity,
            request = GetCredentialRequest(listOf(getPublicKeyCredentialOption)),
        ).credential as PublicKeyCredential
    }
}

internal class StytchReactNativePasskeys(
    private val provider: PasskeysProvider = PasskeysProviderImpl(),
) {
    @get:ChecksSdkIntAtLeast(api = Build.VERSION_CODES.P)
    val isSupported: PasskeysIsSupportedResponse
        get() = PasskeysIsSupportedResponse(Build.VERSION.SDK_INT >= Build.VERSION_CODES.P)

    suspend fun register(activity: Activity, publicKeyCredentialCreationOptions: String): PasskeysRegisterResponse {
        val credentialResponse = provider.createCredential(activity, publicKeyCredentialCreationOptions)
        return PasskeysRegisterResponse(credentialResponse.registrationResponseJson)
    }

    suspend fun authenticate(activity: Activity, publicKeyCredentialRequestOptions: String): PasskeysAuthenticateResponse {
        val credentialResponse = provider.getCredential(activity, publicKeyCredentialRequestOptions)
        return PasskeysAuthenticateResponse(credentialResponse.authenticationResponseJson)
    }
}
