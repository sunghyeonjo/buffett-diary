export interface User {
  id: number
  email: string
  nickname: string
  createdAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  nickname: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RegisterResponse {
  email: string
  message: string
}

export interface VerifyEmailRequest {
  email: string
  code: string
}
