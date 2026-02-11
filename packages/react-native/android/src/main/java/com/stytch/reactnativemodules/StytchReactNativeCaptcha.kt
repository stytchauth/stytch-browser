package com.stytch.reactnativemodules

import android.app.Application
import com.facebook.react.bridge.ReactApplicationContext
import com.google.android.recaptcha.Recaptcha
import com.google.android.recaptcha.RecaptchaAction
import com.google.android.recaptcha.RecaptchaClient

interface CaptchaProvider {

    suspend fun initializeRecaptcha(siteKey: String)
    suspend fun executeRecaptcha(): String
}

internal class CaptchaProviderImpl(private val context: ReactApplicationContext) : CaptchaProvider {

    private lateinit var recaptchaClient: RecaptchaClient

    override suspend fun initializeRecaptcha(siteKey: String) {
        Recaptcha.getClient(context.applicationContext as Application, siteKey).onSuccess {
            recaptchaClient = it
        }
    }

    override suspend fun executeRecaptcha(): String =
        if (::recaptchaClient.isInitialized) {
            recaptchaClient.execute(RecaptchaAction.LOGIN).getOrElse { "" }
        } else {
            ""
        }
}
class StytchReactNativeCaptchaProvider(
    private val context: ReactApplicationContext,
    private val captchaProvider: CaptchaProvider = CaptchaProviderImpl(context)
) {

    suspend fun initializeRecaptcha(siteKey: String) {
        return captchaProvider.initializeRecaptcha(siteKey)
    }
    suspend fun executeRecaptcha(): String {
        return try {
            captchaProvider.executeRecaptcha()
        } catch (e: Exception) {
            ""
        }
    }
}