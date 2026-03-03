package com.buffettdiary.controller

import com.buffettdiary.dto.JournalCommentRequest
import com.buffettdiary.dto.JournalCommentResponse
import com.buffettdiary.service.JournalCommentService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/journals/{journalId}/comments")
class JournalCommentController(
    private val journalCommentService: JournalCommentService,
) {
    private fun userId(auth: Authentication): Long = auth.principal as Long

    @GetMapping
    fun list(auth: Authentication, @PathVariable journalId: Long): ResponseEntity<List<JournalCommentResponse>> {
        return ResponseEntity.ok(journalCommentService.getComments(journalId, userId(auth)))
    }

    @PostMapping
    fun create(
        auth: Authentication,
        @PathVariable journalId: Long,
        @Valid @RequestBody request: JournalCommentRequest,
    ): ResponseEntity<JournalCommentResponse> {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(journalCommentService.createComment(journalId, userId(auth), request))
    }

    @PostMapping("/{commentId}/replies")
    fun createReply(
        auth: Authentication,
        @PathVariable journalId: Long,
        @PathVariable commentId: Long,
        @Valid @RequestBody request: JournalCommentRequest,
    ): ResponseEntity<JournalCommentResponse> {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(journalCommentService.createReply(journalId, commentId, userId(auth), request))
    }

    @PutMapping("/{commentId}")
    fun update(
        auth: Authentication,
        @PathVariable journalId: Long,
        @PathVariable commentId: Long,
        @Valid @RequestBody request: JournalCommentRequest,
    ): ResponseEntity<JournalCommentResponse> {
        return ResponseEntity.ok(journalCommentService.updateComment(commentId, userId(auth), request))
    }

    @DeleteMapping("/{commentId}")
    fun delete(
        auth: Authentication,
        @PathVariable journalId: Long,
        @PathVariable commentId: Long,
    ): ResponseEntity<Void> {
        journalCommentService.deleteComment(commentId, userId(auth))
        return ResponseEntity.noContent().build()
    }
}
