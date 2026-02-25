package com.buffettdiary.entity

import jakarta.persistence.*

@Entity
@Table(name = "stocks")
class Stock(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(length = 10, nullable = false, unique = true)
    val ticker: String,

    @Column(name = "name_en", length = 100, nullable = false)
    val nameEn: String,

    @Column(name = "name_ko", length = 100)
    val nameKo: String? = null,

    @Column(name = "logo_url", length = 255)
    val logoUrl: String? = null,
)
