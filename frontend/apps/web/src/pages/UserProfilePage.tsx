import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Journal, Trade } from '@buffett-diary/shared'
import { useAuth } from '@/contexts/AuthContext'
import { usersApi } from '@/api/users'
import { followsApi } from '@/api/follows'
import { formatDate } from '@/lib/date'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ImageIcon, UserPlus, UserMinus, Grid3x3, BookOpen } from 'lucide-react'

type Tab = 'journals' | 'trades'

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const targetId = Number(userId)
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('journals')

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
          <TradeList trades={trades?.content ?? []} />
        )}
      </div>
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

function TradeList({ trades }: { trades: Trade[] }) {
  if (!trades.length) {
    return <div className="py-8 text-center text-muted-foreground">매매 내역이 없습니다</div>
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
