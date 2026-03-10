package com.buffettdiary.entity

import com.buffettdiary.enums.BadgeType
import jakarta.persistence.*

@Entity
@Table(
    name = "user_badges",
    uniqueConstraints = [UniqueConstraint(columnNames = ["user_id", "badge_type"])],
)
class UserBadge(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "user_id", nullable = false)
    val userId: Long,

    @Enumerated(EnumType.STRING)
    @Column(name = "badge_type", length = 30, nullable = false)
    val badgeType: BadgeType,
) : AuditEntity()
