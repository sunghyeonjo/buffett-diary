package com.buffettdiary.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class RefreshRequest(
    @field:NotBlank val refreshToken: String,
)

data class LogoutRequest(
    @field:NotBlank val refreshToken: String,
)

data class LoginRequest(
    @field:NotBlank @field:Email val email: String,
    @field:NotBlank val password: String,
)

data class RegisterRequest(
    @field:NotBlank @field:Email val email: String,
    @field:NotBlank @field:Size(min = 8) val password: String,
    @field:NotBlank @field:Size(max = 50) val nickname: String,
)

data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val user: UserResponse,
)

data class UserResponse(
    val id: Long,
    val email: String,
    val nickname: String,
    val createdAt: String,
)
