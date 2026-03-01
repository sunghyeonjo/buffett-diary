package com.buffettdiary.repository

import com.buffettdiary.entity.TradeImage
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface TradeImageMeta {
    val id: Long
    val tradeId: Long
    val userId: Long
    val fileName: String
    val contentType: String
    val fileSize: Long
    val createdAt: java.time.LocalDateTime
}

interface TradeImageRepository : JpaRepository<TradeImage, Long> {
    @Query("SELECT t.id as id, t.tradeId as tradeId, t.userId as userId, t.fileName as fileName, t.contentType as contentType, t.fileSize as fileSize, t.createdAt as createdAt FROM TradeImage t WHERE t.tradeId = :tradeId AND t.userId = :userId")
    fun findMetaByTradeIdAndUserId(tradeId: Long, userId: Long): List<TradeImageMeta>

    @Query("SELECT t.id as id, t.tradeId as tradeId, t.userId as userId, t.fileName as fileName, t.contentType as contentType, t.fileSize as fileSize, t.createdAt as createdAt FROM TradeImage t WHERE t.tradeId IN :tradeIds AND t.userId = :userId")
    fun findMetaByTradeIdInAndUserId(tradeIds: List<Long>, userId: Long): List<TradeImageMeta>

    fun countByTradeId(tradeId: Long): Int
    fun deleteByTradeId(tradeId: Long)
}
