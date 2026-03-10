package com.buffettdiary.entity

import jakarta.persistence.*

@Entity
@Table(
    name = "tags",
    uniqueConstraints = [UniqueConstraint(columnNames = ["user_id", "name"])],
)
class Tag(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "user_id", nullable = false)
    val userId: Long,

    @Column(length = 30, nullable = false)
    val name: String,
) : AuditEntity()
