package com.buffettdiary.service

import com.buffettdiary.config.OAuth2Properties
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.*
import org.springframework.stereotype.Service
import org.springframework.util.LinkedMultiValueMap
import org.springframework.web.client.RestTemplate

data class OAuthTokenResponse(val accessToken: String)
data class OAuthUserInfo(val email: String, val nickname: String, val providerId: String)

@Service
class OAuthService(
    private val oauth2Properties: OAuth2Properties,
    @Value("\${server.port:8080}") private val serverPort: String,
) {
    private val restTemplate = RestTemplate()

    fun getAuthorizationUrl(provider: String, backendBaseUrl: String): String {
        val redirectUri = "$backendBaseUrl/api/v1/auth/oauth2/callback/$provider"
        return when (provider) {
            "google" -> "https://accounts.google.com/o/oauth2/v2/auth" +
                "?client_id=${oauth2Properties.google.clientId}" +
                "&redirect_uri=$redirectUri" +
                "&response_type=code" +
                "&scope=email%20profile" +
                "&prompt=select_account"
            "naver" -> "https://nid.naver.com/oauth2.0/authorize" +
                "?client_id=${oauth2Properties.naver.clientId}" +
                "&redirect_uri=$redirectUri" +
                "&response_type=code"
            else -> throw IllegalArgumentException("Unsupported provider: $provider")
        }
    }

    fun exchangeCodeForUserInfo(provider: String, code: String, backendBaseUrl: String): OAuthUserInfo {
        val token = exchangeCode(provider, code, backendBaseUrl)
        return fetchUserInfo(provider, token.accessToken)
    }

    private fun exchangeCode(provider: String, code: String, backendBaseUrl: String): OAuthTokenResponse {
        val redirectUri = "$backendBaseUrl/api/v1/auth/oauth2/callback/$provider"
        return when (provider) {
            "google" -> exchangeGoogleCode(code, redirectUri)
            "naver" -> exchangeNaverCode(code, redirectUri)
            else -> throw IllegalArgumentException("Unsupported provider: $provider")
        }
    }

    private fun exchangeGoogleCode(code: String, redirectUri: String): OAuthTokenResponse {
        val params = LinkedMultiValueMap<String, String>()
        params.add("code", code)
        params.add("client_id", oauth2Properties.google.clientId)
        params.add("client_secret", oauth2Properties.google.clientSecret)
        params.add("redirect_uri", redirectUri)
        params.add("grant_type", "authorization_code")

        val headers = HttpHeaders().apply { contentType = MediaType.APPLICATION_FORM_URLENCODED }
        val response = restTemplate.exchange(
            "https://oauth2.googleapis.com/token",
            HttpMethod.POST,
            HttpEntity(params, headers),
            Map::class.java,
        )
        val accessToken = response.body?.get("access_token") as? String
            ?: throw IllegalStateException("Failed to get Google access token")
        return OAuthTokenResponse(accessToken)
    }

    private fun exchangeNaverCode(code: String, redirectUri: String): OAuthTokenResponse {
        val params = LinkedMultiValueMap<String, String>()
        params.add("code", code)
        params.add("client_id", oauth2Properties.naver.clientId)
        params.add("client_secret", oauth2Properties.naver.clientSecret)
        params.add("grant_type", "authorization_code")

        val headers = HttpHeaders().apply { contentType = MediaType.APPLICATION_FORM_URLENCODED }
        val response = restTemplate.exchange(
            "https://nid.naver.com/oauth2.0/token",
            HttpMethod.POST,
            HttpEntity(params, headers),
            Map::class.java,
        )
        val accessToken = response.body?.get("access_token") as? String
            ?: throw IllegalStateException("Failed to get Naver access token")
        return OAuthTokenResponse(accessToken)
    }

    private fun fetchUserInfo(provider: String, accessToken: String): OAuthUserInfo {
        return when (provider) {
            "google" -> fetchGoogleUserInfo(accessToken)
            "naver" -> fetchNaverUserInfo(accessToken)
            else -> throw IllegalArgumentException("Unsupported provider: $provider")
        }
    }

    private fun fetchGoogleUserInfo(accessToken: String): OAuthUserInfo {
        val headers = HttpHeaders().apply { setBearerAuth(accessToken) }
        val response = restTemplate.exchange(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            HttpMethod.GET,
            HttpEntity<Void>(headers),
            Map::class.java,
        )
        val body = response.body ?: throw IllegalStateException("Failed to get Google user info")
        return OAuthUserInfo(
            email = body["email"] as? String ?: throw IllegalStateException("Email not found"),
            nickname = body["name"] as? String ?: (body["email"] as String).substringBefore("@"),
            providerId = body["id"].toString(),
        )
    }

    @Suppress("UNCHECKED_CAST")
    private fun fetchNaverUserInfo(accessToken: String): OAuthUserInfo {
        val headers = HttpHeaders().apply { setBearerAuth(accessToken) }
        val response = restTemplate.exchange(
            "https://openapi.naver.com/v1/nid/me",
            HttpMethod.GET,
            HttpEntity<Void>(headers),
            Map::class.java,
        )
        val body = response.body ?: throw IllegalStateException("Failed to get Naver user info")
        val responseData = body["response"] as? Map<String, Any>
            ?: throw IllegalStateException("Invalid Naver response format")
        return OAuthUserInfo(
            email = responseData["email"] as? String ?: throw IllegalStateException("Email not found"),
            nickname = responseData["nickname"] as? String
                ?: responseData["name"] as? String
                ?: (responseData["email"] as String).substringBefore("@"),
            providerId = responseData["id"].toString(),
        )
    }
}
