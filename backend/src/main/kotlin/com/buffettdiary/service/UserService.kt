package com.buffettdiary.service

import com.buffettdiary.dto.*
import com.buffettdiary.exception.ForbiddenException
import com.buffettdiary.exception.NotFoundException
import com.buffettdiary.repository.JournalRepository
import com.buffettdiary.repository.TradeRepository
import com.buffettdiary.repository.UserRepository
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.domain.PageRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class UserService(
    private val userRepository: UserRepository,
    private val followService: FollowService,
    private val journalService: JournalService,
    private val tradeService: TradeService,
    private val journalImageService: JournalImageService,
    private val tradeImageService: TradeImageService,
    private val journalRepository: JournalRepository,
    private val tradeRepository: TradeRepository,
) {
    @Transactional(readOnly = true)
    @Cacheable(value = ["userProfile"], key = "#requestingUserId + '-' + #targetUserId")
    fun getProfile(requestingUserId: Long, targetUserId: Long): UserProfileResponse {
        val user = userRepository.findById(targetUserId)
            .orElseThrow { NotFoundException("User not found") }
        val isOwn = requestingUserId == targetUserId

        return UserProfileResponse(
            id = user.id,
            nickname = user.nickname,
            bio = user.bio,
            createdAt = user.createdAt.toString(),
            followerCount = followService.followerCount(targetUserId),
            followingCount = followService.followingCount(targetUserId),
            isFollowing = if (isOwn) false else followService.isFollowing(requestingUserId, targetUserId),
            isOwnProfile = isOwn,
        )
    }

    @Transactional(readOnly = true)
    fun search(query: String, page: Int, size: Int): PageResponse<UserSearchResponse> {
        val result = userRepository.findByNicknameContainingIgnoreCase(query, PageRequest.of(page, size))
        return PageResponse(
            content = result.content.map { UserSearchResponse(it.id, it.nickname, it.bio) },
            totalElements = result.totalElements,
            totalPages = result.totalPages,
            page = page,
            size = size,
        )
    }

    @Transactional
    @CacheEvict(value = ["userProfile"], allEntries = true)
    fun updateProfile(userId: Long, request: UpdateProfileRequest) {
        val user = userRepository.findById(userId)
            .orElseThrow { NotFoundException("User not found") }
        user.bio = request.bio
        userRepository.save(user)
    }

    @Transactional(readOnly = true)
    fun getUserJournals(requestingUserId: Long, targetUserId: Long, page: Int, size: Int): PageResponse<JournalResponse> {
        requireFollowOrSelf(requestingUserId, targetUserId)
        return journalService.list(targetUserId, null, null, page, size)
    }

    @Transactional(readOnly = true)
    fun getUserTrades(requestingUserId: Long, targetUserId: Long, page: Int, size: Int): PageResponse<TradeResponse> {
        requireFollowOrSelf(requestingUserId, targetUserId)
        return tradeService.list(targetUserId, null, null, null, null, page, size)
    }

    fun requireFollowOrSelf(requestingUserId: Long, targetUserId: Long) {
        if (requestingUserId == targetUserId) return
        if (!followService.isFollowing(requestingUserId, targetUserId)) {
            throw ForbiddenException("Follow required to view this content")
        }
    }
}
