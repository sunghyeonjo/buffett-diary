package com.buffettdiary.entity

import jakarta.persistence.*

@Entity
@Table(
    name = "trade_ratings",
    uniqueConstraints = [UniqueConstraint(columnNames = ["trade_id", "user_id"])],
    indexes = [Index(columnList = "trade_id")],
)
class TradeRating(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "trade_id", nullable = false)
    val tradeId: Long,

    @Column(name = "user_id", nullable = false)
    val userId: Long,

    @Column(nullable = false)
    var liked: Boolean,
) : AuditEntity()
