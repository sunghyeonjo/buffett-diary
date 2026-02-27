package com.buffettdiary.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

data class SendCodeRequest(
    @field:Email @field:NotBlank val email: String,
)

data class VerifyCodeRequest(
    @field:Email @field:NotBlank val email: String,
    @field:NotBlank val code: String,
)

data class RegisterRequest(
    @field:Email @field:NotBlank val email: String,
    @field:NotBlank val code: String,
    @field:NotBlank
    @field:Size(min = 8, max = 100, message = "비밀번호는 8자 이상이어야 합니다.")
    @field:Pattern(
        regexp = "^(?=.*[A-Za-z])(?=.*\\d).+$",
        message = "비밀번호는 영문자와 숫자를 모두 포함해야 합니다.",
    )
    val password: String,
    @field:NotBlank @field:Size(max = 50) val nickname: String,
)

data class LoginRequest(
    @field:Email @field:NotBlank val email: String,
    @field:NotBlank val password: String,
)

data class RefreshRequest(
    @field:NotBlank val refreshToken: String,
)

data class LogoutRequest(
    @field:NotBlank val refreshToken: String,
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
