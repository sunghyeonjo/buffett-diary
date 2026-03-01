package com.buffettdiary.service

import com.buffettdiary.dto.*
import com.buffettdiary.entity.Journal
import com.buffettdiary.exception.ForbiddenException
import com.buffettdiary.exception.NotFoundException
import com.buffettdiary.repository.JournalRepository
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

        return PageResponse(
            content = journals.map { it.toResponse(imagesMap[it.id] ?: emptyList()) },
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
        return journal.toResponse(images)
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
        return journalRepository.save(journal).toResponse()
    }

    @Transactional
    @CacheEvict(value = ["journals", "journalDetail"], allEntries = true)
    fun update(userId: Long, id: Long, request: JournalRequest): JournalResponse {
        val journal = journalRepository.findById(id)
            .orElseThrow { NotFoundException("Journal not found") }
        if (journal.userId != userId) throw ForbiddenException("Not authorized")

        journal.title = request.title
        journal.content = request.content

        return journalRepository.save(journal).toResponse()
    }

    @Transactional
    @CacheEvict(value = ["journals", "journalDetail"], allEntries = true)
    fun delete(userId: Long, id: Long) {
        val journal = journalRepository.findById(id)
            .orElseThrow { NotFoundException("Journal not found") }
        if (journal.userId != userId) throw ForbiddenException("Not authorized")
        journalImageService.deleteByJournalId(id)
        journalRepository.delete(journal)
    }

    private fun Journal.toResponse(images: List<JournalImageResponse> = emptyList()) = JournalResponse(
        id = id,
        userId = userId,
        title = title,
        content = content,
        journalDate = journalDate.toString(),
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
        images = images,
    )
}
