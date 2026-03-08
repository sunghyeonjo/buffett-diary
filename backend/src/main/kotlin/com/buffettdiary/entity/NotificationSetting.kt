package com.buffettdiary.entity

import jakarta.persistence.*

@Entity
@Table(name = "notification_settings")
class NotificationSetting(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "user_id", unique = true, nullable = false)
    val userId: Long,

    @Column(name = "follow_notify", nullable = false)
    var followNotify: Boolean = true,

    @Column(name = "comment_notify", nullable = false)
    var commentNotify: Boolean = true,

    @Column(name = "like_notify", nullable = false)
    var likeNotify: Boolean = true,
) : AuditEntity()
