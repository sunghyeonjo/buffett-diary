import type { AuthResponse, LoginRequest, RegisterRequest } from '@buffett-diary/shared'
import client from './client'

export const authApi = {
  register(data: RegisterRequest) {
    return client.post<AuthResponse>('/auth/register', data)
  },
  login(data: LoginRequest) {
    return client.post<AuthResponse>('/auth/login', data)
  },
  logout() {
    const refreshToken = localStorage.getItem('refreshToken')
    return client.post('/auth/logout', { refreshToken })
  },
}
