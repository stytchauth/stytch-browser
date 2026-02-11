package com.stytch.reactnativemodules

import android.annotation.SuppressLint
import android.content.Context
import android.content.IntentFilter
import android.os.Build
import android.util.Log
import com.google.android.gms.auth.api.phone.SmsRetriever

@SuppressLint("UnspecifiedRegisterReceiverFlag")
internal class StytchReactNativeSMSRetriever(
    private val context: Context,
) {
    private var broadcastReceiver: StytchReactNativeSMSBroadcastReceiver? = null

    fun start(callback: (String?) -> Unit) {
        broadcastReceiver = StytchReactNativeSMSBroadcastReceiver(callback)
        val intentFilter = IntentFilter(SmsRetriever.SMS_RETRIEVED_ACTION)
        val permission = SmsRetriever.SEND_PERMISSION
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            context.registerReceiver(
                broadcastReceiver,
                intentFilter,
                permission,
                null,
                Context.RECEIVER_EXPORTED,
            )
        } else {
            context.registerReceiver(broadcastReceiver, intentFilter, permission, null)
        }
        SmsRetriever
            .getClient(context)
            .startSmsRetriever()
            .addOnSuccessListener {
                Log.d("Stytch", "Successfully started SMS Retriever Client")
            }.addOnFailureListener {
                Log.e("Stytch", it.message ?: "Failed to start SMS Retriever Client")
            }.addOnCanceledListener {
                Log.d("Stytch", "SMS Retriever Client canceled")
            }.addOnCompleteListener {
                Log.d("Stytch", "SMS Retriever Client completed")
            }
    }

    fun finish() {
        broadcastReceiver?.let {
            context.unregisterReceiver(it)
        }
    }
}