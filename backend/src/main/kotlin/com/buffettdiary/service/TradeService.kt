package com.buffettdiary.service

import com.buffettdiary.dto.*
import com.buffettdiary.entity.Trade
import com.buffettdiary.repository.TradeRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.LocalDateTime

@Service
class TradeService(
    private val tradeRepository: TradeRepository,
) {
    fun list(userId: Long, startDate: String?, endDate: String?, ticker: String?, position: String?, page: Int, size: Int): PageResponse<TradeResponse> {
        val pageable = PageRequest.of(page, size)
        val result = tradeRepository.findByFilters(
            userId = userId,
            startDate = startDate?.let { LocalDate.parse(it) },
            endDate = endDate?.let { LocalDate.parse(it) },
            ticker = ticker?.uppercase(),
            position = position,
            pageable = pageable,
        )
        return PageResponse(
            content = result.content.map { it.toResponse() },
            totalElements = result.totalElements,
            totalPages = result.totalPages,
            page = page,
            size = size,
        )
    }

    fun get(userId: Long, id: Long): TradeResponse {
        val trade = tradeRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Trade not found") }
        if (trade.userId != userId) throw IllegalArgumentException("Not authorized")
        return trade.toResponse()
    }

    @Transactional
    fun create(userId: Long, request: TradeRequest): TradeResponse {
        val trade = Trade(
            userId = userId,
            tradeDate = LocalDate.parse(request.tradeDate),
            ticker = request.ticker.uppercase(),
            position = request.position,
            quantity = request.quantity,
            entryPrice = request.entryPrice,
            exitPrice = request.exitPrice,
            profit = if (request.position == "SELL") request.profit else null,
            reason = request.reason,
        )
        return tradeRepository.save(trade).toResponse()
    }

    @Transactional
    fun update(userId: Long, id: Long, request: TradeRequest): TradeResponse {
        val trade = tradeRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Trade not found") }
        if (trade.userId != userId) throw IllegalArgumentException("Not authorized")

        trade.ticker = request.ticker.uppercase()
        trade.position = request.position
        trade.quantity = request.quantity
        trade.entryPrice = request.entryPrice
        trade.exitPrice = request.exitPrice
        trade.profit = if (request.position == "SELL") request.profit else null
        trade.reason = request.reason
        trade.updatedAt = LocalDateTime.now()

        return tradeRepository.save(trade).toResponse()
    }

    @Transactional
    fun delete(userId: Long, id: Long) {
        val trade = tradeRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Trade not found") }
        if (trade.userId != userId) throw IllegalArgumentException("Not authorized")
        tradeRepository.delete(trade)
    }

    fun stats(userId: Long, period: String): TradeStatsResponse {
        val trades = when (period) {
            "today" -> {
                val today = LocalDate.now()
                tradeRepository.findByUserIdAndTradeDateBetween(userId, today, today)
            }
            "month" -> {
                val now = LocalDate.now()
                tradeRepository.findByUserIdAndTradeDateBetween(userId, now.withDayOfMonth(1), now)
            }
            else -> tradeRepository.findByUserId(userId)
        }

        val closed = trades.filter { it.profit != null }
        val wins = closed.filter { it.profit!! > BigDecimal.ZERO }
        val losses = closed.filter { it.profit!! < BigDecimal.ZERO }

        return TradeStatsResponse(
            totalTrades = closed.size,
            winCount = wins.size,
            lossCount = losses.size,
            winRate = if (closed.isNotEmpty()) wins.size.toDouble() / closed.size * 100 else 0.0,
            totalProfit = closed.sumOf { it.profit!! },
            averageProfit = if (closed.isNotEmpty())
                closed.sumOf { it.profit!! }.divide(BigDecimal(closed.size), 4, RoundingMode.HALF_UP)
            else BigDecimal.ZERO,
            bestTrade = closed.maxOfOrNull { it.profit!! } ?: BigDecimal.ZERO,
            worstTrade = closed.minOfOrNull { it.profit!! } ?: BigDecimal.ZERO,
        )
    }

    private fun Trade.toResponse() = TradeResponse(
        id = id,
        userId = userId,
        tradeDate = tradeDate.toString(),
        ticker = ticker,
        position = position,
        quantity = quantity,
        entryPrice = entryPrice,
        exitPrice = exitPrice,
        profit = profit,
        reason = reason,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
    )
}
