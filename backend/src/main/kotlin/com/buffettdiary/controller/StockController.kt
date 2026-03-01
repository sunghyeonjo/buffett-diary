package com.buffettdiary.controller

import com.buffettdiary.dto.StockResponse
import com.buffettdiary.service.StockService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/stocks")
class StockController(
    private val stockService: StockService,
) {
    @GetMapping("/search")
    fun search(@RequestParam q: String): ResponseEntity<List<StockResponse>> {
        return ResponseEntity.ok(stockService.search(q))
    }
}
