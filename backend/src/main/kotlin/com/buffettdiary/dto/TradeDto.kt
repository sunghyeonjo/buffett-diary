package com.buffettdiary.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size
import java.math.BigDecimal

data class TradeRequest(
    @field:NotBlank val tradeDate: String,
    @field:NotBlank @field:Size(max = 10) val ticker: String,
    @field:NotBlank val position: String, // BUY or SELL
    @field:NotNull @field:Positive val quantity: BigDecimal,
    @field:NotNull @field:Positive val entryPrice: BigDecimal,
    val exitPrice: BigDecimal? = null,
    val profit: BigDecimal? = null,
    val reason: String? = null,
)

data class TradeResponse(
    val id: Long,
    val userId: Long,
    val tradeDate: String,
    val ticker: String,
    val position: String,
    val quantity: BigDecimal,
    val entryPrice: BigDecimal,
    val exitPrice: BigDecimal?,
    val profit: BigDecimal?,
    val reason: String?,
    val createdAt: String,
    val updatedAt: String,
)

data class PageResponse<T>(
    val content: List<T>,
    val totalElements: Long,
    val totalPages: Int,
    val page: Int,
    val size: Int,
)

data class TradeStatsResponse(
    val totalTrades: Int,
    val winCount: Int,
    val lossCount: Int,
    val winRate: Double,
    val totalProfit: BigDecimal,
    val averageProfit: BigDecimal,
    val bestTrade: BigDecimal,
    val worstTrade: BigDecimal,
)
