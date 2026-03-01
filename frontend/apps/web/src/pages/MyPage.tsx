import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Journal, Trade, FollowUser } from '@buffett-diary/shared'
import { useAuth } from '@/contexts/AuthContext'
import { usersApi } from '@/api/users'
import { followsApi } from '@/api/follows'
import { journalImagesApi } from '@/api/journals'
import { feedApi } from '@/api/feed'
import { formatDate } from '@/lib/date'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, ImageIcon, Settings, Grid3x3, BookOpen, Users, Rss, UserPlus, UserMinus, X } from 'lucide-react'
import EditProfileModal from '@/components/EditProfileModal'

type Tab = 'journals' | 'trades' | 'feed'

export default function MyPage() {
  const { user } = useAuth()
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

  const { data: feed } = useQuery({
    queryKey: ['feed', 0],
    queryFn: () => feedApi.list(0, 20).then((r) => r.data),
    enabled: tab === 'feed',
  })

  if (!user) return null

  const initial = user.nickname.charAt(0).toUpperCase()

  return (
    <div className="mx-auto max-w-2xl">
      {/* Profile Header — Instagram style */}
      <div className="flex items-center gap-6 px-4 py-6 sm:gap-10">
        {/* Avatar */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary text-3xl font-bold text-primary-foreground sm:h-24 sm:w-24">
          {initial}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{user.nickname}</h1>
            <Button variant="outline" size="sm" onClick={() => setEditingProfile(true)}>
              <Settings className="mr-1.5 h-3.5 w-3.5" />
              프로필 편집
            </Button>
          </div>

          {/* Stats row */}
          <div className="mt-4 flex gap-6 text-sm">
            <div className="text-center">
              <span className="font-semibold">{journals?.totalElements ?? 0}</span>
              <span className="ml-1 text-muted-foreground">게시물</span>
            </div>
            <button className="text-center hover:opacity-70" onClick={() => setFollowModal('followers')}>
              <span className="font-semibold">{profile?.followerCount ?? 0}</span>
              <span className="ml-1 text-muted-foreground">팔로워</span>
            </button>
            <button className="text-center hover:opacity-70" onClick={() => setFollowModal('following')}>
              <span className="font-semibold">{profile?.followingCount ?? 0}</span>
              <span className="ml-1 text-muted-foreground">팔로잉</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bio */}
      {profile?.bio && (
        <div className="px-4 pb-4">
          <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>
        </div>
      )}

      {/* Tabs — icon style like Instagram */}
      <div className="flex border-t">
        {([
          { key: 'journals' as const, icon: Grid3x3, label: '투자일지' },
          { key: 'trades' as const, icon: BookOpen, label: '매매 내역' },
          { key: 'feed' as const, icon: Rss, label: '피드' },
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
        {tab === 'journals' && <JournalGrid journals={journals?.content ?? []} />}
        {tab === 'trades' && <TradeList trades={trades?.content ?? []} />}
        {tab === 'feed' && <FeedList feed={feed?.content ?? []} onAuthorClick={(id) => navigate(`/users/${id}`)} />}
      </div>

      {/* Edit Profile Modal */}
      {editingProfile && (
        <EditProfileModal
          currentBio={profile?.bio ?? null}
          onClose={() => {
            setEditingProfile(false)
            queryClient.invalidateQueries({ queryKey: ['userProfile', userId] })
          }}
        />
      )}

      {/* Follower/Following Modal */}
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

// --- Journal Grid (Instagram-style thumbnail grid) ---
function JournalGrid({ journals }: { journals: Journal[] }) {
  if (!journals.length) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <Grid3x3 className="mx-auto h-12 w-12 opacity-30" />
        <p className="mt-3 text-lg font-light">아직 투자일지가 없습니다</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-1">
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
          <span className="line-clamp-3 text-xs text-muted-foreground text-center">{journal.title}</span>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="text-center text-white">
          <p className="text-xs font-semibold line-clamp-2 px-1">{journal.title}</p>
          {journal.images.length > 1 && (
            <div className="mt-1 flex items-center justify-center gap-1 text-xs">
              <ImageIcon className="h-3 w-3" />
              {journal.images.length}
            </div>
          )}
        </div>
      </div>

      {/* Multi-image indicator */}
      {journal.images.length > 1 && (
        <div className="absolute right-1.5 top-1.5">
          <ImageIcon className="h-4 w-4 text-white drop-shadow" />
        </div>
      )}
    </button>
  )
}

// --- Trade List ---
function TradeList({ trades }: { trades: Trade[] }) {
  if (!trades.length) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <BookOpen className="mx-auto h-12 w-12 opacity-30" />
        <p className="mt-3 text-lg font-light">아직 매매 내역이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="grid gap-2 px-1 py-2">
      {trades.map((trade) => (
        <div key={trade.id} className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={trade.position === 'BUY'
                ? 'border-red-300 bg-red-50 text-red-700'
                : 'border-blue-300 bg-blue-50 text-blue-700'}
            >
              {trade.position === 'BUY' ? '매수' : '매도'}
            </Badge>
            <div>
              <span className="font-mono font-semibold text-sm">{trade.ticker}</span>
              <span className="ml-2 text-xs text-muted-foreground">{formatDate(trade.tradeDate)}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">${trade.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            {trade.profit != null && (
              <div className={`text-sm font-semibold ${trade.profit > 0 ? 'text-red-600' : trade.profit < 0 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                {trade.profit > 0 ? '+' : ''}${Math.abs(trade.profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// --- Feed List ---
function FeedList({ feed, onAuthorClick }: { feed: { type: string; journal?: Journal | null; trade?: Trade | null; author: { id: number; nickname: string }; createdAt: string }[]; onAuthorClick: (id: number) => void }) {
  if (!feed.length) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        <Rss className="mx-auto h-12 w-12 opacity-30" />
        <p className="mt-3 text-lg font-light">피드가 비어 있습니다</p>
        <p className="mt-1 text-sm">다른 투자자를 팔로우해보세요</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3 px-1 py-2">
      {feed.map((item, i) => {
        if (item.type === 'journal' && item.journal) {
          return (
            <div key={`j-${item.journal.id}-${i}`} className="rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm">
                <button className="font-semibold hover:underline" onClick={() => onAuthorClick(item.author.id)}>
                  {item.author.nickname}
                </button>
                <span className="text-muted-foreground">{formatDate(item.journal.journalDate)}</span>
              </div>
              <h3 className="mt-1.5 font-semibold">{item.journal.title}</h3>
              <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{item.journal.content}</p>
            </div>
          )
        }
        if (item.type === 'trade' && item.trade) {
          return (
            <div key={`t-${item.trade.id}-${i}`} className="rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm">
                <button className="font-semibold hover:underline" onClick={() => onAuthorClick(item.author.id)}>
                  {item.author.nickname}
                </button>
                <Badge
                  variant="outline"
                  className={item.trade.position === 'BUY'
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-blue-300 bg-blue-50 text-blue-700'}
                >
                  {item.trade.position === 'BUY' ? '매수' : '매도'}
                </Badge>
                <span className="font-mono font-semibold">{item.trade.ticker}</span>
                <span className="text-muted-foreground">{formatDate(item.trade.tradeDate)}</span>
              </div>
              {item.trade.reason && (
                <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{item.trade.reason}</p>
              )}
            </div>
          )
        }
        return null
      })}
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
      (type === 'followers'
        ? followsApi.followers(userId)
        : followsApi.following(userId)
      ).then((r) => r.data),
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
        <div className="w-full max-w-sm rounded-xl border bg-background shadow-xl" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="text-base font-semibold">
              {type === 'followers' ? '팔로워' : '팔로잉'}
            </h2>
            <button onClick={onClose} className="rounded-md p-1 hover:bg-muted">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {!data?.content.length ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {type === 'followers' ? '아직 팔로워가 없습니다' : '아직 팔로우하는 유저가 없습니다'}
              </div>
            ) : (
              data.content.map((u: FollowUser) => (
                <div key={u.id} className="flex items-center justify-between px-4 py-2.5">
                  <button
                    className="flex items-center gap-3 hover:opacity-70"
                    onClick={() => onUserClick(u.id)}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                      {u.nickname.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold">{u.nickname}</p>
                      {u.bio && <p className="text-xs text-muted-foreground line-clamp-1">{u.bio}</p>}
                    </div>
                  </button>
                  {u.id !== userId && (
                    u.isFollowing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => unfollowMutation.mutate(u.id)}
                        disabled={unfollowMutation.isPending}
                      >
                        팔로잉
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => followMutation.mutate(u.id)}
                        disabled={followMutation.isPending}
                      >
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
