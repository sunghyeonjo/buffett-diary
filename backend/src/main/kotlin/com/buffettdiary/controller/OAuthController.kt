package com.buffettdiary.controller

import com.buffettdiary.service.AuthService
import com.buffettdiary.service.OAuthService
import jakarta.servlet.http.HttpServletRequest
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.net.URI
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

@RestController
@RequestMapping("/api/v1/auth/oauth2")
class OAuthController(
    private val oAuthService: OAuthService,
    private val authService: AuthService,
    @Value("\${frontend.url}") private val frontendUrl: String,
) {
    @GetMapping("/{provider}")
    fun redirectToProvider(
        @PathVariable provider: String,
        request: HttpServletRequest,
    ): ResponseEntity<Void> {
        val backendBaseUrl = getBackendBaseUrl(request)
        val authUrl = oAuthService.getAuthorizationUrl(provider, backendBaseUrl)
        return ResponseEntity.status(HttpStatus.FOUND)
            .location(URI.create(authUrl))
            .build()
    }

    @GetMapping("/callback/{provider}")
    fun handleCallback(
        @PathVariable provider: String,
        @RequestParam code: String,
        request: HttpServletRequest,
    ): ResponseEntity<Void> {
        val backendBaseUrl = getBackendBaseUrl(request)
        val userInfo = oAuthService.exchangeCodeForUserInfo(provider, code, backendBaseUrl)
        val authResponse = authService.findOrCreateOAuthUser(
            email = userInfo.email,
            nickname = userInfo.nickname,
            provider = provider.uppercase(),
            providerId = userInfo.providerId,
        )
        val userJson = URLEncoder.encode(
            """{"id":${authResponse.user.id},"email":"${authResponse.user.email}","nickname":"${authResponse.user.nickname}","createdAt":"${authResponse.user.createdAt}"}""",
            StandardCharsets.UTF_8,
        )
        val redirectUrl = "$frontendUrl/oauth/callback" +
            "?accessToken=${authResponse.accessToken}" +
            "&refreshToken=${authResponse.refreshToken}" +
            "&user=$userJson"
        return ResponseEntity.status(HttpStatus.FOUND)
            .location(URI.create(redirectUrl))
            .build()
    }

    private fun getBackendBaseUrl(request: HttpServletRequest): String {
        val scheme = request.getHeader("X-Forwarded-Proto") ?: request.scheme
        val host = request.getHeader("X-Forwarded-Host") ?: request.serverName
        val port = request.getHeader("X-Forwarded-Port")?.toIntOrNull() ?: request.serverPort
        return if ((scheme == "https" && port == 443) || (scheme == "http" && port == 80)) {
            "$scheme://$host"
        } else {
            "$scheme://$host:$port"
        }
    }
}
