package com.buffettdiary.controller

import com.buffettdiary.repository.StockRepository
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

data class StockResponse(
    val ticker: String,
    val nameEn: String,
    val nameKo: String?,
    val logoUrl: String?,
)

@RestController
@RequestMapping("/api/v1/stocks")
class StockController(
    private val stockRepository: StockRepository,
) {
    @GetMapping("/search")
    fun search(@RequestParam q: String): ResponseEntity<List<StockResponse>> {
        if (q.isBlank()) return ResponseEntity.ok(emptyList())
        val stocks = stockRepository.search(q.trim()).take(10)
        return ResponseEntity.ok(stocks.map {
            StockResponse(it.ticker, it.nameEn, it.nameKo, it.logoUrl)
        })
    }
}
