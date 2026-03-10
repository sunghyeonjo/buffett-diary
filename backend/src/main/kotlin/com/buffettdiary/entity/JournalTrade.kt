package com.buffettdiary.entity

import jakarta.persistence.*

@Entity
@Table(
    name = "journal_trades",
    uniqueConstraints = [UniqueConstraint(columnNames = ["journal_id", "trade_id"])],
)
class JournalTrade(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "journal_id", nullable = false)
    val journalId: Long,

    @Column(name = "trade_id", nullable = false)
    val tradeId: Long,
)
