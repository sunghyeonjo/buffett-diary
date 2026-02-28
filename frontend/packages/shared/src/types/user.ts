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
