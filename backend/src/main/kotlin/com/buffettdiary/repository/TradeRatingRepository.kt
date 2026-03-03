package com.buffettdiary.repository

import com.buffettdiary.entity.TradeRating
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface TradeRatingRepository : JpaRepository<TradeRating, Long> {
    fun findByTradeIdAndUserId(tradeId: Long, userId: Long): TradeRating?
    fun findByTradeIdInAndUserId(tradeIds: List<Long>, userId: Long): List<TradeRating>
    fun countByTradeIdAndLiked(tradeId: Long, liked: Boolean): Long

    @Query("SELECT r.tradeId AS tradeId, SUM(CASE WHEN r.liked = true THEN 1 ELSE 0 END) AS likeCount, SUM(CASE WHEN r.liked = false THEN 1 ELSE 0 END) AS dislikeCount FROM TradeRating r WHERE r.tradeId IN :tradeIds GROUP BY r.tradeId")
    fun findLikeCountsByTradeIds(tradeIds: List<Long>): List<TradeLikeProjection>

    @Modifying
    fun deleteByTradeId(tradeId: Long)
}

interface TradeLikeProjection {
    val tradeId: Long
    val likeCount: Long
    val dislikeCount: Long
}
