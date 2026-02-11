package com.stytch.reactnativemodules

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume
import com.stytch.dfp.DFP as StytchDFP

interface DFPProvider {
    suspend fun getTelemetryId(): String
}

internal class DFPProviderImpl(
    context: Context,
    publicToken: String,
    dfppaDomain: String,
) : DFPProvider {
    private val dfp: StytchDFP? =
        try {
            StytchDFP(context = context, publicToken = publicToken, submissionUrl = dfppaDomain)
        } catch (_: UnsatisfiedLinkError) {
            null
        } catch (_: NoClassDefFoundError) {
            null
        }
    override suspend fun getTelemetryId(): String =
        suspendCancellableCoroutine { continuation ->
            dfp?.getTelemetryId { telemetryId ->
                continuation.resume(telemetryId)
            } ?: run {
                continuation.resume("")
            }
        }
}

class StytchReactNativeDFPProvider(
    private val context: ReactApplicationContext,
) {
    private lateinit var dfpProvider: DFPProvider
    fun configure(publicToken: String, dfppaDomain: String) {
        dfpProvider = DFPProviderImpl(context, publicToken, dfppaDomain)
    }
    suspend fun getTelemetryId(): String {
        if (!::dfpProvider.isInitialized) {
            throw DFPNotConfigured
        }
        return dfpProvider.getTelemetryId()
    }
}
