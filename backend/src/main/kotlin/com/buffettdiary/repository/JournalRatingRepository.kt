package com.buffettdiary.repository

import com.buffettdiary.entity.JournalRating
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface JournalRatingRepository : JpaRepository<JournalRating, Long> {
    fun findByJournalIdAndUserId(journalId: Long, userId: Long): JournalRating?
    fun findByJournalIdInAndUserId(journalIds: List<Long>, userId: Long): List<JournalRating>
    fun countByJournalIdAndLiked(journalId: Long, liked: Boolean): Long

    @Query("SELECT r.journalId AS journalId, SUM(CASE WHEN r.liked = true THEN 1 ELSE 0 END) AS likeCount, SUM(CASE WHEN r.liked = false THEN 1 ELSE 0 END) AS dislikeCount FROM JournalRating r WHERE r.journalId IN :journalIds GROUP BY r.journalId")
    fun findLikeCountsByJournalIds(journalIds: List<Long>): List<JournalLikeProjection>

    @Modifying
    fun deleteByJournalId(journalId: Long)
}

interface JournalLikeProjection {
    val journalId: Long
    val likeCount: Long
    val dislikeCount: Long
}
