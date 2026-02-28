package com.buffettdiary.entity

import com.buffettdiary.enums.Position
import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "trades", indexes = [Index(columnList = "user_id, trade_date")])
class Trade(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "user_id", nullable = false)
    val userId: Long,

    @Column(name = "trade_date", nullable = false)
    val tradeDate: LocalDate,

    @Column(length = 10, nullable = false)
    var ticker: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var position: Position,

    @Column(precision = 12, scale = 6, nullable = false)
    var quantity: BigDecimal,

    @Column(name = "entry_price", precision = 12, scale = 4, nullable = false)
    var entryPrice: BigDecimal,

    @Column(name = "exit_price", precision = 12, scale = 4)
    var exitPrice: BigDecimal? = null,

    @Column(precision = 12, scale = 4)
    var profit: BigDecimal? = null,

    @Column(columnDefinition = "TEXT")
    var reason: String? = null,

    @Column(columnDefinition = "TEXT")
    var retrospective: String? = null,

    var rating: Int? = null,

    @Column(name = "retrospective_updated_at")
    var retrospectiveUpdatedAt: LocalDateTime? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now(),
)
