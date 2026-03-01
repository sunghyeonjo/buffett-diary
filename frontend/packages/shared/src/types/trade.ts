export type Position = 'BUY' | 'SELL'

export interface TradeImageMeta {
  id: number
  tradeId: number
  fileName: string
  contentType: string
  fileSize: number
  createdAt: string
}

export interface Trade {
  id: number
  userId: number
  tradeDate: string
  ticker: string
  position: Position
  quantity: number
  entryPrice: number
  exitPrice: number | null
  profit: number | null
  reason: string | null
  comment: string | null
  rating: number | null
  commentUpdatedAt: string | null
  createdAt: string
  updatedAt: string
  images: TradeImageMeta[]
}

export interface TradeRequest {
  tradeDate: string
  ticker: string
  position: Position
  quantity: number
  entryPrice: number
  exitPrice?: number | null
  profit?: number | null
  reason?: string | null
}

export interface TradeCommentRequest {
  content?: string | null
  rating?: number | null
}

export interface TradeFilter {
  startDate?: string
  endDate?: string
  ticker?: string
  position?: Position
  page?: number
  size?: number
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}
