package com.buffettdiary.repository

import com.buffettdiary.entity.Stock
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface StockRepository : JpaRepository<Stock, Long> {
    @Query("""
        SELECT s FROM Stock s
        WHERE UPPER(s.ticker) LIKE UPPER(CONCAT('%', :query, '%'))
           OR UPPER(s.nameEn) LIKE UPPER(CONCAT('%', :query, '%'))
           OR s.nameKo LIKE CONCAT('%', :query, '%')
        ORDER BY
          CASE WHEN UPPER(s.ticker) = UPPER(:query) THEN 0
               WHEN UPPER(s.ticker) LIKE UPPER(CONCAT(:query, '%')) THEN 1
               ELSE 2 END,
          s.ticker
    """)
    fun search(query: String): List<Stock>
}
