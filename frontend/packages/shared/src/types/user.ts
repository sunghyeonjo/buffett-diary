export interface User {
  id: number
  email: string
  nickname: string
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
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
