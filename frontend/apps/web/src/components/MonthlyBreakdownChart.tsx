import { useQuery } from '@tanstack/react-query'
import type { MonthlyPnl } from '@buffett-diary/shared'
import { tradesApi } from '@/api/trades'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function MonthlyBreakdownChart() {
  const { data, isLoading } = useQuery<MonthlyPnl[]>({
    queryKey: ['monthlyPnl'],
    queryFn: () => tradesApi.monthlyPnl().then((r) => r.data),
  })

  if (isLoading) return <div className="text-sm text-muted-foreground">불러오는 중...</div>
  if (!data?.length) return <div className="text-sm text-muted-foreground">데이터가 없습니다</div>

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          tickFormatter={(v: number) => `$${v}`}
        />
        <Tooltip
          formatter={(value: number, _name: string, props: any) => {
            const item = props.payload as MonthlyPnl
            return [
              `$${value.toFixed(2)} (${item.tradeCount}건, 승률 ${item.winRate.toFixed(1)}%)`,
              '손익',
            ]
          }}
        />
        <Bar dataKey="totalProfit" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.totalProfit >= 0 ? '#16a34a' : '#dc2626'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
