package com.buffettdiary.service

import com.buffettdiary.dto.*
import com.buffettdiary.repository.JournalCommentRepository
import com.buffettdiary.repository.JournalRatingRepository
import com.buffettdiary.repository.JournalRepository
import com.buffettdiary.repository.StockRepository
import com.buffettdiary.repository.TradeCommentRepository
import com.buffettdiary.repository.TradeRatingRepository
import com.buffettdiary.repository.TradeRepository
import com.buffettdiary.repository.UserRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class FeedService(
    private val followService: FollowService,
    private val journalRepository: JournalRepository,
    private val tradeRepository: TradeRepository,
    private val userRepository: UserRepository,
    private val journalImageService: JournalImageService,
    private val tradeImageService: TradeImageService,
    private val tradeCommentRepository: TradeCommentRepository,
    private val tradeRatingRepository: TradeRatingRepository,
    private val journalCommentRepository: JournalCommentRepository,
    private val journalRatingRepository: JournalRatingRepository,
    private val stockRepository: StockRepository,
) {
    @Transactional(readOnly = true)
    fun feed(userId: Long, page: Int, size: Int): PageResponse<FeedItem> {
        val effectiveSize = if (size <= 0) 20 else size
        val followingIds = followService.findFollowingIds(userId)
        if (followingIds.isEmpty()) {
            return PageResponse(emptyList(), 0, 0, page, effectiveSize)
        }

        val fetchSize = effectiveSize * 2
        val pageable = PageRequest.of(0, fetchSize)

        val journals = journalRepository.findByUserIdInOrderByCreatedAtDesc(followingIds, pageable).content
        val trades = tradeRepository.findByUserIdInOrderByCreatedAtDesc(followingIds, pageable).content

        val userIds = (journals.map { it.userId } + trades.map { it.userId }).toSet()
        val users = userRepository.findAllById(userIds).associateBy { it.id }

        val journalIds = journals.map { it.id }
        val tradeIds = trades.map { it.id }

        // Batch queries — 1 query each instead of N
        val journalImagesMap = journalImageService.getImageMetasByJournalIds(journalIds)
        val tradeImagesMap = tradeImageService.getImageMetasByTradeIds(tradeIds)
        val journalLikeStats = if (journalIds.isNotEmpty()) {
            journalRatingRepository.findLikeCountsByJournalIds(journalIds).associateBy { it.journalId }
        } else emptyMap()
        val tradeLikeStats = if (tradeIds.isNotEmpty()) {
            tradeRatingRepository.findLikeCountsByTradeIds(tradeIds).associateBy { it.tradeId }
        } else emptyMap()
        val journalCommentCounts = if (journalIds.isNotEmpty()) {
            journalCommentRepository.countByJournalIdIn(journalIds).associate { it.entityId to it.count }
        } else emptyMap()
        val tradeCommentCounts = if (tradeIds.isNotEmpty()) {
            tradeCommentRepository.countByTradeIdIn(tradeIds).associate { it.entityId to it.count }
        } else emptyMap()
        val stockMap = if (trades.isNotEmpty()) {
            val tickers = trades.map { it.ticker }.distinct()
            stockRepository.findByTickerIn(tickers).associateBy { it.ticker }
        } else emptyMap()

        val items = mutableListOf<FeedItem>()

        for (journal in journals) {
            val user = users[journal.userId] ?: continue
            items.add(FeedItem(
                type = "journal",
                journal = JournalResponse(
                    id = journal.id,
                    userId = journal.userId,
                    title = journal.title,
                    content = journal.content,
                    journalDate = journal.journalDate.toString(),
                    createdAt = journal.createdAt.toString(),
                    updatedAt = journal.updatedAt.toString(),
                    images = journalImagesMap[journal.id] ?: emptyList(),
                    author = AuthorSummary(user.id, user.nickname),
                    likeCount = journalLikeStats[journal.id]?.likeCount ?: 0,
                    dislikeCount = journalLikeStats[journal.id]?.dislikeCount ?: 0,
                    myLike = null,
                    commentCount = journalCommentCounts[journal.id] ?: 0,
                ),
                trade = null,
                author = AuthorSummary(user.id, user.nickname),
                createdAt = journal.createdAt.toString(),
            ))
        }

        for (trade in trades) {
            val user = users[trade.userId] ?: continue
            items.add(FeedItem(
                type = "trade",
                journal = null,
                trade = TradeResponse(
                    id = trade.id,
                    userId = trade.userId,
                    tradeDate = trade.tradeDate.toString(),
                    ticker = trade.ticker,
                    position = trade.position,
                    quantity = trade.quantity,
                    entryPrice = trade.entryPrice,
                    exitPrice = trade.exitPrice,
                    profit = trade.profit,
                    reason = trade.reason,
                    likeCount = tradeLikeStats[trade.id]?.likeCount ?: 0,
                    dislikeCount = tradeLikeStats[trade.id]?.dislikeCount ?: 0,
                    myLike = null,
                    commentCount = tradeCommentCounts[trade.id] ?: 0,
                    stockInfo = stockMap[trade.ticker]?.let { s -> StockSummary(s.nameKo, s.logoUrl) },
                    createdAt = trade.createdAt.toString(),
                    updatedAt = trade.updatedAt.toString(),
                    images = tradeImagesMap[trade.id] ?: emptyList(),
                ),
                author = AuthorSummary(user.id, user.nickname),
                createdAt = trade.createdAt.toString(),
            ))
        }

        items.sortByDescending { it.createdAt }

        val start = page * effectiveSize
        val paged = items.drop(start).take(effectiveSize)
        val totalElements = items.size.toLong()
        val totalPages = if (items.isEmpty()) 0 else (items.size + effectiveSize - 1) / effectiveSize

        return PageResponse(paged, totalElements, totalPages, page, effectiveSize)
    }
}
