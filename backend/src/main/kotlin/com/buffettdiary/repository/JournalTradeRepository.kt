package com.buffettdiary.repository

import com.buffettdiary.entity.JournalTrade
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying

interface JournalTradeRepository : JpaRepository<JournalTrade, Long> {
    fun findByJournalId(journalId: Long): List<JournalTrade>
    fun findByJournalIdIn(journalIds: List<Long>): List<JournalTrade>

    @Modifying
    fun deleteByJournalId(journalId: Long)
}
