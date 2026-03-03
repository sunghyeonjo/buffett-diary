package com.buffettdiary.service

import com.buffettdiary.dto.*
import com.buffettdiary.entity.Trade
import com.buffettdiary.enums.Position
import com.buffettdiary.exception.ForbiddenException
import com.buffettdiary.exception.NotFoundException
import com.buffettdiary.repository.StockRepository
import com.buffettdiary.repository.TradeCommentRepository
import com.buffettdiary.repository.TradeRatingRepository
import com.buffettdiary.repository.TradeRepository
import com.buffettdiary.entity.TradeRating
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.DayOfWeek
import java.time.LocalDate

@Service
class TradeService(
    private val tradeRepository: TradeRepository,
    private val tradeImageService: TradeImageService,
    private val tradeCommentRepository: TradeCommentRepository,
    private val tradeRatingRepository: TradeRatingRepository,
    private val stockRepository: StockRepository,
) {
    @Transactional(readOnly = true)
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
        val commentCounts = tradeIds.associateWith { tradeCommentRepository.countByTradeId(it) }
        val likeStats = if (tradeIds.isNotEmpty()) {
            tradeRatingRepository.findLikeCountsByTradeIds(tradeIds).associateBy { it.tradeId }
        } else emptyMap()
        val myLikes = if (tradeIds.isNotEmpty()) {
            tradeRatingRepository.findByTradeIdInAndUserId(tradeIds, userId).associateBy { it.tradeId }
        } else emptyMap()
        val stockMap = if (trades.isNotEmpty()) {
            val tickers = trades.map { it.ticker }.distinct()
            stockRepository.findByTickerIn(tickers).associateBy { it.ticker }
        } else emptyMap()

        return PageResponse(
            content = trades.map {
                it.toResponse(
                    images = imagesMap[it.id] ?: emptyList(),
                    commentCount = commentCounts[it.id] ?: 0,
                    likeCount = likeStats[it.id]?.likeCount ?: 0,
                    dislikeCount = likeStats[it.id]?.dislikeCount ?: 0,
                    myLike = myLikes[it.id]?.liked,
                    stockInfo = stockMap[it.ticker]?.let { s -> StockSummary(s.nameKo, s.logoUrl) },
                )
            },
            totalElements = result.totalElements,
            totalPages = result.totalPages,
            page = page,
            size = size,
        )
    }

    @Transactional(readOnly = true)
    @Cacheable(value = ["tradeDetail"], key = "#userId + '-' + #id")
    fun get(userId: Long, id: Long): TradeResponse {
        val trade = tradeRepository.findById(id)
            .orElseThrow { NotFoundException("Trade not found") }
        if (trade.userId != userId) throw ForbiddenException("Not authorized")
        val images = tradeImageService.getImageMetas(id, userId)
        val commentCount = tradeCommentRepository.countByTradeId(id)
        val likeCount = tradeRatingRepository.countByTradeIdAndLiked(id, true)
        val dislikeCount = tradeRatingRepository.countByTradeIdAndLiked(id, false)
        val myLike = tradeRatingRepository.findByTradeIdAndUserId(id, userId)?.liked
        val stockInfo = stockRepository.findByTicker(trade.ticker)?.let { StockSummary(it.nameKo, it.logoUrl) }
        return trade.toResponse(images, commentCount, likeCount, dislikeCount, myLike, stockInfo)
    }

    @Transactional
    @CacheEvict(value = ["trades", "tradeDetail", "tradeStats"], allEntries = true)
    fun create(userId: Long, request: TradeRequest): TradeResponse {
        return tradeRepository.save(buildTrade(userId, request)).toResponse()
    }

    @Transactional
    @CacheEvict(value = ["trades", "tradeDetail", "tradeStats"], allEntries = true)
    fun bulkCreate(userId: Long, requests: List<TradeRequest>): List<TradeResponse> {
        val trades = requests.map { buildTrade(userId, it) }
        return tradeRepository.saveAll(trades).map { it.toResponse() }
    }

    @Transactional
    @CacheEvict(value = ["trades", "tradeDetail", "tradeStats"], allEntries = true)
    fun update(userId: Long, id: Long, request: TradeRequest): TradeResponse {
        val trade = tradeRepository.findById(id)
            .orElseThrow { NotFoundException("Trade not found") }
        if (trade.userId != userId) throw ForbiddenException("Not authorized")

        trade.ticker = request.ticker.uppercase()
        trade.position = request.position
        trade.quantity = request.quantity
        trade.entryPrice = request.entryPrice
        trade.exitPrice = request.exitPrice
        trade.profit = if (request.position.isSell()) request.profit else null
        trade.reason = request.reason

        return tradeRepository.save(trade).toResponse()
    }

    @Transactional
    @CacheEvict(value = ["trades", "tradeDetail", "tradeStats"], allEntries = true)
    fun delete(userId: Long, id: Long) {
        val trade = tradeRepository.findById(id)
            .orElseThrow { NotFoundException("Trade not found") }
        if (trade.userId != userId) throw ForbiddenException("Not authorized")
        tradeImageService.deleteByTradeId(id)
        tradeCommentRepository.deleteByTradeId(id)
        tradeRatingRepository.deleteByTradeId(id)
        tradeRepository.delete(trade)
    }

    @Transactional(readOnly = true)
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
    fun updateLike(userId: Long, id: Long, request: TradeLikeRequest): TradeResponse {
        val trade = tradeRepository.findById(id)
            .orElseThrow { NotFoundException("Trade not found") }

        val existing = tradeRatingRepository.findByTradeIdAndUserId(id, userId)
        if (request.liked == null) {
            if (existing != null) tradeRatingRepository.delete(existing)
        } else {
            if (existing != null) {
                existing.liked = request.liked
                tradeRatingRepository.save(existing)
            } else {
                tradeRatingRepository.save(TradeRating(tradeId = id, userId = userId, liked = request.liked))
            }
        }

        val commentCount = tradeCommentRepository.countByTradeId(id)
        val likeCount = tradeRatingRepository.countByTradeIdAndLiked(id, true)
        val dislikeCount = tradeRatingRepository.countByTradeIdAndLiked(id, false)
        val stockInfo = stockRepository.findByTicker(trade.ticker)?.let { StockSummary(it.nameKo, it.logoUrl) }
        return trade.toResponse(commentCount = commentCount, likeCount = likeCount, dislikeCount = dislikeCount, myLike = request.liked, stockInfo = stockInfo)
    }

    private fun buildTrade(userId: Long, request: TradeRequest): Trade {
        return Trade(
            userId = userId,
            tradeDate = request.tradeDate,
            ticker = request.ticker.uppercase(),
            position = request.position,
            quantity = request.quantity,
            entryPrice = request.entryPrice,
            exitPrice = request.exitPrice,
            profit = if (request.position.isSell()) request.profit else null,
            reason = request.reason,
        )
    }

    private fun Trade.toResponse(
        images: List<TradeImageResponse> = emptyList(),
        commentCount: Long = 0,
        likeCount: Long = 0,
        dislikeCount: Long = 0,
        myLike: Boolean? = null,
        stockInfo: StockSummary? = null,
    ) = TradeResponse(
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
        likeCount = likeCount,
        dislikeCount = dislikeCount,
        myLike = myLike,
        commentCount = commentCount,
        createdAt = createdAt.toString(),
        stockInfo = stockInfo,
        updatedAt = updatedAt.toString(),
        images = images,
    )
}
