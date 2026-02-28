package com.buffettdiary.service

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.client.RestTemplate

@Service
class EmailService(
    @Value("\${resend.api-key}") private val apiKey: String,
) {
    private val log = LoggerFactory.getLogger(javaClass)
    private val restTemplate = RestTemplate()

    fun sendVerificationCode(email: String, code: String) {
        try {
            val headers = HttpHeaders()
            headers.contentType = MediaType.APPLICATION_JSON
            headers.setBearerAuth(apiKey)

            val body = mapOf(
                "from" to "Buffett Diary <onboarding@resend.dev>",
                "to" to listOf(email),
                "subject" to "[Buffett Diary] 이메일 인증 코드",
                "html" to """
                    <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
                        <h2>이메일 인증</h2>
                        <p>아래 인증 코드를 입력해주세요.</p>
                        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background: #f4f4f4; border-radius: 8px;">
                            $code
                        </div>
                        <p style="color: #888; font-size: 14px; margin-top: 16px;">이 코드는 10분간 유효합니다.</p>
                    </div>
                """.trimIndent(),
            )

            restTemplate.postForEntity(
                "https://api.resend.com/emails",
                HttpEntity(body, headers),
                String::class.java,
            )
        } catch (e: Exception) {
            log.error("Failed to send verification email to {}: {}", email, e.message, e)
            throw IllegalStateException("이메일 발송 실패: ${e.message}")
        }
    }
}
