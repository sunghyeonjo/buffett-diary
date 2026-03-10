package com.buffettdiary.entity

import com.buffettdiary.enums.NotificationType
import com.buffettdiary.enums.ReferenceType
import jakarta.persistence.*

@Entity
@Table(
    name = "notifications",
    indexes = [
        Index(columnList = "user_id, is_read, created_at"),
        Index(columnList = "user_id, created_at"),
    ],
)
class Notification(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    /** 알림 수신자 */
    @Column(name = "user_id", nullable = false)
    val userId: Long,

    /** 알림을 유발한 유저 */
    @Column(name = "actor_id", nullable = false)
    val actorId: Long,

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", length = 30, nullable = false)
    val notificationType: NotificationType,

    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type", length = 20, nullable = false)
    val referenceType: ReferenceType,

    /** 참조 대상 ID (tradeId, journalId, userId 등) */
    @Column(name = "reference_id", nullable = false)
    val referenceId: Long,

    /** 알림 메시지 */
    @Column(length = 200, nullable = false)
    val message: String,

    @Column(name = "is_read", nullable = false)
    var isRead: Boolean = false,
) : AuditEntity()
