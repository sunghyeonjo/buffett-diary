package com.buffettdiary.config

import com.buffettdiary.entity.Trade
import com.buffettdiary.entity.User
import com.buffettdiary.repository.TradeRepository
import com.buffettdiary.repository.UserRepository
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component
import java.math.BigDecimal
import java.time.LocalDate

@Component
@Profile("default")
class DataInitializer(
    private val userRepository: UserRepository,
    private val tradeRepository: TradeRepository,
) : CommandLineRunner {

    override fun run(vararg args: String?) {
        if (userRepository.count() > 0) return

        val user = userRepository.save(
            User(
                email = "demo@buffett.com",
                nickname = "데모유저",
                provider = "DEMO",
            )
        )
        val uid = user.id

        val trades = listOf(
            // 매수 기록들
            Trade(userId = uid, tradeDate = LocalDate.of(2025, 12, 2), ticker = "AAPL",
                position = "BUY", quantity = BigDecimal("10"), entryPrice = BigDecimal("189.50")),
            Trade(userId = uid, tradeDate = LocalDate.of(2025, 12, 5), ticker = "TSLA",
                position = "BUY", quantity = BigDecimal("5"), entryPrice = BigDecimal("242.80")),
            Trade(userId = uid, tradeDate = LocalDate.of(2025, 12, 10), ticker = "NVDA",
                position = "BUY", quantity = BigDecimal("3"), entryPrice = BigDecimal("131.20")),
            Trade(userId = uid, tradeDate = LocalDate.of(2025, 12, 15), ticker = "MSFT",
                position = "BUY", quantity = BigDecimal("8"), entryPrice = BigDecimal("430.10")),
            Trade(userId = uid, tradeDate = LocalDate.of(2026, 1, 3), ticker = "AMZN",
                position = "BUY", quantity = BigDecimal("12"), entryPrice = BigDecimal("197.30")),
            Trade(userId = uid, tradeDate = LocalDate.of(2026, 1, 8), ticker = "GOOG",
                position = "BUY", quantity = BigDecimal("0.5"), entryPrice = BigDecimal("192.45"),
                reason = "소수점 매수 테스트"),
            Trade(userId = uid, tradeDate = LocalDate.of(2026, 1, 15), ticker = "META",
                position = "BUY", quantity = BigDecimal("6"), entryPrice = BigDecimal("612.00"),
                reason = "AI 수혜주 기대"),

            // 매도 기록들 (익절)
            Trade(userId = uid, tradeDate = LocalDate.of(2026, 1, 20), ticker = "AAPL",
                position = "SELL", quantity = BigDecimal("10"), entryPrice = BigDecimal("198.20"),
                profit = BigDecimal("87.00"), reason = "단기 목표가 도달"),
            Trade(userId = uid, tradeDate = LocalDate.of(2026, 1, 25), ticker = "NVDA",
                position = "SELL", quantity = BigDecimal("3"), entryPrice = BigDecimal("145.60"),
                profit = BigDecimal("43.20"), reason = "실적 발표 전 익절"),
            Trade(userId = uid, tradeDate = LocalDate.of(2026, 2, 3), ticker = "AMZN",
                position = "SELL", quantity = BigDecimal("12"), entryPrice = BigDecimal("210.50"),
                profit = BigDecimal("158.40"), reason = "AWS 성장률 호재"),

            // 매도 기록들 (손절)
            Trade(userId = uid, tradeDate = LocalDate.of(2026, 2, 5), ticker = "TSLA",
                position = "SELL", quantity = BigDecimal("5"), entryPrice = BigDecimal("225.10"),
                profit = BigDecimal("-88.50"), reason = "판매량 부진 뉴스, 손절"),
            Trade(userId = uid, tradeDate = LocalDate.of(2026, 2, 10), ticker = "META",
                position = "SELL", quantity = BigDecimal("3"), entryPrice = BigDecimal("595.00"),
                profit = BigDecimal("-51.00"), reason = "분할 매도 - 일부 손절"),

            // 최근 매수
            Trade(userId = uid, tradeDate = LocalDate.of(2026, 2, 18), ticker = "AAPL",
                position = "BUY", quantity = BigDecimal("15"), entryPrice = BigDecimal("205.30"),
                reason = "재진입, 장기 보유 목적"),
            Trade(userId = uid, tradeDate = LocalDate.of(2026, 2, 20), ticker = "COST",
                position = "BUY", quantity = BigDecimal("4"), entryPrice = BigDecimal("985.20"),
                reason = "실적 시즌 대비"),

            // 본전
            Trade(userId = uid, tradeDate = LocalDate.of(2026, 2, 22), ticker = "MSFT",
                position = "SELL", quantity = BigDecimal("8"), entryPrice = BigDecimal("430.10"),
                profit = BigDecimal("0.00"), reason = "본전 청산"),
        )

        tradeRepository.saveAll(trades)
    }
}
