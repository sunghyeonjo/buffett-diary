package com.buffettdiary.controller

import com.buffettdiary.dto.LeaderboardEntry
import com.buffettdiary.service.LeaderboardService
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/leaderboard")
class LeaderboardController(
    private val leaderboardService: LeaderboardService,
) {
    @GetMapping
    fun leaderboard(
        auth: Authentication,
        @RequestParam(defaultValue = "totalProfit") type: String,
        @RequestParam(defaultValue = "10") minTrades: Int,
    ): ResponseEntity<List<LeaderboardEntry>> {
        return ResponseEntity.ok(leaderboardService.getLeaderboard(type, minTrades))
    }
}
