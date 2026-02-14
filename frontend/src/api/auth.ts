import { apiClient, unwrapData } from './apiClient'
import type { AuthResponse, LoginRequest, MeResponse, RegisterRequest } from '../types/auth'

export async function login(payload: LoginRequest) {
  const { data } = await apiClient.post('/api/auth/login', payload)
  return unwrapData<AuthResponse>(data)
}

export async function register(payload: RegisterRequest) {
  const { data } = await apiClient.post('/api/auth/register', payload)
  return unwrapData<AuthResponse>(data)
}

export async function getMe() {
  const { data } = await apiClient.get('/api/me')
  return unwrapData<MeResponse>(data)
}
