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

export interface HallOfFamePost {
  id: string
  type: string
  sourceProjectId?: string | null
  title: string
  summary?: string | null
  body: string
  coverUrl?: string | null
  status: string
  tags?: string[]
  links?: HallOfFamePostLink[]
  media?: HallOfFamePostMedia[]
  publishedAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

export interface HallOfFamePostLink {
  id?: string
  type: string
  label?: string | null
  url: string
  sortOrder?: number | null
}

export interface HallOfFamePostMedia {
  id?: string
  fileUrl: string
  role?: string | null
  sortOrder?: number | null
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

export async function listHallOfFamePosts(params?: {
  type?: string
  status?: string
}): Promise<HallOfFamePost[]> {
  const response = await hallOfFameApi.get('/api/hall-of-fame/posts', { params })
  return response.data.data
}

export async function getHallOfFamePost(id: string): Promise<HallOfFamePost> {
  const response = await hallOfFameApi.get(`/api/hall-of-fame/posts/${id}`)
  return response.data.data
}

export async function createHallOfFamePost(payload: {
  type: string
  sourceProjectId?: string
  title: string
  summary?: string
  body: string
  coverUrl?: string
  tags?: string[]
  links?: HallOfFamePostLink[]
  media?: HallOfFamePostMedia[]
}): Promise<HallOfFamePost> {
  const response = await hallOfFameApi.post('/api/hall-of-fame/posts', payload)
  return response.data.data
}

export async function updateHallOfFamePost(
  id: string,
  payload: Partial<HallOfFamePost>
): Promise<HallOfFamePost> {
  const response = await hallOfFameApi.put(`/api/hall-of-fame/posts/${id}`, payload)
  return response.data.data
}

export async function publishHallOfFamePost(id: string): Promise<HallOfFamePost> {
  const response = await hallOfFameApi.put(`/api/hall-of-fame/posts/${id}/publish`)
  return response.data.data
}

export async function archiveHallOfFamePost(id: string): Promise<HallOfFamePost> {
  const response = await hallOfFameApi.put(`/api/hall-of-fame/posts/${id}/archive`)
  return response.data.data
}
