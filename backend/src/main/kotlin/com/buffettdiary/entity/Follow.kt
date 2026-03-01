package com.buffettdiary.entity

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "follows",
    uniqueConstraints = [UniqueConstraint(columnNames = ["follower_id", "following_id"])],
    indexes = [
        Index(columnList = "follower_id"),
        Index(columnList = "following_id"),
    ],
)
class Follow(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "follower_id", nullable = false)
    val followerId: Long,

    @Column(name = "following_id", nullable = false)
    val followingId: Long,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
)
