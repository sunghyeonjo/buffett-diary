package com.buffettdiary.controller

import com.buffettdiary.dto.*
import com.buffettdiary.service.AuthService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/auth")
class AuthController(
    private val authService: AuthService,
) {
    @PostMapping("/send-code")
    fun sendCode(@Valid @RequestBody request: SendCodeRequest): ResponseEntity<Void> {
        authService.sendCode(request)
        return ResponseEntity.ok().build()
    }

    @PostMapping("/verify-code")
    fun verifyCode(@Valid @RequestBody request: VerifyCodeRequest): ResponseEntity<Void> {
        authService.verifyCode(request)
        return ResponseEntity.ok().build()
    }

    @PostMapping("/register")
    fun register(@Valid @RequestBody request: RegisterRequest): ResponseEntity<AuthResponse> {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request))
    }

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<AuthResponse> {
        return ResponseEntity.ok(authService.login(request))
    }

    @PostMapping("/refresh")
    fun refresh(@Valid @RequestBody request: RefreshRequest): ResponseEntity<AuthResponse> {
        return ResponseEntity.ok(authService.refresh(request))
    }

    @PostMapping("/logout")
    fun logout(@Valid @RequestBody request: LogoutRequest): ResponseEntity<Void> {
        authService.logout(request)
        return ResponseEntity.noContent().build()
    }
}
