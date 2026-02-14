import type { AuthUser } from './user'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  userId: string
  email: string
  name: string
  role: string
}

export type MeResponse = AuthUser
