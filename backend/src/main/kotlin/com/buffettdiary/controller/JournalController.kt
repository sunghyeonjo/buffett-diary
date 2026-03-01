package com.buffettdiary.controller

import com.buffettdiary.dto.*
import com.buffettdiary.service.JournalImageService
import com.buffettdiary.service.JournalService
import jakarta.validation.Valid
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/v1/journals")
class JournalController(
    private val journalService: JournalService,
    private val journalImageService: JournalImageService,
) {
    private fun userId(auth: Authentication): Long = auth.principal as Long

    @GetMapping
    fun list(
        auth: Authentication,
        @RequestParam(required = false) startDate: String?,
        @RequestParam(required = false) endDate: String?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): ResponseEntity<PageResponse<JournalResponse>> {
        return ResponseEntity.ok(journalService.list(userId(auth), startDate, endDate, page, size))
    }

    @GetMapping("/{id}")
    fun get(auth: Authentication, @PathVariable id: Long): ResponseEntity<JournalResponse> {
        return ResponseEntity.ok(journalService.get(userId(auth), id))
    }

    @PostMapping
    fun create(auth: Authentication, @Valid @RequestBody request: JournalRequest): ResponseEntity<JournalResponse> {
        return ResponseEntity.status(HttpStatus.CREATED).body(journalService.create(userId(auth), request))
    }

    @PutMapping("/{id}")
    fun update(auth: Authentication, @PathVariable id: Long, @Valid @RequestBody request: JournalRequest): ResponseEntity<JournalResponse> {
        return ResponseEntity.ok(journalService.update(userId(auth), id, request))
    }

    @DeleteMapping("/{id}")
    fun delete(auth: Authentication, @PathVariable id: Long): ResponseEntity<Void> {
        journalService.delete(userId(auth), id)
        return ResponseEntity.noContent().build()
    }

    // --- Image endpoints ---

    @PostMapping("/{journalId}/images", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun uploadImage(
        auth: Authentication,
        @PathVariable journalId: Long,
        @RequestParam("file") file: MultipartFile,
    ): ResponseEntity<JournalImageResponse> {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(journalImageService.upload(userId(auth), journalId, file))
    }

    @GetMapping("/{journalId}/images/{imageId}")
    fun getImage(
        auth: Authentication,
        @PathVariable journalId: Long,
        @PathVariable imageId: Long,
    ): ResponseEntity<ByteArray> {
        val image = journalImageService.getData(userId(auth), journalId, imageId)
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_TYPE, image.contentType)
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"${image.fileName}\"")
            .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400, immutable")
            .body(image.data)
    }

    @DeleteMapping("/{journalId}/images/{imageId}")
    fun deleteImage(
        auth: Authentication,
        @PathVariable journalId: Long,
        @PathVariable imageId: Long,
    ): ResponseEntity<Void> {
        journalImageService.delete(userId(auth), journalId, imageId)
        return ResponseEntity.noContent().build()
    }
}
