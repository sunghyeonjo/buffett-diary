package com.buffettdiary.dto

import java.io.Serializable

data class FollowResponse(
    val id: Long,
    val followerId: Long,
    val followingId: Long,
    val createdAt: String,
)

data class FollowUserResponse(
    val id: Long,
    val nickname: String,
    val bio: String?,
    val isFollowing: Boolean,
) : Serializable {
    companion object {
        private const val serialVersionUID = 1L
    }
}

data class FollowStatusResponse(
    val isFollowing: Boolean,
)
