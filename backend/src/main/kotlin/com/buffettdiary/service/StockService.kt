package com.buffettdiary.service

import com.buffettdiary.dto.StockResponse
import com.buffettdiary.repository.StockRepository
import com.buffettdiary.util.ChosungUtil
import org.springframework.cache.annotation.CacheEvict
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service

@Service
class StockService(
    private val stockRepository: StockRepository,
) {
    @Cacheable(value = ["stocks"], key = "#query")
    fun search(query: String): List<StockResponse> {
        if (query.isBlank()) return emptyList()
        val trimmed = query.trim()
        // 한글 완성형 입력 시 초성으로도 검색되도록 초성 변환 쿼리를 추가 실행
        val chosung = ChosungUtil.extract(trimmed)
        val results = if (chosung != trimmed && ChosungUtil.isChosungOnly(chosung)) {
            // "삼성" 입력 → chosung="ㅅㅅ" → 원본 쿼리 + 초성 쿼리 합산
            val byOriginal = stockRepository.search(trimmed)
            val byChosung = stockRepository.search(chosung)
            (byOriginal + byChosung).distinctBy { it.ticker }
        } else {
            stockRepository.search(trimmed)
        }
        return results
            .take(10)
            .map { StockResponse(it.ticker, it.nameEn, it.nameKo, it.logoUrl, it.sector, it.exchange) }
    }

    @CacheEvict(value = ["stocks"], allEntries = true)
    fun evictStocksCache() {}
}
