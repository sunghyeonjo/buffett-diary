import type { AuthResponse, LoginRequest, RegisterRequest, RegisterResponse, VerifyEmailRequest } from '@buffett-diary/shared'
import client from './client'

export const authApi = {
  register(data: RegisterRequest) {
    return client.post<RegisterResponse>('/auth/register', data)
  },
  verifyEmail(data: VerifyEmailRequest) {
    return client.post<AuthResponse>('/auth/verify-email', data)
  },
  resendCode(email: string) {
    return client.post('/auth/resend-code', { email })
  },
  login(data: LoginRequest) {
    return client.post<AuthResponse>('/auth/login', data)
  },
  logout() {
    const refreshToken = localStorage.getItem('refreshToken')
    return client.post('/auth/logout', { refreshToken })
  },
}
