package com.buffettdiary.service

import com.buffettdiary.dto.*
import com.buffettdiary.repository.JournalRepository
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
) {
    @Transactional(readOnly = true)
    fun feed(userId: Long, page: Int, size: Int): PageResponse<FeedItem> {
        val followingIds = followService.findFollowingIds(userId)
        if (followingIds.isEmpty()) {
            return PageResponse(emptyList(), 0, 0, page, size)
        }

        val fetchSize = size * 2
        val pageable = PageRequest.of(0, fetchSize)

        val journals = journalRepository.findByUserIdInOrderByCreatedAtDesc(followingIds, pageable).content
        val trades = tradeRepository.findByUserIdInOrderByCreatedAtDesc(followingIds, pageable).content

        val userIds = (journals.map { it.userId } + trades.map { it.userId }).toSet()
        val users = userRepository.findAllById(userIds).associateBy { it.id }

        // Build journal image metas grouped by journal
        val journalIds = journals.map { it.id }
        val journalImagesMap = if (journalIds.isNotEmpty()) {
            // For feed, load images for all journals from all followed users
            journalIds.associateWith { jId ->
                val journal = journals.first { it.id == jId }
                journalImageService.getImageMetas(jId, journal.userId)
            }
        } else emptyMap()

        val tradeIds = trades.map { it.id }
        val tradeImagesMap = if (tradeIds.isNotEmpty()) {
            tradeIds.associateWith { tId ->
                val trade = trades.first { it.id == tId }
                tradeImageService.getImageMetas(tId, trade.userId)
            }
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
                    comment = trade.comment,
                    rating = trade.rating,
                    commentUpdatedAt = trade.commentUpdatedAt?.toString(),
                    createdAt = trade.createdAt.toString(),
                    updatedAt = trade.updatedAt.toString(),
                    images = tradeImagesMap[trade.id] ?: emptyList(),
                ),
                author = AuthorSummary(user.id, user.nickname),
                createdAt = trade.createdAt.toString(),
            ))
        }

        items.sortByDescending { it.createdAt }

        val start = page * size
        val paged = items.drop(start).take(size)
        val totalElements = items.size.toLong()
        val totalPages = if (items.isEmpty()) 0 else (items.size + size - 1) / size

        return PageResponse(paged, totalElements, totalPages, page, size)
    }
}
