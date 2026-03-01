package com.buffettdiary.repository

import com.buffettdiary.entity.Journal
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.time.LocalDate

interface JournalRepository : JpaRepository<Journal, Long> {
    fun findByUserIdOrderByJournalDateDescCreatedAtDesc(userId: Long, pageable: Pageable): Page<Journal>
    fun findByUserIdInOrderByCreatedAtDesc(userIds: List<Long>, pageable: Pageable): Page<Journal>

    @Query("""
        SELECT j FROM Journal j WHERE j.userId = :userId
        AND (:startDate IS NULL OR j.journalDate >= :startDate)
        AND (:endDate IS NULL OR j.journalDate <= :endDate)
        ORDER BY j.journalDate DESC, j.createdAt DESC
    """)
    fun findByFilters(
        userId: Long,
        startDate: LocalDate?,
        endDate: LocalDate?,
        pageable: Pageable,
    ): Page<Journal>
}
