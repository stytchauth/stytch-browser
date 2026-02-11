package com.reactnativemodules

import com.facebook.react.bridge.ReactApplicationContext
import com.stytch.reactnativemodules.StytchReactNativeModule
import com.stytch.reactnativemodules.StytchReactNativeModulePackage
import io.mockk.MockKAnnotations
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.just
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.runs
import org.junit.Before
import org.junit.Test
import java.security.KeyStore
import javax.crypto.Cipher

internal class StytchReactNativeModulePackageTest {
    @MockK
    private lateinit var mockReactApplicationContext: ReactApplicationContext

    @MockK
    private lateinit var mockKeyStore: KeyStore

    private lateinit var modulePackage: StytchReactNativeModulePackage

    @Before
    fun before() {
        MockKAnnotations.init(this, true, true)
        mockkStatic(Cipher::class, KeyStore::class)
        every { Cipher.getInstance(any()) } returns mockk()
        every { KeyStore.getInstance(any()) } returns mockKeyStore
        every { mockKeyStore.load(any()) } returns mockk()
        every { mockReactApplicationContext.applicationContext } returns mockk {
            every { getSharedPreferences(any(), any()) } returns mockk {
                every { edit() } returns mockk()
                every { getString(any(), any()) } returns ""
            }
        }
        every { mockReactApplicationContext.getSharedPreferences(any(), any()) } returns mockk()
        every { mockReactApplicationContext.addActivityEventListener(any()) } just runs
        modulePackage = StytchReactNativeModulePackage()
    }

    @Test
    fun `createViewManagers returns an empty list`() {
        val viewManagers = modulePackage.createViewManagers(mockReactApplicationContext)
        assert(viewManagers.isEmpty())
    }

    @Test
    fun `createNativeModules correctly instantiates our native module`() {
        val modules = modulePackage.createNativeModules(mockReactApplicationContext)
        assert(modules.size == 1)
        assert(modules[0] is StytchReactNativeModule)
    }
}
