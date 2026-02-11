package com.reactnativemodules

import android.content.SharedPreferences
import com.facebook.react.bridge.ReactApplicationContext
import com.stytch.reactnativemodules.StytchReactNativeStorageClient
import io.mockk.MockKAnnotations
import io.mockk.coEvery
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.just
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.runs
import io.mockk.spyk
import io.mockk.verify
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Test
import java.security.KeyStore

@OptIn(ExperimentalCoroutinesApi::class)
internal class StytchReactNativeStorageClientTest {
    @MockK
    private lateinit var mockReactApplicationContext: ReactApplicationContext

    @MockK
    private lateinit var mockSharedPreferences: SharedPreferences

    @MockK
    private lateinit var mockKeyStore: KeyStore

    private lateinit var storageClient: StytchReactNativeStorageClient

    @Before
    fun before() {
        MockKAnnotations.init(this, true, true)
        mockkStatic(KeyStore::class)
        every { KeyStore.getInstance(any()) } returns mockKeyStore
        every { mockKeyStore.load(any()) } returns mockk()
        every { mockReactApplicationContext.applicationContext } returns mockk()
        every { mockReactApplicationContext.getSharedPreferences(any(), any()) } returns mockSharedPreferences
        every { mockSharedPreferences.edit() } returns mockk {
            every { putString(any(), any()) } returns this
            every { apply() } just runs
        }
        storageClient = spyk(
            StytchReactNativeStorageClient(
                mockReactApplicationContext,
                mockSharedPreferences,
            ),
            recordPrivateCalls = true,
        )
    }

    @Test
    fun `getData returns null if an exception is thrown`() = runTest {
        every { mockSharedPreferences.getString(any(), any()) } throws Exception()
        assert(storageClient.getData("test") == null)
    }

    @Test
    fun `getData decrypts data before returning it`() = runTest {
        every { mockSharedPreferences.getString(any(), any()) } returns "something-encrypted"
        every { storageClient.decryptString(any()) } returns "something-decrypted"
        assert(storageClient.getData("test") == "something-decrypted")
    }

    @Test
    fun `setData does not try to encrypt null values, and returns true on success`() = runTest {
        val result = storageClient.setData("key", null)
        verify(exactly = 0) { storageClient.encryptString(any()) }
        assert(result)
    }

    @Test
    fun `setData does encrypt non-null values, and returns true on success`() = runTest {
        every { storageClient.encryptString(any()) } returns "something-encrypted"
        val result = storageClient.setData("key", "something-decrypted")
        verify(exactly = 1) { storageClient.encryptString("something-decrypted") }
        assert(result)
    }

    @Test
    fun `setData returns false if an exception is thrown`() = runTest {
        every { storageClient.encryptString(any()) } throws Exception()
        val result = storageClient.setData("key", "something")
        assert(!result)
    }

    @Test
    fun `didMigrate returns the expected values`() = runTest {
        coEvery { storageClient.getData("didMigrate") } returns null
        assert(!storageClient.didMigrate())
        coEvery { storageClient.getData("didMigrate") } returns "true"
        assert(storageClient.didMigrate())
    }

    // TODO: Migrate (SDK-1017)
}
