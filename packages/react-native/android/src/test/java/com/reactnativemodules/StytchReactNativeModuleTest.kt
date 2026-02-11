package com.reactnativemodules

import android.app.Activity
import android.content.Intent
import android.content.SharedPreferences
import androidx.biometric.BiometricManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactBridge
import com.facebook.react.bridge.ReadableMap
import com.stytch.reactnativemodules.BiometricKeysExistResult
import com.stytch.reactnativemodules.CreateKeysResult
import com.stytch.reactnativemodules.CreateSignatureResult
import com.stytch.reactnativemodules.DeleteKeysResult
import com.stytch.reactnativemodules.GetBiometricKeyResult
import com.stytch.reactnativemodules.GetBiometricsRegistrationId
import com.stytch.reactnativemodules.GetSensorResult
import com.stytch.reactnativemodules.HandleIntentResult
import com.stytch.reactnativemodules.IsKeystoreAvailableResult
import com.stytch.reactnativemodules.ONETAP_INTENT_ID
import com.stytch.reactnativemodules.PasskeysAuthenticateResponse
import com.stytch.reactnativemodules.PasskeysIsSupportedResponse
import com.stytch.reactnativemodules.PasskeysRegisterResponse
import com.stytch.reactnativemodules.StytchReactNativeBiometrics
import com.stytch.reactnativemodules.StytchReactNativeCaptchaProvider
import com.stytch.reactnativemodules.StytchReactNativeDFPProvider
import com.stytch.reactnativemodules.StytchReactNativeGoogleOneTap
import com.stytch.reactnativemodules.StytchReactNativeModule
import com.stytch.reactnativemodules.StytchReactNativePasskeys
import com.stytch.reactnativemodules.StytchReactNativeStorageClient
import com.stytch.reactnativemodules.toWritableMap
import io.mockk.MockKAnnotations
import io.mockk.clearAllMocks
import io.mockk.coEvery
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.just
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.runs
import io.mockk.unmockkAll
import io.mockk.verify
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.newSingleThreadContext
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Before
import org.junit.Test
import java.security.KeyStore
import javax.crypto.Cipher
import kotlin.math.exp

@OptIn(ExperimentalCoroutinesApi::class)
internal class StytchReactNativeModuleTest {
    @MockK
    private lateinit var mockStytchReactNativeBiometrics: StytchReactNativeBiometrics

    @MockK
    private lateinit var mockStytchReactNativeGoogleOneTap: StytchReactNativeGoogleOneTap

    @MockK
    private lateinit var mockStytchReactNativeStorageClient: StytchReactNativeStorageClient

    @MockK
    private lateinit var mockStytchReactNativeDfpProvider: StytchReactNativeDFPProvider

    @MockK
    private lateinit var mockStytchReactNativeCaptchaProvider: StytchReactNativeCaptchaProvider

    @MockK
    private lateinit var mockPromise: Promise

    @MockK
    private lateinit var mockReactApplicationContext: ReactApplicationContext

    @MockK
    private lateinit var mockBiometricManager: BiometricManager

    @MockK
    private lateinit var mockSharedPreferences: SharedPreferences

    @MockK
    private lateinit var mockPasskeys: StytchReactNativePasskeys

    private lateinit var module: StytchReactNativeModule

    @OptIn(DelicateCoroutinesApi::class)
    val mainThreadSurrogate = newSingleThreadContext("UI thread")

    @Before
    fun before() {
        mockkStatic(KeyStore::class)
        every { KeyStore.getInstance(any()) } returns mockk(relaxed = true)
        Dispatchers.setMain(mainThreadSurrogate)
        MockKAnnotations.init(this, true, true)
        mockkStatic(Cipher::class, ReactBridge::class, Arguments::class, BiometricManager::class)
        every { Arguments.createMap() } returns JavaOnlyMap()
        every { Cipher.getInstance(any()) } returns mockk()
        every { mockReactApplicationContext.applicationContext } returns mockk()
        every { mockReactApplicationContext.currentActivity } returns mockk()
        every { mockReactApplicationContext.getSharedPreferences(any(), any()) } returns mockSharedPreferences
        every { mockReactApplicationContext.addActivityEventListener(any()) } just runs
        every { BiometricManager.from(any()) } returns mockBiometricManager
        module = StytchReactNativeModule(mockReactApplicationContext)
        module.biometrics = mockStytchReactNativeBiometrics
        module.googleOneTap = mockStytchReactNativeGoogleOneTap
        module.storageClient = mockStytchReactNativeStorageClient
        module.dfp = mockStytchReactNativeDfpProvider
        module.captcha = mockStytchReactNativeCaptchaProvider
        module.passkeys = mockPasskeys
    }

    @After
    fun after() {
        Dispatchers.resetMain() // reset the main dispatcher to the original Main dispatcher
        mainThreadSurrogate.close()
        unmockkAll()
        clearAllMocks()
    }

    @Test
    fun `It has the expected name`() {
        assert(module.name == "StytchReactNativeModule")
    }

    @Test
    fun `When getSensor throws an exception, the promise is rejected`() {
        val params: ReadableMap = mockk {
            every { getBoolean("allowDeviceCredentials") } returns true
        }
        val exception = Exception("no_biometrics_enrolled")
        every {
            mockStytchReactNativeBiometrics.getSensor(any(), mockBiometricManager)
        } throws exception
        every { mockPromise.reject(exception) } just runs
        module.getSensor(params, mockPromise)
        verify { mockPromise.reject(exception) }
    }

    @Test
    fun `When getSensor returns a GetSensorResult, the promise is resolved`() {
        val params: ReadableMap = mockk {
            every { getBoolean("allowDeviceCredentials") } returns true
        }
        every {
            mockStytchReactNativeBiometrics.getSensor(any(), mockBiometricManager)
        } returns GetSensorResult("Biometrics")
        every { mockPromise.resolve(any()) } just runs
        module.getSensor(params, mockPromise)
        verify { mockPromise.resolve(any()) }
    }

    @Test
    fun `When createKeys fails, the promise is rejected`() {
        val exception = Exception("")
        val params: ReadableMap = mockk {
            every { getString(any()) } throws exception
        }
        every { mockPromise.reject(exception) } just runs
        module.createKeys(params, mockPromise, Dispatchers.Unconfined)
        verify { mockPromise.reject(exception) }
    }

    @Test
    fun `When createKeys succeeds, the promise is resolved`() {
        val params: ReadableMap = mockk {
            every { getString(any()) } returns ""
            every { getBoolean(any()) } returns true
        }
        every { mockPromise.resolve(any()) } just runs
        coEvery {
            mockStytchReactNativeBiometrics.createKeys(any(), any(), any(), any())
        } returns CreateKeysResult("publicKey", "privateKey")
        module.createKeys(params, mockPromise, Dispatchers.Unconfined)
        verify { mockPromise.resolve(any()) }
    }

    @Test
    fun `When deleteKeys fails, the promise is rejected`() {
        val exception = Exception("")
        every { mockStytchReactNativeBiometrics.deleteKeys() } throws exception
        every { mockPromise.reject(exception) } just runs
        module.deleteKeys(mockPromise)
        verify { mockPromise.reject(exception) }
    }

    @Test
    fun `When deleteKeys succeeds, the promise is resolved`() {
        every { mockPromise.resolve(any()) } just runs
        coEvery { mockStytchReactNativeBiometrics.deleteKeys() } returns DeleteKeysResult(true)
        module.deleteKeys(mockPromise)
        verify { mockPromise.resolve(any()) }
    }

    @Test
    fun `When createSignature fails, the promise is rejected`() {
        val exception = Exception("")
        val params: ReadableMap = mockk {
            every { getString(any()) } throws exception
        }
        every { mockPromise.reject(exception) } just runs
        module.createSignature(params, mockPromise)
        verify { mockPromise.reject(exception) }
    }

    @Test
    fun `When createSignature succeeds, the promise is resolved`() {
        val params: ReadableMap = mockk {
            every { getString(any()) } returns ""
        }
        every { mockPromise.resolve(any()) } just runs
        coEvery {
            mockStytchReactNativeBiometrics.createSignature(any(), any(), any())
        } returns CreateSignatureResult("")
        module.createSignature(params, mockPromise)
        verify { mockPromise.resolve(any()) }
    }

    @Test
    fun `When biometricKeysExist fails, the promise is rejected`() {
        val exception = Exception("")
        every { mockPromise.reject(exception) } just runs
        every { mockStytchReactNativeBiometrics.biometricKeysExist() } throws exception
        module.biometricKeysExist(mockPromise)
        verify { mockPromise.reject(exception) }
    }

    @Test
    fun `When biometricKeysExist succeeds, the promise is resolved`() {
        every { mockPromise.resolve(any()) } just runs
        coEvery { mockStytchReactNativeBiometrics.biometricKeysExist() } returns BiometricKeysExistResult(true)
        module.biometricKeysExist(mockPromise)
        verify { mockPromise.resolve(any()) }
    }

    @Test
    fun `When isKeystoreAvailable fails, the promise is rejected`() {
        val exception = Exception("")
        every { mockPromise.reject(exception) } just runs
        every { mockStytchReactNativeBiometrics.isKeystoreAvailable() } throws exception
        module.isKeystoreAvailable(mockPromise)
        verify { mockPromise.reject(exception) }
    }

    @Test
    fun `When isKeystoreAvailable succeeds, the promise is resolved`() {
        every { mockPromise.resolve(any()) } just runs
        coEvery { mockStytchReactNativeBiometrics.isKeystoreAvailable() } returns IsKeystoreAvailableResult(true)
        module.isKeystoreAvailable(mockPromise)
        verify { mockPromise.resolve(any()) }
    }

    @Test
    fun `When getBiometricKey fails, the promise is rejected`() {
        val exception = Exception("")
        val params: ReadableMap = mockk {
            every { getString(any()) } throws exception
        }
        every { mockPromise.reject(exception) } just runs
        module.getBiometricKey(params, mockPromise, Dispatchers.Unconfined)
        verify { mockPromise.reject(exception) }
    }

    @Test
    fun `When getBiometricKey succeeds, the promise is resolved`() {
        val params: ReadableMap = mockk {
            every { getString(any()) } returns ""
            every { getBoolean(any()) } returns true
        }
        every { mockPromise.resolve(any()) } just runs
        coEvery {
            mockStytchReactNativeBiometrics.getBiometricKey(any(), any(), any())
        } returns GetBiometricKeyResult("", "")
        module.getBiometricKey(params, mockPromise, Dispatchers.Unconfined)
        verify { mockPromise.resolve(any()) }
    }

    @Test
    fun `When getBiometricRegistrationId fails, the promise is rejected`() {
        val exception = Exception("")
        every { mockPromise.reject(exception) } just runs
        every { mockStytchReactNativeBiometrics.getBiometricRegistrationId() } throws exception
        module.getBiometricRegistrationId(mockPromise)
        verify { mockPromise.reject(exception) }
    }

    @Test
    fun `When getBiometricRegistrationId succeeds, the promise is resolved`() {
        every { mockPromise.resolve(any()) } just runs
        every {
            mockStytchReactNativeBiometrics.getBiometricRegistrationId()
        } returns GetBiometricsRegistrationId("")
        module.getBiometricRegistrationId(mockPromise)
        verify { mockPromise.resolve(any()) }
    }

    @Test
    fun `When googleOneTapStart fails, the promise is rejected`() {
        val exception = Exception("")
        every { mockPromise.reject(exception) } just runs
        coEvery { mockStytchReactNativeGoogleOneTap.start(any(), any()) } throws exception
        module.googleOneTapStart("", false, mockPromise)
        verify { mockPromise.reject(exception) }
    }

    @Test
    fun `When getData fails, the promise is rejected`() {
        val exception = Exception("")
        every { mockPromise.reject(exception) } just runs
        coEvery { mockStytchReactNativeStorageClient.getData(any()) } throws exception
        module.getData("test", mockPromise, Dispatchers.Unconfined)
        verify { mockPromise.reject(exception) }
    }

    @Test
    fun `When getData succeeds, the promise is resolved`() {
        every { mockPromise.resolve(any()) } just runs
        coEvery { mockStytchReactNativeStorageClient.getData(any()) } returns "something"
        module.getData("test", mockPromise, Dispatchers.Unconfined)
        verify { mockPromise.resolve(eq("something")) }
    }

    @Test
    fun `When setData fails, the promise is rejected`() {
        val exception = Exception("")
        every { mockPromise.reject(exception) } just runs
        coEvery { mockStytchReactNativeStorageClient.setData(any(), any()) } throws exception
        module.setData("test", "something", mockPromise, Dispatchers.Unconfined)
        verify { mockPromise.reject(exception) }
    }

    @Test
    fun `When setData succeeds, the promise is resolved`() {
        every { mockPromise.resolve(any()) } just runs
        coEvery { mockStytchReactNativeStorageClient.setData(any(), any()) } returns true
        module.setData("test", "something", mockPromise, Dispatchers.Unconfined)
        verify { mockPromise.resolve(eq(true)) }
    }

    @Test
    fun `When clearData fails, the promise is rejected`() {
        val exception = Exception("")
        every { mockPromise.reject(exception) } just runs
        coEvery { mockStytchReactNativeStorageClient.setData(any(), any()) } throws exception
        module.clearData("test", mockPromise)
        verify { mockPromise.reject(exception) }
    }

    @Test
    fun `When clearData succeeds, the promise is resolved`() {
        every { mockPromise.resolve(any()) } just runs
        coEvery { mockStytchReactNativeStorageClient.setData(any(), any()) } returns true
        module.clearData("test", mockPromise)
        verify { mockPromise.resolve(eq(true)) }
    }

    @Test
    fun `When didMigrate fails, the promise is rejected`() {
        val exception = Exception("")
        every { mockPromise.reject(exception) } just runs
        coEvery { mockStytchReactNativeStorageClient.didMigrate() } throws exception
        module.didMigrate(mockPromise, Dispatchers.Main)
        verify { mockPromise.reject(exception) }
    }

    @Test
    fun `When didMigrate succeeds, the promise is resolved`() {
        every { mockPromise.resolve(any()) } just runs
        coEvery { mockStytchReactNativeStorageClient.didMigrate() } returns true
        module.didMigrate(mockPromise, Dispatchers.Main)
        verify { mockPromise.resolve(eq(true)) }
    }

    @Test
    fun `When migrate fails, the promise is rejected`() {
        val exception = Exception("")
        every { mockPromise.reject(exception) } just runs
        coEvery { mockStytchReactNativeStorageClient.migrate("public-token-123") } throws exception
        module.migrate("public-token-123", mockPromise, Dispatchers.Main)
        verify { mockPromise.reject(exception) }
    }

    @Test
    fun `When migrate succeeds, the promise is resolved`() {
        every { mockPromise.resolve(any()) } just runs
        coEvery { mockStytchReactNativeStorageClient.migrate("public-token-123") } returns true
        module.migrate("public-token-123", mockPromise, Dispatchers.Main)
        verify { mockPromise.resolve(eq(true)) }
    }

    @Test
    fun `When getTelemetryId fails, the promise is rejected`() {
        val exception = Exception("")
        every { mockPromise.reject(exception) } just runs
        coEvery { mockStytchReactNativeDfpProvider.getTelemetryId("public-token-123") } throws exception
        module.getTelemetryId("public-token-123", "www.example.com", mockPromise, Dispatchers.Main)
        verify { mockPromise.reject(exception) }
    }

    @Test
    fun `When getTelemetryId succeeds, the promise is resolved`() {
        every { mockPromise.resolve(any()) } just runs
        coEvery { mockStytchReactNativeDfpProvider.getTelemetryId("public-token-123") } returns "telemetry-id-123"
        module.getTelemetryId("public-token-123", "www.example.com", mockPromise, Dispatchers.Main)
        verify { mockPromise.resolve(any()) }
    }

    @Test
    fun `When initializeRecaptcha fails, the promise is rejected`() {
        val exception = Exception("")
        every { mockPromise.reject(exception) } just runs
        coEvery { mockStytchReactNativeCaptchaProvider.initializeRecaptcha("site-key-123") } throws exception
        module.initializeRecaptcha("site-key-123", mockPromise, Dispatchers.Main)
        verify { mockPromise.reject(exception) }
    }

    @Test
    fun `When initializeRecaptcha succeeds, the promise is resolved`() {
        every { mockPromise.resolve(any()) } just runs
        coEvery { mockStytchReactNativeCaptchaProvider.initializeRecaptcha("site-key-123") } just runs
        module.initializeRecaptcha("site-key-123", mockPromise, Dispatchers.Main)
        verify { mockPromise.resolve(any()) }
    }

    @Test
    fun `When executeRecaptcha fails, the promise is rejected`() {
        val exception = Exception("")
        every { mockPromise.reject(exception) } just runs
        coEvery { mockStytchReactNativeCaptchaProvider.executeRecaptcha() } throws exception
        module.executeRecaptcha(mockPromise, Dispatchers.Main)
        verify { mockPromise.reject(exception) }
    }

    @Test
    fun `When executeRecaptcha succeeds, the promise is resolved`() {
        every { mockPromise.resolve(any()) } just runs
        coEvery { mockStytchReactNativeCaptchaProvider.executeRecaptcha() } returns "captcha-token-123"
        module.executeRecaptcha(mockPromise, Dispatchers.Unconfined)
        verify { mockPromise.resolve(any()) }
    }

    @Test
    fun `When isPasskeysSupported is called, the promise is resolved`() {
        val response = PasskeysIsSupportedResponse(true)
        val expected = response.toWritableMap()
        every { mockPasskeys.isSupported } returns response
        every { mockPromise.resolve(any()) } just runs
        module.isPasskeysSupported(mockPromise)
        verify { mockPromise.resolve(expected) }
    }

    @Test
    fun `When registerPasskey fails, the promise is rejected`() {
        val exception = Exception("")
        every { mockPromise.reject(exception) } just runs
        coEvery { mockPasskeys.register(any(), any()) } throws exception
        module.registerPasskey(mockk(relaxed = true), mockPromise, Dispatchers.Unconfined)
        verify { mockPromise.reject(exception) }
    }

    @Test
    fun `When registerPasskey succeeds, the promise is resolved`() {
        val result = PasskeysRegisterResponse("public-key-credential")
        val expected = result.toWritableMap()
        every { mockPromise.resolve(any()) } just runs
        coEvery { mockPasskeys.register(any(), any()) } returns result
        module.registerPasskey(mockk(relaxed = true), mockPromise, Dispatchers.Unconfined)
        verify { mockPromise.resolve(expected) }
    }

    @Test
    fun `When authenticatePasskey fails, the promise is rejected`() {
        val exception = Exception("")
        every { mockPromise.reject(exception) } just runs
        coEvery { mockPasskeys.authenticate(any(), any()) } throws exception
        module.authenticatePasskey(mockk(relaxed = true), mockPromise, Dispatchers.Unconfined)
        verify { mockPromise.reject(exception) }
    }

    @Test
    fun `When authenticatePasskey succeeds, the promise is resolved`() {
        val result = PasskeysAuthenticateResponse("public-key-credential")
        val expected = result.toWritableMap()
        every { mockPromise.resolve(any()) } just runs
        coEvery { mockPasskeys.authenticate(any(), any()) } returns result
        module.authenticatePasskey(mockk(relaxed = true), mockPromise, Dispatchers.Unconfined)
        verify { mockPromise.resolve(expected) }
    }
}
