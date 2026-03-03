import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import type { FeedItem, Trade, AuthorSummary } from '@buffett-diary/shared'
import { feedApi } from '@/api/feed'
import { tradesApi } from '@/api/trades'
import { formatDate } from '@/lib/date'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TickerLogo } from '@/components/StockLogo'
import TradeDetailModal from '@/components/TradeDetailModal'
import JournalCommentSection from '@/components/JournalCommentSection'
import { ImageIcon, Search, ChevronLeft, ChevronRight, ArrowRight, ThumbsUp, ThumbsDown, MessageSquare, Loader2, X } from 'lucide-react'

function getGreetingSubtitle(): string {
  const hour = new Date().getHours()
  if (hour < 12) return '좋은 아침입니다 ☀️'
  if (hour < 18) return '활기찬 하루 보내고 계신가요? 🌤️'
  return '마음을 편하게 가지고 오늘을 잘 마무리하세요 🌙'
}

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [month, setMonth] = useState(() => dayjs().startOf('month'))
  const [selectedFeedItem, setSelectedFeedItem] = useState<FeedItem | null>(null)

  const startDate = month.startOf('month').format('YYYY-MM-DD')
  const endDate = month.endOf('month').format('YYYY-MM-DD')

  const { data: monthTrades } = useQuery({
    queryKey: ['monthTrades', startDate],
    queryFn: () => tradesApi.list({ startDate, endDate, size: 200 }).then((r) => r.data),
  })

  const { data: recentTrades } = useQuery({
    queryKey: ['recentTrades'],
    queryFn: () => tradesApi.list({ size: 5 }).then((r) => r.data),
  })

  const {
    data: feedData,
    isLoading: feedLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = 0 }) => feedApi.list(pageParam).then((r) => r.data),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined,
    initialPageParam: 0,
  })

  const feedItems = feedData?.pages.flatMap((p) => p.content) ?? []

  // Intersection observer for infinite scroll
  const observerRef = useRef<HTMLDivElement>(null)
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  )

  useEffect(() => {
    const el = observerRef.current
    if (!el) return
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [handleObserver])

  const trades = monthTrades?.content ?? []

  const stats = useMemo(() => {
    let totalProfit = 0
    for (const t of trades) {
      if (t.profit != null) {
        totalProfit += t.profit
      }
    }
    return { totalTrades: trades.length, totalProfit }
  }, [trades])

  const handleAuthorClick = (id: number) => {
    setSelectedFeedItem(null)
    navigate(`/users/${id}`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-lg font-bold">안녕하세요, {user?.nickname}님</h1>
        <p className="text-sm text-muted-foreground">{getGreetingSubtitle()}</p>
      </div>

      {/* Monthly Stats */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">월간 성과</h2>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setMonth((m) => m.subtract(1, 'month'))} className="p-1 text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[5.5rem] text-center text-sm font-medium tabular-nums">
              {month.format('YYYY년 M월')}
            </span>
            <button onClick={() => setMonth((m) => m.add(1, 'month'))} className="p-1 text-muted-foreground hover:text-foreground">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-2 rounded-xl border">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">총 손익</p>
              <p className={`text-2xl font-bold tabular-nums ${
                stats.totalProfit > 0 ? 'text-red-600' : stats.totalProfit < 0 ? 'text-blue-600' : 'text-foreground'
              }`}>
                {stats.totalProfit > 0 ? '+' : stats.totalProfit < 0 ? '-' : ''}
                ${Math.abs(stats.totalProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground">거래</p>
              <p className="text-sm font-bold tabular-nums">{stats.totalTrades}건</p>
            </div>
          </div>
        </div>
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
                  <TickerLogo ticker={trade.ticker} stockInfo={trade.stockInfo} className="h-6 w-6" />
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
        ) : !feedItems.length ? (
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
              {feedItems.map((item, i) => (
                <FeedCard
                  key={`${item.type}-${i}`}
                  item={item}
                  onAuthorClick={(id) => navigate(`/users/${id}`)}
                  onClick={() => setSelectedFeedItem(item)}
                />
              ))}
            </div>

            <div ref={observerRef} className="py-4 text-center">
              {isFetchingNextPage && (
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
              )}
            </div>
          </>
        )}
      </div>

      {/* Feed Detail Modals */}
      {selectedFeedItem?.type === 'trade' && selectedFeedItem.trade && (
        <TradeDetailModal
          trade={selectedFeedItem.trade}
          author={selectedFeedItem.author}
          onAuthorClick={handleAuthorClick}
          onClose={() => setSelectedFeedItem(null)}
        />
      )}
      {selectedFeedItem?.type === 'journal' && selectedFeedItem.journal && (
        <JournalDetailModal
          journal={selectedFeedItem.journal}
          author={selectedFeedItem.author}
          onAuthorClick={handleAuthorClick}
          onClose={() => setSelectedFeedItem(null)}
        />
      )}
    </div>
  )
}

function FeedCard({
  item,
  onAuthorClick,
  onClick,
}: {
  item: FeedItem
  onAuthorClick: (id: number) => void
  onClick: () => void
}) {
  const authorInitial = item.author.nickname.charAt(0).toUpperCase()

  if (item.type === 'journal' && item.journal) {
    const journal = item.journal
    return (
      <div
        className="cursor-pointer rounded-xl border p-4 transition-colors hover:bg-muted/30"
        onClick={onClick}
      >
        <div className="flex items-center gap-2.5">
          <button
            onClick={(e) => { e.stopPropagation(); onAuthorClick(item.author.id) }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary text-xs font-bold text-primary-foreground"
          >
            {authorInitial}
          </button>
          <div className="min-w-0 flex-1">
            <button className="text-sm font-semibold hover:underline" onClick={(e) => { e.stopPropagation(); onAuthorClick(item.author.id) }}>
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

        <div className="mt-2.5 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5" />
            {journal.likeCount}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsDown className="h-3.5 w-3.5" />
            {journal.dislikeCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {journal.commentCount}
          </span>
        </div>
      </div>
    )
  }

  if (item.type === 'trade' && item.trade) {
    const trade = item.trade
    return (
      <div
        className="cursor-pointer rounded-xl border p-4 transition-colors hover:bg-muted/30"
        onClick={onClick}
      >
        <div className="flex items-center gap-2.5">
          <button
            onClick={(e) => { e.stopPropagation(); onAuthorClick(item.author.id) }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary text-xs font-bold text-primary-foreground"
          >
            {authorInitial}
          </button>
          <div className="min-w-0 flex-1">
            <button className="text-sm font-semibold hover:underline" onClick={(e) => { e.stopPropagation(); onAuthorClick(item.author.id) }}>
              {item.author.nickname}
            </button>
            <p className="text-xs text-muted-foreground">{formatDate(trade.tradeDate)}</p>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] ${trade.position === 'BUY'
              ? 'border-red-300 bg-red-50 text-red-700'
              : 'border-blue-300 bg-blue-50 text-blue-700'}`}
          >
            {trade.position === 'BUY' ? '매수' : '매도'}
          </Badge>
        </div>

        <div className="mt-3 flex items-center gap-2.5">
          <TickerLogo ticker={trade.ticker} stockInfo={trade.stockInfo} className="h-8 w-8 shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="font-mono text-sm font-semibold">{trade.ticker}</span>
            <span className="ml-2 text-xs text-muted-foreground">
              {trade.quantity}주 · ${trade.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          {trade.profit != null && (
            <span className={`text-sm font-semibold tabular-nums ${trade.profit > 0 ? 'text-red-600' : trade.profit < 0 ? 'text-blue-600' : 'text-muted-foreground'}`}>
              {trade.profit > 0 ? '+' : '-'}${Math.abs(trade.profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          )}
        </div>

        {trade.reason && (
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{trade.reason}</p>
        )}

        <div className="mt-2.5 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5" />
            {trade.likeCount}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsDown className="h-3.5 w-3.5" />
            {trade.dislikeCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {trade.commentCount}
          </span>
        </div>
      </div>
    )
  }

  return null
}

function JournalDetailModal({
  journal,
  author,
  onAuthorClick,
  onClose,
}: {
  journal: NonNullable<FeedItem['journal']>
  author: AuthorSummary
  onAuthorClick: (id: number) => void
  onClose: () => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg max-h-[85vh] overflow-hidden rounded-xl border bg-background shadow-xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header — author */}
          <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => onAuthorClick(author.id)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary text-xs font-bold text-primary-foreground"
              >
                {author.nickname.charAt(0).toUpperCase()}
              </button>
              <div className="min-w-0">
                <button
                  className="text-sm font-semibold hover:underline"
                  onClick={() => onAuthorClick(author.id)}
                >
                  {author.nickname}
                </button>
                <p className="text-xs text-muted-foreground">{formatDate(journal.journalDate)}</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-md p-1 hover:bg-muted ml-2 shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <h2 className="text-lg font-bold">{journal.title}</h2>
              <p className="mt-2 text-sm whitespace-pre-wrap leading-relaxed">{journal.content}</p>
            </div>

            {journal.images.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ImageIcon className="h-3.5 w-3.5" />
                사진 {journal.images.length}장
              </div>
            )}

            <div className="border-t pt-4">
              <JournalCommentSection journalId={journal.id} canComment={true} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
