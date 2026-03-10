package com.buffettdiary.repository

import com.buffettdiary.entity.UserBadge
import com.buffettdiary.enums.BadgeType
import org.springframework.data.jpa.repository.JpaRepository

interface UserBadgeRepository : JpaRepository<UserBadge, Long> {
    fun findByUserId(userId: Long): List<UserBadge>
    fun existsByUserIdAndBadgeType(userId: Long, badgeType: BadgeType): Boolean
}
