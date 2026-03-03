package com.buffettdiary.service

import com.buffettdiary.dto.JournalCommentRequest
import com.buffettdiary.dto.JournalCommentResponse
import com.buffettdiary.entity.JournalComment
import com.buffettdiary.exception.BadRequestException
import com.buffettdiary.exception.ForbiddenException
import com.buffettdiary.exception.NotFoundException
import com.buffettdiary.repository.FollowRepository
import com.buffettdiary.repository.JournalCommentRepository
import com.buffettdiary.repository.JournalRepository
import com.buffettdiary.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class JournalCommentService(
    private val journalCommentRepository: JournalCommentRepository,
    private val journalRepository: JournalRepository,
    private val followRepository: FollowRepository,
    private val userRepository: UserRepository,
) {
    @Transactional(readOnly = true)
    fun getComments(journalId: Long, requestingUserId: Long): List<JournalCommentResponse> {
        val journal = journalRepository.findById(journalId)
            .orElseThrow { NotFoundException("Journal not found") }
        checkAccess(requestingUserId, journal.userId)

        val comments = journalCommentRepository.findByJournalIdOrderByCreatedAtAsc(journalId)
        val userIds = comments.map { it.userId }.distinct()
        val nicknames = userRepository.findAllById(userIds).associate { it.id to it.nickname }

        return comments.map { it.toResponse(nicknames[it.userId] ?: "unknown") }
    }

    @Transactional
    fun createComment(journalId: Long, userId: Long, request: JournalCommentRequest): JournalCommentResponse {
        val journal = journalRepository.findById(journalId)
            .orElseThrow { NotFoundException("Journal not found") }
        checkAccess(userId, journal.userId)

        val comment = journalCommentRepository.save(
            JournalComment(journalId = journalId, userId = userId, content = request.content)
        )
        val nickname = userRepository.findById(userId).orElseThrow { NotFoundException("User not found") }.nickname
        return comment.toResponse(nickname)
    }

    @Transactional
    fun createReply(journalId: Long, parentId: Long, userId: Long, request: JournalCommentRequest): JournalCommentResponse {
        val journal = journalRepository.findById(journalId)
            .orElseThrow { NotFoundException("Journal not found") }
        checkAccess(userId, journal.userId)

        val parent = journalCommentRepository.findById(parentId)
            .orElseThrow { NotFoundException("Parent comment not found") }
        if (parent.journalId != journalId) throw BadRequestException("Parent comment does not belong to this journal")
        if (parent.parentId != null) throw BadRequestException("Cannot reply to a reply")

        val reply = journalCommentRepository.save(
            JournalComment(journalId = journalId, userId = userId, parentId = parentId, content = request.content)
        )
        val nickname = userRepository.findById(userId).orElseThrow { NotFoundException("User not found") }.nickname
        return reply.toResponse(nickname)
    }

    @Transactional
    fun updateComment(commentId: Long, userId: Long, request: JournalCommentRequest): JournalCommentResponse {
        val comment = journalCommentRepository.findById(commentId)
            .orElseThrow { NotFoundException("Comment not found") }
        if (comment.userId != userId) throw ForbiddenException("Not authorized")

        comment.content = request.content
        val updated = journalCommentRepository.save(comment)
        val nickname = userRepository.findById(userId).orElseThrow { NotFoundException("User not found") }.nickname
        return updated.toResponse(nickname)
    }

    @Transactional
    fun deleteComment(commentId: Long, userId: Long) {
        val comment = journalCommentRepository.findById(commentId)
            .orElseThrow { NotFoundException("Comment not found") }
        if (comment.userId != userId) throw ForbiddenException("Not authorized")
        journalCommentRepository.delete(comment)
    }

    private fun checkAccess(requestingUserId: Long, journalOwnerId: Long) {
        if (requestingUserId == journalOwnerId) return
        if (!followRepository.existsByFollowerIdAndFollowingId(requestingUserId, journalOwnerId)) {
            throw ForbiddenException("Follow the user to access comments")
        }
    }

    private fun JournalComment.toResponse(nickname: String) = JournalCommentResponse(
        id = id,
        journalId = journalId,
        userId = userId,
        nickname = nickname,
        parentId = parentId,
        content = content,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
    )
}
