package com.stytch.reactnativemodules

import android.content.Context
import android.content.SharedPreferences
import androidx.annotation.VisibleForTesting
import androidx.core.database.getStringOrNull
import com.facebook.react.bridge.ReactApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONException
import org.json.JSONObject
import java.io.IOException
import java.security.GeneralSecurityException
import java.security.KeyStore
import java.security.UnrecoverableKeyException

internal sealed class MigrationType {
    data class REACTNATIVE(val rnSession: String) : MigrationType()
    data class EXPO(val expoSession: String) : MigrationType()
    object NONE : MigrationType()
}

class SessionMigrationHelper(
    context: ReactApplicationContext,
    private val keyStore: KeyStore
) {
    private val expoDbHelper: ExpoDBHelper = ExpoDBHelper(context)
    private val rnSharedPreferences: SharedPreferences = context.getSharedPreferences(
        "RN_KEYCHAIN",
        Context.MODE_PRIVATE,
    )
    private val expoSharedPreferences: SharedPreferences = context.getSharedPreferences(
        "SecureStore",
        Context.MODE_PRIVATE,
    )

    suspend fun getExistingSessionData(key: String): String? =
        when (val migrationType = determineMigrationType(key)) {
            is MigrationType.REACTNATIVE -> maybeGetExistingRNSession(migrationType.rnSession)
            is MigrationType.EXPO -> maybeGetExistingExpoSession(migrationType.expoSession, key)
            is MigrationType.NONE -> null
        }

    @VisibleForTesting
    internal suspend fun determineMigrationType(key: String): MigrationType {
        val rnSession = rnSharedPreferences.getString(":p", null)
        if (rnSession != null) return MigrationType.REACTNATIVE(rnSession)
        val expoSession = withContext(Dispatchers.IO) {
            val db = expoDbHelper.readableDatabase
            val cursor = db.query(
                ExpoDBHelper.TABLE_CATALYST, // The table to query
                null, // The array of columns to return (pass null to get all)
                "${ExpoDBHelper.KEY_COLUMN} = ?", // The columns for the WHERE clause
                arrayOf(key), // The values for the WHERE clause
                null, // don't group the rows
                null, // don't filter by row groups
                null, // The sort order
            )
            if (cursor.count > 0) {
                val state = with(cursor) {
                    moveToNext()
                    getStringOrNull(getColumnIndexOrThrow(ExpoDBHelper.VALUE_COLUMN))
                }
                cursor.close()
                state
            } else {
                null
            }
        }
        if (expoSession != null) return MigrationType.EXPO(expoSession)
        return MigrationType.NONE
    }

    @VisibleForTesting
    internal fun maybeGetExistingRNSession(potentialEncryptedRNSession: String): String? {
        // Get RN Key
        val rnKey = try {
            keyStore.getKey("RN_KEYCHAIN_DEFAULT_ALIAS", null)
        } catch (_: UnrecoverableKeyException) {
            return null
        }
        return try {
            // Decrypt (potential) RN Session
            val maybeSession = AESHelper.decryptRNItemWithKey(potentialEncryptedRNSession, rnKey)
            // Check if it is actually a session
            JSONObject(maybeSession)
            // It's a session, so return it
            maybeSession
        } catch (_: GeneralSecurityException) {
            null
        } catch (_: JSONException) {
            // not a session
            null
        }
    }

    @VisibleForTesting
    internal fun maybeGetExistingExpoSession(encryptedExpoSession: String, key: String): String? {
        // Get Expo Key
        val encryptedKeyString = expoSharedPreferences.getString("${key}_secret_key", null) ?: return null
        val encryptedKeyJSON = try {
            JSONObject(encryptedKeyString)
        } catch (_: JSONException) {
            return null
        }
        return try {
            // decrypt Expo Key
            (keyStore.getEntry(AESHelper.EXPO_KEYSTORE_ALIAS, null) as? KeyStore.SecretKeyEntry)
                ?.let { secretKey ->
                    val decryptedKeyString = AESHelper.decryptExpoItemFromJSON(encryptedKeyJSON, secretKey)
                    // Decrypt and return ExpoSession
                    AESHelper.decryptCryptoAES(decryptedKeyString, encryptedExpoSession)
                }
        } catch (_: IOException) {
            null
        } catch (_: GeneralSecurityException) {
            null
        } catch (_: JSONException) {
            null
        }
    }
}
