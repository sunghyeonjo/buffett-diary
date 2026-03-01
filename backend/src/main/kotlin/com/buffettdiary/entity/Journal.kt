package com.buffettdiary.entity

import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(name = "journals", indexes = [
    Index(columnList = "user_id, journal_date"),
    Index(columnList = "user_id, created_at"),
])
class Journal(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "user_id", nullable = false)
    val userId: Long,

    @Column(length = 100, nullable = false)
    var title: String,

    @Column(columnDefinition = "TEXT", nullable = false)
    var content: String,

    @Column(name = "journal_date", nullable = false)
    val journalDate: LocalDate,
) : AuditEntity()
