package com.buffettdiary.repository

import com.buffettdiary.entity.TradeComment
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying

interface TradeCommentRepository : JpaRepository<TradeComment, Long> {
    fun findByTradeIdOrderByCreatedAtAsc(tradeId: Long): List<TradeComment>
    fun countByTradeId(tradeId: Long): Long

    @Modifying
    fun deleteByTradeId(tradeId: Long)
}
