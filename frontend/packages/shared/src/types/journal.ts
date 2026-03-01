export interface JournalImageMeta {
  id: number
  journalId: number
  fileName: string
  contentType: string
  fileSize: number
  createdAt: string
}

export interface AuthorSummary {
  id: number
  nickname: string
}

export interface Journal {
  id: number
  userId: number
  title: string
  content: string
  journalDate: string
  createdAt: string
  updatedAt: string
  images: JournalImageMeta[]
  author?: AuthorSummary
}

export interface JournalRequest {
  title: string
  content: string
  journalDate: string
}

export interface JournalFilter {
  startDate?: string
  endDate?: string
  page?: number
  size?: number
}
