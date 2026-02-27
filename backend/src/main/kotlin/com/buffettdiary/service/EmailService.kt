package com.buffettdiary.service

import org.slf4j.LoggerFactory
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.stereotype.Service

@Service
class EmailService(
    private val mailSender: JavaMailSender,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    fun sendVerificationCode(email: String, code: String) {
        try {
            val message = mailSender.createMimeMessage()
            val helper = MimeMessageHelper(message, true, "UTF-8")
            helper.setTo(email)
            helper.setSubject("[Buffett Diary] 이메일 인증 코드")
            helper.setText(
                """
                <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
                    <h2>이메일 인증</h2>
                    <p>아래 인증 코드를 입력해주세요.</p>
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background: #f4f4f4; border-radius: 8px;">
                        $code
                    </div>
                    <p style="color: #888; font-size: 14px; margin-top: 16px;">이 코드는 10분간 유효합니다.</p>
                </div>
                """.trimIndent(),
                true,
            )
            mailSender.send(message)
        } catch (e: Exception) {
            log.error("Failed to send verification email to {}: {}", email, e.message)
            throw IllegalStateException("이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.")
        }
    }
}
