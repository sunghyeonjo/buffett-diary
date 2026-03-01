import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { usersApi } from '@/api/users'
import { followsApi } from '@/api/follows'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function UserSearchPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['userSearch', searchQuery],
    queryFn: () => usersApi.search(searchQuery).then((r) => r.data),
    enabled: searchQuery.length > 0,
  })

  const followMutation = useMutation({
    mutationFn: (userId: number) => followsApi.follow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSearch'] })
    },
  })

  const unfollowMutation = useMutation({
    mutationFn: (userId: number) => followsApi.unfollow(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSearch'] })
    },
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchQuery(query.trim())
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="닉네임으로 투자자 검색"
          className="pl-9 pr-16"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!query.trim()}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7"
        >
          검색
        </Button>
      </form>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">검색 중...</div>
      ) : searchQuery && !data?.content.length ? (
        <div className="py-8 text-center text-sm text-muted-foreground">검색 결과가 없습니다</div>
      ) : data?.content.length ? (
        <div className="divide-y">
          {data.content.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between py-3 px-1"
            >
              <button
                className="flex items-center gap-3 min-w-0"
                onClick={() => navigate(u.id === user?.id ? '/mypage' : `/users/${u.id}`)}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary text-sm font-bold text-primary-foreground">
                  {u.nickname.charAt(0).toUpperCase()}
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-semibold truncate">{u.nickname}</p>
                  {u.bio && <p className="text-xs text-muted-foreground truncate">{u.bio}</p>}
                </div>
              </button>
              {user?.id !== u.id && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-3 shrink-0 h-8 text-xs"
                  onClick={() => navigate(`/users/${u.id}`)}
                >
                  프로필 보기
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : !searchQuery ? (
        <div className="py-20 text-center">
          <Users className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 font-medium">다른 투자자를 찾아보세요</p>
          <p className="mt-1 text-sm text-muted-foreground">닉네임으로 검색하여 팔로우하고 투자 인사이트를 공유하세요</p>
        </div>
      ) : null}
    </div>
  )
}
