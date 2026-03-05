package com.buffettdiary.config

import com.buffettdiary.entity.Journal
import com.buffettdiary.entity.Trade
import com.buffettdiary.entity.User
import com.buffettdiary.enums.AuthProvider
import com.buffettdiary.enums.Position
import com.buffettdiary.repository.JournalRepository
import com.buffettdiary.repository.TradeRepository
import com.buffettdiary.repository.UserRepository
import org.springframework.boot.CommandLineRunner
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component
import java.math.BigDecimal
import java.time.LocalDate

@Component
@Profile("local")
class DataInitializer(
    private val userRepository: UserRepository,
    private val tradeRepository: TradeRepository,
    private val journalRepository: JournalRepository,
) : CommandLineRunner {

    override fun run(vararg args: String?) {
        if (userRepository.count() > 0) return

        val user = userRepository.save(
            User(
                email = "demo@buffett.com",
                nickname = "데모유저",
                provider = AuthProvider.DEMO,
            )
        )
        val uid = user.id

        val trades = listOf(
            // 매수 기록들
            Trade(userId = uid, tradeDate = LocalDate.of(2025, 12, 2), ticker = "AAPL",
                position = Position.BUY, quantity = BigDecimal("10"), entryPrice = BigDecimal("189.50")),
            Trade(userId = uid, tradeDate = LocalDate.of(2025, 12, 5), ticker = "TSLA",
                position = Position.BUY, quantity = BigDecimal("5"), entryPrice = BigDecimal("242.80")),
            Trade(userId = uid, tradeDate = LocalDate.of(2025, 12, 10), ticker = "NVDA",
                position = Position.BUY, quantity = BigDecimal("3"), entryPrice = BigDecimal("131.20")),
            Trade(userId = uid, tradeDate = LocalDate.of(2025, 12, 15), ticker = "MSFT",
                position = Position.BUY, quantity = BigDecimal("8"), entryPrice = BigDecimal("430.10")),
            Trade(userId = uid, tradeDate = LocalDate.of(2026, 1, 3), ticker = "AMZN",
                position = Position.BUY, quantity = BigDecimal("12"), entryPrice = BigDecimal("197.30")),
            Trade(userId = uid, tradeDate = LocalDate.of(2026, 1, 8), ticker = "GOOG",
                position = Position.BUY, quantity = BigDecimal("0.5"), entryPrice = BigDecimal("192.45"),
                reason = "소수점 매수 테스트"),
            Trade(userId = uid, tradeDate = LocalDate.of(2026, 1, 15), ticker = "META",
                position = Position.BUY, quantity = BigDecimal("6"), entryPrice = BigDecimal("612.00"),
                reason = "AI 수혜주 기대"),

            // 매도 기록들 (익절)
            Trade(userId = uid, tradeDate = LocalDate.of(2026, 1, 20), ticker = "AAPL",
                position = Position.SELL, quantity = BigDecimal("10"), entryPrice = BigDecimal("198.20"),
                profit = BigDecimal("87.00"), reason = "단기 목표가 도달"),
            Trade(userId = uid, tradeDate = LocalDate.of(2026, 1, 25), ticker = "NVDA",
                position = Position.SELL, quantity = BigDecimal("3"), entryPrice = BigDecimal("145.60"),
                profit = BigDecimal("43.20"), reason = "실적 발표 전 익절"),
            Trade(userId = uid, tradeDate = LocalDate.of(2026, 2, 3), ticker = "AMZN",
                position = Position.SELL, quantity = BigDecimal("12"), entryPrice = BigDecimal("210.50"),
                profit = BigDecimal("158.40"), reason = "AWS 성장률 호재"),

            // 매도 기록들 (손절)
            Trade(userId = uid, tradeDate = LocalDate.of(2026, 2, 5), ticker = "TSLA",
                position = Position.SELL, quantity = BigDecimal("5"), entryPrice = BigDecimal("225.10"),
                profit = BigDecimal("-88.50"), reason = "판매량 부진 뉴스, 손절"),
            Trade(userId = uid, tradeDate = LocalDate.of(2026, 2, 10), ticker = "META",
                position = Position.SELL, quantity = BigDecimal("3"), entryPrice = BigDecimal("595.00"),
                profit = BigDecimal("-51.00"), reason = "분할 매도 - 일부 손절"),

            // 최근 매수
            Trade(userId = uid, tradeDate = LocalDate.of(2026, 2, 18), ticker = "AAPL",
                position = Position.BUY, quantity = BigDecimal("15"), entryPrice = BigDecimal("205.30"),
                reason = "재진입, 장기 보유 목적"),
            Trade(userId = uid, tradeDate = LocalDate.of(2026, 2, 20), ticker = "COST",
                position = Position.BUY, quantity = BigDecimal("4"), entryPrice = BigDecimal("985.20"),
                reason = "실적 시즌 대비"),

            // 본전
            Trade(userId = uid, tradeDate = LocalDate.of(2026, 2, 22), ticker = "MSFT",
                position = Position.SELL, quantity = BigDecimal("8"), entryPrice = BigDecimal("430.10"),
                profit = BigDecimal("0.00"), reason = "본전 청산"),
        )

        tradeRepository.saveAll(trades)

        val journals = listOf(
            Journal(
                userId = uid,
                title = "2025년 12월 투자 시작 — 포트폴리오 구성",
                content = """올해 마지막 달, 본격적으로 미국 주식 포트폴리오를 구성하기 시작했다. AAPL 10주를 189.50달러에 매수. 워런 버핏이 가장 큰 비중으로 보유하고 있는 종목이기도 하고, 아이폰 16 판매 호조 뉴스가 있어서 진입 타이밍이 괜찮다고 판단했다.

기술주 중심으로 가되, 섹터 분산은 어느 정도 하려고 한다. 연말 산타 랠리에 대한 기대감도 있지만, 금리 인하 속도가 예상보다 느릴 수 있다는 점은 리스크 요인. 일단 첫 매수는 안정적인 대형주 위주로 시작.""",
                journalDate = LocalDate.of(2025, 12, 2),
            ),
            Journal(
                userId = uid,
                title = "테슬라 매수 — FSD 기대감",
                content = """TSLA 5주 매수 (242.80달러). 최근 FSD v13 업데이트 소식이 나오면서 자율주행 모멘텀이 다시 살아나고 있다. 일론 머스크의 트위터 발언에 주가가 흔들리는 건 여전하지만, 기술적으로는 지지선 근처라 매수 타이밍으로 봤다.

다만 테슬라는 변동성이 크기 때문에 전체 포트폴리오의 15% 이내로 비중을 제한할 계획이다. 실적 시즌까지 홀딩하면서 지켜볼 예정.""",
                journalDate = LocalDate.of(2025, 12, 5),
            ),
            Journal(
                userId = uid,
                title = "NVDA 매수 — AI 반도체 싸이클",
                content = """엔비디아 3주를 131.20달러에 매수했다. AI 투자 싸이클이 아직 초기라고 생각한다. 마이크로소프트, 구글, 아마존 모두 내년 AI 인프라 투자를 크게 늘린다는 발표가 있었고, 그 수혜를 가장 직접적으로 받는 건 엔비디아다.

블랙웰 칩 양산 시작 소식도 긍정적. 다만 밸류에이션이 부담스러운 건 사실이라, 분할 매수 전략으로 접근 중. 오늘은 1차 매수.""",
                journalDate = LocalDate.of(2025, 12, 10),
            ),
            Journal(
                userId = uid,
                title = "MSFT 진입 — 클라우드 + AI 양날개",
                content = """마이크로소프트 8주 매수 (430.10달러). Azure 성장률이 다시 가속화되고 있고, 코파일럿 수익화도 본격적으로 시작됐다는 분석 리포트를 읽었다. 오피스 365에 AI 기능이 통합되면서 기업 고객 ARPU가 올라가는 구조.

안정적인 현금흐름에 AI 성장 스토리까지 있으니, 포트폴리오의 핵심 보유 종목으로 가져갈 생각. 배당도 소소하게 나온다.""",
                journalDate = LocalDate.of(2025, 12, 15),
            ),
            Journal(
                userId = uid,
                title = "2025년 회고 — 투자 원칙 정리",
                content = """올해 투자를 되돌아보며 몇 가지 원칙을 정리해본다.

1. 뉴스에 휘둘리지 않기: 단기 뉴스에 반응해서 매매하면 수수료만 나간다
2. 분할 매수/매도: 한 번에 올인하지 않기
3. 손절 라인 설정: 매수 시점에 -10% 손절 라인을 미리 정해두기
4. 매매 일지 쓰기: 감정적 매매를 방지하기 위해 매수/매도 이유를 반드시 기록

12월 한 달간 4종목을 매수했고, 아직 수익률은 크지 않지만 원칙을 지키며 진행 중이다. 내년에는 이 원칙들을 잘 지켜나가는 게 목표.""",
                journalDate = LocalDate.of(2025, 12, 30),
            ),
            Journal(
                userId = uid,
                title = "새해 첫 매수 — AMZN",
                content = """2026년 첫 거래로 아마존 12주를 197.30달러에 매수했다. AWS 성장률이 다시 30%대로 올라왔고, 광고 사업도 빠르게 크고 있다. 이커머스는 솔직히 마진이 박한 편이지만, AWS와 광고가 수익을 견인하는 구조가 마음에 든다.

앤디 재시 CEO의 비용 효율화 노력도 눈에 보인다. 작년 대규모 감원 이후 영업이익률이 확실히 개선됐다. 장기 보유 관점에서 좋은 가격이라 판단.""",
                journalDate = LocalDate.of(2026, 1, 3),
            ),
            Journal(
                userId = uid,
                title = "구글 소수점 매수 테스트",
                content = """GOOG 0.5주를 192.45달러에 매수해봤다. 소수점 매매 기능을 처음 써보는 건데, 적은 금액으로도 대형주에 투자할 수 있어서 편리하다. 구글은 검색 광고 독점 + 유튜브 + 클라우드 3가지 성장 동력이 있어서 장기적으로 괜찮다고 본다.

다만 AI 검색(SGE)으로 인한 검색 광고 매출 변동 가능성은 리스크. 제미나이가 ChatGPT 대비 어떤 포지셔닝을 잡을지 지켜봐야 한다.""",
                journalDate = LocalDate.of(2026, 1, 8),
            ),
            Journal(
                userId = uid,
                title = "META 매수 — AI 수혜주 기대",
                content = """메타 6주를 612달러에 매수했다. 저커버그의 AI 투자가 드디어 결실을 맺기 시작하는 것 같다. 릴스의 광고 수익화가 잘 되고 있고, LLaMA 모델의 오픈소스 전략이 개발자 생태계에서 좋은 반응을 얻고 있다.

메타버스(Reality Labs) 적자는 여전히 부담이지만, 인스타그램 + 페이스북의 광고 매출이 워낙 탄탄해서 커버가 된다. ARPU 성장세도 건전한 편.""",
                journalDate = LocalDate.of(2026, 1, 15),
            ),
            Journal(
                userId = uid,
                title = "AAPL 익절 — 단기 목표가 도달",
                content = """애플 10주를 198.20달러에 전량 매도했다. 매수가 189.50 대비 약 4.6% 수익. 목표했던 단기 수익률에 도달해서 원칙대로 익절했다.

솔직히 더 갈 수도 있겠지만, '먹을 만큼 먹고 나오자'는 원칙을 지키기로 했다. 주가가 조정을 받으면 다시 진입할 계획이다. 빈 자금으로는 다음 기회를 노릴 예정.

첫 익절 매매라 뿌듯하다. 매매 일지를 쓰면서 감정적 매매를 줄이는 데 확실히 도움이 되고 있다.""",
                journalDate = LocalDate.of(2026, 1, 20),
            ),
            Journal(
                userId = uid,
                title = "NVDA 실적 전 익절 결정",
                content = """엔비디아 3주를 145.60달러에 매도. 매수가 131.20 대비 약 11% 수익. 실적 발표가 다음 주인데, 실적 발표 전에 수익을 확정하기로 했다.

엔비디아 실적은 항상 기대치가 너무 높게 잡혀 있어서, 좋은 실적을 발표해도 주가가 빠지는 경우가 많았다. 이번에는 리스크를 회피하는 선택을 했다. 실적 발표 후 조정이 오면 다시 매수할 기회가 있을 것이다.

결과적으로 이번 매매는 성공적이었다. 분할 매수 전략의 1차 매수만 했는데, 다음에는 2-3차 매수까지 실행해볼 계획.""",
                journalDate = LocalDate.of(2026, 1, 25),
            ),
            Journal(
                userId = uid,
                title = "1월 투자 결산",
                content = """1월 한 달을 정리해본다.

[매수] AMZN 12주, GOOG 0.5주, META 6주
[매도] AAPL 10주 (+4.6%), NVDA 3주 (+11%)

총 실현 수익: +130.20달러
현재 보유: TSLA 5주, MSFT 8주, AMZN 12주, GOOG 0.5주, META 6주

잘한 점: 손절/익절 라인을 미리 정하고 원칙대로 실행했다
아쉬운 점: NVDA를 전량 매도하지 않고 일부만 익절했으면 더 좋았을 것

2월에는 보유 종목 관리에 집중하고, 새로운 매수는 큰 조정이 올 때만 실행할 계획.""",
                journalDate = LocalDate.of(2026, 1, 31),
            ),
            Journal(
                userId = uid,
                title = "AMZN 매도 — AWS 호재",
                content = """아마존 12주를 210.50달러에 전량 매도. 매수가 197.30 대비 약 6.7% 수익, 총 158.40달러 실현.

AWS 4분기 실적이 시장 기대치를 크게 상회하면서 주가가 급등했다. 이런 모멘텀에서 욕심을 부리지 않고 목표가에서 정리하는 게 맞다고 판단했다.

다만 아마존은 장기적으로도 좋은 종목이라 생각하므로, 조정 시 재진입할 예정. AI 관련 서비스(Bedrock 등)의 매출 기여도가 높아지고 있는 점이 긍정적이다.""",
                journalDate = LocalDate.of(2026, 2, 3),
            ),
            Journal(
                userId = uid,
                title = "TSLA 손절 — 원칙 지키기",
                content = """테슬라 5주를 225.10달러에 손절. 매수가 242.80 대비 -7.3%, 총 -88.50달러 손실.

중국 판매량이 전월 대비 15% 감소했다는 뉴스가 나왔다. 경쟁 심화(BYD, 샤오미)와 가격 인하 압박이 지속되고 있는 상황에서, 더 버티는 것보다 손절하는 게 낫다고 판단했다.

-10% 손절 라인에 도달하기 전에 미리 정리한 건 잘한 결정이라고 생각한다. 감정적으로 '좀 더 기다리면 반등할 텐데'라는 생각이 들었지만, 원칙을 지켰다. 손절도 실력이다.""",
                journalDate = LocalDate.of(2026, 2, 5),
            ),
            Journal(
                userId = uid,
                title = "META 분할 매도 — 리스크 관리",
                content = """메타 6주 중 3주를 595달러에 매도. 매수가 612 대비 -2.8%, 총 -51달러 소폭 손실.

메타버스 관련 지출이 예상보다 크다는 실적 발표 이후 주가가 조정을 받았다. 전량 손절하기보다는 절반만 정리해서 리스크를 줄이면서 반등 가능성도 열어두는 전략을 택했다.

나머지 3주는 600달러 회복 시 익절, 570달러 이탈 시 추가 손절 계획. 분할 매도가 심리적으로도 편하고 결과적으로도 나쁘지 않은 전략인 것 같다.""",
                journalDate = LocalDate.of(2026, 2, 10),
            ),
            Journal(
                userId = uid,
                title = "시장 조정기 — 현금 비중 확대",
                content = """이번 주 나스닥이 3% 넘게 빠졌다. 연준 의사록에서 금리 인하 속도를 늦출 수 있다는 시그널이 나오면서 기술주 전반이 조정을 받고 있다.

현재 보유: MSFT 8주, GOOG 0.5주, META 3주
현금 비중이 약 40%까지 올라왔다. 이런 시장에서는 무리하게 매수하지 않고, 확실한 기회가 올 때까지 기다리는 게 맞다고 본다.

워런 버핏의 말처럼 "시장이 탐욕스러울 때 두려워하고, 두려워할 때 탐욕스러워라." 지금은 아직 두려움의 시기는 아니고, 관망하면서 공부하는 시간.""",
                journalDate = LocalDate.of(2026, 2, 14),
            ),
            Journal(
                userId = uid,
                title = "AAPL 재진입 — 장기 보유 목적",
                content = """애플 15주를 205.30달러에 재매수했다. 1월에 198.20에 익절했던 것보다 높은 가격이지만, 이번에는 장기 보유 목적이다.

아이폰 17 루머가 나오면서 디자인 변경 기대감이 있고, 서비스 매출(애플뮤직, 앱스토어, iCloud)이 분기마다 사상 최고치를 갱신하고 있다. 하드웨어 사이클과 무관하게 안정적인 수익을 만들어주는 구조가 매력적이다.

이번에는 단기 매매가 아니라 최소 6개월 이상 보유할 계획. 배당도 소소하게 받을 수 있다.""",
                journalDate = LocalDate.of(2026, 2, 18),
            ),
            Journal(
                userId = uid,
                title = "COST 매수 — 실적 시즌 대비",
                content = """코스트코 4주를 985.20달러에 매수. 처음으로 리테일 섹터 종목을 포트폴리오에 추가했다.

코스트코는 경기 방어주 성격이 있어서 포트폴리오 분산 효과가 있고, 멤버십 갱신율이 93%로 엄청나게 높다. 이건 사실상 구독 모델이나 다름없다. 실적 시즌을 앞두고 진입했는데, 컨센서스를 상회할 가능성이 높다고 본다.

주가가 비싸 보이지만, PEG 비율로 보면 꾸준한 성장 대비 합리적인 수준이라 판단.""",
                journalDate = LocalDate.of(2026, 2, 20),
            ),
            Journal(
                userId = uid,
                title = "MSFT 본전 청산 — 포지션 정리",
                content = """마이크로소프트 8주를 430.10달러에 매도. 매수가와 동일해서 수익/손실 없이 청산.

2개월 넘게 보유했는데 주가가 횡보만 했다. 기회비용을 생각하면 다른 종목에 투자하는 게 낫다고 판단해서 정리했다. 마이크로소프트 자체는 좋은 기업이지만, 단기적으로 촉매가 부족한 상황이다.

빈 자금으로는 다음 매수 기회를 노릴 예정. 요즘 헬스케어 섹터가 눈에 들어오고 있다.""",
                journalDate = LocalDate.of(2026, 2, 22),
            ),
            Journal(
                userId = uid,
                title = "2월 투자 결산 — 수익률 점검",
                content = """2월 결산.

[매도] TSLA 5주 (-7.3%), META 3주 (-2.8%), AMZN 12주 (+6.7%), MSFT 8주 (0%)
[매수] AAPL 15주, COST 4주

2월 실현 손익: +18.90달러 (소폭 이익)
누적 실현 손익: +149.10달러

현재 보유: AAPL 15주, GOOG 0.5주, META 3주, COST 4주

잘한 점: TSLA 손절을 빠르게 결정한 것. 원칙을 지킨 것.
아쉬운 점: MSFT를 좀 더 일찍 정리했으면 다른 기회를 잡을 수 있었을 것.

3월에는 보유 종목 집중 관리 + 섹터 분산을 위한 신규 종목 발굴에 집중할 예정.""",
                journalDate = LocalDate.of(2026, 2, 28),
            ),
            Journal(
                userId = uid,
                title = "3월 시장 전망 — 금리 인하 기대",
                content = """3월 FOMC를 앞두고 시장이 다시 활기를 띠고 있다. 2월 고용지표가 예상보다 약하게 나오면서 연준의 금리 인하 기대가 높아졌다.

CME FedWatch 기준으로 6월 인하 확률이 70%까지 올라왔다. 금리 인하가 시작되면 기술주에 유리한 환경이 조성될 것이다.

현재 포트폴리오는 기술주 비중이 높은 편이라 금리 인하 수혜를 받을 수 있는 구조다. 다만 인플레이션이 다시 고개를 들면 시나리오가 바뀔 수 있으므로 경계를 늦추지 않아야 한다.

이번 주는 매매 없이 관망 모드. 공부에 시간을 투자하고 있다.""",
                journalDate = LocalDate.of(2026, 3, 3),
            ),
        )

        journalRepository.saveAll(journals)
    }
}
