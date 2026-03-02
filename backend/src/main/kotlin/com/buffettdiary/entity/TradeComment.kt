package com.buffettdiary.entity

import jakarta.persistence.*

@Entity
@Table(
    name = "trade_comments",
    indexes = [
        Index(columnList = "trade_id"),
        Index(columnList = "parent_id"),
    ],
)
class TradeComment(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "trade_id", nullable = false)
    val tradeId: Long,

    @Column(name = "user_id", nullable = false)
    val userId: Long,

    @Column(name = "parent_id")
    val parentId: Long? = null,

    @Column(columnDefinition = "TEXT", nullable = false)
    var content: String,
) : AuditEntity()
