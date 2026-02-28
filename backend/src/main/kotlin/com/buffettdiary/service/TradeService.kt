package com.buffettdiary.service

import com.buffettdiary.dto.*
import com.buffettdiary.entity.Trade
import com.buffettdiary.enums.Position
import com.buffettdiary.repository.TradeRepository
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.LocalDateTime

@Service
class TradeService(
    private val tradeRepository: TradeRepository,
    private val tradeImageService: TradeImageService,
) {
    @Cacheable(value = ["trades"], key = "#userId + '-' + #startDate + '-' + #endDate + '-' + #ticker + '-' + #position + '-' + #page + '-' + #size")
    fun list(userId: Long, startDate: String?, endDate: String?, ticker: String?, position: Position?, page: Int, size: Int): PageResponse<TradeResponse> {
        val pageable = PageRequest.of(page, size)
        val result = tradeRepository.findByFilters(
            userId = userId,
            startDate = startDate?.let { LocalDate.parse(it) },
            endDate = endDate?.let { LocalDate.parse(it) },
            ticker = ticker?.uppercase(),
            position = position,
            pageable = pageable,
        )
        val trades = result.content
        val tradeIds = trades.map { it.id }
        val imagesMap = tradeImageService.getImageMetasByTradeIds(tradeIds, userId)

        return PageResponse(
            content = trades.map { it.toResponse(imagesMap[it.id] ?: emptyList()) },
            totalElements = result.totalElements,
            totalPages = result.totalPages,
            page = page,
            size = size,
        )
    }

    @Cacheable(value = ["tradeDetail"], key = "#userId + '-' + #id")
    fun get(userId: Long, id: Long): TradeResponse {
        val trade = tradeRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Trade not found") }
        if (trade.userId != userId) throw IllegalArgumentException("Not authorized")
        val images = tradeImageService.getImageMetas(id, userId)
        return trade.toResponse(images)
    }

    @Transactional
    @CacheEvict(value = ["trades", "tradeDetail", "tradeStats"], allEntries = true)
    fun create(userId: Long, request: TradeRequest): TradeResponse {
        val trade = Trade(
            userId = userId,
            tradeDate = LocalDate.parse(request.tradeDate),
            ticker = request.ticker.uppercase(),
            position = request.position,
            quantity = request.quantity,
            entryPrice = request.entryPrice,
            exitPrice = request.exitPrice,
            profit = if (request.position.isSell()) request.profit else null,
            reason = request.reason,
        )
        return tradeRepository.save(trade).toResponse()
    }

    @Transactional
    @CacheEvict(value = ["trades", "tradeDetail", "tradeStats"], allEntries = true)
    fun bulkCreate(userId: Long, requests: List<TradeRequest>): List<TradeResponse> {
        val trades = requests.map { request ->
            Trade(
                userId = userId,
                tradeDate = LocalDate.parse(request.tradeDate),
                ticker = request.ticker.uppercase(),
                position = request.position,
                quantity = request.quantity,
                entryPrice = request.entryPrice,
                exitPrice = request.exitPrice,
                profit = if (request.position.isSell()) request.profit else null,
                reason = request.reason,
            )
        }
        return tradeRepository.saveAll(trades).map { it.toResponse() }
    }

    @Transactional
    @CacheEvict(value = ["trades", "tradeDetail", "tradeStats"], allEntries = true)
    fun update(userId: Long, id: Long, request: TradeRequest): TradeResponse {
        val trade = tradeRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Trade not found") }
        if (trade.userId != userId) throw IllegalArgumentException("Not authorized")

        trade.ticker = request.ticker.uppercase()
        trade.position = request.position
        trade.quantity = request.quantity
        trade.entryPrice = request.entryPrice
        trade.exitPrice = request.exitPrice
        trade.profit = if (request.position.isSell()) request.profit else null
        trade.reason = request.reason
        trade.updatedAt = LocalDateTime.now()

        return tradeRepository.save(trade).toResponse()
    }

    @Transactional
    @CacheEvict(value = ["trades", "tradeDetail", "tradeStats"], allEntries = true)
    fun delete(userId: Long, id: Long) {
        val trade = tradeRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Trade not found") }
        if (trade.userId != userId) throw IllegalArgumentException("Not authorized")
        tradeImageService.deleteByTradeId(id)
        tradeRepository.delete(trade)
    }

    @Cacheable(value = ["tradeStats"], key = "#userId + '-' + #period")
    fun stats(userId: Long, period: String): TradeStatsResponse {
        val trades = when (period) {
            "today" -> {
                val today = LocalDate.now()
                tradeRepository.findByUserIdAndTradeDateBetween(userId, today, today)
            }
            "week" -> {
                val now = LocalDate.now()
                tradeRepository.findByUserIdAndTradeDateBetween(userId, now.with(DayOfWeek.MONDAY), now)
            }
            "month" -> {
                val now = LocalDate.now()
                tradeRepository.findByUserIdAndTradeDateBetween(userId, now.withDayOfMonth(1), now)
            }
            "year" -> {
                val now = LocalDate.now()
                tradeRepository.findByUserIdAndTradeDateBetween(userId, now.withDayOfYear(1), now)
            }
            else -> tradeRepository.findByUserId(userId)
        }

        val buyCount = trades.count { it.position.isBuy() }
        val sellCount = trades.count { it.position.isSell() }
        val closed = trades.filter { it.profit != null }
        val wins = closed.filter { it.profit!! > BigDecimal.ZERO }
        val losses = closed.filter { it.profit!! < BigDecimal.ZERO }

        return TradeStatsResponse(
            totalTrades = trades.size,
            buyCount = buyCount,
            sellCount = sellCount,
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

    @Transactional
    @CacheEvict(value = ["trades", "tradeDetail"], allEntries = true)
    fun updateRetrospective(userId: Long, id: Long, request: TradeRetrospectiveRequest): TradeResponse {
        val trade = tradeRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Trade not found") }
        if (trade.userId != userId) throw IllegalArgumentException("Not authorized")
        if (request.rating != null && request.rating !in 1..5) throw IllegalArgumentException("Rating must be 1-5")
        trade.retrospective = request.content
        trade.rating = request.rating
        trade.retrospectiveUpdatedAt = LocalDateTime.now()
        trade.updatedAt = LocalDateTime.now()
        return tradeRepository.save(trade).toResponse()
    }

    @Transactional
    @CacheEvict(value = ["trades", "tradeDetail"], allEntries = true)
    fun deleteRetrospective(userId: Long, id: Long) {
        val trade = tradeRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Trade not found") }
        if (trade.userId != userId) throw IllegalArgumentException("Not authorized")
        trade.retrospective = null
        trade.rating = null
        trade.retrospectiveUpdatedAt = null
        trade.updatedAt = LocalDateTime.now()
        tradeRepository.save(trade)
    }

    private fun Trade.toResponse(images: List<TradeImageResponse> = emptyList()) = TradeResponse(
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
        retrospective = retrospective,
        rating = rating,
        retrospectiveUpdatedAt = retrospectiveUpdatedAt?.toString(),
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
        images = images,
    )
}
