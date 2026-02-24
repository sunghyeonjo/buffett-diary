import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import type { Trade, TradeFilter } from '@buffett-diary/shared'
import dayjs from 'dayjs'
import { tradesApi } from '@/api/trades'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { POPULAR_TICKERS } from '@/lib/tickers'

const columnHelper = createColumnHelper<Trade>()

export default function TradeListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<TradeFilter>({ page: 0, size: 20 })

  const { data, isLoading } = useQuery({
    queryKey: ['trades', filter],
    queryFn: () => tradesApi.list(filter).then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: tradesApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trades'] }),
  })

  const columns = [
    columnHelper.accessor('tradeDate', {
      header: '날짜',
      cell: (info) => dayjs(info.getValue()).format('YYYY-MM-DD'),
    }),
    columnHelper.accessor('ticker', {
      header: '종목',
      cell: (info) => <span className="font-mono font-semibold">{info.getValue()}</span>,
    }),
    columnHelper.accessor('position', {
      header: '구분',
      cell: (info) => (
        <Badge
          variant="outline"
          className={info.getValue() === 'BUY'
            ? 'border-red-300 bg-red-50 text-red-700'
            : 'border-blue-300 bg-blue-50 text-blue-700'}
        >
          {info.getValue() === 'BUY' ? '매수' : '매도'}
        </Badge>
      ),
    }),
    columnHelper.accessor('quantity', {
      header: '수량',
      cell: (info) => {
        const v = info.getValue()
        return Number.isInteger(v) ? v : v.toFixed(6).replace(/\.?0+$/, '')
      },
    }),
    columnHelper.accessor('entryPrice', {
      header: '단가($)',
      cell: (info) => `$${info.getValue().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    }),
    columnHelper.accessor('profit', {
      header: '손익',
      cell: (info) => {
        const v = info.getValue()
        if (v == null) return <span className="text-muted-foreground">-</span>
        const formatted = Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        if (v > 0) return <span className="font-semibold text-red-600">+${formatted}</span>
        if (v < 0) return <span className="font-semibold text-blue-600">-${formatted}</span>
        return <span className="text-muted-foreground">$0.00</span>
      },
    }),
    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/trades/${row.original.id}/edit`)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm('이 매매를 삭제하시겠습니까?')) deleteMutation.mutate(row.original.id)
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data: data?.content ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">매매 내역</h1>
        <Link to="/trades/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            새 매매
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Input
          type="date"
          placeholder="Start date"
          className="w-auto"
          onChange={(e) => setFilter((f) => ({ ...f, startDate: e.target.value || undefined }))}
        />
        <Input
          type="date"
          placeholder="End date"
          className="w-auto"
          onChange={(e) => setFilter((f) => ({ ...f, endDate: e.target.value || undefined }))}
        />
        <Input
          placeholder="종목 검색"
          className="w-32"
          list="ticker-filter-list"
          onChange={(e) =>
            setFilter((f) => ({ ...f, ticker: e.target.value.toUpperCase() || undefined }))
          }
        />
        <datalist id="ticker-filter-list">
          {POPULAR_TICKERS.map((t) => (
            <option key={t.ticker} value={t.ticker}>
              {t.ticker} - {t.name}
            </option>
          ))}
        </datalist>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">매매 내역을 불러오는 중...</div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => (
                      <TableHead key={h.id}>
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center">
                      매매 내역이 없습니다
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={filter.page === 0}
                onClick={() => setFilter((f) => ({ ...f, page: (f.page ?? 0) - 1 }))}
              >
                이전
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {(filter.page ?? 0) + 1} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={(filter.page ?? 0) >= data.totalPages - 1}
                onClick={() => setFilter((f) => ({ ...f, page: (f.page ?? 0) + 1 }))}
              >
                다음
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
