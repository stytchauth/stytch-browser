package com.reactnativemodules

import com.facebook.react.bridge.ReactApplicationContext
import com.stytch.reactnativemodules.CaptchaProvider
import com.stytch.reactnativemodules.StytchReactNativeCaptchaProvider
import io.mockk.MockKAnnotations
import io.mockk.coEvery
import io.mockk.impl.annotations.MockK
import io.mockk.just
import io.mockk.runs
import io.mockk.spyk
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Test
import kotlin.test.assertFails

@OptIn(ExperimentalCoroutinesApi::class)
class StytchReactNativeCaptchaTest {
    @MockK
    private lateinit var mockReactApplicationContext: ReactApplicationContext

    @MockK
    private lateinit var mockCaptchaProvider: CaptchaProvider

    private lateinit var captchaProvider: StytchReactNativeCaptchaProvider

    @Before
    fun before() {
        MockKAnnotations.init(this, true, true)
        captchaProvider = spyk(StytchReactNativeCaptchaProvider(mockReactApplicationContext, mockCaptchaProvider))
    }

    @Test
    fun `initializeRecaptcha throws exception`() = runTest {
        coEvery { mockCaptchaProvider.initializeRecaptcha(any()) } throws Exception()
        assertFails { captchaProvider.initializeRecaptcha("site-key-123") }
    }

    @Test
    fun `initializeRecaptcha runs as expected`() = runTest {
        coEvery { mockCaptchaProvider.initializeRecaptcha(any()) } just runs
        captchaProvider.initializeRecaptcha("site-key-123")
    }

    @Test
    fun `executeRecaptcha throws exception`() = runTest {
        coEvery { mockCaptchaProvider.executeRecaptcha() } throws Exception()
        assert(captchaProvider.executeRecaptcha() == "")
    }

    @Test
    fun `executeRecaptcha returns expected value`() = runTest {
        coEvery { mockCaptchaProvider.executeRecaptcha() } returns "captcha-token-123"
        assert(captchaProvider.executeRecaptcha() == "captcha-token-123")
    }
}
