package com.buffettdiary.service

import com.buffettdiary.dto.*
import com.buffettdiary.entity.RefreshToken
import com.buffettdiary.entity.User
import com.buffettdiary.repository.RefreshTokenRepository
import com.buffettdiary.repository.UserRepository
import com.buffettdiary.security.JwtUtil
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val refreshTokenRepository: RefreshTokenRepository,
    private val jwtUtil: JwtUtil,
) {
    @Transactional
    fun findOrCreateOAuthUser(email: String, nickname: String, provider: String, providerId: String): AuthResponse {
        val user = userRepository.findByEmail(email)
            ?: userRepository.save(
                User(
                    email = email,
                    nickname = nickname,
                    provider = provider,
                    providerId = providerId,
                )
            )
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
