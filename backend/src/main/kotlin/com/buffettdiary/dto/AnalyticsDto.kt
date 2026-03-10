package com.buffettdiary.dto

import java.io.Serializable
import java.math.BigDecimal

data class TickerStatsResponse(
    val ticker: String,
    val tradeCount: Int,
    val winCount: Int,
    val lossCount: Int,
    val winRate: Double,
    val totalProfit: BigDecimal,
    val avgProfit: BigDecimal,
    val stockInfo: StockSummary? = null,
) : Serializable {
    companion object {
        private const val serialVersionUID = 1L
    }
}

data class MonthlyPnlResponse(
    val month: String,
    val totalProfit: BigDecimal,
    val tradeCount: Int,
    val winRate: Double,
) : Serializable {
    companion object {
        private const val serialVersionUID = 1L
    }
}

data class EquityCurvePoint(
    val date: String,
    val cumulativeProfit: BigDecimal,
) : Serializable {
    companion object {
        private const val serialVersionUID = 1L
    }
}

data class DailyPnlEntry(
    val date: String,
    val profit: BigDecimal,
) : Serializable {
    companion object {
        private const val serialVersionUID = 1L
    }
}

data class TagStatsResponse(
    val tag: String,
    val tradeCount: Int,
    val winCount: Int,
    val lossCount: Int,
    val winRate: Double,
    val totalProfit: BigDecimal,
    val avgProfit: BigDecimal,
) : Serializable {
    companion object {
        private const val serialVersionUID = 1L
    }
}

data class PeriodReviewResponse(
    val period: String,
    val totalTrades: Int,
    val totalProfit: BigDecimal,
    val winRate: Double,
    val topPerformer: String?,
    val worstPerformer: String?,
    val mostTradedTicker: String?,
    val winRateChange: Double?,
    val topTags: List<String>,
) : Serializable {
    companion object {
        private const val serialVersionUID = 1L
    }
}
