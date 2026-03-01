package com.buffettdiary.controller

import com.buffettdiary.dto.FollowStatusResponse
import com.buffettdiary.dto.FollowUserResponse
import com.buffettdiary.dto.PageResponse
import com.buffettdiary.service.FollowService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/follows")
class FollowController(
    private val followService: FollowService,
) {
    private fun userId(auth: Authentication): Long = auth.principal as Long

    @PostMapping("/{targetId}")
    fun follow(auth: Authentication, @PathVariable targetId: Long): ResponseEntity<Void> {
        followService.follow(userId(auth), targetId)
        return ResponseEntity.status(HttpStatus.CREATED).build()
    }

    @DeleteMapping("/{targetId}")
    fun unfollow(auth: Authentication, @PathVariable targetId: Long): ResponseEntity<Void> {
        followService.unfollow(userId(auth), targetId)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/{targetId}/followers")
    fun followers(
        auth: Authentication,
        @PathVariable targetId: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): ResponseEntity<PageResponse<FollowUserResponse>> {
        return ResponseEntity.ok(followService.followers(targetId, userId(auth), page, size))
    }

    @GetMapping("/{targetId}/following")
    fun following(
        auth: Authentication,
        @PathVariable targetId: Long,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): ResponseEntity<PageResponse<FollowUserResponse>> {
        return ResponseEntity.ok(followService.following(targetId, userId(auth), page, size))
    }

    @GetMapping("/{targetId}/status")
    fun status(auth: Authentication, @PathVariable targetId: Long): ResponseEntity<FollowStatusResponse> {
        return ResponseEntity.ok(followService.status(userId(auth), targetId))
    }
}
