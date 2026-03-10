package com.buffettdiary.controller

import com.buffettdiary.dto.NotificationResponse
import com.buffettdiary.dto.PageResponse
import com.buffettdiary.dto.UnreadCountResponse
import com.buffettdiary.service.NotificationService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/notifications")
class NotificationController(
    private val notificationService: NotificationService,
) {
    private fun userId(auth: Authentication): Long = auth.principal as Long

    @GetMapping
    fun list(
        auth: Authentication,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): ResponseEntity<PageResponse<NotificationResponse>> {
        return ResponseEntity.ok(notificationService.list(userId(auth), page, size))
    }

    @GetMapping("/unread-count")
    fun unreadCount(auth: Authentication): ResponseEntity<UnreadCountResponse> {
        return ResponseEntity.ok(UnreadCountResponse(notificationService.unreadCount(userId(auth))))
    }

    @PutMapping("/{id}/read")
    fun markAsRead(auth: Authentication, @PathVariable id: Long): ResponseEntity<Void> {
        notificationService.markAsRead(userId(auth), id)
        return ResponseEntity.ok().build()
    }

    @PutMapping("/read-all")
    fun markAllAsRead(auth: Authentication): ResponseEntity<Void> {
        notificationService.markAllAsRead(userId(auth))
        return ResponseEntity.ok().build()
    }
}
