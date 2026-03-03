package com.buffettdiary.entity

import jakarta.persistence.*

@Entity
@Table(
    name = "journal_ratings",
    uniqueConstraints = [UniqueConstraint(columnNames = ["journal_id", "user_id"])],
    indexes = [Index(columnList = "journal_id")],
)
class JournalRating(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "journal_id", nullable = false)
    val journalId: Long,

    @Column(name = "user_id", nullable = false)
    val userId: Long,

    @Column(nullable = false)
    var liked: Boolean,
) : AuditEntity()
