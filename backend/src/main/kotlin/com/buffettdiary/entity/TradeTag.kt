package com.buffettdiary.entity

import jakarta.persistence.*

@Entity
@Table(
    name = "trade_tags",
    uniqueConstraints = [UniqueConstraint(columnNames = ["trade_id", "tag_id"])],
    indexes = [Index(columnList = "tag_id")],
)
class TradeTag(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "trade_id", nullable = false)
    val tradeId: Long,

    @Column(name = "tag_id", nullable = false)
    val tagId: Long,
)
