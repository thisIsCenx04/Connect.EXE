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
  summary?: string | null
  content?: string | null
  stage: string
  industry: string
  country?: string | null
  status: string
  moderationStatus?: string | null
  visibility?: string | null
  dealType: string
  fundingTargetUsd?: number | null
  fundingNeedUsd?: number | null
  fundingRaisedUsd?: number | null
  valuationUsd?: number | null
  equityPercent?: number | null
  tractionSummary?: string | null
  fundingTimeline?: string | null
  tractionMetrics?: string | null
  pitchDeckUrl?: string | null
  featured: boolean
  featuredRank?: number | null
  tags?: string[]
  links?: ProjectLink[]
  media?: ProjectMedia[]
  publishedAt?: string | null
  closedAt?: string | null
  submittedAt?: string | null
  reviewedBy?: string | null
  reviewedAt?: string | null
}

export interface ProjectLink {
  id?: string
  type: string
  label?: string | null
  url: string
  sortOrder?: number | null
}

export interface ProjectMedia {
  id?: string
  fileUrl: string
  fileType?: string | null
  role?: string | null
  sortOrder?: number | null
  caption?: string | null
}

export async function listProjects(params: {
  stage?: string
  industry?: string
  country?: string
  dealType?: string
  status?: string
  moderationStatus?: string
  visibility?: string
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
  summary?: string
  content?: string
  stage: string
  industry: string
  dealType: string
  country?: string
  fundingTargetUsd?: number
  fundingNeedUsd?: number
  fundingRaisedUsd?: number
  valuationUsd?: number
  equityPercent?: number
  tractionSummary?: string
  fundingTimeline?: string
  tractionMetrics?: string
  pitchDeckUrl?: string
  tags?: string[]
  links?: ProjectLink[]
  media?: ProjectMedia[]
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

export async function submitProject(id: string): Promise<Project> {
  const response = await projectApi.post(`/api/projects/${id}/submit`)
  return response.data.data
}

export async function approveProject(id: string): Promise<Project> {
  const response = await projectApi.put(`/api/projects/${id}/approve`)
  return response.data.data
}

export async function rejectProject(id: string): Promise<Project> {
  const response = await projectApi.put(`/api/projects/${id}/reject`)
  return response.data.data
}

export async function hideProject(id: string): Promise<Project> {
  const response = await projectApi.put(`/api/projects/${id}/hide`)
  return response.data.data
}

export async function listIndustries(): Promise<string[]> {
  const response = await projectApi.get('/api/projects/industries')
  return response.data.data
}
