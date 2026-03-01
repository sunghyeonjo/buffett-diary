import type { UserProfile, UserSearchResult, UpdateProfileRequest, PageResponse, Journal, Trade } from '@buffett-diary/shared'
import client from './client'

export const usersApi = {
  search(q: string, page = 0, size = 20) {
    return client.get<PageResponse<UserSearchResult>>('/users/search', { params: { q, page, size } })
  },
  profile(userId: number) {
    return client.get<UserProfile>(`/users/${userId}/profile`)
  },
  updateProfile(data: UpdateProfileRequest) {
    return client.put('/users/me/profile', data)
  },
  journals(userId: number, page = 0, size = 20) {
    return client.get<PageResponse<Journal>>(`/users/${userId}/journals`, { params: { page, size } })
  },
  trades(userId: number, page = 0, size = 20) {
    return client.get<PageResponse<Trade>>(`/users/${userId}/trades`, { params: { page, size } })
  },
}
