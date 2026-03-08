package com.buffettdiary.util

object ChosungUtil {

    private val CHOSUNG = charArrayOf(
        'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
        'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
    )

    private const val HANGUL_START = 0xAC00
    private const val HANGUL_END = 0xD7A3

    /**
     * 한글 문자열에서 초성만 추출.
     * "삼성전자" → "ㅅㅅㅈㅈ"
     * "Apple" → "Apple" (비한글은 그대로 유지)
     */
    fun extract(text: String): String {
        return buildString(text.length) {
            for (ch in text) {
                val code = ch.code
                if (code in HANGUL_START..HANGUL_END) {
                    append(CHOSUNG[(code - HANGUL_START) / 28 / 21])
                } else {
                    append(ch)
                }
            }
        }
    }

    /**
     * 입력이 초성 문자(ㄱ~ㅎ)만으로 구성되어 있는지 확인.
     */
    fun isChosungOnly(text: String): Boolean {
        return text.isNotEmpty() && text.all { it in 'ㄱ'..'ㅎ' }
    }
}
