package com.buffettdiary.enums

enum class BadgeType(val displayName: String, val description: String) {
    FIRST_TRADE("첫 거래", "첫 번째 매매를 기록했습니다"),
    TRADES_10("10건 달성", "매매 기록 10건을 달성했습니다"),
    TRADES_100("100건 달성", "매매 기록 100건을 달성했습니다"),
    WIN_STREAK_5("5연승", "5연승을 달성했습니다"),
    WIN_STREAK_10("10연승", "10연승을 달성했습니다"),
    FIRST_JOURNAL("첫 일지", "첫 번째 투자일지를 작성했습니다"),
}
