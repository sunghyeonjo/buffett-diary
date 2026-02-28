package com.buffettdiary.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "users")
class User(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(unique = true, nullable = false)
    val email: String,

    @Column(nullable = true)
    var password: String? = null,

    @Column(length = 20, unique = true, nullable = false)
    var nickname: String,

    @Column(length = 20, nullable = false)
    val provider: String = "LOCAL",

    @Column(name = "provider_id")
    val providerId: String? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now(),
)
