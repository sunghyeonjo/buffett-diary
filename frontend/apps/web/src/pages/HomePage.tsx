import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { FeedItem, TradeStats } from '@buffett-diary/shared'
import { feedApi } from '@/api/feed'
import { tradesApi } from '@/api/trades'
import { formatDate } from '@/lib/date'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ImageIcon, TrendingUp, Search } from 'lucide-react'

type Period = 'today' | 'week' | 'month' | 'all'

const PERIOD_TABS: { label: string; period: Period }[] = [
  { label: '오늘', period: 'today' },
  { label: '이번 주', period: 'week' },
  { label: '이번 달', period: 'month' },
  { label: '전체', period: 'all' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState<Period>('today')
  const [feedPage, setFeedPage] = useState(0)

  const { data: stats } = useQuery<TradeStats>({
    queryKey: ['stats', period],
    queryFn: () => tradesApi.stats(period).then((r) => r.data),
  })

  const { data: feed, isLoading: feedLoading } = useQuery({
    queryKey: ['feed', feedPage],
    queryFn: () => feedApi.list(feedPage).then((r) => r.data),
  })

  const closedCount = (stats?.winCount ?? 0) + (stats?.lossCount ?? 0)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Stats Summary — compact inline */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">내 매매 성과</h2>
          <div className="flex gap-0.5 rounded-lg border bg-muted p-0.5">
            {PERIOD_TABS.map((tab) => (
              <button
                key={tab.period}
                onClick={() => setPeriod(tab.period)}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
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
          <div className="mt-3 grid grid-cols-4 gap-2">
            <Card>
              <CardContent className="px-3 py-3">
                <p className="text-[11px] text-muted-foreground">총 손익</p>
                <p className={`text-lg font-bold tabular-nums ${stats.totalProfit >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                  {stats.totalProfit >= 0 ? '+' : '-'}${Math.abs(stats.totalProfit).toFixed(0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="px-3 py-3">
                <p className="text-[11px] text-muted-foreground">거래</p>
                <p className="text-lg font-bold tabular-nums">{stats.totalTrades}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="px-3 py-3">
                <p className="text-[11px] text-muted-foreground">승률</p>
                <p className="text-lg font-bold tabular-nums">
                  {closedCount > 0 ? `${stats.winRate.toFixed(0)}%` : '-'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="px-3 py-3">
                <p className="text-[11px] text-muted-foreground">승/패</p>
                <p className="text-lg font-bold tabular-nums">
                  {closedCount > 0 ? `${stats.winCount}/${stats.lossCount}` : '-'}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Feed */}
      <div>
        <h2 className="text-lg font-semibold">피드</h2>

        {feedLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">불러오는 중...</div>
        ) : !feed?.content.length ? (
          <div className="mt-4 rounded-xl border border-dashed p-8 text-center">
            <Search className="mx-auto h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 font-medium">팔로우한 투자자가 없습니다</p>
            <p className="mt-1 text-sm text-muted-foreground">다른 투자자를 찾아 팔로우해보세요</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/search')}>
              투자자 찾기
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-3 space-y-3">
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
        {/* Author row */}
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

        {/* Content */}
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
        {/* Author row */}
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

        {/* Trade info */}
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
