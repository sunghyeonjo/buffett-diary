package com.buffettdiary.entity

import jakarta.persistence.*

@Entity
@Table(
    name = "journal_comments",
    indexes = [
        Index(columnList = "journal_id"),
        Index(columnList = "parent_id"),
    ],
)
class JournalComment(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "journal_id", nullable = false)
    val journalId: Long,

    @Column(name = "user_id", nullable = false)
    val userId: Long,

    @Column(name = "parent_id")
    val parentId: Long? = null,

    @Column(columnDefinition = "TEXT", nullable = false)
    var content: String,
) : AuditEntity()
