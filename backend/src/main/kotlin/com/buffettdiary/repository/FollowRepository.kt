package com.buffettdiary.repository

import com.buffettdiary.entity.Follow
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface FollowRepository : JpaRepository<Follow, Long> {
    fun existsByFollowerIdAndFollowingId(followerId: Long, followingId: Long): Boolean
    fun countByFollowingId(followingId: Long): Long
    fun countByFollowerId(followerId: Long): Long

    @Query("SELECT f.followingId FROM Follow f WHERE f.followerId = :followerId")
    fun findFollowingIds(followerId: Long): List<Long>

    fun findByFollowingId(followingId: Long, pageable: Pageable): Page<Follow>
    fun findByFollowerId(followerId: Long, pageable: Pageable): Page<Follow>

    @Modifying
    fun deleteByFollowerIdAndFollowingId(followerId: Long, followingId: Long)
}
