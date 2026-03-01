export interface User {
  id: number
  email: string
  nickname: string
  bio: string | null
  createdAt: string
}

export interface UserProfile {
  id: number
  nickname: string
  bio: string | null
  createdAt: string
  followerCount: number
  followingCount: number
  isFollowing: boolean
  isOwnProfile: boolean
}

export interface UserSearchResult {
  id: number
  nickname: string
  bio: string | null
}

export interface UpdateProfileRequest {
  bio?: string | null
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
  code: string
}

export interface SendCodeRequest {
  email: string
}

export interface VerifyCodeRequest {
  email: string
  code: string
}
