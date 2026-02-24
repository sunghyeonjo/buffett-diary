import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { TradeRequest } from '@buffett-diary/shared'
import dayjs from 'dayjs'
import { tradesApi } from '@/api/trades'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { POPULAR_TICKERS } from '@/lib/tickers'

export default function TradeFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')

  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm<TradeRequest & { profit?: number | null }>({
    defaultValues: {
      tradeDate: dayjs().format('YYYY-MM-DD'),
      position: 'BUY',
    },
  })

  const position = watch('position')

  const { data: existingTrade } = useQuery({
    queryKey: ['trade', id],
    queryFn: () => tradesApi.get(Number(id)).then((r) => r.data),
    enabled: isEdit,
  })

  useEffect(() => {
    if (existingTrade) {
      reset({
        tradeDate: existingTrade.tradeDate,
        ticker: existingTrade.ticker,
        position: existingTrade.position,
        quantity: existingTrade.quantity,
        entryPrice: existingTrade.entryPrice,
        profit: existingTrade.profit,
        reason: existingTrade.reason,
      })
    }
  }, [existingTrade, reset])

  const mutation = useMutation({
    mutationFn: (data: TradeRequest) =>
      isEdit ? tradesApi.update(Number(id), data) : tradesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      navigate('/trades')
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || '저장에 실패했습니다')
    },
  })

  const onSubmit = (data: TradeRequest & { profit?: number | null }) => {
    const isBuy = data.position === 'BUY'
    mutation.mutate({
      ...data,
      ticker: data.ticker.toUpperCase(),
      exitPrice: null,
      profit: isBuy ? null : (data.profit ?? null),
      reason: data.reason || null,
    })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? '매매 수정' : '새 매매 기록'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tradeDate">매매일</Label>
                <Input
                  id="tradeDate"
                  type="date"
                  {...register('tradeDate', { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticker">종목</Label>
                <Input
                  id="ticker"
                  placeholder="AAPL"
                  className="uppercase"
                  list="ticker-list"
                  {...register('ticker', { required: true })}
                />
                <datalist id="ticker-list">
                  {POPULAR_TICKERS.map((t) => (
                    <option key={t.ticker} value={t.ticker}>
                      {t.ticker} - {t.name}
                    </option>
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="position">구분</Label>
                <select
                  id="position"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  {...register('position', { required: true })}
                >
                  <option value="BUY">매수</option>
                  <option value="SELL">매도</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">수량</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="any"
                  {...register('quantity', { required: true, valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entryPrice">{position === 'SELL' ? '매도가($)' : '매수가($)'}</Label>
                <Input
                  id="entryPrice"
                  type="number"
                  step="0.01"
                  {...register('entryPrice', { required: true, valueAsNumber: true })}
                />
              </div>
            </div>

            {position === 'SELL' && (
              <div className="space-y-2">
                <Label htmlFor="profit">수익금($)</Label>
                <Input
                  id="profit"
                  type="number"
                  step="0.01"
                  placeholder="익절 150, 손절 -150"
                  {...register('profit', { valueAsNumber: true })}
                />
                <p className="text-xs text-muted-foreground">
                  양수 = 익절, 음수 = 손절
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reason">매매 사유 / 메모</Label>
              <Textarea
                id="reason"
                rows={3}
                placeholder="이 매매를 한 이유는?"
                {...register('reason')}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '저장 중...' : isEdit ? '수정하기' : '기록하기'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/trades')}>
                취소
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
