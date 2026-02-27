package com.buffettdiary.repository

import com.buffettdiary.entity.EmailVerification
import org.springframework.data.jpa.repository.JpaRepository

interface EmailVerificationRepository : JpaRepository<EmailVerification, Long> {
    fun findByEmailAndCode(email: String, code: String): EmailVerification?
    fun deleteByEmail(email: String)
}
