package com.buffettdiary.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.io.Serializable
import java.time.LocalDate

data class JournalRequest(
    @field:NotBlank @field:Size(max = 100) val title: String,
    @field:NotBlank val content: String,
    @field:NotNull val journalDate: LocalDate,
)

data class JournalResponse(
    val id: Long,
    val userId: Long,
    val title: String,
    val content: String,
    val journalDate: String,
    val createdAt: String,
    val updatedAt: String,
    val images: List<JournalImageResponse> = emptyList(),
    val author: AuthorSummary? = null,
    val likeCount: Long = 0,
    val dislikeCount: Long = 0,
    val myLike: Boolean? = null,
    val commentCount: Long = 0,
) : Serializable {
    companion object {
        private const val serialVersionUID = 2L
    }
}

data class JournalImageResponse(
    val id: Long,
    val journalId: Long,
    val fileName: String,
    val contentType: String,
    val fileSize: Long,
    val createdAt: String,
) : Serializable {
    companion object {
        private const val serialVersionUID = 1L
    }
}

data class JournalImageDataResponse(
    val fileName: String,
    val contentType: String,
    val data: ByteArray,
)

data class AuthorSummary(
    val id: Long,
    val nickname: String,
) : Serializable {
    companion object {
        private const val serialVersionUID = 1L
    }
}

data class JournalCommentRequest(
    @field:Size(max = 1000) val content: String,
)

data class JournalLikeRequest(
    val liked: Boolean? = null,
)

data class JournalCommentResponse(
    val id: Long,
    val journalId: Long,
    val userId: Long,
    val nickname: String,
    val parentId: Long?,
    val content: String,
    val createdAt: String,
    val updatedAt: String,
)
