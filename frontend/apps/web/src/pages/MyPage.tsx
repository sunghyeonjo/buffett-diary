import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Journal, Trade, FollowUser } from '@buffett-diary/shared'
import { useAuth } from '@/contexts/AuthContext'
import { usersApi } from '@/api/users'
import { followsApi } from '@/api/follows'
import { journalImagesApi } from '@/api/journals'
import { tradeImagesApi } from '@/api/trades'
import { formatDate } from '@/lib/date'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TickerLogo } from '@/components/StockLogo'
import { ImageIcon, Settings, Grid3x3, BookOpen, X, LogOut, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import EditProfileModal from '@/components/EditProfileModal'
import TradeCommentSection from '@/components/TradeCommentSection'

type Tab = 'journals' | 'trades'

export default function MyPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('journals')
  const [editingProfile, setEditingProfile] = useState(false)
  const [followModal, setFollowModal] = useState<'followers' | 'following' | null>(null)
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)

  const userId = user?.id ?? 0

  const { data: profile } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => usersApi.profile(userId).then((r) => r.data),
    enabled: userId > 0,
  })

  const { data: journals } = useQuery({
    queryKey: ['userJournals', userId],
    queryFn: () => usersApi.journals(userId).then((r) => r.data),
    enabled: userId > 0 && tab === 'journals',
  })

  const { data: trades } = useQuery({
    queryKey: ['userTrades', userId],
    queryFn: () => usersApi.trades(userId).then((r) => r.data),
    enabled: userId > 0 && tab === 'trades',
  })

  if (!user) return null

  const initial = user.nickname.charAt(0).toUpperCase()

  return (
    <div className="mx-auto max-w-2xl">
      {/* Profile Header */}
      <div className="flex items-start gap-5 py-4 sm:gap-8">
        {/* Avatar */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary text-3xl font-bold text-primary-foreground sm:h-24 sm:w-24">
          {initial}
        </div>

        {/* Info */}
        <div className="flex-1 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold">{user.nickname}</h1>
            <Button variant="outline" size="sm" className="h-8" onClick={() => setEditingProfile(true)}>
              <Settings className="mr-1.5 h-3.5 w-3.5" />
              편집
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-muted-foreground md:hidden" onClick={logout}>
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Stats — clickable counts */}
          <div className="mt-3 flex gap-5 text-sm">
            <span>
              <strong>{journals?.totalElements ?? 0}</strong>
              <span className="ml-1 text-muted-foreground">게시물</span>
            </span>
            <button className="hover:opacity-70" onClick={() => setFollowModal('followers')}>
              <strong>{profile?.followerCount ?? 0}</strong>
              <span className="ml-1 text-muted-foreground">팔로워</span>
            </button>
            <button className="hover:opacity-70" onClick={() => setFollowModal('following')}>
              <strong>{profile?.followingCount ?? 0}</strong>
              <span className="ml-1 text-muted-foreground">팔로잉</span>
            </button>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <p className="mt-2.5 text-sm whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-y">
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
      <div className="py-1">
        {tab === 'journals' && <JournalCardList journals={journals?.content ?? []} onSelect={setSelectedJournal} />}
        {tab === 'trades' && <TradeCardList trades={trades?.content ?? []} onSelect={setSelectedTrade} />}
      </div>

      {/* Modals */}
      {editingProfile && (
        <EditProfileModal
          currentBio={profile?.bio ?? null}
          onClose={() => {
            setEditingProfile(false)
            queryClient.invalidateQueries({ queryKey: ['userProfile', userId] })
          }}
        />
      )}

      {followModal && (
        <FollowListModal
          userId={userId}
          type={followModal}
          onClose={() => setFollowModal(null)}
          onUserClick={(id) => {
            setFollowModal(null)
            navigate(`/users/${id}`)
          }}
        />
      )}

      {selectedJournal && (
        <JournalDetailModal
          journal={selectedJournal}
          onClose={() => setSelectedJournal(null)}
        />
      )}

      {selectedTrade && (
        <TradeDetailModal
          trade={selectedTrade}
          onClose={() => setSelectedTrade(null)}
        />
      )}
    </div>
  )
}

// --- Journal Card List ---
function JournalCardList({ journals, onSelect }: { journals: Journal[]; onSelect: (j: Journal) => void }) {
  const navigate = useNavigate()

  if (!journals.length) {
    return (
      <div className="py-16 text-center">
        <Grid3x3 className="mx-auto h-10 w-10 text-muted-foreground/30" />
        <p className="mt-3 text-muted-foreground">아직 투자일지가 없습니다</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/journals')}>
          일지 작성하기
        </Button>
      </div>
    )
  }

  return (
    <div className="divide-y">
      {journals.map((journal) => (
        <JournalCard key={journal.id} journal={journal} onClick={() => onSelect(journal)} />
      ))}
    </div>
  )
}

function JournalCard({ journal, onClick }: { journal: Journal; onClick: () => void }) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!journal.images.length) return
    let revoked = false
    journalImagesApi.fetchBlob(journal.id, journal.images[0].id).then(({ data: blob }) => {
      if (!revoked) setThumbnailUrl(URL.createObjectURL(blob))
    }).catch(() => {})
    return () => {
      revoked = true
      if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl)
    }
  }, [journal.id, journal.images]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <button
      className="flex w-full gap-3 px-1 py-3 text-left transition-colors hover:bg-muted/30"
      onClick={onClick}
    >
      {/* Thumbnail */}
      {thumbnailUrl && (
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md">
          <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold truncate">{journal.title}</h3>
          <span className="shrink-0 text-[11px] text-muted-foreground">{formatDate(journal.journalDate)}</span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{journal.content}</p>
        {journal.images.length > 0 && !thumbnailUrl && (
          <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <ImageIcon className="h-3 w-3" />
            {journal.images.length}
          </div>
        )}
      </div>
    </button>
  )
}

// --- Journal Detail Modal ---
function JournalDetailModal({ journal, onClose }: { journal: Journal; onClose: () => void }) {
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    if (!journal.images.length) return
    const urls: string[] = []
    let cancelled = false

    Promise.all(
      journal.images.map((img) =>
        journalImagesApi.fetchBlob(journal.id, img.id).then(({ data: blob }) => URL.createObjectURL(blob))
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
  }, [journal.id, journal.images])

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
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3 shrink-0">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold truncate">{journal.title}</h2>
              <p className="text-xs text-muted-foreground">{formatDate(journal.journalDate)}</p>
            </div>
            <button onClick={onClose} className="rounded-md p-1 hover:bg-muted ml-2 shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            {/* Image carousel */}
            {imageUrls.length > 0 && (
              <div className="relative bg-muted">
                <img
                  src={imageUrls[currentImage]}
                  alt=""
                  className="w-full max-h-80 object-contain"
                />
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

            {/* Content */}
            <div className="p-4">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{journal.content}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// --- Trade Card List ---
function TradeCardList({ trades, onSelect }: { trades: Trade[]; onSelect: (t: Trade) => void }) {
  const navigate = useNavigate()

  if (!trades.length) {
    return (
      <div className="py-16 text-center">
        <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/30" />
        <p className="mt-3 text-muted-foreground">아직 매매 내역이 없습니다</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/trades')}>
          매매 기록하기
        </Button>
      </div>
    )
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
              <span className="text-[11px] text-muted-foreground shrink-0">{formatDate(trade.tradeDate)}</span>
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

// --- Trade Detail Modal ---
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
          {/* Header */}
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

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">
            {/* Image carousel */}
            {imageUrls.length > 0 && (
              <div className="relative bg-muted">
                <img
                  src={imageUrls[currentImage]}
                  alt=""
                  className="w-full max-h-80 object-contain"
                />
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

            {/* Trade details */}
            <div className="p-4 space-y-4">
              {/* P&L */}
              {trade.profit != null && (
                <div className="rounded-lg bg-muted/50 px-4 py-3 text-center">
                  <p className="text-xs text-muted-foreground">손익</p>
                  <p className={`text-2xl font-bold tabular-nums ${trade.profit > 0 ? 'text-red-600' : trade.profit < 0 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                    {trade.profit > 0 ? '+' : trade.profit < 0 ? '-' : ''}${Math.abs(trade.profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}

              {/* Info grid */}
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

              {/* Reason */}
              {trade.reason && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">매매 메모</p>
                  <p className="mt-1 text-sm whitespace-pre-wrap leading-relaxed">{trade.reason}</p>
                </div>
              )}

              {/* Comments */}
              <TradeCommentSection tradeId={trade.id} canComment />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// --- Follower/Following Modal ---
function FollowListModal({
  userId,
  type,
  onClose,
  onUserClick,
}: {
  userId: number
  type: 'followers' | 'following'
  onClose: () => void
  onUserClick: (id: number) => void
}) {
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['followList', userId, type],
    queryFn: () =>
      (type === 'followers' ? followsApi.followers(userId) : followsApi.following(userId))
        .then((r) => r.data),
  })

  const unfollowMutation = useMutation({
    mutationFn: (targetId: number) => followsApi.unfollow(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followList'] })
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
    },
  })

  const followMutation = useMutation({
    mutationFn: (targetId: number) => followsApi.follow(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followList'] })
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
    },
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm overflow-hidden rounded-xl border bg-background shadow-xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-sm font-semibold">{type === 'followers' ? '팔로워' : '팔로잉'}</h2>
            <button onClick={onClose} className="rounded-md p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {!data?.content.length ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                {type === 'followers' ? '아직 팔로워가 없습니다' : '아직 팔로우하는 유저가 없습니다'}
              </div>
            ) : (
              data.content.map((u: FollowUser) => (
                <div key={u.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/50">
                  <button className="flex items-center gap-3 min-w-0" onClick={() => onUserClick(u.id)}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-muted-foreground/20 to-muted text-xs font-bold">
                      {u.nickname.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-sm font-semibold truncate">{u.nickname}</p>
                      {u.bio && <p className="text-xs text-muted-foreground truncate">{u.bio}</p>}
                    </div>
                  </button>
                  {u.id !== userId && (
                    u.isFollowing ? (
                      <Button variant="outline" size="sm" className="ml-3 h-7 shrink-0 text-xs" onClick={() => unfollowMutation.mutate(u.id)} disabled={unfollowMutation.isPending}>
                        팔로잉
                      </Button>
                    ) : (
                      <Button size="sm" className="ml-3 h-7 shrink-0 text-xs" onClick={() => followMutation.mutate(u.id)} disabled={followMutation.isPending}>
                        팔로우
                      </Button>
                    )
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
