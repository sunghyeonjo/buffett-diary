package com.buffettdiary.controller

import com.buffettdiary.dto.*
import com.buffettdiary.service.BadgeService
import com.buffettdiary.service.UserService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/users")
class UserController(
    private val userService: UserService,
    private val badgeService: BadgeService,
) {
    private fun userId(auth: Authentication): Long = auth.principal as Long

    @GetMapping("/search")
    fun search(
        auth: Authentication,
        @RequestParam q: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): ResponseEntity<PageResponse<UserSearchResponse>> {
        return ResponseEntity.ok(userService.search(q, page, size))
    }

    @GetMapping("/{targetId}/profile")
    fun profile(auth: Authentication, @PathVariable targetId: Long): ResponseEntity<UserProfileResponse> {
        return ResponseEntity.ok(userService.getProfile(userId(auth), targetId))
    }

    @PutMapping("/me/profile")
    fun updateProfile(auth: Authentication, @Valid @RequestBody request: UpdateProfileRequest): ResponseEntity<Void> {
        userService.updateProfile(userId(auth), request)
        return ResponseEntity.ok().build()
    }

    @DeleteMapping("/me")
    fun deleteAccount(auth: Authentication): ResponseEntity<Void> {
        userService.deleteAccount(userId(auth))
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/me/notification-settings")
    fun getNotificationSettings(auth: Authentication): ResponseEntity<NotificationSettingResponse> {
        return ResponseEntity.ok(userService.getNotificationSettings(userId(auth)))
    }

    @PutMapping("/me/notification-settings")
    fun updateNotificationSettings(
        auth: Authentication,
        @RequestBody request: UpdateNotificationSettingRequest,
    ): ResponseEntity<NotificationSettingResponse> {
        return ResponseEntity.ok(userService.updateNotificationSettings(userId(auth), request))
    }

    @GetMapping("/me/badges")
    fun myBadges(auth: Authentication): ResponseEntity<List<BadgeResponse>> {
        return ResponseEntity.ok(badgeService.getUserBadges(userId(auth)))
    }

    @GetMapping("/{targetId}/journals")
    fun userJournals(
        auth: Authentication,
        @PathVariable targetId: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): ResponseEntity<PageResponse<JournalResponse>> {
        return ResponseEntity.ok(userService.getUserJournals(userId(auth), targetId, page, size))
    }

    @GetMapping("/{targetId}/trades")
    fun userTrades(
        auth: Authentication,
        @PathVariable targetId: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): ResponseEntity<PageResponse<TradeResponse>> {
        return ResponseEntity.ok(userService.getUserTrades(userId(auth), targetId, page, size))
    }
}
