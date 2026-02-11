package com.reactnativemodules

import android.app.Activity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.ReactApplicationContext
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.common.api.Status
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.android.libraries.identity.googleid.GoogleIdTokenParsingException
import com.stytch.reactnativemodules.GoogleCredentialManagerProvider
import com.stytch.reactnativemodules.HandleIntentResult
import com.stytch.reactnativemodules.InvalidAuthorizationCredential
import com.stytch.reactnativemodules.MissingAuthorizationCredentialIDToken
import com.stytch.reactnativemodules.NoCredentialsPresent
import com.stytch.reactnativemodules.StytchReactNativeGoogleOneTap
import com.stytch.reactnativemodules.toWritableMap
import io.mockk.MockKAnnotations
import io.mockk.coEvery
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.spyk
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Test

class StytchReactNativeGoogleOneTapTest {
    @MockK
    private lateinit var mockReactApplicationContext: ReactApplicationContext

    @MockK
    private lateinit var mockGoogleOneTapProvider: GoogleCredentialManagerProvider

    private lateinit var oneTap: StytchReactNativeGoogleOneTap

    @Before
    fun before() {
        MockKAnnotations.init(this, true, true)
        mockkStatic(Arguments::class)
        every { Arguments.createMap() } returns JavaOnlyMap()
        oneTap = spyk(StytchReactNativeGoogleOneTap(mockReactApplicationContext, mockGoogleOneTapProvider))
    }

    @Test
    fun `HandleIntentResult Success toWritableMap returns the expected data`() {
        val result = HandleIntentResult.Success("test-id-token", "test-nonce")
        val expected = JavaOnlyMap().apply {
            putString("idToken", "test-id-token")
            putString("nonce", "test-nonce")
        }
        assert(result.toWritableMap() == expected)
    }

    @Test
    fun `start returns InvalidAuthorizationCredential if unknown credential returned`() = runTest {
        val mockActivity: Activity = mockk()
        every { mockReactApplicationContext.currentActivity } returns mockActivity
        every { oneTap.generateNonce() } returns "a-generated-nonce"
        coEvery { mockGoogleOneTapProvider.getSignInWithGoogleCredential(any(), any(), any(), any()) } returns mockk {
            every { credential } returns
                    mockk {
                        every { type } returns "Something Weird"
                    }
        }
        val result = oneTap.start("client-id", true)
        require(result is HandleIntentResult.Error)
        assert(result.exception is InvalidAuthorizationCredential)
    }

    @Test
    fun `start returns MissingAuthorizationCredentialIDToken if token parsing fails`() = runTest {
        val mockActivity: Activity = mockk()
        every { mockReactApplicationContext.currentActivity } returns mockActivity
        every { oneTap.generateNonce() } returns "a-generated-nonce"
        coEvery { mockGoogleOneTapProvider.getSignInWithGoogleCredential(any(), any(), any(), any()) } returns mockk {
            every { credential } returns
                    mockk {
                        every { type } returns GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
                        every { data } returns mockk(relaxed = true)
                    }
        }
        every { mockGoogleOneTapProvider.createTokenCredential(any()) } throws GoogleIdTokenParsingException(RuntimeException("testing"))
        val result = oneTap.start("client-id", true)
        require(result is HandleIntentResult.Error)
        assert(result.exception is MissingAuthorizationCredentialIDToken)
    }

    @Test
    fun `start returns NoCredentialsPresent if token is missing from parsed token`() = runTest {
        val mockActivity: Activity = mockk()
        every { mockReactApplicationContext.currentActivity } returns mockActivity
        every { oneTap.generateNonce() } returns "a-generated-nonce"
        coEvery { mockGoogleOneTapProvider.getSignInWithGoogleCredential(any(), any(), any(), any()) } returns mockk {
            every { credential } returns
                    mockk {
                        every { type } returns GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
                        every { data } returns mockk(relaxed = true)
                    }
        }
        every { mockGoogleOneTapProvider.createTokenCredential(any()) } returns mockk {
            every { idToken } throws ApiException(Status.RESULT_INTERNAL_ERROR)
        }
        val result = oneTap.start("client-id", true)
        require(result is HandleIntentResult.Error)
        assert(result.exception is NoCredentialsPresent)
    }

    @Test
    fun `start returns success if everything is good`() = runTest {
        val mockActivity: Activity = mockk()
        every { mockReactApplicationContext.currentActivity } returns mockActivity
        every { oneTap.generateNonce() } returns "a-generated-nonce"
        coEvery { mockGoogleOneTapProvider.getSignInWithGoogleCredential(any(), any(), any(), any()) } returns mockk {
            every { credential } returns
                    mockk {
                        every { type } returns GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
                        every { data } returns mockk(relaxed = true)
                    }
        }
        every { mockGoogleOneTapProvider.createTokenCredential(any()) } returns mockk {
            every { idToken } returns "my-id-token"
        }
        val result = oneTap.start("client-id", true)
        require(result is HandleIntentResult.Success)
        assert(result.idToken == "my-id-token")
        assert(result.nonce == "a-generated-nonce")
    }
}
