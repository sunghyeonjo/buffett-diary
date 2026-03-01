import { useCallback, useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Journal, JournalFilter } from '@buffett-diary/shared'
import dayjs from 'dayjs'
import { journalsApi, journalImagesApi } from '@/api/journals'
import { formatDate } from '@/lib/date'
import { toDateString } from '@/lib/date'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Pencil, ImageIcon, X, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import JournalFormModal from '@/components/JournalFormModal'

const INITIAL_FILTER: JournalFilter = { page: 0, size: 20 }

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
      <div className="flex items-center justify-between px-4 py-3 text-white" onClick={(e) => e.stopPropagation()}>
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
      <div className="relative flex flex-1 items-center justify-center px-12" onClick={(e) => e.stopPropagation()}>
        {images.length > 1 && index > 0 && (
          <button onClick={() => setIndex((i) => i - 1)} className="absolute left-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        <img src={current.url} alt={current.fileName} className="max-h-[calc(100vh-8rem)] max-w-full object-contain" />
        {images.length > 1 && index < images.length - 1 && (
          <button onClick={() => setIndex((i) => i + 1)} className="absolute right-2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  )
}

// --- Journal Card with Thumbnail ---
function JournalCard({
  journal,
  onClick,
}: {
  journal: Journal
  onClick: () => void
}) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!journal.images.length) return
    let revoked = false
    const firstImg = journal.images[0]
    journalImagesApi.fetchBlob(journal.id, firstImg.id).then(({ data: blob }) => {
      if (!revoked) setThumbnailUrl(URL.createObjectURL(blob))
    }).catch(() => {})
    return () => {
      revoked = true
      if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl)
    }
  }, [journal.id, journal.images]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="cursor-pointer overflow-hidden rounded-lg border transition-colors hover:bg-muted/50"
      onClick={onClick}
    >
      {/* Thumbnail */}
      {thumbnailUrl && (
        <div className="aspect-[16/9] overflow-hidden bg-muted">
          <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{formatDate(journal.journalDate)}</span>
          {journal.images.length > 1 && (
            <Badge variant="outline" className="gap-1 text-xs">
              <ImageIcon className="h-3 w-3" />
              {journal.images.length}
            </Badge>
          )}
        </div>
        <h3 className="mt-1.5 font-semibold">{journal.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{journal.content}</p>
      </div>
    </div>
  )
}

// --- Journal Detail Panel ---
function JournalDetailPanel({
  journal,
  onClose,
  onEdit,
}: {
  journal: Journal
  onClose: () => void
  onEdit: () => void
}) {
  const queryClient = useQueryClient()
  const [imageUrls, setImageUrls] = useState<Map<number, string>>(new Map())
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const deleteMutation = useMutation({
    mutationFn: () => journalsApi.delete(journal.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] })
      onClose()
    },
  })

  const loadImages = useCallback(async () => {
    if (!journal.images?.length) return
    const urls = new Map<number, string>()
    for (const img of journal.images) {
      try {
        const { data: blob } = await journalImagesApi.fetchBlob(journal.id, img.id)
        urls.set(img.id, URL.createObjectURL(blob))
      } catch { /* skip */ }
    }
    setImageUrls(urls)
  }, [journal.id, journal.images])

  useEffect(() => {
    loadImages()
    return () => {
      imageUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [loadImages]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewerIndex === null) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, viewerIndex])

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">{journal.title}</h2>
            <p className="text-sm text-muted-foreground">{formatDate(journal.journalDate)}</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{journal.content}</p>
          </div>

          {/* Image Gallery */}
          {journal.images && journal.images.length > 0 && (() => {
            const selectedImg = journal.images[selectedImageIndex]
            const selectedUrl = selectedImg ? imageUrls.get(selectedImg.id) : undefined
            return (
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  첨부파일 ({journal.images.length})
                </h3>
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
                {journal.images.length > 1 && (
                  <div className="mt-2 flex gap-2">
                    {journal.images.map((img, i) => {
                      const url = imageUrls.get(img.id)
                      return (
                        <button
                          key={img.id}
                          onClick={() => setSelectedImageIndex(i)}
                          className={`h-12 w-12 shrink-0 overflow-hidden rounded-md border transition-all ${
                            i === selectedImageIndex ? 'ring-2 ring-primary' : 'opacity-50 hover:opacity-100'
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
        <div className="flex gap-2 border-t px-5 py-3">
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            수정하기
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              if (confirm('이 일지를 삭제하시겠습니까?')) deleteMutation.mutate()
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewerIndex !== null && journal.images && (() => {
        const viewerImages = journal.images
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
export default function JournalListPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<JournalFilter>(INITIAL_FILTER)
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null)
  const [formJournalId, setFormJournalId] = useState<number | 'new' | null>(null)
  const [period, setPeriod] = useState('')

  const periodToDates = (p: string): { startDate?: string; endDate?: string } => {
    if (!p) return { startDate: undefined, endDate: undefined }
    const today = dayjs()
    const end = toDateString(today)
    if (p === 'today') return { startDate: end, endDate: end }
    if (p === 'week') return { startDate: toDateString(today.startOf('week').add(1, 'day')), endDate: end }
    if (p === 'month') return { startDate: toDateString(today.startOf('month')), endDate: end }
    return { startDate: undefined, endDate: undefined }
  }

  const updateFilter = (patch: Partial<JournalFilter>) => {
    setFilter((f) => ({ ...f, ...patch, page: 0 }))
  }

  const resetFilters = () => {
    setPeriod('')
    setFilter(INITIAL_FILTER)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['journals', filter],
    queryFn: () => journalsApi.list(filter).then((r) => r.data),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">투자일지</h1>
        <Button onClick={() => setFormJournalId('new')}>
          <Plus className="mr-2 h-4 w-4" />
          새 일지
        </Button>
      </div>

      {/* Date Filter */}
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
        {period && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            필터 초기화
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">일지를 불러오는 중...</div>
      ) : !data?.content.length ? (
        <div className="py-16 text-center text-muted-foreground">
          <p className="text-lg">{period ? '해당 기간에 작성된 일지가 없습니다' : '작성된 투자일지가 없습니다'}</p>
          <p className="mt-1 text-sm">오늘의 시장 뷰와 투자 생각을 기록해보세요</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.content.map((journal) => (
              <JournalCard
                key={journal.id}
                journal={journal}
                onClick={() => setSelectedJournal(journal)}
              />
            ))}
          </div>

          {data.totalPages > 1 && (
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

      {/* Detail Panel */}
      {selectedJournal && (
        <JournalDetailPanel
          journal={selectedJournal}
          onClose={() => setSelectedJournal(null)}
          onEdit={() => {
            setFormJournalId(selectedJournal.id)
            setSelectedJournal(null)
          }}
        />
      )}

      {/* Form Modal */}
      {formJournalId !== null && (
        <JournalFormModal
          journalId={formJournalId === 'new' ? undefined : formJournalId}
          onClose={() => setFormJournalId(null)}
          onSaved={() => {
            setFormJournalId(null)
            queryClient.invalidateQueries({ queryKey: ['journals'] })
          }}
        />
      )}
    </div>
  )
}
