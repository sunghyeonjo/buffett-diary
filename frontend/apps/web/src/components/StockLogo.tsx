import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Stock } from '@buffett-diary/shared'
import { stocksApi } from '@/api/stocks'
import { cn } from '@/lib/utils'

/** Render logo from a Stock object directly */
export function StockLogo({ stock, className }: { stock: Stock; className?: string }) {
  const [error, setError] = useState(false)
  const size = className ?? 'h-6 w-6'

  if (!stock.logoUrl || error) {
    return (
      <span className={cn('flex shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold', size)}>
        {stock.ticker[0]}
      </span>
    )
  }

  return (
    <img
      src={stock.logoUrl}
      alt={stock.ticker}
      className={cn('shrink-0 rounded-full', size)}
      onError={() => setError(true)}
    />
  )
}

/** Render logo by ticker (fetches stock data automatically) */
export function TickerLogo({ ticker, className }: { ticker: string; className?: string }) {
  const { data: results } = useQuery({
    queryKey: ['stock-logo', ticker],
    queryFn: () => stocksApi.search(ticker).then((r) => r.data),
    staleTime: Infinity,
  })

  const stock = results?.find((s) => s.ticker === ticker)
  const size = className ?? 'h-6 w-6'

  if (!stock) {
    return (
      <span className={cn('flex shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold', size)}>
        {ticker[0]}
      </span>
    )
  }

  return <StockLogo stock={stock} className={className} />
}
