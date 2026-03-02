package com.buffettdiary.controller

import com.buffettdiary.dto.TradeCommentRequest
import com.buffettdiary.dto.TradeCommentResponse
import com.buffettdiary.service.TradeCommentService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/trades/{tradeId}/comments")
class TradeCommentController(
    private val tradeCommentService: TradeCommentService,
) {
    private fun userId(auth: Authentication): Long = auth.principal as Long

    @GetMapping
    fun list(auth: Authentication, @PathVariable tradeId: Long): ResponseEntity<List<TradeCommentResponse>> {
        return ResponseEntity.ok(tradeCommentService.getComments(tradeId, userId(auth)))
    }

    @PostMapping
    fun create(
        auth: Authentication,
        @PathVariable tradeId: Long,
        @Valid @RequestBody request: TradeCommentRequest,
    ): ResponseEntity<TradeCommentResponse> {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(tradeCommentService.createComment(tradeId, userId(auth), request))
    }

    @PostMapping("/{commentId}/replies")
    fun createReply(
        auth: Authentication,
        @PathVariable tradeId: Long,
        @PathVariable commentId: Long,
        @Valid @RequestBody request: TradeCommentRequest,
    ): ResponseEntity<TradeCommentResponse> {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(tradeCommentService.createReply(tradeId, commentId, userId(auth), request))
    }

    @PutMapping("/{commentId}")
    fun update(
        auth: Authentication,
        @PathVariable tradeId: Long,
        @PathVariable commentId: Long,
        @Valid @RequestBody request: TradeCommentRequest,
    ): ResponseEntity<TradeCommentResponse> {
        return ResponseEntity.ok(tradeCommentService.updateComment(commentId, userId(auth), request))
    }

    @DeleteMapping("/{commentId}")
    fun delete(
        auth: Authentication,
        @PathVariable tradeId: Long,
        @PathVariable commentId: Long,
    ): ResponseEntity<Void> {
        tradeCommentService.deleteComment(commentId, userId(auth))
        return ResponseEntity.noContent().build()
    }
}
