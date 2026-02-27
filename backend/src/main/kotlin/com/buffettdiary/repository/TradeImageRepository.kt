package com.buffettdiary.repository

import com.buffettdiary.entity.TradeImage
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface TradeImageRepository : JpaRepository<TradeImage, Long> {
    @Query("SELECT new TradeImage(t.id, t.tradeId, t.userId, t.fileName, t.contentType, t.fileSize, t.createdAt) FROM TradeImage t WHERE t.tradeId = :tradeId AND t.userId = :userId")
    fun findMetaByTradeIdAndUserId(tradeId: Long, userId: Long): List<TradeImage>

    @Query("SELECT new TradeImage(t.id, t.tradeId, t.userId, t.fileName, t.contentType, t.fileSize, t.createdAt) FROM TradeImage t WHERE t.tradeId IN :tradeIds AND t.userId = :userId")
    fun findMetaByTradeIdInAndUserId(tradeIds: List<Long>, userId: Long): List<TradeImage>

    fun countByTradeId(tradeId: Long): Int
    fun deleteByTradeId(tradeId: Long)
}
