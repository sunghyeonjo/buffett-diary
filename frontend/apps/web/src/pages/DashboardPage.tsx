import { useQuery } from '@tanstack/react-query'
import type { TradeStats } from '@buffett-diary/shared'
import { tradesApi } from '@/api/trades'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function StatCard({ title, value, sub }: { title: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function StatsSection({ title, period }: { title: string; period: 'today' | 'month' | 'all' }) {
  const { data: stats, isLoading } = useQuery<TradeStats>({
    queryKey: ['stats', period],
    queryFn: () => tradesApi.stats(period).then((r) => r.data),
  })

  if (isLoading) return <div className="text-sm text-muted-foreground">{title} 불러오는 중...</div>
  if (!stats) return null

  const profitStr = stats.totalProfit >= 0
    ? `+$${stats.totalProfit.toFixed(2)}`
    : `-$${Math.abs(stats.totalProfit).toFixed(2)}`

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="총 거래" value={stats.totalTrades} />
        <StatCard
          title="승률"
          value={stats.totalTrades > 0 ? `${stats.winRate.toFixed(1)}%` : '-'}
          sub={`${stats.winCount}승 / ${stats.lossCount}패`}
        />
        <StatCard title="총 손익" value={profitStr} />
        <StatCard
          title="평균 수익"
          value={stats.totalTrades > 0 ? `$${stats.averageProfit.toFixed(2)}` : '-'}
        />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">대시보드</h1>
      <StatsSection title="오늘" period="today" />
      <StatsSection title="이번 달" period="month" />
      <StatsSection title="전체" period="all" />
    </div>
  )
}
