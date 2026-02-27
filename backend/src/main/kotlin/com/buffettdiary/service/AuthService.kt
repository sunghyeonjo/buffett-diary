package com.buffettdiary.service

import com.buffettdiary.dto.*
import com.buffettdiary.entity.EmailVerification
import com.buffettdiary.entity.RefreshToken
import com.buffettdiary.entity.User
import com.buffettdiary.repository.EmailVerificationRepository
import com.buffettdiary.repository.RefreshTokenRepository
import com.buffettdiary.repository.UserRepository
import com.buffettdiary.security.JwtUtil
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import kotlin.random.Random

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val refreshTokenRepository: RefreshTokenRepository,
    private val emailVerificationRepository: EmailVerificationRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtUtil: JwtUtil,
    private val emailService: EmailService,
) {
    @Transactional
    fun register(request: RegisterRequest): RegisterResponse {
        if (userRepository.existsByEmail(request.email)) {
            throw IllegalArgumentException("Email already exists")
        }
        userRepository.save(
            User(
                email = request.email,
                password = passwordEncoder.encode(request.password),
                nickname = request.nickname,
            )
        )
        sendVerificationCode(request.email)
        return RegisterResponse(
            email = request.email,
            message = "인증 코드가 이메일로 발송되었습니다.",
        )
    }

    @Transactional
    fun verifyEmail(request: VerifyEmailRequest): AuthResponse {
        val verification = emailVerificationRepository.findByEmailAndCode(request.email, request.code)
            ?: throw IllegalArgumentException("잘못된 인증 코드입니다.")
        if (verification.expiresAt.isBefore(LocalDateTime.now())) {
            throw IllegalArgumentException("인증 코드가 만료되었습니다. 재발송해주세요.")
        }
        val user = userRepository.findByEmail(request.email)
            ?: throw IllegalArgumentException("User not found")
        user.emailVerified = true
        user.updatedAt = LocalDateTime.now()
        userRepository.save(user)
        emailVerificationRepository.deleteByEmail(request.email)
        return createAuthResponse(user)
    }

    @Transactional
    fun resendCode(request: ResendCodeRequest) {
        val user = userRepository.findByEmail(request.email)
            ?: throw IllegalArgumentException("User not found")
        if (user.emailVerified) {
            throw IllegalArgumentException("이미 인증된 이메일입니다.")
        }
        sendVerificationCode(request.email)
    }

    @Transactional
    fun login(request: LoginRequest): AuthResponse {
        val user = userRepository.findByEmail(request.email)
            ?: throw IllegalArgumentException("Invalid email or password")
        if (!passwordEncoder.matches(request.password, user.password)) {
            throw IllegalArgumentException("Invalid email or password")
        }
        if (!user.emailVerified) {
            throw IllegalArgumentException("이메일 인증이 필요합니다.")
        }
        return createAuthResponse(user)
    }

    @Transactional
    fun refresh(request: RefreshRequest): AuthResponse {
        val stored = refreshTokenRepository.findByToken(request.refreshToken)
            ?: throw IllegalArgumentException("Invalid refresh token")
        if (stored.expiresAt.isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(stored)
            throw IllegalArgumentException("Refresh token expired")
        }
        refreshTokenRepository.delete(stored)
        val user = userRepository.findById(stored.userId)
            .orElseThrow { IllegalArgumentException("User not found") }
        return createAuthResponse(user)
    }

    @Transactional
    fun logout(request: LogoutRequest) {
        refreshTokenRepository.deleteByToken(request.refreshToken)
    }

    private fun sendVerificationCode(email: String) {
        emailVerificationRepository.deleteByEmail(email)
        val code = String.format("%06d", Random.nextInt(1_000_000))
        emailVerificationRepository.save(
            EmailVerification(
                email = email,
                code = code,
                expiresAt = LocalDateTime.now().plusMinutes(10),
            )
        )
        emailService.sendVerificationCode(email, code)
    }

    private fun createAuthResponse(user: User): AuthResponse {
        val accessToken = jwtUtil.generateAccessToken(user.id, user.email)
        val refreshToken = jwtUtil.generateRefreshToken(user.id, user.email)
        refreshTokenRepository.save(
            RefreshToken(
                userId = user.id,
                token = refreshToken,
                expiresAt = LocalDateTime.now().plusSeconds(jwtUtil.getRefreshExpirationMs() / 1000),
            )
        )
        return AuthResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            user = UserResponse(
                id = user.id,
                email = user.email,
                nickname = user.nickname,
                createdAt = user.createdAt.toString(),
            ),
        )
    }
}
