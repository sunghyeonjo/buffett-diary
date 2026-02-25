import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { TradeStats } from '@buffett-diary/shared'
import { tradesApi } from '@/api/trades'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Period = 'today' | 'week' | 'month' | 'year' | 'all'

const TABS: { label: string; period: Period }[] = [
  { label: '오늘', period: 'today' },
  { label: '이번 주', period: 'week' },
  { label: '이번 달', period: 'month' },
  { label: '올해', period: 'year' },
  { label: '전체', period: 'all' },
]

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

function formatProfit(value: number): string {
  return value >= 0 ? `+$${value.toFixed(2)}` : `-$${Math.abs(value).toFixed(2)}`
}

function StatsSection({ period }: { period: Period }) {
  const { data: stats, isLoading } = useQuery<TradeStats>({
    queryKey: ['stats', period],
    queryFn: () => tradesApi.stats(period).then((r) => r.data),
  })

  if (isLoading) return <div className="text-sm text-muted-foreground">불러오는 중...</div>
  if (!stats) return null

  const closedCount = stats.winCount + stats.lossCount

  return (
    <div className="space-y-4">
      {/* Hero card: 총 손익 + 승률 */}
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm font-medium text-muted-foreground">총 손익</p>
          <p className={`text-4xl font-bold tracking-tight ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatProfit(stats.totalProfit)}
          </p>
          {closedCount > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              승률 {stats.winRate.toFixed(1)}% · {stats.winCount}승 {stats.lossCount}패
            </p>
          )}
        </CardContent>
      </Card>

      {/* 거래 건수: 총 / 매수 / 매도 */}
      <div className="grid gap-4 grid-cols-3">
        <StatCard title="총 거래" value={`${stats.totalTrades}건`} />
        <StatCard title="매수" value={`${stats.buyCount ?? 0}건`} />
        <StatCard title="매도" value={`${stats.sellCount ?? 0}건`} />
      </div>

      {/* 수익 상세 */}
      <div className="grid gap-4 grid-cols-3">
        <StatCard
          title="평균 수익"
          value={closedCount > 0 ? `$${stats.averageProfit.toFixed(2)}` : '-'}
        />
        <StatCard
          title="최고 거래"
          value={closedCount > 0 ? formatProfit(stats.bestTrade) : '-'}
        />
        <StatCard
          title="최저 거래"
          value={closedCount > 0 ? formatProfit(stats.worstTrade) : '-'}
        />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [activePeriod, setActivePeriod] = useState<Period>('today')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">대시보드</h1>
      <div className="flex gap-1 rounded-lg border bg-muted p-1">
        {TABS.map((tab) => (
          <button
            key={tab.period}
            onClick={() => setActivePeriod(tab.period)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activePeriod === tab.period
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <StatsSection period={activePeriod} />
    </div>
  )
}
