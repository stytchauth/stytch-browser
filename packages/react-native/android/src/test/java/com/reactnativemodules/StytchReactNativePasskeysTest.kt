package com.reactnativemodules

import androidx.credentials.CreatePublicKeyCredentialResponse
import androidx.credentials.PublicKeyCredential
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.JavaOnlyMap
import com.stytch.reactnativemodules.PasskeysAuthenticateResponse
import com.stytch.reactnativemodules.PasskeysIsSupportedResponse
import com.stytch.reactnativemodules.PasskeysProvider
import com.stytch.reactnativemodules.PasskeysRegisterResponse
import com.stytch.reactnativemodules.StytchReactNativePasskeys
import com.stytch.reactnativemodules.toWritableMap
import io.mockk.MockKAnnotations
import io.mockk.coEvery
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.mockk
import io.mockk.mockkStatic
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
internal class StytchReactNativePasskeysTest {
    @MockK
    private lateinit var mockPasskeysProvider: PasskeysProvider

    private lateinit var passkeys: StytchReactNativePasskeys

    @Before
    fun before() {
        MockKAnnotations.init(this, true, true)
        mockkStatic(Arguments::class)
        every { Arguments.createMap() } returns JavaOnlyMap()
        passkeys = StytchReactNativePasskeys(mockPasskeysProvider)
    }

    @Test
    fun `PasskeysIsSupportedResponse_toWritableMap returns the expected data`() {
        var result = PasskeysIsSupportedResponse(true)
        var expected = JavaOnlyMap().apply {
            putBoolean("isSupported", true)
        }
        assert(result.toWritableMap() == expected)
        result = PasskeysIsSupportedResponse(false)
        expected = JavaOnlyMap().apply {
            putBoolean("isSupported", false)
        }
        assert(result.toWritableMap() == expected)
    }

    @Test
    fun `PasskeysAuthenticateResponse_toWritableMap returns the expected data`() {
        val result = PasskeysAuthenticateResponse("public-key-credential")
        val expected = JavaOnlyMap().apply {
            putString("publicKeyCredential", "public-key-credential")
        }
        assert(result.toWritableMap() == expected)
    }

    @Test
    fun `PasskeysRegisterResponse_toWritableMap returns the expected data`() {
        val result = PasskeysRegisterResponse("public-key-credential")
        val expected = JavaOnlyMap().apply {
            putString("publicKeyCredential", "public-key-credential")
        }
        assert(result.toWritableMap() == expected)
    }

    @Test(expected = ClassCastException::class)
    fun `register throws underlying exception when createCredential fails`() = runTest {
        coEvery { mockPasskeysProvider.createCredential(any(), any()) } throws ClassCastException()
        passkeys.register(mockk(), "")
    }

    @Test()
    fun `register returns a PasskeysRegisterResponse when createCredential succeeds`() = runTest {
        val response = mockk<CreatePublicKeyCredentialResponse> {
            every { registrationResponseJson } returns "registration-response-json"
        }
        val expected = PasskeysRegisterResponse(response.registrationResponseJson)
        coEvery { mockPasskeysProvider.createCredential(any(), any()) } returns response
        val result = passkeys.register(mockk(), "")
        assert(result == expected)
    }

    @Test(expected = ClassCastException::class)
    fun `authenticate throws underlying exception when getCredential fails`() = runTest {
        coEvery { mockPasskeysProvider.getCredential(any(), any()) } throws ClassCastException()
        passkeys.authenticate(mockk(), "")
    }

    @Test()
    fun `authenticate returns a PasskeysAuthenticateResponse when getCredential succeeds`() = runTest {
        val response = mockk<PublicKeyCredential> {
            every { authenticationResponseJson } returns "authentication-response-json"
        }
        val expected = PasskeysAuthenticateResponse(response.authenticationResponseJson)
        coEvery { mockPasskeysProvider.getCredential(any(), any()) } returns response
        val result = passkeys.authenticate(mockk(), "")
        assert(result == expected)
    }
}
