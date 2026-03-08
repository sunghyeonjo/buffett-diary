package com.buffettdiary.repository

import com.buffettdiary.entity.NotificationSetting
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying

interface NotificationSettingRepository : JpaRepository<NotificationSetting, Long> {
    fun findByUserId(userId: Long): NotificationSetting?

    @Modifying
    fun deleteByUserId(userId: Long)
}
