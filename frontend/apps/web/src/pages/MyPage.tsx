import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Journal, Trade, FollowUser } from '@buffett-diary/shared'
import { useAuth } from '@/contexts/AuthContext'
import { usersApi } from '@/api/users'
import { followsApi } from '@/api/follows'
import { journalImagesApi } from '@/api/journals'
import { formatDate } from '@/lib/date'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ImageIcon, Settings, Grid3x3, BookOpen, X, LogOut } from 'lucide-react'
import EditProfileModal from '@/components/EditProfileModal'

type Tab = 'journals' | 'trades'

export default function MyPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('journals')
  const [editingProfile, setEditingProfile] = useState(false)
  const [followModal, setFollowModal] = useState<'followers' | 'following' | null>(null)

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
        {tab === 'journals' && <JournalGrid journals={journals?.content ?? []} />}
        {tab === 'trades' && <TradeList trades={trades?.content ?? []} />}
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
    </div>
  )
}

// --- Journal Grid ---
function JournalGrid({ journals }: { journals: Journal[] }) {
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
    <div className="grid grid-cols-3 gap-0.5">
      {journals.map((journal) => (
        <JournalGridItem key={journal.id} journal={journal} />
      ))}
    </div>
  )
}

function JournalGridItem({ journal }: { journal: Journal }) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const navigate = useNavigate()

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
      className="group relative aspect-square overflow-hidden bg-muted"
      onClick={() => navigate('/journals')}
    >
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center p-2">
          <span className="line-clamp-3 text-[11px] text-muted-foreground text-center leading-tight">{journal.title}</span>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="text-center text-white px-1.5">
          <p className="text-xs font-semibold line-clamp-2">{journal.title}</p>
          {journal.images.length > 1 && (
            <div className="mt-1 flex items-center justify-center gap-1 text-[10px]">
              <ImageIcon className="h-3 w-3" />
              {journal.images.length}
            </div>
          )}
        </div>
      </div>

      {journal.images.length > 1 && (
        <div className="absolute right-1 top-1">
          <ImageIcon className="h-3.5 w-3.5 text-white drop-shadow" />
        </div>
      )}
    </button>
  )
}

// --- Trade List ---
function TradeList({ trades }: { trades: Trade[] }) {
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
        <div key={trade.id} className="flex items-center justify-between px-1 py-3">
          <div className="flex items-center gap-2.5">
            <Badge
              variant="outline"
              className={`text-[10px] ${trade.position === 'BUY'
                ? 'border-red-300 bg-red-50 text-red-700'
                : 'border-blue-300 bg-blue-50 text-blue-700'}`}
            >
              {trade.position === 'BUY' ? '매수' : '매도'}
            </Badge>
            <div>
              <span className="font-mono text-sm font-semibold">{trade.ticker}</span>
              <span className="ml-2 text-xs text-muted-foreground">{formatDate(trade.tradeDate)}</span>
            </div>
          </div>
          <div className="text-right">
            {trade.profit != null ? (
              <span className={`text-sm font-semibold tabular-nums ${trade.profit > 0 ? 'text-red-600' : trade.profit < 0 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                {trade.profit > 0 ? '+' : ''}${trade.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">${trade.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            )}
          </div>
        </div>
      ))}
    </div>
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
