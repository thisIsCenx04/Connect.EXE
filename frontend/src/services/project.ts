import axios from 'axios'
import { tokenStorage } from './tokenStorage'

const projectApi = axios.create({
  baseURL: import.meta.env.VITE_PROJECT_API_URL ?? 'http://localhost:8082',
})

projectApi.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface Project {
  id: string
  ownerId: string
  title: string
  slug?: string | null
  description: string
  stage: string
  industry: string
  country?: string | null
  status: string
  dealType: string
  fundingNeedUsd?: number | null
  equityPercent?: number | null
  tractionSummary?: string | null
  pitchDeckUrl?: string | null
  featured: boolean
  featuredRank?: number | null
  publishedAt?: string | null
  closedAt?: string | null
}

export async function listProjects(params: {
  stage?: string
  industry?: string
  country?: string
  dealType?: string
}): Promise<Project[]> {
  const response = await projectApi.get('/api/projects', { params })
  return response.data.data
}

export async function getProject(id: string): Promise<Project> {
  const response = await projectApi.get(`/api/projects/${id}`)
  return response.data.data
}

export async function createProject(payload: {
  title: string
  description: string
  stage: string
  industry: string
  dealType: string
  country?: string
  fundingNeedUsd?: number
  equityPercent?: number
  tractionSummary?: string
  pitchDeckUrl?: string
}): Promise<Project> {
  const response = await projectApi.post('/api/projects', payload)
  return response.data.data
}

export async function updateProject(id: string, payload: Partial<Project>): Promise<Project> {
  const response = await projectApi.put(`/api/projects/${id}`, payload)
  return response.data.data
}

export async function deleteProject(id: string): Promise<void> {
  await projectApi.delete(`/api/projects/${id}`)
}

export async function listMyProjects(): Promise<Project[]> {
  const response = await projectApi.get('/api/projects/mine')
  return response.data.data
}
