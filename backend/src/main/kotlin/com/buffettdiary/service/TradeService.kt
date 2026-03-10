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
import java.time.format.DateTimeFormatter

@Service
class TradeService(
    private val tradeRepository: TradeRepository,
    private val tradeImageService: TradeImageService,
    private val tradeCommentRepository: TradeCommentRepository,
    private val tradeRatingRepository: TradeRatingRepository,
    private val stockRepository: StockRepository,
    private val tagService: TagService,
    private val badgeService: BadgeService,
    private val notificationService: NotificationService,
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

        val tagsMap = tagService.getTradeTagsMap(tradeIds)

        return PageResponse(
            content = trades.map {
                it.toResponse(
                    images = imagesMap[it.id] ?: emptyList(),
                    commentCount = commentCounts[it.id] ?: 0,
                    likeCount = likeStats[it.id]?.likeCount ?: 0,
                    myLike = myLikes[it.id]?.liked,
                    stockInfo = stockMap[it.ticker]?.let { s -> StockSummary(s.nameKo, s.logoUrl) },
                    tags = tagsMap[it.id] ?: emptyList(),
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
        val myLike = tradeRatingRepository.findByTradeIdAndUserId(id, userId)?.liked
        val stockInfo = stockRepository.findByTicker(trade.ticker)?.let { StockSummary(it.nameKo, it.logoUrl) }
        val tags = tagService.getTradeTagNames(id)
        return trade.toResponse(images, commentCount, likeCount, myLike = myLike, stockInfo = stockInfo, tags = tags)
    }

    @Transactional
    @CacheEvict(value = ["trades", "tradeDetail", "tradeStats", "tradeAnalytics"], allEntries = true)
    fun create(userId: Long, request: TradeRequest): TradeResponse {
        val trade = tradeRepository.save(buildTrade(userId, request))
        if (!request.tags.isNullOrEmpty()) {
            tagService.setTradeTags(userId, trade.id, request.tags)
        }
        badgeService.checkAndAwardTradeBadges(userId)
        val tags = request.tags ?: emptyList()
        return trade.toResponse(tags = tags)
    }

    @Transactional
    @CacheEvict(value = ["trades", "tradeDetail", "tradeStats", "tradeAnalytics"], allEntries = true)
    fun bulkCreate(userId: Long, requests: List<TradeRequest>): List<TradeResponse> {
        val trades = requests.map { buildTrade(userId, it) }
        return tradeRepository.saveAll(trades).map { it.toResponse() }
    }

    @Transactional
    @CacheEvict(value = ["trades", "tradeDetail", "tradeStats", "tradeAnalytics"], allEntries = true)
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
        trade.targetPrice = request.targetPrice
        trade.stopLossPrice = request.stopLossPrice

        val saved = tradeRepository.save(trade)
        if (request.tags != null) {
            tagService.setTradeTags(userId, id, request.tags)
        }
        val tags = request.tags ?: tagService.getTradeTagNames(id)
        return saved.toResponse(tags = tags)
    }

    @Transactional
    @CacheEvict(value = ["trades", "tradeDetail", "tradeStats", "tradeAnalytics"], allEntries = true)
    fun delete(userId: Long, id: Long) {
        val trade = tradeRepository.findById(id)
            .orElseThrow { NotFoundException("Trade not found") }
        if (trade.userId != userId) throw ForbiddenException("Not authorized")
        tradeImageService.deleteByTradeId(id)
        tradeCommentRepository.deleteByTradeId(id)
        tradeRatingRepository.deleteByTradeId(id)
        tagService.setTradeTags(userId, id, emptyList())
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
                if (request.liked) {
                    notificationService.notifyTradeLike(userId, trade.userId, id)
                }
            }
        }

        val commentCount = tradeCommentRepository.countByTradeId(id)
        val likeCount = tradeRatingRepository.countByTradeIdAndLiked(id, true)
        val stockInfo = stockRepository.findByTicker(trade.ticker)?.let { StockSummary(it.nameKo, it.logoUrl) }
        return trade.toResponse(commentCount = commentCount, likeCount = likeCount, myLike = request.liked, stockInfo = stockInfo)
    }

    @Transactional(readOnly = true)
    @Cacheable(value = ["tradeAnalytics"], key = "#userId + '-ticker'")
    fun statsByTicker(userId: Long): List<TickerStatsResponse> {
        val trades = tradeRepository.findByUserId(userId)
        val stockMap = if (trades.isNotEmpty()) {
            val tickers = trades.map { it.ticker }.distinct()
            stockRepository.findByTickerIn(tickers).associateBy { it.ticker }
        } else emptyMap()

        return trades.groupBy { it.ticker }.map { (ticker, group) ->
            val closed = group.filter { it.profit != null }
            val wins = closed.filter { it.profit!! > BigDecimal.ZERO }
            TickerStatsResponse(
                ticker = ticker,
                tradeCount = group.size,
                winCount = wins.size,
                lossCount = closed.size - wins.size,
                winRate = if (closed.isNotEmpty()) wins.size.toDouble() / closed.size * 100 else 0.0,
                totalProfit = closed.sumOf { it.profit!! },
                avgProfit = if (closed.isNotEmpty())
                    closed.sumOf { it.profit!! }.divide(BigDecimal(closed.size), 4, RoundingMode.HALF_UP)
                else BigDecimal.ZERO,
                stockInfo = stockMap[ticker]?.let { StockSummary(it.nameKo, it.logoUrl) },
            )
        }.sortedByDescending { it.totalProfit }
    }

    @Transactional(readOnly = true)
    @Cacheable(value = ["tradeAnalytics"], key = "#userId + '-monthly'")
    fun statsMonthly(userId: Long): List<MonthlyPnlResponse> {
        val trades = tradeRepository.findByUserId(userId)
        val formatter = DateTimeFormatter.ofPattern("yyyy-MM")

        return trades.groupBy { it.tradeDate.format(formatter) }.map { (month, group) ->
            val closed = group.filter { it.profit != null }
            val wins = closed.filter { it.profit!! > BigDecimal.ZERO }
            MonthlyPnlResponse(
                month = month,
                totalProfit = closed.sumOf { it.profit!! },
                tradeCount = group.size,
                winRate = if (closed.isNotEmpty()) wins.size.toDouble() / closed.size * 100 else 0.0,
            )
        }.sortedBy { it.month }
    }

    @Transactional(readOnly = true)
    @Cacheable(value = ["tradeAnalytics"], key = "#userId + '-equity'")
    fun equityCurve(userId: Long): List<EquityCurvePoint> {
        val trades = tradeRepository.findByUserId(userId)
            .filter { it.profit != null }
            .sortedBy { it.tradeDate }

        var cumulative = BigDecimal.ZERO
        return trades.map { trade ->
            cumulative = cumulative.add(trade.profit!!)
            EquityCurvePoint(
                date = trade.tradeDate.toString(),
                cumulativeProfit = cumulative,
            )
        }
    }

    @Transactional(readOnly = true)
    @Cacheable(value = ["tradeAnalytics"], key = "#userId + '-daily-' + #year")
    fun dailyPnl(userId: Long, year: Int): List<DailyPnlEntry> {
        val start = LocalDate.of(year, 1, 1)
        val end = LocalDate.of(year, 12, 31)
        val trades = tradeRepository.findByUserIdAndTradeDateBetween(userId, start, end)
            .filter { it.profit != null }

        return trades.groupBy { it.tradeDate }.map { (date, group) ->
            DailyPnlEntry(
                date = date.toString(),
                profit = group.sumOf { it.profit!! },
            )
        }.sortedBy { it.date }
    }

    @Transactional(readOnly = true)
    fun periodReview(userId: Long, type: String, dateStr: String?): PeriodReviewResponse {
        val baseDate = dateStr?.let { LocalDate.parse(it) } ?: LocalDate.now()

        val (start, end, prevStart, prevEnd, periodLabel) = when (type) {
            "monthly" -> {
                val s = baseDate.withDayOfMonth(1)
                val e = s.plusMonths(1).minusDays(1)
                val ps = s.minusMonths(1)
                val pe = s.minusDays(1)
                PeriodRange(s, e, ps, pe, "${baseDate.year}-${"%02d".format(baseDate.monthValue)}")
            }
            else -> { // weekly
                val s = baseDate.with(DayOfWeek.MONDAY)
                val e = s.plusDays(6)
                val ps = s.minusWeeks(1)
                val pe = s.minusDays(1)
                PeriodRange(s, e, ps, pe, "${s}~${e}")
            }
        }

        val trades = tradeRepository.findByUserIdAndTradeDateBetween(userId, start, end)
        val prevTrades = tradeRepository.findByUserIdAndTradeDateBetween(userId, prevStart, prevEnd)

        val closed = trades.filter { it.profit != null }
        val wins = closed.filter { it.profit!! > BigDecimal.ZERO }
        val winRate = if (closed.isNotEmpty()) wins.size.toDouble() / closed.size * 100 else 0.0

        val prevClosed = prevTrades.filter { it.profit != null }
        val prevWins = prevClosed.filter { it.profit!! > BigDecimal.ZERO }
        val prevWinRate = if (prevClosed.isNotEmpty()) prevWins.size.toDouble() / prevClosed.size * 100 else null

        val tickerGroups = trades.groupBy { it.ticker }
        val mostTraded = tickerGroups.maxByOrNull { it.value.size }?.key

        val tickerProfits = tickerGroups.mapValues { (_, group) ->
            group.filter { it.profit != null }.sumOf { it.profit!! }
        }
        val topPerformer = tickerProfits.maxByOrNull { it.value }?.key
        val worstPerformer = tickerProfits.minByOrNull { it.value }?.key

        val tradeIds = trades.map { it.id }
        val tagsMap = tagService.getTradeTagsMap(tradeIds)
        val allTags = tagsMap.values.flatten()
        val topTags = allTags.groupingBy { it }.eachCount()
            .entries.sortedByDescending { it.value }.take(3).map { it.key }

        return PeriodReviewResponse(
            period = periodLabel,
            totalTrades = trades.size,
            totalProfit = closed.sumOf { it.profit!! },
            winRate = winRate,
            topPerformer = topPerformer,
            worstPerformer = worstPerformer,
            mostTradedTicker = mostTraded,
            winRateChange = prevWinRate?.let { winRate - it },
            topTags = topTags,
        )
    }

    private data class PeriodRange(
        val start: LocalDate,
        val end: LocalDate,
        val prevStart: LocalDate,
        val prevEnd: LocalDate,
        val label: String,
    )

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
            targetPrice = request.targetPrice,
            stopLossPrice = request.stopLossPrice,
        )
    }

    private fun Trade.toResponse(
        images: List<TradeImageResponse> = emptyList(),
        commentCount: Long = 0,
        likeCount: Long = 0,
        myLike: Boolean? = null,
        stockInfo: StockSummary? = null,
        tags: List<String> = emptyList(),
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
        myLike = myLike,
        commentCount = commentCount,
        createdAt = createdAt.toString(),
        stockInfo = stockInfo,
        updatedAt = updatedAt.toString(),
        images = images,
        tags = tags,
        targetPrice = targetPrice,
        stopLossPrice = stopLossPrice,
    )
}
