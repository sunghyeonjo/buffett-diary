package com.buffettdiary.dto

import com.buffettdiary.enums.Position
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size
import java.io.Serializable
import java.math.BigDecimal
import java.time.LocalDate

data class TradeRequest(
    @field:NotNull val tradeDate: LocalDate,
    @field:Size(max = 10) val ticker: String,
    @field:NotNull val position: Position, // BUY or SELL
    @field:NotNull @field:Positive val quantity: BigDecimal,
    @field:NotNull @field:Positive val entryPrice: BigDecimal,
    val exitPrice: BigDecimal? = null,
    val profit: BigDecimal? = null,
    val reason: String? = null,
)

data class TradeResponse(
    val id: Long,
    val userId: Long,
    val tradeDate: String,
    val ticker: String,
    val position: Position,
    val quantity: BigDecimal,
    val entryPrice: BigDecimal,
    val exitPrice: BigDecimal?,
    val profit: BigDecimal?,
    val reason: String?,
    val likeCount: Long,
    val dislikeCount: Long,
    val myLike: Boolean?,
    val commentCount: Long,
    val createdAt: String,
    val updatedAt: String,
    val stockInfo: StockSummary? = null,
    val images: List<TradeImageResponse> = emptyList(),
) : Serializable {
    companion object {
        private const val serialVersionUID = 1L
    }
}

data class TradeImageResponse(
    val id: Long,
    val tradeId: Long,
    val fileName: String,
    val contentType: String,
    val fileSize: Long,
    val createdAt: String,
) : Serializable {
    companion object {
        private const val serialVersionUID = 1L
    }
}

data class PageResponse<T>(
    val content: List<T>,
    val totalElements: Long,
    val totalPages: Int,
    val page: Int,
    val size: Int,
) : Serializable {
    companion object {
        private const val serialVersionUID = 1L
    }
}

class TradeImageDataResponse(
    val fileName: String,
    val contentType: String,
    val data: ByteArray,
)

data class TradeCommentRequest(
    @field:Size(max = 1000) val content: String,
)

data class TradeLikeRequest(
    val liked: Boolean? = null,
)

data class TradeCommentResponse(
    val id: Long,
    val tradeId: Long,
    val userId: Long,
    val nickname: String,
    val parentId: Long?,
    val content: String,
    val createdAt: String,
    val updatedAt: String,
)

data class TradeStatsResponse(
    val totalTrades: Int,
    val buyCount: Int,
    val sellCount: Int,
    val winCount: Int,
    val lossCount: Int,
    val winRate: Double,
    val totalProfit: BigDecimal,
    val averageProfit: BigDecimal,
    val bestTrade: BigDecimal,
    val worstTrade: BigDecimal,
) : Serializable {
    companion object {
        private const val serialVersionUID = 1L
    }
}

data class StockResponse(
    val ticker: String,
    val nameEn: String,
    val nameKo: String?,
    val logoUrl: String?,
    val sector: String?,
    val exchange: String?,
) : Serializable {
    companion object {
        private const val serialVersionUID = 1L
    }
}

data class StockSummary(
    val nameKo: String?,
    val logoUrl: String?,
) : Serializable {
    companion object {
        private const val serialVersionUID = 1L
    }
}
