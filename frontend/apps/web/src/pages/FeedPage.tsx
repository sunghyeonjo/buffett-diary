import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import type { FeedItem } from '@buffett-diary/shared'
import { feedApi } from '@/api/feed'
import { formatDate } from '@/lib/date'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ImageIcon } from 'lucide-react'

export default function FeedPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['feed', page],
    queryFn: () => feedApi.list(page).then((r) => r.data),
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">피드</h1>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">피드를 불러오는 중...</div>
      ) : !data?.content.length ? (
        <div className="py-16 text-center text-muted-foreground">
          <p className="text-lg">피드가 비어 있습니다</p>
          <p className="mt-1 text-sm">다른 투자자를 팔로우하면 여기에 업데이트가 표시됩니다</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/search')}>
            투자자 찾기
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-3">
            {data.content.map((item, i) => (
              <FeedCard key={`${item.type}-${item.createdAt}-${i}`} item={item} onAuthorClick={(id) => navigate(`/users/${id}`)} />
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                이전
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {data.totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= data.totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                다음
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function FeedCard({ item, onAuthorClick }: { item: FeedItem; onAuthorClick: (id: number) => void }) {
  if (item.type === 'journal' && item.journal) {
    const journal = item.journal
    return (
      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-2 text-sm">
          <button
            className="font-semibold hover:underline"
            onClick={() => onAuthorClick(item.author.id)}
          >
            {item.author.nickname}
          </button>
          <span className="text-muted-foreground">투자일지</span>
          <span className="text-muted-foreground">{formatDate(journal.journalDate)}</span>
          {journal.images.length > 0 && (
            <Badge variant="outline" className="gap-1 text-xs">
              <ImageIcon className="h-3 w-3" />
              {journal.images.length}
            </Badge>
          )}
        </div>
        <h3 className="mt-2 font-semibold">{journal.title}</h3>
        <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{journal.content}</p>
      </div>
    )
  }

  if (item.type === 'trade' && item.trade) {
    const trade = item.trade
    return (
      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-2 text-sm">
          <button
            className="font-semibold hover:underline"
            onClick={() => onAuthorClick(item.author.id)}
          >
            {item.author.nickname}
          </button>
          <span className="text-muted-foreground">매매</span>
          <span className="text-muted-foreground">{formatDate(trade.tradeDate)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={trade.position === 'BUY'
                ? 'border-red-300 bg-red-50 text-red-700'
                : 'border-blue-300 bg-blue-50 text-blue-700'}
            >
              {trade.position === 'BUY' ? '매수' : '매도'}
            </Badge>
            <span className="font-mono font-semibold">{trade.ticker}</span>
          </div>
          <div className="text-right">
            <div className="text-sm">${trade.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            {trade.profit != null && (
              <div className={`text-sm font-semibold ${trade.profit > 0 ? 'text-red-600' : trade.profit < 0 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                {trade.profit > 0 ? '+' : ''}{trade.profit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
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
