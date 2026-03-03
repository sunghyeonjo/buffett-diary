package com.buffettdiary.repository

import com.buffettdiary.entity.TradeComment
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface TradeCommentRepository : JpaRepository<TradeComment, Long> {
    fun findByTradeIdOrderByCreatedAtAsc(tradeId: Long): List<TradeComment>
    fun countByTradeId(tradeId: Long): Long

    @Query("SELECT c.tradeId AS entityId, COUNT(c) AS count FROM TradeComment c WHERE c.tradeId IN :tradeIds GROUP BY c.tradeId")
    fun countByTradeIdIn(tradeIds: List<Long>): List<CommentCountProjection>

    @Modifying
    fun deleteByTradeId(tradeId: Long)
}
