package com.buffettdiary.service

import com.buffettdiary.dto.LeaderboardEntry
import com.buffettdiary.repository.TradeRepository
import com.buffettdiary.repository.UserRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

@Service
class LeaderboardService(
    private val userRepository: UserRepository,
    private val tradeRepository: TradeRepository,
) {
    @Transactional(readOnly = true)
    @Cacheable(value = ["leaderboard"], key = "#type + '-' + #minTrades")
    fun getLeaderboard(type: String, minTrades: Int): List<LeaderboardEntry> {
        val users = userRepository.findByShowOnLeaderboardTrue()
        val userIds = users.map { it.id }
        val tradesByUser = tradeRepository.findByUserIdIn(userIds).groupBy { it.userId }

        return users.mapNotNull { user ->
            val trades = tradesByUser[user.id] ?: emptyList()
            if (trades.size < minTrades) return@mapNotNull null

            val closed = trades.filter { it.profit != null }
            val wins = closed.filter { it.profit!! > BigDecimal.ZERO }

            LeaderboardEntry(
                userId = user.id,
                nickname = user.nickname,
                totalTrades = trades.size,
                winRate = if (closed.isNotEmpty()) wins.size.toDouble() / closed.size * 100 else 0.0,
                totalProfit = closed.sumOf { it.profit!! },
            )
        }.let { entries ->
            when (type) {
                "winRate" -> entries.sortedByDescending { it.winRate }
                else -> entries.sortedByDescending { it.totalProfit }
            }
        }.take(50)
    }
}
