import type { Trade, TradeRequest, TradeFilter, PageResponse, TradeStats, TradeImageMeta, TradeCommentRequest } from '@buffett-diary/shared'
import client from './client'

export const tradesApi = {
  list(filter: TradeFilter = {}) {
    return client.get<PageResponse<Trade>>('/trades', { params: filter })
  },
  get(id: number) {
    return client.get<Trade>(`/trades/${id}`)
  },
  create(data: TradeRequest) {
    return client.post<Trade>('/trades', data)
  },
  bulkCreate(data: TradeRequest[]) {
    return client.post<Trade[]>('/trades/bulk', data)
  },
  update(id: number, data: TradeRequest) {
    return client.put<Trade>(`/trades/${id}`, data)
  },
  delete(id: number) {
    return client.delete(`/trades/${id}`)
  },
  stats(period: 'today' | 'week' | 'month' | 'year' | 'all' = 'all') {
    return client.get<TradeStats>('/trades/stats', { params: { period } })
  },
}

export const tradeCommentApi = {
  update(tradeId: number, data: TradeCommentRequest) {
    return client.put<Trade>(`/trades/${tradeId}/comment`, data)
  },
  delete(tradeId: number) {
    return client.delete(`/trades/${tradeId}/comment`)
  },
}

export const tradeImagesApi = {
  upload(tradeId: number, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return client.post<TradeImageMeta>(`/trades/${tradeId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  delete(tradeId: number, imageId: number) {
    return client.delete(`/trades/${tradeId}/images/${imageId}`)
  },
  fetchBlob(tradeId: number, imageId: number) {
    return client.get<Blob>(`/trades/${tradeId}/images/${imageId}`, {
      responseType: 'blob',
    })
  },
}
