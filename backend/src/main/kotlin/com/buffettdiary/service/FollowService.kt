package com.buffettdiary.service

import com.buffettdiary.dto.FollowStatusResponse
import com.buffettdiary.dto.FollowUserResponse
import com.buffettdiary.dto.PageResponse
import com.buffettdiary.entity.Follow
import com.buffettdiary.exception.BadRequestException
import com.buffettdiary.exception.ConflictException
import com.buffettdiary.exception.NotFoundException
import com.buffettdiary.repository.FollowRepository
import com.buffettdiary.repository.UserRepository
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class FollowService(
    private val followRepository: FollowRepository,
    private val userRepository: UserRepository,
) {
    @Transactional
    @CacheEvict(value = ["followCounts", "userProfile"], allEntries = true)
    fun follow(userId: Long, targetId: Long) {
        if (userId == targetId) throw BadRequestException("Cannot follow yourself")
        userRepository.findById(targetId).orElseThrow { NotFoundException("User not found") }
        if (followRepository.existsByFollowerIdAndFollowingId(userId, targetId)) {
            throw ConflictException("Already following")
        }
        followRepository.save(Follow(followerId = userId, followingId = targetId))
    }

    @Transactional
    @CacheEvict(value = ["followCounts", "userProfile"], allEntries = true)
    fun unfollow(userId: Long, targetId: Long) {
        followRepository.deleteByFollowerIdAndFollowingId(userId, targetId)
    }

    @Transactional(readOnly = true)
    fun isFollowing(userId: Long, targetId: Long): Boolean {
        return followRepository.existsByFollowerIdAndFollowingId(userId, targetId)
    }

    @Transactional(readOnly = true)
    fun status(userId: Long, targetId: Long): FollowStatusResponse {
        return FollowStatusResponse(isFollowing(userId, targetId))
    }

    @Transactional(readOnly = true)
    @Cacheable(value = ["followCounts"], key = "'follower-' + #userId")
    fun followerCount(userId: Long): Long = followRepository.countByFollowingId(userId)

    @Transactional(readOnly = true)
    @Cacheable(value = ["followCounts"], key = "'following-' + #userId")
    fun followingCount(userId: Long): Long = followRepository.countByFollowerId(userId)

    @Transactional(readOnly = true)
    fun followers(userId: Long, requestingUserId: Long, page: Int, size: Int): PageResponse<FollowUserResponse> {
        val result = followRepository.findByFollowingId(userId, PageRequest.of(page, size))
        val followerIds = result.content.map { it.followerId }
        val users = userRepository.findAllById(followerIds).associateBy { it.id }
        val followingSet = followRepository.findFollowingIds(requestingUserId).toSet()

        return PageResponse(
            content = result.content.mapNotNull { follow ->
                users[follow.followerId]?.let { user ->
                    FollowUserResponse(
                        id = user.id,
                        nickname = user.nickname,
                        bio = user.bio,
                        isFollowing = user.id in followingSet,
                    )
                }
            },
            totalElements = result.totalElements,
            totalPages = result.totalPages,
            page = page,
            size = size,
        )
    }

    @Transactional(readOnly = true)
    fun following(userId: Long, requestingUserId: Long, page: Int, size: Int): PageResponse<FollowUserResponse> {
        val result = followRepository.findByFollowerId(userId, PageRequest.of(page, size))
        val followingIds = result.content.map { it.followingId }
        val users = userRepository.findAllById(followingIds).associateBy { it.id }
        val myFollowingSet = followRepository.findFollowingIds(requestingUserId).toSet()

        return PageResponse(
            content = result.content.mapNotNull { follow ->
                users[follow.followingId]?.let { user ->
                    FollowUserResponse(
                        id = user.id,
                        nickname = user.nickname,
                        bio = user.bio,
                        isFollowing = user.id in myFollowingSet,
                    )
                }
            },
            totalElements = result.totalElements,
            totalPages = result.totalPages,
            page = page,
            size = size,
        )
    }

    @Transactional(readOnly = true)
    fun findFollowingIds(userId: Long): List<Long> = followRepository.findFollowingIds(userId)
}
