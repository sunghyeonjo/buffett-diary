package com.buffettdiary.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "email_verifications")
class EmailVerification(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    val email: String,

    @Column(length = 6, nullable = false)
    val code: String,

    @Column(name = "expires_at", nullable = false)
    val expiresAt: LocalDateTime,
)
