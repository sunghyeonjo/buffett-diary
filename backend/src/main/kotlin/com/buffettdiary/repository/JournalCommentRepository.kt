package com.buffettdiary.repository

import com.buffettdiary.entity.JournalComment
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface CommentCountProjection {
    val entityId: Long
    val count: Long
}

interface JournalCommentRepository : JpaRepository<JournalComment, Long> {
    fun findByJournalIdOrderByCreatedAtAsc(journalId: Long): List<JournalComment>
    fun countByJournalId(journalId: Long): Long

    @Query("SELECT c.journalId AS entityId, COUNT(c) AS count FROM JournalComment c WHERE c.journalId IN :journalIds GROUP BY c.journalId")
    fun countByJournalIdIn(journalIds: List<Long>): List<CommentCountProjection>

    @Modifying
    fun deleteByJournalId(journalId: Long)
}
