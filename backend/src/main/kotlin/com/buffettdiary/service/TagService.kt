package com.buffettdiary.service

import com.buffettdiary.dto.TagStatsResponse
import com.buffettdiary.entity.Tag
import com.buffettdiary.entity.TradeTag
import com.buffettdiary.exception.ForbiddenException
import com.buffettdiary.exception.NotFoundException
import com.buffettdiary.repository.TagRepository
import com.buffettdiary.repository.TradeRepository
import com.buffettdiary.repository.TradeTagRepository
import org.springframework.cache.annotation.CacheEvict
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode

@Service
class TagService(
    private val tagRepository: TagRepository,
    private val tradeTagRepository: TradeTagRepository,
    private val tradeRepository: TradeRepository,
) {
    @Transactional(readOnly = true)
    fun getUserTags(userId: Long): List<String> {
        return tagRepository.findByUserId(userId).map { it.name }
    }

    @Transactional
    fun getOrCreateTags(userId: Long, tagNames: List<String>): List<Tag> {
        val normalized = tagNames.map { it.trim() }.filter { it.isNotBlank() }.distinct()
        if (normalized.isEmpty()) return emptyList()

        val existing = tagRepository.findByUserIdAndNameIn(userId, normalized)
        val existingNames = existing.map { it.name }.toSet()
        val newTags = normalized.filter { it !in existingNames }
            .map { Tag(userId = userId, name = it) }
        val saved = if (newTags.isNotEmpty()) tagRepository.saveAll(newTags) else emptyList()
        return existing + saved
    }

    @Transactional
    @CacheEvict(value = ["trades", "tradeDetail", "tradeStats", "tradeAnalytics"], allEntries = true)
    fun setTradeTags(userId: Long, tradeId: Long, tagNames: List<String>) {
        val trade = tradeRepository.findById(tradeId)
            .orElseThrow { NotFoundException("Trade not found") }
        if (trade.userId != userId) throw ForbiddenException("Not authorized")

        tradeTagRepository.deleteByTradeId(tradeId)

        if (tagNames.isNotEmpty()) {
            val tags = getOrCreateTags(userId, tagNames)
            val tradeTags = tags.map { TradeTag(tradeId = tradeId, tagId = it.id) }
            tradeTagRepository.saveAll(tradeTags)
        }
    }

    @Transactional(readOnly = true)
    fun getTradeTagNames(tradeId: Long): List<String> {
        val tradeTags = tradeTagRepository.findByTradeId(tradeId)
        if (tradeTags.isEmpty()) return emptyList()
        val tagIds = tradeTags.map { it.tagId }
        val tags = tagRepository.findAllById(tagIds).associateBy { it.id }
        return tradeTags.mapNotNull { tags[it.tagId]?.name }
    }

    @Transactional(readOnly = true)
    fun getTradeTagsMap(tradeIds: List<Long>): Map<Long, List<String>> {
        if (tradeIds.isEmpty()) return emptyMap()
        val tradeTags = tradeTagRepository.findByTradeIdIn(tradeIds)
        if (tradeTags.isEmpty()) return emptyMap()

        val tagIds = tradeTags.map { it.tagId }.distinct()
        val tags = tagRepository.findAllById(tagIds).associateBy { it.id }

        return tradeTags.groupBy { it.tradeId }
            .mapValues { (_, tts) -> tts.mapNotNull { tags[it.tagId]?.name } }
    }

    @Transactional(readOnly = true)
    fun getTagStats(userId: Long): List<TagStatsResponse> {
        val tags = tagRepository.findByUserId(userId)
        if (tags.isEmpty()) return emptyList()

        val allTrades = tradeRepository.findByUserId(userId)
        val allTradeTags = tradeTagRepository.findByTradeIdIn(allTrades.map { it.id })
        val tradeMap = allTrades.associateBy { it.id }

        return tags.map { tag ->
            val tradeIds = allTradeTags.filter { it.tagId == tag.id }.map { it.tradeId }
            val trades = tradeIds.mapNotNull { tradeMap[it] }
            val closed = trades.filter { it.profit != null }
            val wins = closed.filter { it.profit!! > BigDecimal.ZERO }
            TagStatsResponse(
                tag = tag.name,
                tradeCount = trades.size,
                winCount = wins.size,
                lossCount = closed.size - wins.size,
                winRate = if (closed.isNotEmpty()) wins.size.toDouble() / closed.size * 100 else 0.0,
                totalProfit = closed.sumOf { it.profit!! },
                avgProfit = if (closed.isNotEmpty())
                    closed.sumOf { it.profit!! }.divide(BigDecimal(closed.size), 4, RoundingMode.HALF_UP)
                else BigDecimal.ZERO,
            )
        }.sortedByDescending { it.totalProfit }
    }
}
