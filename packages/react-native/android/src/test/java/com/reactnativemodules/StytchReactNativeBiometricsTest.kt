package com.reactnativemodules

import android.content.SharedPreferences
import android.hardware.biometrics.BiometricManager.Authenticators.BIOMETRIC_STRONG
import android.hardware.biometrics.BiometricManager.Authenticators.DEVICE_CREDENTIAL
import android.os.Build
import android.os.Build.VERSION
import android.security.keystore.KeyPermanentlyInvalidatedException
import android.security.keystore.KeyProperties
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.biometric.BiometricPrompt.CryptoObject
import androidx.biometric.BiometricPrompt.ERROR_CANCELED
import androidx.biometric.BiometricPrompt.ERROR_HW_NOT_PRESENT
import androidx.biometric.BiometricPrompt.ERROR_HW_UNAVAILABLE
import androidx.biometric.BiometricPrompt.ERROR_LOCKOUT
import androidx.biometric.BiometricPrompt.ERROR_LOCKOUT_PERMANENT
import androidx.biometric.BiometricPrompt.ERROR_NEGATIVE_BUTTON
import androidx.biometric.BiometricPrompt.ERROR_NO_BIOMETRICS
import androidx.biometric.BiometricPrompt.ERROR_NO_DEVICE_CREDENTIAL
import androidx.biometric.BiometricPrompt.ERROR_NO_SPACE
import androidx.biometric.BiometricPrompt.ERROR_SECURITY_UPDATE_REQUIRED
import androidx.biometric.BiometricPrompt.ERROR_TIMEOUT
import androidx.biometric.BiometricPrompt.ERROR_UNABLE_TO_PROCESS
import androidx.biometric.BiometricPrompt.ERROR_USER_CANCELED
import androidx.biometric.BiometricPrompt.ERROR_VENDOR
import androidx.fragment.app.FragmentActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.JavaOnlyMap
import com.facebook.react.bridge.ReactApplicationContext
import com.google.crypto.tink.integration.android.AndroidKeysetManager
import com.google.crypto.tink.subtle.Base64
import com.google.gson.internal.JavaVersion
import com.reactnativemodules.utils.IsLessThan
import com.reactnativemodules.utils.setFinalStatic
import com.stytch.reactnativemodules.BIOMETRIC_KEY_NAME
import com.stytch.reactnativemodules.BIOMETRIC_REGISTRATION_ID_KEY_NAME
import com.stytch.reactnativemodules.BiometricKeysExistResult
import com.stytch.reactnativemodules.BiometricPromptProvider
import com.stytch.reactnativemodules.CIPHER_IV_KEY
import com.stytch.reactnativemodules.CreateKeysResult
import com.stytch.reactnativemodules.CreateSignatureResult
import com.stytch.reactnativemodules.DeleteKeysResult
import com.stytch.reactnativemodules.GetBiometricKeyResult
import com.stytch.reactnativemodules.GetBiometricsRegistrationId
import com.stytch.reactnativemodules.GetSensorResult
import com.stytch.reactnativemodules.IsKeystoreAvailableResult
import com.stytch.reactnativemodules.PREF_ALLOW_DEV_CRED
import com.stytch.reactnativemodules.PRIVATE_KEY
import com.stytch.reactnativemodules.StytchReactNativeBiometrics
import com.stytch.reactnativemodules.toWritableMap
import io.mockk.MockKAnnotations
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.just
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.runs
import io.mockk.slot
import io.mockk.spyk
import io.mockk.verify
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import org.junit.Assume.assumeThat
import org.junit.Before
import org.junit.Test
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.Cipher.DECRYPT_MODE
import javax.crypto.Cipher.ENCRYPT_MODE
import javax.crypto.SecretKey
import javax.crypto.spec.IvParameterSpec
import kotlin.test.assertFailsWith

@OptIn(ExperimentalCoroutinesApi::class)
internal class StytchReactNativeBiometricsTest {
    @MockK
    private lateinit var mockReactApplicationContext: ReactApplicationContext

    @MockK
    private lateinit var mockSharedPreferences: SharedPreferences

    @MockK
    private lateinit var mockBiometricManager: BiometricManager

    @MockK
    private lateinit var mockCipher: Cipher

    @MockK
    private lateinit var mockBiometricPromptProvider: BiometricPromptProvider

    @MockK
    private lateinit var mockCryptoObject: CryptoObject

    @MockK
    private lateinit var mockKeyStore: KeyStore

    @MockK
    private lateinit var mockAndroidKeysetManager: AndroidKeysetManager

    private lateinit var biometrics: StytchReactNativeBiometrics

    @Before
    fun before() {
        MockKAnnotations.init(this, true, true)
        mockkStatic(
            Cipher::class,
            Arguments::class,
            Base64::class,
            Build::class,
            KeyStore::class,
        )
        every { Arguments.createMap() } returns JavaOnlyMap()
        every { Cipher.getInstance(any()) } returns mockCipher
        every { KeyStore.getInstance(any()) } returns mockKeyStore
        every { mockReactApplicationContext.applicationContext } returns mockk()
        every { Base64.encode(any()) } returns "mockedBase64String"
        every { Base64.decode(any()) } returns byteArrayOf()
        every { mockBiometricPromptProvider.getKeysetManager(any()) } returns mockAndroidKeysetManager
        biometrics = spyk(
            StytchReactNativeBiometrics(
                mockReactApplicationContext,
                mockBiometricPromptProvider,
                mockSharedPreferences,
            ),
            recordPrivateCalls = true,
        )
    }

    @Test
    fun `GetSensorResult_toWritableMap returns the expected data`() {
        val result = GetSensorResult("Biometrics")
        val expected = JavaOnlyMap().apply {
            putString("biometryType", "Biometrics")
        }
        assert(result.toWritableMap() == expected)
    }

    @Test
    fun `CreateKeysResult_toWritableMap returns the expected data`() {
        val result = CreateKeysResult("testPublicKey", "testPrivateKey")
        val expected = JavaOnlyMap().apply {
            putString("publicKey", "testPublicKey")
            putString("privateKey", "testPrivateKey")
        }
        assert(result.toWritableMap() == expected)
    }

    @Test
    fun `DeleteKeysResult_toWritableMap returns the expected data`() {
        val result = DeleteKeysResult(false)
        val expected = JavaOnlyMap().apply {
            putBoolean("keysDeleted", false)
        }
        assert(result.toWritableMap() == expected)
    }

    @Test
    fun `CreateSignatureResult_toWritableMap returns the expected data`() {
        val result = CreateSignatureResult("testSignature")
        val expected = JavaOnlyMap().apply {
            putString("signature", "testSignature")
        }
        assert(result.toWritableMap() == expected)
    }

    @Test
    fun `BiometricKeysExistResult_toWritableMap returns the expected data`() {
        val result = BiometricKeysExistResult(true)
        val expected = JavaOnlyMap().apply {
            putBoolean("keysExist", true)
        }
        assert(result.toWritableMap() == expected)
    }

    @Test
    fun `IsKeystoreAvailableResult_toWritableMap returns the expected data`() {
        val result = IsKeystoreAvailableResult(true)
        val expected = JavaOnlyMap().apply {
            putBoolean("isKeystoreAvailable", true)
        }
        assert(result.toWritableMap() == expected)
    }

    @Test
    fun `GetBiometricKeyResult_toWritableMap returns the expected data`() {
        val result = GetBiometricKeyResult("testPublicKey", "testPrivateKey")
        val expected = JavaOnlyMap().apply {
            putString("publicKey", "testPublicKey")
            putString("privateKey", "testPrivateKey")
        }
        assert(result.toWritableMap() == expected)
    }

    @Test
    fun `GetBiometricsRegistrationId_toWritableMap returns the expected data`() {
        val result = GetBiometricsRegistrationId("testBiometricsRegistrationId")
        val expected = JavaOnlyMap().apply {
            putString("biometricRegistrationId", "testBiometricsRegistrationId")
        }
        assert(result.toWritableMap() == expected)
    }

    @Test
    fun `iV get delegates to SharedPreferences and Base64 decodes the value`() {
        every { mockSharedPreferences.getString(CIPHER_IV_KEY, null) } returns "mockedBase64String"
        assert(biometrics.iV.contentEquals(byteArrayOf()))
        verify { mockSharedPreferences.getString(CIPHER_IV_KEY, null) }
        verify { Base64.decode("mockedBase64String") }
    }

    @Test
    fun `iV set delegates to SharedPreferences and Base64 encodes the value`() {
        val mockEditor: SharedPreferences.Editor = mockk {
            every { putString(any(), any()) } returns this
            every { apply() } just runs
        }
        every { mockSharedPreferences.edit() } returns mockEditor
        biometrics.iV = byteArrayOf()
        verify { mockSharedPreferences.edit() }
        verify { Base64.encode(byteArrayOf()) }
        verify { mockEditor.putString(CIPHER_IV_KEY, "mockedBase64String") }
    }

    @Test
    fun `registerAllowDeviceCredentials get delegates to SharedPreferences`() {
        every { mockSharedPreferences.getBoolean(PREF_ALLOW_DEV_CRED, false) } returns true
        assert(biometrics.registerAllowDeviceCredentials)
        verify { mockSharedPreferences.getBoolean(PREF_ALLOW_DEV_CRED, false) }
    }

    @Test
    fun `registerAllowDeviceCredentials set delegates to SharedPreferences`() {
        val mockEditor: SharedPreferences.Editor = mockk {
            every { putBoolean(any(), any()) } returns this
            every { apply() } just runs
        }
        every { mockSharedPreferences.edit() } returns mockEditor
        biometrics.registerAllowDeviceCredentials = true
        verify { mockSharedPreferences.edit() }
        verify { mockEditor.putBoolean(PREF_ALLOW_DEV_CRED, true) }
    }

    @Test
    fun `privateKeyEncoded get delegates to SharedPreferences`() {
        every { mockSharedPreferences.getString(PRIVATE_KEY, null) } returns "encoded private key"
        assert(biometrics.privateKeyEncoded == "encoded private key")
        verify { mockSharedPreferences.getString(PRIVATE_KEY, null) }
    }

    @Test
    fun `privateKeyEncoded set delegates to SharedPreferences`() {
        val mockEditor: SharedPreferences.Editor = mockk {
            every { putString(any(), any()) } returns this
            every { apply() } just runs
        }
        every { mockSharedPreferences.edit() } returns mockEditor
        biometrics.privateKeyEncoded = "private key encoded"
        verify { mockSharedPreferences.edit() }
        verify { mockEditor.putString(PRIVATE_KEY, "private key encoded") }
    }

    @Test
    fun `registrationId get delegates to SharedPreferences`() {
        every {
            mockSharedPreferences.getString(BIOMETRIC_REGISTRATION_ID_KEY_NAME, null)
        } returns "biometricRegistrationId"
        assert(biometrics.registrationId == "biometricRegistrationId")
        verify { mockSharedPreferences.getString(BIOMETRIC_REGISTRATION_ID_KEY_NAME, null) }
    }

    @Test
    fun `registrationId set delegates to SharedPreferences`() {
        val mockEditor: SharedPreferences.Editor = mockk {
            every { putString(any(), any()) } returns this
            every { apply() } just runs
        }
        every { mockSharedPreferences.edit() } returns mockEditor
        biometrics.registrationId = "biometricRegistrationId"
        verify { mockSharedPreferences.edit() }
        verify { mockEditor.putString(BIOMETRIC_REGISTRATION_ID_KEY_NAME, "biometricRegistrationId") }
    }

    @Test
    fun `getSensor returns the correct GetSensorResult, or throws the correct exception`() {
        every { mockBiometricManager.canAuthenticate(any()) } returns BiometricManager.BIOMETRIC_SUCCESS
        assert(biometrics.getSensor(true, mockBiometricManager) == GetSensorResult(biometryType = "Biometrics"))

        every { mockBiometricManager.canAuthenticate(any()) } returns BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE
        var exception = assertFailsWith<Exception> { biometrics.getSensor(true, mockBiometricManager) }
        assert(exception.message == "biometrics_unavailable")

        every { mockBiometricManager.canAuthenticate(any()) } returns BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE
        exception = assertFailsWith { biometrics.getSensor(true, mockBiometricManager) }
        assert(exception.message == "biometrics_unavailable")

        every {
            mockBiometricManager.canAuthenticate(any())
        } returns BiometricManager.BIOMETRIC_ERROR_SECURITY_UPDATE_REQUIRED
        exception = assertFailsWith { biometrics.getSensor(true, mockBiometricManager) }
        assert(exception.message == "biometrics_unavailable")

        every { mockBiometricManager.canAuthenticate(any()) } returns BiometricManager.BIOMETRIC_ERROR_UNSUPPORTED
        exception = assertFailsWith { biometrics.getSensor(true, mockBiometricManager) }
        assert(exception.message == "biometrics_unavailable")

        every { mockBiometricManager.canAuthenticate(any()) } returns BiometricManager.BIOMETRIC_STATUS_UNKNOWN
        exception = assertFailsWith { biometrics.getSensor(true, mockBiometricManager) }
        assert(exception.message == "biometrics_unavailable")

        every { mockBiometricManager.canAuthenticate(any()) } returns BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED
        exception = assertFailsWith { biometrics.getSensor(true, mockBiometricManager) }
        assert(exception.message == "no_biometrics_enrolled")

        every { mockBiometricManager.canAuthenticate(any()) } returns 100 // Non-existent
        assert(biometrics.getSensor(true, mockBiometricManager) == GetSensorResult(biometryType = "None"))
    }

    @Test
    fun `isUsingKeystore returns as expected`() {
        every { mockAndroidKeysetManager.isUsingKeystore } returns false
        assert(!biometrics.isUsingKeystore())
        every { mockAndroidKeysetManager.isUsingKeystore } throws Exception()
        assert(!biometrics.isUsingKeystore())
        every { mockAndroidKeysetManager.isUsingKeystore } returns true
        assert(biometrics.isUsingKeystore())
    }

    @Test
    fun `createKeys throws exception if not using keystore and allowFallbackToCleartext is false`() = runTest {
        every { biometrics.isUsingKeystore() } returns false
        val exception = assertFailsWith<Exception> {
            biometrics.createKeys("", "", allowDeviceCredentials = true, allowFallbackToCleartext = false)
        }
        assert(exception.message == "keystore_unavailable")
        verify { biometrics.isUsingKeystore() }
    }

    @Test
    fun `createKeys deletes a key if it exists`() = runTest {
        every { biometrics.isUsingKeystore() } returns true
        every { biometrics.biometricKeyExists() } returns true
        every { biometrics.deleteBiometricKey() } just runs
        try {
            biometrics.createKeys(
                "",
                "",
                allowDeviceCredentials = true,
                allowFallbackToCleartext = true,
            )
        } catch (_: Exception) {}
        verify { biometrics.deleteBiometricKey() }
    }

    @Test
    fun `createKeys properly sets registerAllowDeviceCredentials`() = runTest {
        every { biometrics.isUsingKeystore() } returns true
        every { biometrics.biometricKeyExists() } returns false
        every { mockSharedPreferences.edit() } returns mockk {
            every { putBoolean(any(), any()) } returns this
            every { apply() } just runs
        }
        try {
            biometrics.createKeys(
                "",
                "",
                allowDeviceCredentials = false,
                allowFallbackToCleartext = true,
            )
        } catch (_: Exception) {}
        verify { biometrics.registerAllowDeviceCredentials = false }
        try {
            biometrics.createKeys(
                "",
                "",
                allowDeviceCredentials = true,
                allowFallbackToCleartext = true,
            )
        } catch (_: Exception) {}
        verify { biometrics.registerAllowDeviceCredentials = true }
    }

    @Test
    fun `createKeys throws key_invalidated when KeyPermanentlyInvalidatedException is raised`() = runTest {
        val mockSecretKey: SecretKey = mockk()
        every { biometrics.getSecretKey(any()) } returns mockSecretKey
        every { biometrics.isUsingKeystore() } returns true
        every { biometrics.biometricKeyExists() } returns false
        every { mockSharedPreferences.edit() } returns mockk {
            every { putBoolean(any(), any()) } returns this
            every { apply() } just runs
        }
        every { mockCipher.init(ENCRYPT_MODE, mockSecretKey) } throws KeyPermanentlyInvalidatedException()
        val exception = assertFailsWith<Exception> {
            biometrics.createKeys("", "", allowDeviceCredentials = true, allowFallbackToCleartext = false)
        }
        assert(exception.message == "key_invalidated")
    }

    @Test
    fun `createKeys calls authenticate correctly, and throws exception onAuthenticationError`() = runTest {
        val mockSecretKey: SecretKey = mockk()
        every { biometrics.getSecretKey(any()) } returns mockSecretKey
        every { biometrics.isUsingKeystore() } returns true
        every { biometrics.biometricKeyExists() } returns false
        every { mockSharedPreferences.edit() } returns mockk {
            every { putBoolean(any(), any()) } returns this
            every { apply() } just runs
        }
        every { mockCipher.init(ENCRYPT_MODE, mockSecretKey) } just runs
        every { mockBiometricPromptProvider.getCryptoObject(mockCipher) } returns mockCryptoObject
        val mockFragmentActivity: FragmentActivity = mockk()
        every { mockReactApplicationContext.currentActivity } returns mockFragmentActivity
        val mockBiometricPrompt: BiometricPrompt = mockk {
            every { authenticate(any(), any()) } just runs
        }
        val slot = slot<BiometricPrompt.AuthenticationCallback>()
        every {
            mockBiometricPromptProvider.getBiometricPrompt(mockFragmentActivity, any(), capture(slot))
        } answers {
            slot.captured.onAuthenticationError(ERROR_HW_NOT_PRESENT, "")
            mockBiometricPrompt
        }
        every { biometrics.getPromptInfo(any(), any(), any()) } returns mockk()
        val exception = assertFailsWith<Exception> {
            biometrics.createKeys(
                promptMessage = "",
                cancelButtonText = "",
                allowDeviceCredentials = true,
                allowFallbackToCleartext = false,
            )
        }
        assert(exception.message == "biometrics_unavailable")
        verify { mockBiometricPrompt.authenticate(any(), any()) }
    }

    @Test
    fun `createKeys calls authenticate correctly, and throws exception if keypair cannot be generated`() = runTest {
        val mockSecretKey: SecretKey = mockk()
        every { biometrics.getSecretKey(any()) } returns mockSecretKey
        every { biometrics.isUsingKeystore() } returns true
        every { biometrics.biometricKeyExists() } returns false
        every { mockSharedPreferences.edit() } returns mockk {
            every { putBoolean(any(), any()) } returns this
            every { apply() } just runs
        }
        every { mockCipher.init(ENCRYPT_MODE, mockSecretKey) } just runs
        every { mockBiometricPromptProvider.getCryptoObject(mockCipher) } returns mockCryptoObject
        val mockFragmentActivity: FragmentActivity = mockk()
        every { mockReactApplicationContext.currentActivity } returns mockFragmentActivity
        val mockBiometricPrompt: BiometricPrompt = mockk {
            every { authenticate(any(), any()) } just runs
        }
        val slot = slot<BiometricPrompt.AuthenticationCallback>()
        val mockAuthenticationResult: BiometricPrompt.AuthenticationResult = mockk()
        every { biometrics.generateKeyPair() } throws Exception("error generating keypair")
        every {
            mockBiometricPromptProvider.getBiometricPrompt(mockFragmentActivity, any(), capture(slot))
        } answers {
            slot.captured.onAuthenticationSucceeded(mockAuthenticationResult)
            mockBiometricPrompt
        }
        every { biometrics.getPromptInfo(any(), any(), any()) } returns mockk()
        val exception = assertFailsWith<Exception> {
            biometrics.createKeys(
                promptMessage = "",
                cancelButtonText = "",
                allowDeviceCredentials = true,
                allowFallbackToCleartext = false,
            )
        }
        assert(exception.message == "internal_error")
        verify { biometrics.generateKeyPair() }
        verify { mockBiometricPrompt.authenticate(any(), any()) }
    }

    @Test
    fun `createKeys calls authenticate correctly, and throws exception if cryptoObject is not present`() = runTest {
        val mockSecretKey: SecretKey = mockk()
        every { biometrics.getSecretKey(any()) } returns mockSecretKey
        every { biometrics.isUsingKeystore() } returns true
        every { biometrics.biometricKeyExists() } returns false
        every { mockSharedPreferences.edit() } returns mockk {
            every { putBoolean(any(), any()) } returns this
            every { apply() } just runs
        }
        every { mockCipher.init(ENCRYPT_MODE, mockSecretKey) } just runs
        every { mockBiometricPromptProvider.getCryptoObject(mockCipher) } returns mockCryptoObject
        val mockFragmentActivity: FragmentActivity = mockk()
        every { mockReactApplicationContext.currentActivity } returns mockFragmentActivity
        val mockBiometricPrompt: BiometricPrompt = mockk {
            every { authenticate(any(), any()) } just runs
        }
        val slot = slot<BiometricPrompt.AuthenticationCallback>()
        val mockAuthenticationResult: BiometricPrompt.AuthenticationResult = mockk {
            every { cryptoObject } returns null
        }
        every { biometrics.generateKeyPair() } returns Pair(byteArrayOf(), byteArrayOf())
        every {
            mockBiometricPromptProvider.getBiometricPrompt(mockFragmentActivity, any(), capture(slot))
        } answers {
            slot.captured.onAuthenticationSucceeded(mockAuthenticationResult)
            mockBiometricPrompt
        }
        every { biometrics.getPromptInfo(any(), any(), any()) } returns mockk()
        val exception = assertFailsWith<Exception> {
            biometrics.createKeys(
                promptMessage = "",
                cancelButtonText = "",
                allowDeviceCredentials = true,
                allowFallbackToCleartext = false,
            )
        }
        assert(exception.message == "biometrics_failed")
        verify { biometrics.generateKeyPair() }
        verify { mockBiometricPrompt.authenticate(any(), any()) }
    }

    @Test
    fun `createKeys calls authenticate correctly, and succeeds if cryptoObject is present`() = runTest {
        val mockSecretKey: SecretKey = mockk()
        every { biometrics.getSecretKey(any()) } returns mockSecretKey
        every { biometrics.isUsingKeystore() } returns true
        every { biometrics.biometricKeyExists() } returns false
        every { mockSharedPreferences.edit() } returns mockk {
            every { putBoolean(any(), any()) } returns this
            every { putString(any(), any()) } returns this
            every { apply() } just runs
        }
        every { mockCipher.init(ENCRYPT_MODE, mockSecretKey) } just runs
        every { mockBiometricPromptProvider.getCryptoObject(mockCipher) } returns mockCryptoObject
        val mockFragmentActivity: FragmentActivity = mockk()
        every { mockReactApplicationContext.currentActivity } returns mockFragmentActivity
        val mockBiometricPrompt: BiometricPrompt = mockk {
            every { authenticate(any(), any()) } just runs
        }
        val slot = slot<BiometricPrompt.AuthenticationCallback>()
        val mockAuthenticationResult: BiometricPrompt.AuthenticationResult = mockk {
            every { cryptoObject } returns mockk {
                every { cipher } returns mockCipher
            }
        }
        every { mockCipher.iv } returns byteArrayOf()
        every { mockCipher.doFinal(any()) } returns byteArrayOf()
        every { biometrics.generateKeyPair() } returns Pair(byteArrayOf(), byteArrayOf())
        every {
            mockBiometricPromptProvider.getBiometricPrompt(mockFragmentActivity, any(), capture(slot))
        } answers {
            slot.captured.onAuthenticationSucceeded(mockAuthenticationResult)
            mockBiometricPrompt
        }
        every { biometrics.getPromptInfo(any(), any(), any()) } returns mockk()
        val result = biometrics.createKeys(
            promptMessage = "",
            cancelButtonText = "",
            allowDeviceCredentials = true,
            allowFallbackToCleartext = false,
        )
        verify { biometrics.generateKeyPair() }
        verify { mockBiometricPrompt.authenticate(any(), any()) }
        assert(result.publicKey == "mockedBase64String")
        assert(result.privateKey == "mockedBase64String")
    }

    @Test
    fun `deleteKeys returns as expected`() {
        every { biometrics.biometricKeyExists() } returns false
        var result = biometrics.deleteKeys()
        assert(!result.keysDeleted)

        every { biometrics.biometricKeyExists() } returns true
        every { biometrics.deleteBiometricKey() } throws Exception()
        val exception = assertFailsWith<Exception> { biometrics.deleteKeys() }
        assert(exception.message == "internal_error")

        every { biometrics.biometricKeyExists() } returns true
        every { biometrics.deleteBiometricKey() } just runs
        result = biometrics.deleteKeys()
        assert(result.keysDeleted)
    }

    @Test
    fun `createSignature returns as expected`() {
        every { biometrics.biometricKeyExists() } returns false
        val exception = assertFailsWith<Exception> {
            biometrics.createSignature(payload = "", privateKey = "", biometricRegistrationId = "")
        }
        assert(exception.message == "missing_public_key")

        every { biometrics.biometricKeyExists() } returns true
        every { biometrics.signChallenge(byteArrayOf(), byteArrayOf()) } returns byteArrayOf()
        every { mockSharedPreferences.edit() } returns mockk {
            every { putBoolean(any(), any()) } returns this
            every { putString(any(), any()) } returns this
            every { apply() } just runs
        }
        val result = biometrics.createSignature(payload = "", privateKey = "", biometricRegistrationId = "")
        assert(result.signature == "mockedBase64String")
    }

    @Test
    fun `biometricKeysExist delegates to internal method`() {
        every { biometrics.biometricKeyExists() } returns true
        val result = biometrics.biometricKeysExist()
        assert(result.keysExist)
        verify { biometrics.biometricKeyExists() }
    }

    @Test
    fun `isKeystoreAvailable delegates to internal method`() {
        every { biometrics.isUsingKeystore() } returns true
        val result = biometrics.isKeystoreAvailable()
        assert(result.isKeystoreAvailable)
        verify { biometrics.isUsingKeystore() }
    }

    @Test
    fun `getBiometricKey throws exception if no biometric keys exist`() = runTest {
        every { biometrics.biometricKeyExists() } returns false
        val exception = assertFailsWith<Exception> {
            biometrics.getBiometricKey("", "", true)
        }
        assert(exception.message == "no_biometrics_registration")
    }

    @Test
    fun `getBiometricKey throws exception if no device credentials allowed mismatch`() = runTest {
        every { biometrics.biometricKeyExists() } returns true
        every { biometrics.registerAllowDeviceCredentials } returns false
        val exception = assertFailsWith<Exception> {
            biometrics.getBiometricKey("", "", true)
        }
        assert(exception.message == "device_credentials_not_allowed")
    }

    @Test
    fun `getBiometricKey throws exception onAuthenticationError`() = runTest {
        every { biometrics.biometricKeyExists() } returns true
        every { biometrics.registerAllowDeviceCredentials } returns true
        val mockSecretKey: SecretKey = mockk()
        every { biometrics.getSecretKey(any()) } returns mockSecretKey
        every { biometrics.iV } returns byteArrayOf()
        val mockIvParameterSpec: IvParameterSpec = mockk()
        every { biometrics.getIvParameterSpec() } returns mockIvParameterSpec
        every { mockCipher.init(DECRYPT_MODE, mockSecretKey, mockIvParameterSpec) } just runs
        every { mockBiometricPromptProvider.getCryptoObject(mockCipher) } returns mockCryptoObject
        val mockFragmentActivity: FragmentActivity = mockk()
        every { mockReactApplicationContext.currentActivity } returns mockFragmentActivity
        val mockBiometricPrompt: BiometricPrompt = mockk {
            every { authenticate(any(), any()) } just runs
        }
        val slot = slot<BiometricPrompt.AuthenticationCallback>()
        every {
            mockBiometricPromptProvider.getBiometricPrompt(mockFragmentActivity, any(), capture(slot))
        } answers {
            slot.captured.onAuthenticationError(ERROR_HW_NOT_PRESENT, "")
            mockBiometricPrompt
        }
        every { biometrics.getPromptInfo(any(), any(), any()) } returns mockk()
        val exception = assertFailsWith<Exception> {
            biometrics.getBiometricKey(
                promptMessage = "",
                cancelButtonText = "",
                allowDeviceCredentials = true,
            )
        }
        assert(exception.message == "biometrics_unavailable")
        verify { mockBiometricPrompt.authenticate(any(), any()) }
    }

    @Test
    fun `getBiometricKey throws exception onAuthenticationSucceeded if no cryptoObject is present`() = runTest {
        every { biometrics.biometricKeyExists() } returns true
        every { biometrics.registerAllowDeviceCredentials } returns true
        val mockSecretKey: SecretKey = mockk()
        every { biometrics.getSecretKey(any()) } returns mockSecretKey
        every { biometrics.iV } returns byteArrayOf()
        val mockIvParameterSpec: IvParameterSpec = mockk()
        every { biometrics.getIvParameterSpec() } returns mockIvParameterSpec
        every { mockCipher.init(DECRYPT_MODE, mockSecretKey, mockIvParameterSpec) } just runs
        every { mockBiometricPromptProvider.getCryptoObject(mockCipher) } returns mockCryptoObject
        val mockFragmentActivity: FragmentActivity = mockk()
        every { mockReactApplicationContext.currentActivity } returns mockFragmentActivity
        val mockBiometricPrompt: BiometricPrompt = mockk {
            every { authenticate(any(), any()) } just runs
        }
        val slot = slot<BiometricPrompt.AuthenticationCallback>()
        val mockAuthenticationResult: BiometricPrompt.AuthenticationResult = mockk {
            every { cryptoObject } returns null
        }
        every {
            mockBiometricPromptProvider.getBiometricPrompt(mockFragmentActivity, any(), capture(slot))
        } answers {
            slot.captured.onAuthenticationSucceeded(mockAuthenticationResult)
            mockBiometricPrompt
        }
        every { biometrics.getPromptInfo(any(), any(), any()) } returns mockk()
        val exception = assertFailsWith<Exception> {
            biometrics.getBiometricKey(
                promptMessage = "",
                cancelButtonText = "",
                allowDeviceCredentials = true,
            )
        }
        assert(exception.message == "biometrics_failed")
        verify { mockBiometricPrompt.authenticate(any(), any()) }
    }

    @Test
    fun `getBiometricKey succeeds onAuthenticationSucceeded if cryptoObject is present`() = runTest {
        every { biometrics.biometricKeyExists() } returns true
        every { biometrics.registerAllowDeviceCredentials } returns true
        val mockSecretKey: SecretKey = mockk()
        every { biometrics.getSecretKey(any()) } returns mockSecretKey
        every { biometrics.iV } returns byteArrayOf()
        val mockIvParameterSpec: IvParameterSpec = mockk()
        every { biometrics.getIvParameterSpec() } returns mockIvParameterSpec
        every { mockCipher.init(DECRYPT_MODE, mockSecretKey, mockIvParameterSpec) } just runs
        every { mockBiometricPromptProvider.getCryptoObject(mockCipher) } returns mockCryptoObject
        val mockFragmentActivity: FragmentActivity = mockk()
        every { mockReactApplicationContext.currentActivity } returns mockFragmentActivity
        val mockBiometricPrompt: BiometricPrompt = mockk {
            every { authenticate(any(), any()) } just runs
        }
        val slot = slot<BiometricPrompt.AuthenticationCallback>()
        val mockAuthenticationResult: BiometricPrompt.AuthenticationResult = mockk {
            every { cryptoObject } returns mockk {
                every { cipher } returns mockCipher
            }
        }
        every {
            mockBiometricPromptProvider.getBiometricPrompt(mockFragmentActivity, any(), capture(slot))
        } answers {
            slot.captured.onAuthenticationSucceeded(mockAuthenticationResult)
            mockBiometricPrompt
        }
        every { biometrics.getPromptInfo(any(), any(), any()) } returns mockk()
        every { mockCipher.doFinal(any()) } returns byteArrayOf()
        every { biometrics.privateKeyEncoded } returns ""
        every { biometrics.getPublicKeyFromPrivateKey(byteArrayOf()) } returns byteArrayOf()
        val result = biometrics.getBiometricKey(
            promptMessage = "",
            cancelButtonText = "",
            allowDeviceCredentials = true,
        )
        verify { mockBiometricPrompt.authenticate(any(), any()) }
        assert(result.publicKey == "mockedBase64String")
        assert(result.privateKey == "mockedBase64String")
    }

    @Test
    fun `getBiometricRegistrationId returns or throws`() {
        every {
            mockSharedPreferences.getString(BIOMETRIC_REGISTRATION_ID_KEY_NAME, null)
        } returns "biometricRegistrationId"
        assert(biometrics.getBiometricRegistrationId() == GetBiometricsRegistrationId("biometricRegistrationId"))

        every {
            mockSharedPreferences.getString(BIOMETRIC_REGISTRATION_ID_KEY_NAME, null)
        } returns null
        val exception = assertFailsWith<Exception> { biometrics.getBiometricRegistrationId() }
        assert(exception.message == "no_biometrics_registration")
    }

    @Test
    fun `getAllowedAuthenticators returns as expected`() {
        assumeThat(
            "Reflection for these tests only works on JDK <= 11",
            JavaVersion.getMajorJavaVersion(),
            IsLessThan(12),
        )
        var allowedAuthenticators: Int = biometrics.getAllowedAuthenticators(false)
        assert(allowedAuthenticators == BIOMETRIC_STRONG)
        setFinalStatic(VERSION::class.java.getField("SDK_INT"), 28)
        allowedAuthenticators = biometrics.getAllowedAuthenticators(true)
        assert(allowedAuthenticators == BIOMETRIC_STRONG)
        setFinalStatic(VERSION::class.java.getField("SDK_INT"), 30)
        allowedAuthenticators = biometrics.getAllowedAuthenticators(true)
        assert(allowedAuthenticators == BIOMETRIC_STRONG or DEVICE_CREDENTIAL)
    }

    @Test
    fun `isCurrentSDK29OrEarlier returns correctly`() {
        assumeThat(
            "Reflection for these tests only works on JDK <= 11",
            JavaVersion.getMajorJavaVersion(),
            IsLessThan(12),
        )
        setFinalStatic(VERSION::class.java.getField("SDK_INT"), 28)
        assert(biometrics.isCurrentSDK29OrEarlier)
        setFinalStatic(VERSION::class.java.getField("SDK_INT"), 29)
        assert(biometrics.isCurrentSDK29OrEarlier)
        setFinalStatic(VERSION::class.java.getField("SDK_INT"), 30)
        assert(!biometrics.isCurrentSDK29OrEarlier)
    }

    @Test
    fun `isCurrentSDK30OrEarlier returns correctly`() {
        assumeThat(
            "Reflection for these tests only works on JDK <= 11",
            JavaVersion.getMajorJavaVersion(),
            IsLessThan(12),
        )
        setFinalStatic(VERSION::class.java.getField("SDK_INT"), 29)
        assert(biometrics.isCurrentSDK30OrEarlier)
        setFinalStatic(VERSION::class.java.getField("SDK_INT"), 30)
        assert(biometrics.isCurrentSDK30OrEarlier)
        setFinalStatic(VERSION::class.java.getField("SDK_INT"), 31)
        assert(!biometrics.isCurrentSDK30OrEarlier)
    }

    @Test
    fun `biometricKeyExists returns as expected`() {
        every { biometrics.privateKeyEncoded } returns null
        assert(!biometrics.biometricKeyExists())
        every { biometrics.privateKeyEncoded } returns ""
        assert(biometrics.biometricKeyExists())
    }

    @Test
    fun `deleteBiometricKey deletes the key data from KeyStore and shared preferences`() {
        every { mockKeyStore.load(null) } just runs
        every { mockKeyStore.deleteEntry(any()) } just runs
        val mockEditor: SharedPreferences.Editor = mockk {
            every { remove(any()) } returns this
            every { apply() } just runs
        }
        every { mockSharedPreferences.edit() } returns mockEditor
        biometrics.deleteBiometricKey()
        verify { mockKeyStore.deleteEntry(BIOMETRIC_KEY_NAME) }
        verify { mockEditor.remove(PRIVATE_KEY) }
        verify { mockEditor.remove(CIPHER_IV_KEY) }
        verify { mockEditor.apply() }
    }

    @Test
    fun `getUserAuthenticationParameters returns as expected`() {
        assumeThat(
            "Reflection for these tests only works on JDK <= 11",
            JavaVersion.getMajorJavaVersion(),
            IsLessThan(12),
        )
        assert(biometrics.getUserAuthenticationParameters(false) == KeyProperties.AUTH_BIOMETRIC_STRONG)
        setFinalStatic(VERSION::class.java.getField("SDK_INT"), 30)
        assert(biometrics.getUserAuthenticationParameters(true) == KeyProperties.AUTH_BIOMETRIC_STRONG)
        setFinalStatic(VERSION::class.java.getField("SDK_INT"), 31)
        assert(
            biometrics.getUserAuthenticationParameters(true) ==
                KeyProperties.AUTH_BIOMETRIC_STRONG or KeyProperties.AUTH_DEVICE_CREDENTIAL,
        )
    }

    @Test
    fun `getSecretKey does or doesn't call generateSecretKey as appropriate`() {
        every { mockKeyStore.load(null) } just runs
        every { mockKeyStore.getKey(any(), any()) } returns mockk<SecretKey>()
        every { biometrics.generateSecretKey(any()) } returns mockk()
        biometrics.getSecretKey(true)
        every { mockKeyStore.getKey(any(), any()) } returns null
        biometrics.getSecretKey(true)
        verify(exactly = 1) { biometrics.generateSecretKey(true) }
    }

    @Test
    fun `handleAuthenticationError returns correct messaging`() {
        assert(biometrics.handleAuthenticationError(ERROR_HW_NOT_PRESENT, "default").message == "biometrics_unavailable")
        assert(biometrics.handleAuthenticationError(ERROR_HW_UNAVAILABLE, "default").message == "biometrics_unavailable")
        assert(biometrics.handleAuthenticationError(ERROR_NO_SPACE, "default").message == "biometrics_unavailable")
        assert(
            biometrics.handleAuthenticationError(ERROR_SECURITY_UPDATE_REQUIRED, "default").message == "biometrics_unavailable",
        )
        assert(biometrics.handleAuthenticationError(ERROR_VENDOR, "default").message == "biometrics_unavailable")
        assert(biometrics.handleAuthenticationError(ERROR_LOCKOUT, "default").message == "user_locked_out")
        assert(biometrics.handleAuthenticationError(ERROR_LOCKOUT_PERMANENT, "default").message == "user_locked_out")
        assert(biometrics.handleAuthenticationError(ERROR_TIMEOUT, "default").message == "user_locked_out")
        assert(biometrics.handleAuthenticationError(ERROR_NO_BIOMETRICS, "default").message == "no_biometrics_enrolled")
        assert(biometrics.handleAuthenticationError(ERROR_NO_DEVICE_CREDENTIAL, "default").message == "no_biometrics_enrolled")
        assert(biometrics.handleAuthenticationError(ERROR_CANCELED, "default").message == "biometrics_unavailable")
        assert(biometrics.handleAuthenticationError(ERROR_UNABLE_TO_PROCESS, "default").message == "biometrics_unavailable")
        assert(biometrics.handleAuthenticationError(ERROR_NEGATIVE_BUTTON, "default").message == "user_cancellation")
        assert(biometrics.handleAuthenticationError(ERROR_USER_CANCELED, "default").message == "user_cancellation")
        assert(biometrics.handleAuthenticationError(100, "default").message == "internal_error")
    }
}
