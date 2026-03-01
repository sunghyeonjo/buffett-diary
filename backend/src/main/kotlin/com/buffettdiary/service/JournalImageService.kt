package com.buffettdiary.service

import com.buffettdiary.dto.JournalImageDataResponse
import com.buffettdiary.dto.JournalImageResponse
import com.buffettdiary.entity.JournalImage
import com.buffettdiary.exception.BadRequestException
import com.buffettdiary.exception.ForbiddenException
import com.buffettdiary.exception.NotFoundException
import com.buffettdiary.repository.FollowRepository
import com.buffettdiary.repository.JournalImageMeta
import com.buffettdiary.repository.JournalImageRepository
import com.buffettdiary.repository.JournalRepository
import org.springframework.cache.annotation.CacheEvict
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile

@Service
class JournalImageService(
    private val journalImageRepository: JournalImageRepository,
    private val journalRepository: JournalRepository,
    private val followRepository: FollowRepository,
) {
    companion object {
        const val MAX_IMAGES_PER_JOURNAL = 5
        const val MAX_FILE_SIZE = 5L * 1024 * 1024
        val ALLOWED_CONTENT_TYPES = setOf(
            "image/jpeg", "image/png", "image/gif", "image/webp",
        )
    }

    @Transactional
    @CacheEvict(value = ["journals", "journalDetail"], allEntries = true)
    fun upload(userId: Long, journalId: Long, file: MultipartFile): JournalImageResponse {
        val journal = journalRepository.findById(journalId)
            .orElseThrow { NotFoundException("Journal not found") }
        if (journal.userId != userId) throw ForbiddenException("Not authorized")

        val contentType = file.contentType ?: throw BadRequestException("Content type is required")
        if (contentType !in ALLOWED_CONTENT_TYPES) {
            throw BadRequestException("Unsupported file type: $contentType. Allowed: JPEG, PNG, GIF, WebP")
        }
        if (file.size > MAX_FILE_SIZE) {
            throw BadRequestException("File size exceeds 5MB limit")
        }

        val currentCount = journalImageRepository.countByJournalId(journalId)
        if (currentCount >= MAX_IMAGES_PER_JOURNAL) {
            throw BadRequestException("Maximum $MAX_IMAGES_PER_JOURNAL images per journal")
        }

        val image = JournalImage(
            journalId = journalId,
            userId = userId,
            fileName = file.originalFilename ?: "image",
            contentType = contentType,
            fileSize = file.size,
            data = file.bytes,
        )
        return journalImageRepository.save(image).toResponse()
    }

    @Transactional(readOnly = true)
    fun getData(userId: Long, journalId: Long, imageId: Long): JournalImageDataResponse {
        val image = journalImageRepository.findById(imageId)
            .orElseThrow { NotFoundException("Image not found") }
        if (image.journalId != journalId) throw ForbiddenException("Not authorized")
        if (image.userId != userId && !followRepository.existsByFollowerIdAndFollowingId(userId, image.userId)) {
            throw ForbiddenException("Not authorized")
        }
        return JournalImageDataResponse(image.fileName, image.contentType, image.data)
    }

    @Transactional
    @CacheEvict(value = ["journals", "journalDetail"], allEntries = true)
    fun delete(userId: Long, journalId: Long, imageId: Long) {
        val image = journalImageRepository.findById(imageId)
            .orElseThrow { NotFoundException("Image not found") }
        if (image.journalId != journalId || image.userId != userId) {
            throw ForbiddenException("Not authorized")
        }
        journalImageRepository.delete(image)
    }

    @Transactional(readOnly = true)
    fun getImageMetasByJournalIds(journalIds: List<Long>, userId: Long): Map<Long, List<JournalImageResponse>> {
        if (journalIds.isEmpty()) return emptyMap()
        return journalImageRepository.findMetaByJournalIdInAndUserId(journalIds, userId)
            .map { it.toResponse() }
            .groupBy { it.journalId }
    }

    @Transactional(readOnly = true)
    fun getImageMetas(journalId: Long, userId: Long): List<JournalImageResponse> {
        return journalImageRepository.findMetaByJournalIdAndUserId(journalId, userId)
            .map { it.toResponse() }
    }

    @Transactional
    fun deleteByJournalId(journalId: Long) {
        journalImageRepository.deleteByJournalId(journalId)
    }

    private fun JournalImage.toResponse() = JournalImageResponse(
        id = id,
        journalId = journalId,
        fileName = fileName,
        contentType = contentType,
        fileSize = fileSize,
        createdAt = createdAt.toString(),
    )

    private fun JournalImageMeta.toResponse() = JournalImageResponse(
        id = id,
        journalId = journalId,
        fileName = fileName,
        contentType = contentType,
        fileSize = fileSize,
        createdAt = createdAt.toString(),
    )
}
