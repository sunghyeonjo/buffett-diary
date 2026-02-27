import { useCallback, useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import type { Trade, TradeFilter } from '@buffett-diary/shared'
import dayjs from 'dayjs'
import { tradesApi, tradeImagesApi } from '@/api/trades'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Pencil, Trash2, ImageIcon, X, Download, ChevronLeft, ChevronRight, List } from 'lucide-react'
import { TickerCombobox } from '@/components/TickerCombobox'
import TradeFormModal from '@/components/TradeFormModal'
import BulkTradeModal from '@/components/BulkTradeModal'
import TradeForm from '@/components/TradeForm'
import { TickerLogo } from '@/components/StockLogo'

const columnHelper = createColumnHelper<Trade>()

const INITIAL_FILTER: TradeFilter = { page: 0, size: 20 }

// --- Image Viewer ---

function ImageViewer({
  images,
  initialIndex,
  onClose,
}: {
  images: { fileName: string; url: string }[]
  initialIndex: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(initialIndex)
  const current = images[index]

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setIndex((i) => (i > 0 ? i - 1 : i))
      if (e.key === 'ArrowRight') setIndex((i) => (i < images.length - 1 ? i + 1 : i))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [images.length, onClose])

  const handleDownload = () => {
    const a = document.createElement('a')
    a.href = current.url
    a.download = current.fileName
    a.click()
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/90" onClick={onClose}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-sm">
          {current.fileName}
          <span className="ml-2 text-white/60">{index + 1} / {images.length}</span>
        </span>
        <div className="flex items-center gap-1">
          <button onClick={handleDownload} className="rounded-md p-2 hover:bg-white/10" title="다운로드">
            <Download className="h-5 w-5" />
          </button>
          <button onClick={onClose} className="rounded-md p-2 hover:bg-white/10" title="닫기">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div className="relative flex flex-1 items-center justify-center px-12" onClick={(e) => e.stopPropagation()}>
        {images.length > 1 && index > 0 && (
          <button
            onClick={() => setIndex((i) => i - 1)}
            className="absolute left-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        <img
          src={current.url}
          alt={current.fileName}
          className="max-h-[calc(100vh-8rem)] max-w-full object-contain"
        />

        {images.length > 1 && index < images.length - 1 && (
          <button
            onClick={() => setIndex((i) => i + 1)}
            className="absolute right-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  )
}

// --- Detail Side Panel ---

function TradeDetailPanel({ trade, onClose, onSaved }: { trade: Trade; onClose: () => void; onSaved: () => void }) {
  const [imageUrls, setImageUrls] = useState<Map<number, string>>(new Map())
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [editing, setEditing] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const loadImages = useCallback(async () => {
    if (!trade.images?.length) return
    const urls = new Map<number, string>()
    for (const img of trade.images) {
      try {
        const { data: blob } = await tradeImagesApi.fetchBlob(trade.id, img.id)
        urls.set(img.id, URL.createObjectURL(blob))
      } catch { /* skip */ }
    }
    setImageUrls(urls)
  }, [trade.id, trade.images])

  useEffect(() => {
    loadImages()
    return () => {
      imageUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [loadImages]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close on Escape (only when viewer is not open)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewerIndex === null) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, viewerIndex])

  const profitDisplay = () => {
    if (trade.profit == null) return null
    const v = trade.profit
    const formatted = Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    if (v > 0) return <span className="font-semibold text-red-600">+${formatted}</span>
    if (v < 0) return <span className="font-semibold text-blue-600">-${formatted}</span>
    return <span className="text-muted-foreground">$0.00</span>
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l bg-background shadow-xl transition-transform duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-3">
            <TickerLogo ticker={trade.ticker} className="h-8 w-8" />
            <div>
              <h2 className="text-lg font-semibold font-mono">{trade.ticker}</h2>
              <p className="text-sm text-muted-foreground">{dayjs(trade.tradeDate).format('YYYY-MM-DD')}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {editing ? (
          /* Inline Edit Form */
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <TradeForm
              tradeId={trade.id}
              compact
              onCancel={() => setEditing(false)}
              onSaved={onSaved}
            />
          </div>
        ) : (
          <>
            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Summary */}
              <div className="divide-y text-sm">
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">구분</span>
                  <Badge
                    variant="outline"
                    className={trade.position === 'BUY'
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-blue-300 bg-blue-50 text-blue-700'}
                  >
                    {trade.position === 'BUY' ? '매수' : '매도'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">수량</span>
                  <span className="font-medium">
                    {Number.isInteger(trade.quantity) ? trade.quantity : trade.quantity.toFixed(6).replace(/\.?0+$/, '')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">{trade.position === 'SELL' ? '매도가' : '매수가'}</span>
                  <span className="font-medium">${trade.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {trade.profit != null && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">손익</span>
                    <span className="font-medium">{profitDisplay()}</span>
                  </div>
                )}
              </div>

              {/* Memo */}
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">매매 사유</h3>
                {trade.reason ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{trade.reason}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">작성된 메모가 없습니다</p>
                )}
              </div>

              {/* Image Gallery */}
              {trade.images && trade.images.length > 0 && (() => {
                const selectedImg = trade.images[selectedImageIndex]
                const selectedUrl = selectedImg ? imageUrls.get(selectedImg.id) : undefined
                return (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                      첨부파일 ({trade.images.length})
                    </h3>

                    {/* Main preview */}
                    <div
                      className="cursor-pointer overflow-hidden rounded-lg border bg-muted/30"
                      onClick={() => selectedUrl && setViewerIndex(selectedImageIndex)}
                    >
                      <div className="aspect-[4/3]">
                        {selectedUrl ? (
                          <img src={selectedUrl} alt={selectedImg.fileName} className="h-full w-full object-contain" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <span className="text-xs text-muted-foreground">...</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Thumbnail strip */}
                    {trade.images.length > 1 && (
                      <div className="mt-2 flex gap-2">
                        {trade.images.map((img, i) => {
                          const url = imageUrls.get(img.id)
                          return (
                            <button
                              key={img.id}
                              onClick={() => setSelectedImageIndex(i)}
                              className={`h-12 w-12 shrink-0 overflow-hidden rounded-md border transition-all ${
                                i === selectedImageIndex
                                  ? 'ring-2 ring-primary'
                                  : 'opacity-50 hover:opacity-100'
                              }`}
                            >
                              {url ? (
                                <img src={url} alt={img.fileName} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full items-center justify-center bg-muted">
                                  <span className="text-[10px] text-muted-foreground">...</span>
                                </div>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Footer */}
            <div className="border-t px-5 py-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setEditing(true)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                수정하기
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Image Viewer */}
      {viewerIndex !== null && trade.images && (() => {
        const viewerImages = trade.images
          .map((img) => ({ fileName: img.fileName, url: imageUrls.get(img.id) }))
          .filter((item): item is { fileName: string; url: string } => !!item.url)
        return viewerImages.length > 0 ? (
          <ImageViewer
            images={viewerImages}
            initialIndex={Math.min(viewerIndex, viewerImages.length - 1)}
            onClose={() => setViewerIndex(null)}
          />
        ) : null
      })()}
    </>
  )
}

// --- Main Page ---

export default function TradeListPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<TradeFilter>(INITIAL_FILTER)
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [formTradeId, setFormTradeId] = useState<number | 'new' | null>(null)
  const [bulkOpen, setBulkOpen] = useState(false)

  const [period, setPeriod] = useState('')
  const [ticker, setTicker] = useState('')
  const [position, setPosition] = useState('')

  const updateFilter = (patch: Partial<TradeFilter>) => {
    setFilter((f) => ({ ...f, ...patch, page: 0 }))
  }

  const periodToDates = (p: string): { startDate?: string; endDate?: string } => {
    if (!p) return { startDate: undefined, endDate: undefined }
    const today = dayjs()
    const end = today.format('YYYY-MM-DD')
    if (p === 'today') return { startDate: end, endDate: end }
    if (p === 'week') return { startDate: today.startOf('week').add(1, 'day').format('YYYY-MM-DD'), endDate: end }
    if (p === 'month') return { startDate: today.startOf('month').format('YYYY-MM-DD'), endDate: end }
    return { startDate: undefined, endDate: undefined }
  }

  const resetFilters = () => {
    setPeriod('')
    setTicker('')
    setPosition('')
    setFilter(INITIAL_FILTER)
  }

  const hasActiveFilters = period || ticker || position

  const { data, isLoading } = useQuery({
    queryKey: ['trades', filter],
    queryFn: () => tradesApi.list(filter).then((r) => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: tradesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] })
      setSelectedTrade(null)
    },
  })

  const columns = [
    columnHelper.accessor('tradeDate', {
      header: '날짜',
      cell: (info) => dayjs(info.getValue()).format('YYYY-MM-DD'),
    }),
    columnHelper.accessor('ticker', {
      header: '종목',
      cell: (info) => (
        <span className="flex items-center gap-2">
          <TickerLogo ticker={info.getValue()} className="h-6 w-6" />
          <span className="font-mono font-semibold">{info.getValue()}</span>
        </span>
      ),
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
    columnHelper.accessor('reason', {
      header: '메모',
      cell: (info) => {
        const v = info.getValue()
        const images = info.row.original.images
        const hasImages = images && images.length > 0
        if (!v && !hasImages) return <span className="text-muted-foreground">-</span>
        return (
          <span className="flex items-center gap-1.5 max-w-[200px]">
            {hasImages && <ImageIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
            {v ? <span className="truncate">{v}</span> : null}
          </span>
        )
      },
    }),
    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            if (confirm('이 매매를 삭제하시겠습니까?')) deleteMutation.mutate(row.original.id)
          }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBulkOpen(true)}>
            <List className="mr-2 h-4 w-4" />
            일괄 등록
          </Button>
          <Button onClick={() => setFormTradeId('new')}>
            <Plus className="mr-2 h-4 w-4" />
            새 매매
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border bg-muted p-1">
          {([['', '전체'], ['today', '오늘'], ['week', '이번 주'], ['month', '이번 달']] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => {
                setPeriod(value)
                updateFilter(periodToDates(value))
              }}
              className={`rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
                period === value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-lg border bg-muted p-1">
          {([['', '전체'], ['BUY', '매수'], ['SELL', '매도']] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => {
                setPosition(value)
                updateFilter({ position: value || undefined })
              }}
              className={`rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
                position === value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="w-40">
          <TickerCombobox
            value={ticker}
            onChange={(v) => {
              setTicker(v)
              updateFilter({ ticker: v || undefined })
            }}
            placeholder="종목 검색"
          />
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            필터 초기화
          </Button>
        )}
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
                    <TableRow
                      key={row.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedTrade(row.original)}
                    >
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

      {/* Detail Side Panel */}
      {selectedTrade && (
        <TradeDetailPanel
          trade={selectedTrade}
          onClose={() => setSelectedTrade(null)}
          onSaved={() => setSelectedTrade(null)}
        />
      )}

      {/* Bulk Trade Modal */}
      {bulkOpen && (
        <BulkTradeModal
          onClose={() => setBulkOpen(false)}
          onSaved={() => setBulkOpen(false)}
        />
      )}

      {/* Trade Form Modal */}
      {formTradeId !== null && (
        <TradeFormModal
          tradeId={formTradeId === 'new' ? undefined : formTradeId}
          onClose={() => setFormTradeId(null)}
          onSaved={() => setFormTradeId(null)}
        />
      )}
    </div>
  )
}
