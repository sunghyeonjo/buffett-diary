import type { Journal, JournalRequest, JournalFilter, JournalImageMeta, PageResponse } from '@buffett-diary/shared'
import client from './client'

export const journalsApi = {
  list(filter: JournalFilter = {}) {
    return client.get<PageResponse<Journal>>('/journals', { params: filter })
  },
  get(id: number) {
    return client.get<Journal>(`/journals/${id}`)
  },
  create(data: JournalRequest) {
    return client.post<Journal>('/journals', data)
  },
  update(id: number, data: JournalRequest) {
    return client.put<Journal>(`/journals/${id}`, data)
  },
  delete(id: number) {
    return client.delete(`/journals/${id}`)
  },
}

export const journalImagesApi = {
  upload(journalId: number, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return client.post<JournalImageMeta>(`/journals/${journalId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  delete(journalId: number, imageId: number) {
    return client.delete(`/journals/${journalId}/images/${imageId}`)
  },
  fetchBlob(journalId: number, imageId: number) {
    return client.get<Blob>(`/journals/${journalId}/images/${imageId}`, {
      responseType: 'blob',
    })
  },
}
