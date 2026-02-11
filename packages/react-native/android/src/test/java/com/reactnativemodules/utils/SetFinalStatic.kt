package com.reactnativemodules.utils

import java.lang.reflect.Field
import java.lang.reflect.Modifier

@Throws(java.lang.Exception::class)
fun setFinalStatic(field: Field, newValue: Any?) {
    field.isAccessible = true
    val modifiersField: Field = Field::class.java.getDeclaredField("modifiers")
    modifiersField.isAccessible = true
    modifiersField.setInt(field, field.modifiers and Modifier.FINAL.inv())
    field.set(null, newValue)
}
