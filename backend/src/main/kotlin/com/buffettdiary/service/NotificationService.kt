package com.buffettdiary.service

import com.buffettdiary.dto.NotificationResponse
import com.buffettdiary.dto.PageResponse
import com.buffettdiary.entity.Notification
import com.buffettdiary.enums.NotificationType
import com.buffettdiary.enums.ReferenceType
import com.buffettdiary.exception.ForbiddenException
import com.buffettdiary.exception.NotFoundException
import com.buffettdiary.repository.NotificationRepository
import com.buffettdiary.repository.NotificationSettingRepository
import com.buffettdiary.repository.UserRepository
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class NotificationService(
    private val notificationRepository: NotificationRepository,
    private val notificationSettingRepository: NotificationSettingRepository,
    private val userRepository: UserRepository,
) {
    companion object {
        private val MENTION_REGEX = Regex("@(\\S+)")
    }

    // ─── 알림 조회 ───

    @Transactional(readOnly = true)
    fun list(userId: Long, page: Int, size: Int): PageResponse<NotificationResponse> {
        val result = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
        val actorIds = result.content.map { it.actorId }.distinct()
        val actorMap = userRepository.findAllById(actorIds).associateBy { it.id }

        return PageResponse(
            content = result.content.map { n ->
                NotificationResponse(
                    id = n.id,
                    actorId = n.actorId,
                    actorNickname = actorMap[n.actorId]?.nickname ?: "알 수 없음",
                    notificationType = n.notificationType.name,
                    referenceType = n.referenceType.name,
                    referenceId = n.referenceId,
                    message = n.message,
                    isRead = n.isRead,
                    createdAt = n.createdAt.toString(),
                )
            },
            totalElements = result.totalElements,
            totalPages = result.totalPages,
            page = page,
            size = size,
        )
    }

    @Transactional(readOnly = true)
    fun unreadCount(userId: Long): Long {
        return notificationRepository.countByUserIdAndIsRead(userId, false)
    }

    @Transactional
    fun markAsRead(userId: Long, notificationId: Long) {
        val notification = notificationRepository.findById(notificationId)
            .orElseThrow { NotFoundException("Notification not found") }
        if (notification.userId != userId) throw ForbiddenException("Not authorized")
        notification.isRead = true
        notificationRepository.save(notification)
    }

    @Transactional
    fun markAllAsRead(userId: Long) {
        notificationRepository.markAllAsRead(userId)
    }

    // ─── 알림 생성 (내부 호출용) ───

    @Transactional
    fun notifyFollow(actorId: Long, targetUserId: Long) {
        if (actorId == targetUserId) return
        if (!isEnabled(targetUserId, NotificationType.FOLLOW)) return

        val actorName = nickname(actorId)
        save(
            userId = targetUserId,
            actorId = actorId,
            type = NotificationType.FOLLOW,
            refType = ReferenceType.USER,
            refId = actorId,
            message = "${actorName}님이 회원님을 팔로우했습니다",
        )
    }

    @Transactional
    fun notifyTradeComment(actorId: Long, tradeOwnerId: Long, tradeId: Long) {
        if (actorId == tradeOwnerId) return
        if (!isEnabled(tradeOwnerId, NotificationType.TRADE_COMMENT)) return

        val actorName = nickname(actorId)
        save(
            userId = tradeOwnerId,
            actorId = actorId,
            type = NotificationType.TRADE_COMMENT,
            refType = ReferenceType.TRADE,
            refId = tradeId,
            message = "${actorName}님이 회원님의 매매에 댓글을 남겼습니다",
        )
    }

    @Transactional
    fun notifyJournalComment(actorId: Long, journalOwnerId: Long, journalId: Long) {
        if (actorId == journalOwnerId) return
        if (!isEnabled(journalOwnerId, NotificationType.JOURNAL_COMMENT)) return

        val actorName = nickname(actorId)
        save(
            userId = journalOwnerId,
            actorId = actorId,
            type = NotificationType.JOURNAL_COMMENT,
            refType = ReferenceType.JOURNAL,
            refId = journalId,
            message = "${actorName}님이 회원님의 일지에 댓글을 남겼습니다",
        )
    }

    @Transactional
    fun notifyTradeLike(actorId: Long, tradeOwnerId: Long, tradeId: Long) {
        if (actorId == tradeOwnerId) return
        if (!isEnabled(tradeOwnerId, NotificationType.TRADE_LIKE)) return

        val actorName = nickname(actorId)
        save(
            userId = tradeOwnerId,
            actorId = actorId,
            type = NotificationType.TRADE_LIKE,
            refType = ReferenceType.TRADE,
            refId = tradeId,
            message = "${actorName}님이 회원님의 매매를 좋아합니다",
        )
    }

    @Transactional
    fun notifyJournalLike(actorId: Long, journalOwnerId: Long, journalId: Long) {
        if (actorId == journalOwnerId) return
        if (!isEnabled(journalOwnerId, NotificationType.JOURNAL_LIKE)) return

        val actorName = nickname(actorId)
        save(
            userId = journalOwnerId,
            actorId = actorId,
            type = NotificationType.JOURNAL_LIKE,
            refType = ReferenceType.JOURNAL,
            refId = journalId,
            message = "${actorName}님이 회원님의 일지를 좋아합니다",
        )
    }

    /**
     * 댓글 본문에서 @닉네임을 파싱하여 멘션 알림을 생성한다.
     * @return 멘션된 유저 닉네임 목록
     */
    @Transactional
    fun notifyMentions(
        actorId: Long,
        content: String,
        refType: ReferenceType,
        refId: Long,
    ): List<String> {
        val nicknames = parseMentions(content)
        if (nicknames.isEmpty()) return emptyList()

        val mentionedUsers = userRepository.findByNicknameIn(nicknames)
        val actorName = nickname(actorId)

        val contextLabel = when (refType) {
            ReferenceType.TRADE -> "매매"
            ReferenceType.JOURNAL -> "일지"
            else -> "글"
        }

        mentionedUsers.forEach { user ->
            if (user.id == actorId) return@forEach
            if (!isEnabled(user.id, NotificationType.MENTION)) return@forEach

            save(
                userId = user.id,
                actorId = actorId,
                type = NotificationType.MENTION,
                refType = refType,
                refId = refId,
                message = "${actorName}님이 ${contextLabel} 댓글에서 회원님을 멘션했습니다",
            )
        }
        return mentionedUsers.map { it.nickname }
    }

    fun parseMentions(content: String): List<String> {
        return MENTION_REGEX.findAll(content)
            .map { it.groupValues[1] }
            .distinct()
            .toList()
    }

    // ─── private helpers ───

    private fun isEnabled(userId: Long, type: NotificationType): Boolean {
        val setting = notificationSettingRepository.findByUserId(userId) ?: return true
        return when (type) {
            NotificationType.FOLLOW -> setting.followNotify
            NotificationType.TRADE_COMMENT, NotificationType.JOURNAL_COMMENT -> setting.commentNotify
            NotificationType.TRADE_LIKE, NotificationType.JOURNAL_LIKE -> setting.likeNotify
            NotificationType.MENTION -> setting.commentNotify // 멘션은 댓글 설정에 따름
        }
    }

    private fun nickname(userId: Long): String {
        return userRepository.findById(userId).orElse(null)?.nickname ?: "알 수 없음"
    }

    private fun save(
        userId: Long,
        actorId: Long,
        type: NotificationType,
        refType: ReferenceType,
        refId: Long,
        message: String,
    ) {
        notificationRepository.save(
            Notification(
                userId = userId,
                actorId = actorId,
                notificationType = type,
                referenceType = refType,
                referenceId = refId,
                message = message,
            )
        )
    }
}
