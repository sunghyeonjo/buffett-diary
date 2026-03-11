package com.buffettdiary.service

import com.buffettdiary.dto.BadgeResponse
import com.buffettdiary.entity.UserBadge
import com.buffettdiary.enums.BadgeType
import com.buffettdiary.repository.JournalRepository
import com.buffettdiary.repository.TradeRepository
import com.buffettdiary.repository.UserBadgeRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

@Service
class BadgeService(
    private val userBadgeRepository: UserBadgeRepository,
    private val tradeRepository: TradeRepository,
    private val journalRepository: JournalRepository,
) {
    @Transactional(readOnly = true)
    fun getUserBadges(userId: Long): List<BadgeResponse> {
        return userBadgeRepository.findByUserId(userId).map {
            BadgeResponse(
                type = it.badgeType.name,
                name = it.badgeType.displayName,
                description = it.badgeType.description,
                earnedAt = it.createdAt.toString(),
            )
        }
    }

    @Transactional
    fun checkAndAwardTradeBadges(userId: Long) {
        val count = tradeRepository.countByUserId(userId)

        awardIfNew(userId, BadgeType.FIRST_TRADE) { count >= 1 }
        awardIfNew(userId, BadgeType.TRADES_10) { count >= 10 }
        awardIfNew(userId, BadgeType.TRADES_100) { count >= 100 }

        // Win streak check — need full trade list for streak calculation
        val closedTrades = tradeRepository.findByUserId(userId)
            .filter { it.profit != null }
            .sortedBy { it.tradeDate }

        var maxStreak = 0
        var currentStreak = 0
        for (trade in closedTrades) {
            if (trade.profit!! > BigDecimal.ZERO) {
                currentStreak++
                if (currentStreak > maxStreak) maxStreak = currentStreak
            } else {
                currentStreak = 0
            }
        }

        awardIfNew(userId, BadgeType.WIN_STREAK_5) { maxStreak >= 5 }
        awardIfNew(userId, BadgeType.WIN_STREAK_10) { maxStreak >= 10 }
    }

    @Transactional
    fun checkAndAwardJournalBadges(userId: Long) {
        awardIfNew(userId, BadgeType.FIRST_JOURNAL) {
            journalRepository.countByUserId(userId) >= 1
        }
    }

    private fun awardIfNew(userId: Long, type: BadgeType, condition: () -> Boolean) {
        if (!userBadgeRepository.existsByUserIdAndBadgeType(userId, type) && condition()) {
            userBadgeRepository.save(UserBadge(userId = userId, badgeType = type))
        }
    }
}
