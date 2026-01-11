import { api } from './api'

export interface AuthPayload {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    fullName: string
    role: string
  }
}

export async function login(email: string, password: string): Promise<AuthPayload> {
  const response = await api.post('/api/auth/login', { email, password })
  return response.data.data
}

export async function register(payload: {
  email: string
  password: string
  fullName: string
}): Promise<AuthPayload> {
  const response = await api.post('/api/auth/register', payload)
  return response.data.data
}
