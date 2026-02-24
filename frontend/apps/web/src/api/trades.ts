import type { Trade, TradeRequest, TradeFilter, PageResponse, TradeStats } from '@buffett-diary/shared'
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
  update(id: number, data: TradeRequest) {
    return client.put<Trade>(`/trades/${id}`, data)
  },
  delete(id: number) {
    return client.delete(`/trades/${id}`)
  },
  stats(period: 'today' | 'month' | 'all' = 'all') {
    return client.get<TradeStats>('/trades/stats', { params: { period } })
  },
}
