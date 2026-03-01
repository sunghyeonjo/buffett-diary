package com.buffettdiary.dto

data class FeedItem(
    val type: String,
    val journal: JournalResponse?,
    val trade: TradeResponse?,
    val author: AuthorSummary,
    val createdAt: String,
)
