package com.buffettdiary.repository

import com.buffettdiary.entity.Tag
import org.springframework.data.jpa.repository.JpaRepository

interface TagRepository : JpaRepository<Tag, Long> {
    fun findByUserIdAndNameIn(userId: Long, names: List<String>): List<Tag>
    fun findByUserId(userId: Long): List<Tag>
}
