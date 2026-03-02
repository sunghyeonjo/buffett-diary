import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Journal, Trade } from '@buffett-diary/shared'
import { useAuth } from '@/contexts/AuthContext'
import { usersApi } from '@/api/users'
import { followsApi } from '@/api/follows'
import { tradeImagesApi } from '@/api/trades'
import { formatDate } from '@/lib/date'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TickerLogo } from '@/components/StockLogo'
import { ImageIcon, UserPlus, UserMinus, Grid3x3, BookOpen, X, ChevronLeft, ChevronRight, Star } from 'lucide-react'

type Tab = 'journals' | 'trades'

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const targetId = Number(userId)
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('journals')
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)

  // Redirect to MyPage if viewing own profile
  useEffect(() => {
    if (user && user.id === targetId) {
      navigate('/mypage', { replace: true })
    }
  }, [user, targetId, navigate])

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['userProfile', targetId],
    queryFn: () => usersApi.profile(targetId).then((r) => r.data),
    enabled: !!user && user.id !== targetId,
  })

  const { data: journals } = useQuery({
    queryKey: ['userJournals', targetId],
    queryFn: () => usersApi.journals(targetId).then((r) => r.data),
    enabled: !!profile && profile.isFollowing && tab === 'journals',
  })

  const { data: trades } = useQuery({
    queryKey: ['userTrades', targetId],
    queryFn: () => usersApi.trades(targetId).then((r) => r.data),
    enabled: !!profile && profile.isFollowing && tab === 'trades',
  })

  const followMutation = useMutation({
    mutationFn: () => followsApi.follow(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', targetId] })
      queryClient.invalidateQueries({ queryKey: ['userJournals', targetId] })
      queryClient.invalidateQueries({ queryKey: ['userTrades', targetId] })
    },
  })

  const unfollowMutation = useMutation({
    mutationFn: () => followsApi.unfollow(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', targetId] })
    },
  })

  if (user && user.id === targetId) return null

  if (profileLoading) {
    return <div className="py-8 text-center text-muted-foreground">프로필을 불러오는 중...</div>
  }

  if (!profile) {
    return <div className="py-8 text-center text-muted-foreground">사용자를 찾을 수 없습니다</div>
  }

  const initial = profile.nickname.charAt(0).toUpperCase()

  return (
    <div className="mx-auto max-w-2xl">
      {/* Profile Header — Instagram style */}
      <div className="flex items-center gap-6 px-4 py-6 sm:gap-10">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted-foreground/20 text-3xl font-bold text-muted-foreground sm:h-24 sm:w-24">
          {initial}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{profile.nickname}</h1>
            {profile.isFollowing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => unfollowMutation.mutate()}
                disabled={unfollowMutation.isPending}
              >
                <UserMinus className="mr-1.5 h-3.5 w-3.5" />
                팔로잉
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => followMutation.mutate()}
                disabled={followMutation.isPending}
              >
                <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                팔로우
              </Button>
            )}
          </div>
          <div className="mt-4 flex gap-6 text-sm">
            <div>
              <span className="font-semibold">{profile.followerCount}</span>
              <span className="ml-1 text-muted-foreground">팔로워</span>
            </div>
            <div>
              <span className="font-semibold">{profile.followingCount}</span>
              <span className="ml-1 text-muted-foreground">팔로잉</span>
            </div>
          </div>
        </div>
      </div>

      {profile.bio && (
        <div className="px-4 pb-4">
          <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-t">
        {([
          { key: 'journals' as const, icon: Grid3x3, label: '투자일지' },
          { key: 'trades' as const, icon: BookOpen, label: '매매 내역' },
        ]).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
              tab === key
                ? 'border-t-2 border-foreground text-foreground -mt-px'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-1 py-2">
        {!profile.isFollowing ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="text-lg font-light">비공개 계정입니다</p>
            <p className="mt-1 text-sm">팔로우하여 투자일지와 매매 내역을 확인하세요</p>
          </div>
        ) : tab === 'journals' ? (
          <JournalList journals={journals?.content ?? []} />
        ) : (
          <TradeCardList trades={trades?.content ?? []} onSelect={setSelectedTrade} />
        )}
      </div>

      {selectedTrade && (
        <TradeDetailModal
          trade={selectedTrade}
          onClose={() => setSelectedTrade(null)}
        />
      )}
    </div>
  )
}

function JournalList({ journals }: { journals: Journal[] }) {
  if (!journals.length) {
    return <div className="py-8 text-center text-muted-foreground">작성된 투자일지가 없습니다</div>
  }
  return (
    <div className="grid gap-3 px-1 py-2">
      {journals.map((journal) => (
        <div key={journal.id} className="rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{formatDate(journal.journalDate)}</span>
            {journal.images.length > 0 && (
              <Badge variant="outline" className="gap-1 text-xs">
                <ImageIcon className="h-3 w-3" />
                {journal.images.length}
              </Badge>
            )}
          </div>
          <h3 className="mt-1 font-semibold">{journal.title}</h3>
          <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{journal.content}</p>
        </div>
      ))}
    </div>
  )
}

function TradeCardList({ trades, onSelect }: { trades: Trade[]; onSelect: (t: Trade) => void }) {
  if (!trades.length) {
    return <div className="py-8 text-center text-muted-foreground">매매 내역이 없습니다</div>
  }
  return (
    <div className="divide-y">
      {trades.map((trade) => (
        <button
          key={trade.id}
          className="flex w-full items-center gap-3 overflow-hidden px-1 py-3 text-left transition-colors hover:bg-muted/30"
          onClick={() => onSelect(trade)}
        >
          <TickerLogo ticker={trade.ticker} className="h-10 w-10 shrink-0" />
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="font-mono text-sm font-semibold">{trade.ticker}</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${trade.position === 'BUY'
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-blue-300 bg-blue-50 text-blue-700'}`}
                >
                  {trade.position === 'BUY' ? '매수' : '매도'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-muted-foreground">{formatDate(trade.tradeDate)}</span>
                {trade.profit != null && (
                  <span className={`text-sm font-semibold tabular-nums ${trade.profit > 0 ? 'text-red-600' : trade.profit < 0 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                    {trade.profit > 0 ? '+' : '-'}${Math.abs(trade.profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {trade.reason || `${trade.quantity}주 · $${trade.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}

function TradeDetailModal({ trade, onClose }: { trade: Trade; onClose: () => void }) {
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    if (!trade.images.length) return
    const urls: string[] = []
    let cancelled = false

    Promise.all(
      trade.images.map((img) =>
        tradeImagesApi.fetchBlob(trade.id, img.id).then(({ data: blob }) => URL.createObjectURL(blob))
      )
    ).then((results) => {
      if (!cancelled) {
        urls.push(...results)
        setImageUrls(results)
      }
    }).catch(() => {})

    return () => {
      cancelled = true
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [trade.id, trade.images])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setCurrentImage((i) => Math.max(0, i - 1))
      if (e.key === 'ArrowRight') setCurrentImage((i) => Math.min(imageUrls.length - 1, i + 1))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, imageUrls.length])

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg max-h-[85vh] overflow-hidden rounded-xl border bg-background shadow-xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <TickerLogo ticker={trade.ticker} className="h-8 w-8 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-semibold">{trade.ticker}</h2>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${trade.position === 'BUY'
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-blue-300 bg-blue-50 text-blue-700'}`}
                  >
                    {trade.position === 'BUY' ? '매수' : '매도'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(trade.tradeDate)}</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-md p-1 hover:bg-muted ml-2 shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {imageUrls.length > 0 && (
              <div className="relative bg-muted">
                <img src={imageUrls[currentImage]} alt="" className="w-full max-h-80 object-contain" />
                {imageUrls.length > 1 && (
                  <>
                    {currentImage > 0 && (
                      <button
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
                        onClick={() => setCurrentImage((i) => i - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    )}
                    {currentImage < imageUrls.length - 1 && (
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
                        onClick={() => setCurrentImage((i) => i + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                      {imageUrls.map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 w-1.5 rounded-full ${i === currentImage ? 'bg-white' : 'bg-white/40'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="p-4 space-y-4">
              {trade.profit != null && (
                <div className="rounded-lg bg-muted/50 px-4 py-3 text-center">
                  <p className="text-xs text-muted-foreground">손익</p>
                  <p className={`text-2xl font-bold tabular-nums ${trade.profit > 0 ? 'text-red-600' : trade.profit < 0 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                    {trade.profit > 0 ? '+' : '-'}${Math.abs(trade.profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">수량</p>
                  <p className="font-medium">{trade.quantity}주</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">매입가</p>
                  <p className="font-medium tabular-nums">${trade.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
                {trade.exitPrice != null && (
                  <div>
                    <p className="text-xs text-muted-foreground">매도가</p>
                    <p className="font-medium tabular-nums">${trade.exitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                )}
                {trade.rating != null && (
                  <div>
                    <p className="text-xs text-muted-foreground">평가</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <Star
                          key={v}
                          className={`h-3.5 w-3.5 ${v <= trade.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {trade.reason && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">매매 메모</p>
                  <p className="mt-1 text-sm whitespace-pre-wrap leading-relaxed">{trade.reason}</p>
                </div>
              )}

              {trade.comment && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">회고</p>
                  <p className="mt-1 text-sm whitespace-pre-wrap leading-relaxed">{trade.comment}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
