package com.reactnativemodules

import com.facebook.react.bridge.ReactApplicationContext
import com.stytch.reactnativemodules.DFPProvider
import com.stytch.reactnativemodules.StytchReactNativeDFPProvider
import io.mockk.MockKAnnotations
import io.mockk.coEvery
import io.mockk.impl.annotations.MockK
import io.mockk.spyk
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class StytchReactNativeDFPTest {
    @MockK
    private lateinit var mockReactApplicationContext: ReactApplicationContext

    @MockK
    private lateinit var mockDfpProvider: DFPProvider

    private lateinit var dfpProvider: StytchReactNativeDFPProvider

    @Before
    fun before() {
        MockKAnnotations.init(this, true, true)
        dfpProvider = spyk(StytchReactNativeDFPProvider(mockReactApplicationContext, mockDfpProvider))
    }

    @Test
    fun `getTelemetryId throws exception`() = runTest {
        coEvery { mockDfpProvider.getTelemetryId(any()) } throws Exception()
        assert(dfpProvider.getTelemetryId("public-token-123") == "")
    }

    @Test
    fun `getTelemetryId returns expected value`() = runTest {
        coEvery { mockDfpProvider.getTelemetryId(any()) } returns "telemetry-id-123"
        assert(dfpProvider.getTelemetryId("public-token-123") == "telemetry-id-123")
    }
}
