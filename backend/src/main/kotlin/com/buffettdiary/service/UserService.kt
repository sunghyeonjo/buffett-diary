package com.buffettdiary.service

import com.buffettdiary.dto.*
import com.buffettdiary.entity.NotificationSetting
import com.buffettdiary.exception.ConflictException
import com.buffettdiary.exception.ForbiddenException
import com.buffettdiary.exception.NotFoundException
import com.buffettdiary.repository.*
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
    private val followRepository: FollowRepository,
    private val tradeCommentRepository: TradeCommentRepository,
    private val journalCommentRepository: JournalCommentRepository,
    private val tradeRatingRepository: TradeRatingRepository,
    private val journalRatingRepository: JournalRatingRepository,
    private val refreshTokenRepository: RefreshTokenRepository,
    private val notificationSettingRepository: NotificationSettingRepository,
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
        if (request.nickname != null && request.nickname != user.nickname) {
            if (userRepository.existsByNickname(request.nickname)) {
                throw ConflictException("이미 사용 중인 닉네임입니다")
            }
            user.nickname = request.nickname
        }
        user.bio = request.bio
        userRepository.save(user)
    }

    @Transactional
    @CacheEvict(value = ["userProfile", "trades", "tradeDetail", "tradeStats", "journals", "journalDetail", "followCounts"], allEntries = true)
    fun deleteAccount(userId: Long) {
        val user = userRepository.findById(userId)
            .orElseThrow { NotFoundException("User not found") }

        // Delete user's own trades and journals (handles images/comments/ratings per entity)
        val trades = tradeRepository.findByUserId(userId)
        trades.forEach { tradeService.delete(userId, it.id) }
        val journals = journalRepository.findByUserIdOrderByJournalDateDescCreatedAtDesc(userId, PageRequest.of(0, Int.MAX_VALUE))
        journals.content.forEach { journalService.delete(userId, it.id) }

        // Delete comments/ratings left on other users' content
        tradeCommentRepository.deleteByUserId(userId)
        journalCommentRepository.deleteByUserId(userId)
        tradeRatingRepository.deleteByUserId(userId)
        journalRatingRepository.deleteByUserId(userId)

        // Delete follow relationships
        followRepository.deleteByFollowerIdOrFollowingId(userId, userId)

        // Delete notification settings
        notificationSettingRepository.deleteByUserId(userId)

        // Delete refresh tokens
        refreshTokenRepository.deleteByUserId(userId)

        // Delete user
        userRepository.delete(user)
    }

    @Transactional(readOnly = true)
    fun getNotificationSettings(userId: Long): NotificationSettingResponse {
        val setting = notificationSettingRepository.findByUserId(userId)
            ?: return NotificationSettingResponse(followNotify = true, commentNotify = true, likeNotify = true)
        return NotificationSettingResponse(
            followNotify = setting.followNotify,
            commentNotify = setting.commentNotify,
            likeNotify = setting.likeNotify,
        )
    }

    @Transactional
    fun updateNotificationSettings(userId: Long, request: UpdateNotificationSettingRequest): NotificationSettingResponse {
        val setting = notificationSettingRepository.findByUserId(userId)
            ?: NotificationSetting(userId = userId)
        request.followNotify?.let { setting.followNotify = it }
        request.commentNotify?.let { setting.commentNotify = it }
        request.likeNotify?.let { setting.likeNotify = it }
        notificationSettingRepository.save(setting)
        return NotificationSettingResponse(
            followNotify = setting.followNotify,
            commentNotify = setting.commentNotify,
            likeNotify = setting.likeNotify,
        )
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
