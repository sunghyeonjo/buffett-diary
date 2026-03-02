import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { FeedItem, Trade, TradeStats } from '@buffett-diary/shared'
import { feedApi } from '@/api/feed'
import { tradesApi } from '@/api/trades'
import { formatDate } from '@/lib/date'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { TickerLogo } from '@/components/StockLogo'
import { ImageIcon, Search, TrendingUp, TrendingDown, ArrowRight, BookOpen } from 'lucide-react'

function getGreetingSubtitle(): string {
  const hour = new Date().getHours()
  if (hour < 12) return '좋은 아침입니다 ☀️'
  if (hour < 18) return '활기찬 하루 보내고 계신가요? 🌤️'
  return '벌써 저녁이네요 🌙'
}

type Period = 'today' | 'week' | 'month' | 'all'

const PERIOD_TABS: { label: string; period: Period }[] = [
  { label: '오늘', period: 'today' },
  { label: '이번 주', period: 'week' },
  { label: '이번 달', period: 'month' },
  { label: '전체', period: 'all' },
]

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [period, setPeriod] = useState<Period>('month')
  const [feedPage, setFeedPage] = useState(0)

  const { data: stats } = useQuery<TradeStats>({
    queryKey: ['stats', period],
    queryFn: () => tradesApi.stats(period).then((r) => r.data),
  })

  const { data: recentTrades } = useQuery({
    queryKey: ['recentTrades'],
    queryFn: () => tradesApi.list({ size: 5 }).then((r) => r.data),
  })

  const { data: feed, isLoading: feedLoading } = useQuery({
    queryKey: ['feed', feedPage],
    queryFn: () => feedApi.list(feedPage).then((r) => r.data),
  })

  const closedCount = (stats?.winCount ?? 0) + (stats?.lossCount ?? 0)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-lg font-bold">안녕하세요, {user?.nickname}님</h1>
        <p className="text-sm text-muted-foreground">{getGreetingSubtitle()}</p>
      </div>

      {/* Stats */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">매매 성과</h2>
          <div className="flex gap-0.5 rounded-lg border bg-muted p-0.5">
            {PERIOD_TABS.map((tab) => (
              <button
                key={tab.period}
                onClick={() => setPeriod(tab.period)}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  period === tab.period
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {stats && (
          <div className="mt-2.5">
            {/* Main P&L */}
            <Card>
              <CardContent className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">총 손익</p>
                    <p className={`text-2xl font-bold tabular-nums ${stats.totalProfit >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                      {stats.totalProfit >= 0 ? '+' : '-'}${Math.abs(stats.totalProfit).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">거래 {stats.totalTrades}건</p>
                    {closedCount > 0 && (
                      <p className="text-sm font-semibold tabular-nums">
                        승률 {stats.winRate.toFixed(0)}%
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          ({stats.winCount}승 {stats.lossCount}패)
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Secondary stats */}
            {closedCount > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                <Card>
                  <CardContent className="px-3 py-2.5">
                    <p className="text-[11px] text-muted-foreground">평균 수익</p>
                    <p className={`text-sm font-bold tabular-nums ${stats.averageProfit >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                      ${stats.averageProfit.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="px-3 py-2.5">
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" />최대 수익</p>
                    <p className={`text-sm font-bold tabular-nums ${stats.bestTrade > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {stats.bestTrade > 0 ? `+$${stats.bestTrade.toFixed(2)}` : '-'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="px-3 py-2.5">
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1"><TrendingDown className="h-3 w-3" />최대 손실</p>
                    <p className={`text-sm font-bold tabular-nums ${stats.worstTrade < 0 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                      {stats.worstTrade < 0 ? `-$${Math.abs(stats.worstTrade).toFixed(2)}` : '-'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Trades */}
      {recentTrades && recentTrades.content.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">최근 매매</h2>
            <button className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground" onClick={() => navigate('/trades')}>
              전체보기 <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          <div className="mt-2 divide-y rounded-xl border">
            {recentTrades.content.slice(0, 5).map((trade: Trade) => (
              <div key={trade.id} className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <TickerLogo ticker={trade.ticker} className="h-6 w-6" />
                  <span className="font-mono text-sm font-semibold">{trade.ticker}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${trade.position === 'BUY'
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-blue-300 bg-blue-50 text-blue-700'}`}
                  >
                    {trade.position === 'BUY' ? '매수' : '매도'}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">{formatDate(trade.tradeDate)}</span>
                </div>
                {trade.profit != null ? (
                  <span className={`shrink-0 text-sm font-semibold tabular-nums ${trade.profit > 0 ? 'text-red-600' : trade.profit < 0 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                    {trade.profit > 0 ? '+' : '-'}${Math.abs(trade.profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                ) : (
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    ${trade.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} / {trade.quantity}주
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feed */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground">피드</h2>

        {feedLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">불러오는 중...</div>
        ) : !feed?.content.length ? (
          <div className="mt-2.5 flex items-center justify-between rounded-xl border border-dashed px-4 py-3">
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-muted-foreground/50" />
              <div>
                <p className="text-sm font-medium">팔로우한 투자자가 없습니다</p>
                <p className="text-xs text-muted-foreground">다른 투자자를 찾아 팔로우해보세요</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/search')}>
              투자자 찾기
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-2.5 space-y-3">
              {feed.content.map((item, i) => (
                <FeedCard key={`${item.type}-${i}`} item={item} onAuthorClick={(id) => navigate(`/users/${id}`)} />
              ))}
            </div>

            {feed.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" disabled={feedPage === 0} onClick={() => setFeedPage((p) => p - 1)}>
                  이전
                </Button>
                <span className="text-xs text-muted-foreground">
                  {feedPage + 1} / {feed.totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={feedPage >= feed.totalPages - 1} onClick={() => setFeedPage((p) => p + 1)}>
                  다음
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function FeedCard({ item, onAuthorClick }: { item: FeedItem; onAuthorClick: (id: number) => void }) {
  const authorInitial = item.author.nickname.charAt(0).toUpperCase()

  if (item.type === 'journal' && item.journal) {
    const journal = item.journal
    return (
      <div className="rounded-xl border p-4">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onAuthorClick(item.author.id)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary text-xs font-bold text-primary-foreground"
          >
            {authorInitial}
          </button>
          <div className="min-w-0 flex-1">
            <button className="text-sm font-semibold hover:underline" onClick={() => onAuthorClick(item.author.id)}>
              {item.author.nickname}
            </button>
            <p className="text-xs text-muted-foreground">{formatDate(journal.journalDate)}</p>
          </div>
          <Badge variant="secondary" className="text-[10px]">투자일지</Badge>
        </div>
        <div className="mt-3">
          <h3 className="font-semibold">{journal.title}</h3>
          <p className="mt-1 line-clamp-3 text-sm text-muted-foreground leading-relaxed">{journal.content}</p>
        </div>
        {journal.images.length > 0 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <ImageIcon className="h-3.5 w-3.5" />
            사진 {journal.images.length}장
          </div>
        )}
      </div>
    )
  }

  if (item.type === 'trade' && item.trade) {
    const trade = item.trade
    return (
      <div className="rounded-xl border p-4">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onAuthorClick(item.author.id)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary text-xs font-bold text-primary-foreground"
          >
            {authorInitial}
          </button>
          <div className="min-w-0 flex-1">
            <button className="text-sm font-semibold hover:underline" onClick={() => onAuthorClick(item.author.id)}>
              {item.author.nickname}
            </button>
            <p className="text-xs text-muted-foreground">{formatDate(trade.tradeDate)}</p>
          </div>
          <Badge
            variant="outline"
            className={trade.position === 'BUY'
              ? 'border-red-300 bg-red-50 text-red-700'
              : 'border-blue-300 bg-blue-50 text-blue-700'}
          >
            {trade.position === 'BUY' ? '매수' : '매도'}
          </Badge>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
          <span className="font-mono text-sm font-semibold">{trade.ticker}</span>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">${trade.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            {trade.profit != null && (
              <span className={`font-semibold ${trade.profit > 0 ? 'text-red-600' : trade.profit < 0 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                {trade.profit > 0 ? '+' : ''}${trade.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </div>
        </div>
        {trade.reason && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{trade.reason}</p>
        )}
      </div>
    )
  }

  return null
}
