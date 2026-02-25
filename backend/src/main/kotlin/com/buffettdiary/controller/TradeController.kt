package com.buffettdiary.controller

import com.buffettdiary.dto.*
import com.buffettdiary.service.TradeImageService
import com.buffettdiary.service.TradeService
import jakarta.validation.Valid
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/v1/trades")
class TradeController(
    private val tradeService: TradeService,
    private val tradeImageService: TradeImageService,
) {
    private fun userId(auth: Authentication): Long = auth.principal as Long

    @GetMapping
    fun list(
        auth: Authentication,
        @RequestParam(required = false) startDate: String?,
        @RequestParam(required = false) endDate: String?,
        @RequestParam(required = false) ticker: String?,
        @RequestParam(required = false) position: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): ResponseEntity<PageResponse<TradeResponse>> {
        return ResponseEntity.ok(tradeService.list(userId(auth), startDate, endDate, ticker, position, page, size))
    }

    @GetMapping("/{id}")
    fun get(auth: Authentication, @PathVariable id: Long): ResponseEntity<TradeResponse> {
        return ResponseEntity.ok(tradeService.get(userId(auth), id))
    }

    @PostMapping
    fun create(auth: Authentication, @Valid @RequestBody request: TradeRequest): ResponseEntity<TradeResponse> {
        return ResponseEntity.status(HttpStatus.CREATED).body(tradeService.create(userId(auth), request))
    }

    @PutMapping("/{id}")
    fun update(auth: Authentication, @PathVariable id: Long, @Valid @RequestBody request: TradeRequest): ResponseEntity<TradeResponse> {
        return ResponseEntity.ok(tradeService.update(userId(auth), id, request))
    }

    @DeleteMapping("/{id}")
    fun delete(auth: Authentication, @PathVariable id: Long): ResponseEntity<Void> {
        tradeService.delete(userId(auth), id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/stats")
    fun stats(auth: Authentication, @RequestParam(defaultValue = "all") period: String): ResponseEntity<TradeStatsResponse> {
        return ResponseEntity.ok(tradeService.stats(userId(auth), period))
    }

    // --- Image endpoints ---

    @PostMapping("/{tradeId}/images", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun uploadImage(
        auth: Authentication,
        @PathVariable tradeId: Long,
        @RequestParam("file") file: MultipartFile,
    ): ResponseEntity<TradeImageResponse> {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(tradeImageService.upload(userId(auth), tradeId, file))
    }

    @GetMapping("/{tradeId}/images/{imageId}")
    fun getImage(
        auth: Authentication,
        @PathVariable tradeId: Long,
        @PathVariable imageId: Long,
    ): ResponseEntity<ByteArray> {
        val image = tradeImageService.getData(userId(auth), tradeId, imageId)
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_TYPE, image.contentType)
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"${image.fileName}\"")
            .body(image.data)
    }

    @DeleteMapping("/{tradeId}/images/{imageId}")
    fun deleteImage(
        auth: Authentication,
        @PathVariable tradeId: Long,
        @PathVariable imageId: Long,
    ): ResponseEntity<Void> {
        tradeImageService.delete(userId(auth), tradeId, imageId)
        return ResponseEntity.noContent().build()
    }
}
