package com.buffettdiary.controller

import com.buffettdiary.dto.FeedItem
import com.buffettdiary.dto.PageResponse
import com.buffettdiary.service.FeedService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/feed")
class FeedController(
    private val feedService: FeedService,
) {
    private fun userId(auth: Authentication): Long = auth.principal as Long

    @GetMapping
    fun feed(
        auth: Authentication,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): ResponseEntity<PageResponse<FeedItem>> {
        return ResponseEntity.ok(feedService.feed(userId(auth), page, size))
    }
}
