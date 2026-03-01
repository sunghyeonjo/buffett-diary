import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { usersApi } from '@/api/users'
import { followsApi } from '@/api/follows'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">탐색</h1>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="닉네임으로 검색"
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={!query.trim()}>검색</Button>
      </form>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">검색 중...</div>
      ) : searchQuery && !data?.content.length ? (
        <div className="py-8 text-center text-muted-foreground">검색 결과가 없습니다</div>
      ) : data?.content.length ? (
        <div className="grid gap-3">
          {data.content.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div
                className="min-w-0 flex-1 cursor-pointer"
                onClick={() => navigate(`/users/${u.id}`)}
              >
                <p className="font-semibold">{u.nickname}</p>
                {u.bio && <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">{u.bio}</p>}
              </div>
              {user?.id !== u.id && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-3 shrink-0"
                  onClick={() => {
                    // We need to check follow status — for now just navigate
                    navigate(`/users/${u.id}`)
                  }}
                >
                  프로필 보기
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : !searchQuery ? (
        <div className="py-16 text-center text-muted-foreground">
          <p className="text-lg">다른 투자자를 찾아보세요</p>
          <p className="mt-1 text-sm">닉네임으로 검색하여 팔로우하고 투자 인사이트를 공유하세요</p>
        </div>
      ) : null}
    </div>
  )
}
