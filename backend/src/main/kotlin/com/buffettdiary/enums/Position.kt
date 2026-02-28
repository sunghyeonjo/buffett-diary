package com.buffettdiary.enums

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
                ?: throw IllegalArgumentException("Invalid Position code: $code")
    }
}