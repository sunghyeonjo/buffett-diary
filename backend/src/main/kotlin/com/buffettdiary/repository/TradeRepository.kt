package com.buffettdiary.repository

import com.buffettdiary.entity.Trade
import com.buffettdiary.enums.Position
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.time.LocalDate

interface TradeRepository : JpaRepository<Trade, Long> {
    fun findByUserIdOrderByTradeDateDesc(userId: Long, pageable: Pageable): Page<Trade>

    @Query("""
        SELECT t FROM Trade t WHERE t.userId = :userId
        AND (:startDate IS NULL OR t.tradeDate >= :startDate)
        AND (:endDate IS NULL OR t.tradeDate <= :endDate)
        AND (:ticker IS NULL OR t.ticker = :ticker)
        AND (:position IS NULL OR t.position = :position)
        ORDER BY t.tradeDate DESC
    """)
    fun findByFilters(
        userId: Long,
        startDate: LocalDate?,
        endDate: LocalDate?,
        ticker: String?,
        position: Position?,
        pageable: Pageable,
    ): Page<Trade>

    fun findByUserIdAndTradeDateBetween(userId: Long, start: LocalDate, end: LocalDate): List<Trade>
    fun findByUserId(userId: Long): List<Trade>
}
