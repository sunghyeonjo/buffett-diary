package com.buffettdiary.repository

import com.buffettdiary.entity.TradeTag
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying

interface TradeTagRepository : JpaRepository<TradeTag, Long> {
    fun findByTradeId(tradeId: Long): List<TradeTag>
    fun findByTradeIdIn(tradeIds: List<Long>): List<TradeTag>
    fun findByTagId(tagId: Long): List<TradeTag>

    @Modifying
    fun deleteByTradeId(tradeId: Long)
}
