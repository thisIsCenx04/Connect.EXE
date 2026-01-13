import axios from 'axios'
import { tokenStorage } from './tokenStorage'

const hallOfFameApi = axios.create({
  baseURL: import.meta.env.VITE_HALL_OF_FAME_API_URL ?? 'http://localhost:8085',
})

hallOfFameApi.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface HallOfFameEntry {
  id: string
  type: string
  referenceId: string
  score: number
  status: string
  ratingCount: number
  createdAt: string
  updatedAt: string
}

export async function listHallOfFame(params?: { type?: string; status?: string }): Promise<HallOfFameEntry[]> {
  const response = await hallOfFameApi.get('/api/hall-of-fame', { params })
  return response.data.data
}

export async function getHallOfFameEntry(id: string): Promise<HallOfFameEntry> {
  const response = await hallOfFameApi.get(`/api/hall-of-fame/${id}`)
  return response.data.data
}

export async function applyHallOfFame(payload: { type: string; referenceId: string }): Promise<HallOfFameEntry> {
  const response = await hallOfFameApi.post('/api/hall-of-fame', payload)
  return response.data.data
}

export async function voteHallOfFame(id: string, payload: { value: number }): Promise<HallOfFameEntry> {
  const response = await hallOfFameApi.post(`/api/hall-of-fame/${id}/votes`, payload)
  return response.data.data
}
