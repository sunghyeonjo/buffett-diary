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
)
