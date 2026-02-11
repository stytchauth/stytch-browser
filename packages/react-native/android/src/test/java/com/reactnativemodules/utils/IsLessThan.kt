package com.reactnativemodules.utils

import org.hamcrest.CustomMatcher

internal class IsLessThan(
    private val target: Int
) : CustomMatcher<Int>("is less than $target") {
    override fun matches(item: Any?): Boolean {
        return item is Int && item < target
    }
}
