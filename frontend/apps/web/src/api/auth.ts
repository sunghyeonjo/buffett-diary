import type { AuthResponse, LoginRequest, RegisterRequest } from '@buffett-diary/shared'
import client from './client'

export const authApi = {
  login(data: LoginRequest) {
    return client.post<AuthResponse>('/auth/login', data)
  },
  register(data: RegisterRequest) {
    return client.post<AuthResponse>('/auth/register', data)
  },
  logout() {
    const refreshToken = localStorage.getItem('refreshToken')
    return client.post('/auth/logout', { refreshToken })
  },
}
