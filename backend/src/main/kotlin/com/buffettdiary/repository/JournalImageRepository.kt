package com.buffettdiary.repository

import com.buffettdiary.entity.JournalImage
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface JournalImageMeta {
    val id: Long
    val journalId: Long
    val userId: Long
    val fileName: String
    val contentType: String
    val fileSize: Long
    val createdAt: java.time.LocalDateTime
}

interface JournalImageRepository : JpaRepository<JournalImage, Long> {
    @Query("SELECT j.id as id, j.journalId as journalId, j.userId as userId, j.fileName as fileName, j.contentType as contentType, j.fileSize as fileSize, j.createdAt as createdAt FROM JournalImage j WHERE j.journalId = :journalId AND j.userId = :userId")
    fun findMetaByJournalIdAndUserId(journalId: Long, userId: Long): List<JournalImageMeta>

    @Query("SELECT j.id as id, j.journalId as journalId, j.userId as userId, j.fileName as fileName, j.contentType as contentType, j.fileSize as fileSize, j.createdAt as createdAt FROM JournalImage j WHERE j.journalId IN :journalIds AND j.userId = :userId")
    fun findMetaByJournalIdInAndUserId(journalIds: List<Long>, userId: Long): List<JournalImageMeta>

    fun countByJournalId(journalId: Long): Int

    @Modifying
    fun deleteByJournalId(journalId: Long)
}
