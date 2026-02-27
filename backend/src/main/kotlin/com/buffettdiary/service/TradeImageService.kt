package com.buffettdiary.service

import com.buffettdiary.dto.TradeImageDataResponse
import com.buffettdiary.dto.TradeImageResponse
import com.buffettdiary.entity.TradeImage
import com.buffettdiary.repository.TradeImageRepository
import com.buffettdiary.repository.TradeRepository
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile

@Service
class TradeImageService(
    private val tradeImageRepository: TradeImageRepository,
    private val tradeRepository: TradeRepository,
) {
    companion object {
        const val MAX_IMAGES_PER_TRADE = 5
        const val MAX_FILE_SIZE = 5L * 1024 * 1024 // 5MB
        val ALLOWED_CONTENT_TYPES = setOf(
            "image/jpeg", "image/png", "image/gif", "image/webp",
        )
    }

    @Transactional
    @CacheEvict(value = ["trades", "tradeDetail"], allEntries = true)
    fun upload(userId: Long, tradeId: Long, file: MultipartFile): TradeImageResponse {
        val trade = tradeRepository.findById(tradeId)
            .orElseThrow { IllegalArgumentException("Trade not found") }
        if (trade.userId != userId) throw IllegalArgumentException("Not authorized")

        val contentType = file.contentType ?: throw IllegalArgumentException("Content type is required")
        if (contentType !in ALLOWED_CONTENT_TYPES) {
            throw IllegalArgumentException("Unsupported file type: $contentType. Allowed: JPEG, PNG, GIF, WebP")
        }
        if (file.size > MAX_FILE_SIZE) {
            throw IllegalArgumentException("File size exceeds 5MB limit")
        }

        val currentCount = tradeImageRepository.countByTradeId(tradeId)
        if (currentCount >= MAX_IMAGES_PER_TRADE) {
            throw IllegalArgumentException("Maximum $MAX_IMAGES_PER_TRADE images per trade")
        }

        val image = TradeImage(
            tradeId = tradeId,
            userId = userId,
            fileName = file.originalFilename ?: "image",
            contentType = contentType,
            fileSize = file.size,
            data = file.bytes,
        )
        return tradeImageRepository.save(image).toResponse()
    }

    @Cacheable(value = ["tradeImageData"], key = "#imageId")
    fun getData(userId: Long, tradeId: Long, imageId: Long): TradeImageDataResponse {
        val image = tradeImageRepository.findById(imageId)
            .orElseThrow { IllegalArgumentException("Image not found") }
        if (image.tradeId != tradeId || image.userId != userId) {
            throw IllegalArgumentException("Not authorized")
        }
        return TradeImageDataResponse(image.fileName, image.contentType, image.data)
    }

    @Transactional
    @CacheEvict(value = ["trades", "tradeDetail", "tradeImageData"], allEntries = true)
    fun delete(userId: Long, tradeId: Long, imageId: Long) {
        val image = tradeImageRepository.findById(imageId)
            .orElseThrow { IllegalArgumentException("Image not found") }
        if (image.tradeId != tradeId || image.userId != userId) {
            throw IllegalArgumentException("Not authorized")
        }
        tradeImageRepository.delete(image)
    }

    fun getImageMetasByTradeIds(tradeIds: List<Long>, userId: Long): Map<Long, List<TradeImageResponse>> {
        if (tradeIds.isEmpty()) return emptyMap()
        return tradeImageRepository.findMetaByTradeIdInAndUserId(tradeIds, userId)
            .map { it.toResponse() }
            .groupBy { it.tradeId }
    }

    fun getImageMetas(tradeId: Long, userId: Long): List<TradeImageResponse> {
        return tradeImageRepository.findMetaByTradeIdAndUserId(tradeId, userId)
            .map { it.toResponse() }
    }

    @Transactional
    fun deleteByTradeId(tradeId: Long) {
        tradeImageRepository.deleteByTradeId(tradeId)
    }

    private fun TradeImage.toResponse() = TradeImageResponse(
        id = id,
        tradeId = tradeId,
        fileName = fileName,
        contentType = contentType,
        fileSize = fileSize,
        createdAt = createdAt.toString(),
    )
}
