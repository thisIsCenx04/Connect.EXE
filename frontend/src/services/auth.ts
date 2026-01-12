import { api } from './api'

export interface AuthPayload {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    fullName: string
    role: string
    verifiedStatus: string
    avatarUrl?: string | null
    emailVerified: boolean
  }
}

export interface RegisterResponse {
  userId: string
  email: string
}

export async function login(email: string, password: string): Promise<AuthPayload> {
  const response = await api.post('/api/auth/login', { email, password })
  return response.data.data
}

export async function register(payload: {
  email: string
  password: string
  fullName: string
}): Promise<RegisterResponse> {
  const response = await api.post('/api/auth/register', payload)
  return response.data.data
}

export async function verifyEmail(token: string): Promise<void> {
  await api.post('/api/auth/verify-email', { token })
}

export async function forgotPassword(email: string): Promise<void> {
  await api.post('/api/auth/forgot-password', { email })
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await api.post('/api/auth/reset-password', { token, newPassword })
}

export function getGoogleLoginUrl() {
  return `${api.defaults.baseURL}/oauth2/authorization/google`
}
