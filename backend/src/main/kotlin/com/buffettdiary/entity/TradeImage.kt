package com.buffettdiary.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "trade_images")
class TradeImage(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "trade_id", nullable = false)
    val tradeId: Long,

    @Column(name = "user_id", nullable = false)
    val userId: Long,

    @Column(name = "file_name", nullable = false)
    val fileName: String,

    @Column(name = "content_type", nullable = false, length = 50)
    val contentType: String,

    @Column(name = "file_size", nullable = false)
    val fileSize: Long,

    @Lob
    @Column(nullable = false, columnDefinition = "LONGBLOB")
    val data: ByteArray = ByteArray(0),

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
) {
    constructor(id: Long, tradeId: Long, userId: Long, fileName: String, contentType: String, fileSize: Long, createdAt: LocalDateTime)
        : this(id, tradeId, userId, fileName, contentType, fileSize, ByteArray(0), createdAt)
}
