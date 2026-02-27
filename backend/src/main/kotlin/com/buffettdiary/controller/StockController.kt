package com.buffettdiary.controller

import com.buffettdiary.repository.StockRepository
import jakarta.annotation.PostConstruct
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
    private lateinit var cachedStocks: List<StockResponse>

    @PostConstruct
    fun init() {
        cachedStocks = stockRepository.findAll().map {
            StockResponse(it.ticker, it.nameEn, it.nameKo, it.logoUrl)
        }
    }

    @GetMapping("/search")
    fun search(@RequestParam q: String): ResponseEntity<List<StockResponse>> {
        if (q.isBlank()) return ResponseEntity.ok(emptyList())
        val query = q.trim().uppercase()
        val results = cachedStocks
            .filter {
                it.ticker.uppercase().contains(query) ||
                it.nameEn.uppercase().contains(query) ||
                it.nameKo?.contains(q.trim()) == true
            }
            .sortedWith(compareBy {
                when {
                    it.ticker.equals(query, ignoreCase = true) -> 0
                    it.ticker.uppercase().startsWith(query) -> 1
                    else -> 2
                }
            })
            .take(10)
        return ResponseEntity.ok(results)
    }
}
