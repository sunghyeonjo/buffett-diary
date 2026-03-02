package com.buffettdiary.service

import com.buffettdiary.dto.TradeCommentRequest
import com.buffettdiary.dto.TradeCommentResponse
import com.buffettdiary.entity.TradeComment
import com.buffettdiary.exception.BadRequestException
import com.buffettdiary.exception.ForbiddenException
import com.buffettdiary.exception.NotFoundException
import com.buffettdiary.repository.FollowRepository
import com.buffettdiary.repository.TradeCommentRepository
import com.buffettdiary.repository.TradeRepository
import com.buffettdiary.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class TradeCommentService(
    private val tradeCommentRepository: TradeCommentRepository,
    private val tradeRepository: TradeRepository,
    private val followRepository: FollowRepository,
    private val userRepository: UserRepository,
) {
    @Transactional(readOnly = true)
    fun getComments(tradeId: Long, requestingUserId: Long): List<TradeCommentResponse> {
        val trade = tradeRepository.findById(tradeId)
            .orElseThrow { NotFoundException("Trade not found") }
        checkAccess(requestingUserId, trade.userId)

        val comments = tradeCommentRepository.findByTradeIdOrderByCreatedAtAsc(tradeId)
        val userIds = comments.map { it.userId }.distinct()
        val nicknames = userRepository.findAllById(userIds).associate { it.id to it.nickname }

        return comments.map { it.toResponse(nicknames[it.userId] ?: "unknown") }
    }

    @Transactional
    fun createComment(tradeId: Long, userId: Long, request: TradeCommentRequest): TradeCommentResponse {
        val trade = tradeRepository.findById(tradeId)
            .orElseThrow { NotFoundException("Trade not found") }
        checkAccess(userId, trade.userId)

        val comment = tradeCommentRepository.save(
            TradeComment(tradeId = tradeId, userId = userId, content = request.content)
        )
        val nickname = userRepository.findById(userId).orElseThrow { NotFoundException("User not found") }.nickname
        return comment.toResponse(nickname)
    }

    @Transactional
    fun createReply(tradeId: Long, parentId: Long, userId: Long, request: TradeCommentRequest): TradeCommentResponse {
        val trade = tradeRepository.findById(tradeId)
            .orElseThrow { NotFoundException("Trade not found") }
        checkAccess(userId, trade.userId)

        val parent = tradeCommentRepository.findById(parentId)
            .orElseThrow { NotFoundException("Parent comment not found") }
        if (parent.tradeId != tradeId) throw BadRequestException("Parent comment does not belong to this trade")
        if (parent.parentId != null) throw BadRequestException("Cannot reply to a reply")

        val reply = tradeCommentRepository.save(
            TradeComment(tradeId = tradeId, userId = userId, parentId = parentId, content = request.content)
        )
        val nickname = userRepository.findById(userId).orElseThrow { NotFoundException("User not found") }.nickname
        return reply.toResponse(nickname)
    }

    @Transactional
    fun updateComment(commentId: Long, userId: Long, request: TradeCommentRequest): TradeCommentResponse {
        val comment = tradeCommentRepository.findById(commentId)
            .orElseThrow { NotFoundException("Comment not found") }
        if (comment.userId != userId) throw ForbiddenException("Not authorized")

        comment.content = request.content
        val updated = tradeCommentRepository.save(comment)
        val nickname = userRepository.findById(userId).orElseThrow { NotFoundException("User not found") }.nickname
        return updated.toResponse(nickname)
    }

    @Transactional
    fun deleteComment(commentId: Long, userId: Long) {
        val comment = tradeCommentRepository.findById(commentId)
            .orElseThrow { NotFoundException("Comment not found") }
        if (comment.userId != userId) throw ForbiddenException("Not authorized")
        tradeCommentRepository.delete(comment)
    }

    private fun checkAccess(requestingUserId: Long, tradeOwnerId: Long) {
        if (requestingUserId == tradeOwnerId) return
        if (!followRepository.existsByFollowerIdAndFollowingId(requestingUserId, tradeOwnerId)) {
            throw ForbiddenException("Follow the user to access comments")
        }
    }

    private fun TradeComment.toResponse(nickname: String) = TradeCommentResponse(
        id = id,
        tradeId = tradeId,
        userId = userId,
        nickname = nickname,
        parentId = parentId,
        content = content,
        createdAt = createdAt.toString(),
        updatedAt = updatedAt.toString(),
    )
}
