package com.buffettdiary.repository

import com.buffettdiary.entity.TradeImage
import org.springframework.data.jpa.repository.JpaRepository

interface TradeImageRepository : JpaRepository<TradeImage, Long> {
    fun findByTradeIdAndUserId(tradeId: Long, userId: Long): List<TradeImage>
    fun findByTradeIdInAndUserId(tradeIds: List<Long>, userId: Long): List<TradeImage>
    fun countByTradeId(tradeId: Long): Int
    fun deleteByTradeId(tradeId: Long)
}
