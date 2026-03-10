package com.buffettdiary.service

import com.buffettdiary.dto.*
import com.buffettdiary.entity.Journal
import com.buffettdiary.entity.JournalRating
import com.buffettdiary.exception.ForbiddenException
import com.buffettdiary.exception.NotFoundException
import com.buffettdiary.entity.JournalTrade
import com.buffettdiary.repository.JournalCommentRepository
import com.buffettdiary.repository.JournalRatingRepository
import com.buffettdiary.repository.JournalRepository
import com.buffettdiary.repository.JournalTradeRepository
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
class JournalService(
    private val journalRepository: JournalRepository,
    private val journalImageService: JournalImageService,
    private val journalCommentRepository: JournalCommentRepository,
    private val journalRatingRepository: JournalRatingRepository,
    private val journalTradeRepository: JournalTradeRepository,
    private val badgeService: BadgeService,
    private val notificationService: NotificationService,
) {
    @Transactional(readOnly = true)
    @Cacheable(value = ["journals"], key = "#userId + '-' + #startDate + '-' + #endDate + '-' + #page + '-' + #size")
    fun list(userId: Long, startDate: String?, endDate: String?, page: Int, size: Int): PageResponse<JournalResponse> {
        val pageable = PageRequest.of(page, size)
        val result = journalRepository.findByFilters(
            userId = userId,
            startDate = startDate?.let { LocalDate.parse(it) },
            endDate = endDate?.let { LocalDate.parse(it) },
            pageable = pageable,
        )
        val journals = result.content
        val journalIds = journals.map { it.id }
        val imagesMap = journalImageService.getImageMetasByJournalIds(journalIds, userId)
        val commentCounts = journalIds.associateWith { journalCommentRepository.countByJournalId(it) }
        val likeStats = if (journalIds.isNotEmpty()) {
            journalRatingRepository.findLikeCountsByJournalIds(journalIds).associateBy { it.journalId }
        } else emptyMap()
        val myLikes = if (journalIds.isNotEmpty()) {
            journalRatingRepository.findByJournalIdInAndUserId(journalIds, userId).associateBy { it.journalId }
        } else emptyMap()

        val linkedTradesMap = if (journalIds.isNotEmpty()) {
            journalTradeRepository.findByJournalIdIn(journalIds)
                .groupBy { it.journalId }
                .mapValues { (_, v) -> v.map { it.tradeId } }
        } else emptyMap()

        return PageResponse(
            content = journals.map {
                it.toResponse(
                    images = imagesMap[it.id] ?: emptyList(),
                    commentCount = commentCounts[it.id] ?: 0,
                    likeCount = likeStats[it.id]?.likeCount ?: 0,
                    myLike = myLikes[it.id]?.liked,
                    linkedTradeIds = linkedTradesMap[it.id] ?: emptyList(),
                )
            },
            totalElements = result.totalElements,
            totalPages = result.totalPages,
            page = page,
            size = size,
        )
    }

    @Transactional(readOnly = true)
    @Cacheable(value = ["journalDetail"], key = "#userId + '-' + #id")
    fun get(userId: Long, id: Long): JournalResponse {
        val journal = journalRepository.findById(id)
            .orElseThrow { NotFoundException("Journal not found") }
        if (journal.userId != userId) throw ForbiddenException("Not authorized")
        val images = journalImageService.getImageMetas(id, userId)
        val commentCount = journalCommentRepository.countByJournalId(id)
        val likeCount = journalRatingRepository.countByJournalIdAndLiked(id, true)
        val myLike = journalRatingRepository.findByJournalIdAndUserId(id, userId)?.liked
        val linkedTradeIds = journalTradeRepository.findByJournalId(id).map { it.tradeId }
        return journal.toResponse(images, commentCount, likeCount, myLike = myLike, linkedTradeIds = linkedTradeIds)
    }

    @Transactional
    @CacheEvict(value = ["journals", "journalDetail"], allEntries = true)
    fun create(userId: Long, request: JournalRequest): JournalResponse {
        val journal = Journal(
            userId = userId,
            title = request.title,
            content = request.content,
            journalDate = request.journalDate,
        )
        val saved = journalRepository.save(journal)
        val tradeIds = request.tradeIds ?: emptyList()
        if (tradeIds.isNotEmpty()) {
            journalTradeRepository.saveAll(tradeIds.map { JournalTrade(journalId = saved.id, tradeId = it) })
        }
        badgeService.checkAndAwardJournalBadges(userId)
        return saved.toResponse(linkedTradeIds = tradeIds)
    }

    @Transactional
    @CacheEvict(value = ["journals", "journalDetail"], allEntries = true)
    fun update(userId: Long, id: Long, request: JournalRequest): JournalResponse {
        val journal = journalRepository.findById(id)
            .orElseThrow { NotFoundException("Journal not found") }
        if (journal.userId != userId) throw ForbiddenException("Not authorized")

        journal.title = request.title
        journal.content = request.content

        val saved = journalRepository.save(journal)
        if (request.tradeIds != null) {
            journalTradeRepository.deleteByJournalId(id)
            if (request.tradeIds.isNotEmpty()) {
                journalTradeRepository.saveAll(request.tradeIds.map { JournalTrade(journalId = id, tradeId = it) })
            }
        }
        val linkedTradeIds = request.tradeIds ?: journalTradeRepository.findByJournalId(id).map { it.tradeId }
        return saved.toResponse(linkedTradeIds = linkedTradeIds)
    }

    @Transactional
    @CacheEvict(value = ["journals", "journalDetail"], allEntries = true)
    fun delete(userId: Long, id: Long) {
        val journal = journalRepository.findById(id)
            .orElseThrow { NotFoundException("Journal not found") }
        if (journal.userId != userId) throw ForbiddenException("Not authorized")
        journalImageService.deleteByJournalId(id)
        journalCommentRepository.deleteByJournalId(id)
        journalRatingRepository.deleteByJournalId(id)
        journalTradeRepository.deleteByJournalId(id)
        journalRepository.delete(journal)
    }

    @Transactional
    @CacheEvict(value = ["journals", "journalDetail"], allEntries = true)
    fun updateLike(userId: Long, id: Long, request: JournalLikeRequest): JournalResponse {
        val journal = journalRepository.findById(id)
            .orElseThrow { NotFoundException("Journal not found") }

        val existing = journalRatingRepository.findByJournalIdAndUserId(id, userId)
        if (request.liked == null) {
            if (existing != null) journalRatingRepository.delete(existing)
        } else {
            if (existing != null) {
                existing.liked = request.liked
                journalRatingRepository.save(existing)
            } else {
                journalRatingRepository.save(JournalRating(journalId = id, userId = userId, liked = request.liked))
                if (request.liked) {
                    notificationService.notifyJournalLike(userId, journal.userId, id)
                }
            }
        }

        val commentCount = journalCommentRepository.countByJournalId(id)
        val likeCount = journalRatingRepository.countByJournalIdAndLiked(id, true)
        return journal.toResponse(commentCount = commentCount, likeCount = likeCount, myLike = request.liked)
    }

    private fun Journal.toResponse(
        images: List<JournalImageResponse> = emptyList(),
        commentCount: Long = 0,
        likeCount: Long = 0,
        myLike: Boolean? = null,
        linkedTradeIds: List<Long> = emptyList(),
    ) = JournalResponse(
        id = id,
        userId = userId,
        title = title,
        content = content,
        journalDate = journalDate.toString(),
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
        images = images,
        likeCount = likeCount,
        myLike = myLike,
        commentCount = commentCount,
        linkedTradeIds = linkedTradeIds,
    )
}
