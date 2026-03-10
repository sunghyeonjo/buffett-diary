package com.buffettdiary.dto

import java.io.Serializable

data class NotificationResponse(
    val id: Long,
    val actorId: Long,
    val actorNickname: String,
    val notificationType: String,
    val referenceType: String,
    val referenceId: Long,
    val message: String,
    val isRead: Boolean,
    val createdAt: String,
) : Serializable {
    companion object {
        private const val serialVersionUID = 1L
    }
}

data class UnreadCountResponse(
    val count: Long,
)
