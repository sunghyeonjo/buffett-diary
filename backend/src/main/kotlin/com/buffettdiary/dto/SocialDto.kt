package com.buffettdiary.dto

import java.io.Serializable
import java.math.BigDecimal

data class BadgeResponse(
    val type: String,
    val name: String,
    val description: String,
    val earnedAt: String,
) : Serializable {
    companion object {
        private const val serialVersionUID = 1L
    }
}

data class PublicTradeStats(
    val totalTrades: Int,
    val winRate: Double,
    val totalProfit: BigDecimal,
) : Serializable {
    companion object {
        private const val serialVersionUID = 1L
    }
}

data class LeaderboardEntry(
    val userId: Long,
    val nickname: String,
    val totalTrades: Int,
    val winRate: Double,
    val totalProfit: BigDecimal,
) : Serializable {
    companion object {
        private const val serialVersionUID = 1L
    }
}
