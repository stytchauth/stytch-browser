package com.stytch.reactnativemodules

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

class ExpoDBHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {
    private val CREATE_TABLE = "CREATE TABLE '$TABLE_CATALYST' ('$KEY_COLUMN' TEXT PRIMARY KEY, '$VALUE_COLUMN' TEXT NOT NULL)"
    private val DROP_TABLE = "DROP TABLE IF EXISTS $TABLE_CATALYST"

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL(CREATE_TABLE)
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL(DROP_TABLE)
        onCreate(db)
    }

    override fun onDowngrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        onUpgrade(db, oldVersion, newVersion)
    }

    companion object {
        // If you change the database schema, you must increment the database version.
        const val DATABASE_VERSION = 1
        const val DATABASE_NAME = "RKStorage"
        const val TABLE_CATALYST = "catalystLocalStorage"
        const val KEY_COLUMN = "key"
        const val VALUE_COLUMN = "value"
    }
}
