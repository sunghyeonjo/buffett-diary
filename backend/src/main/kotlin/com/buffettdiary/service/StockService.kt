package com.buffettdiary.service

import com.buffettdiary.dto.StockResponse
import com.buffettdiary.repository.StockRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service

@Service
class StockService(
    private val stockRepository: StockRepository,
) {
    @Cacheable(value = ["stocks"], key = "#query")
    fun search(query: String): List<StockResponse> {
        if (query.isBlank()) return emptyList()
        return stockRepository.search(query.trim())
            .take(10)
            .map { StockResponse(it.ticker, it.nameEn, it.nameKo, it.logoUrl) }
    }
}
