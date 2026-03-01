package com.buffettdiary.enums

import com.buffettdiary.exception.BadRequestException

enum class Position(
    val code: String,
    val description: String
) {
    BUY("B", "매수"),
    SELL("S", "매도");

    fun isBuy() = this == BUY
    fun isSell() = this == SELL

    companion object {
        fun fromCode(code: String): Position =
            entries.firstOrNull { it.code == code }
                ?: throw BadRequestException("Invalid Position code: $code")
    }
}
