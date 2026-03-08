package com.buffettdiary.dto

import jakarta.validation.constraints.Size
import java.io.Serializable

data class UserProfileResponse(
    val id: Long,
    val nickname: String,
    val bio: String?,
    val createdAt: String,
    val followerCount: Long,
    val followingCount: Long,
    val isFollowing: Boolean,
    val isOwnProfile: Boolean,
) : Serializable {
    companion object {
        private const val serialVersionUID = 1L
    }
}

data class UserSearchResponse(
    val id: Long,
    val nickname: String,
    val bio: String?,
)

data class UpdateProfileRequest(
    @field:Size(max = 200) val bio: String? = null,
    @field:Size(min = 2, max = 20) val nickname: String? = null,
)

data class NotificationSettingResponse(
    val followNotify: Boolean,
    val commentNotify: Boolean,
    val likeNotify: Boolean,
)

data class UpdateNotificationSettingRequest(
    val followNotify: Boolean? = null,
    val commentNotify: Boolean? = null,
    val likeNotify: Boolean? = null,
)
