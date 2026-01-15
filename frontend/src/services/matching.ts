import axios from 'axios'
import { api } from './api'
import { tokenStorage } from './tokenStorage'
import type { Project } from './project'

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

export interface InvestorPreference {
  id?: string
  userId?: string
  industries: string[]
  stages: string[]
  minFundingUsd?: number | null
  maxFundingUsd?: number | null
  country?: string | null
  city?: string | null
}

export interface InvestorMatch {
  userId: string
  fullName: string
  headline?: string | null
  avatarUrl?: string | null
  country?: string | null
  city?: string | null
  industries: string[]
  stages: string[]
  minFundingUsd?: number | null
  maxFundingUsd?: number | null
  score: number
}

export interface ProjectMatch {
  project: Project
  score: number
}

export async function getInvestorPreferences(userId: string): Promise<InvestorPreference> {
  const response = await api.get(`/api/investors/${userId}/preferences`)
  return response.data.data
}

export async function upsertInvestorPreferences(userId: string, payload: InvestorPreference): Promise<InvestorPreference> {
  const response = await api.put(`/api/investors/${userId}/preferences`, payload)
  return response.data.data
}

export async function matchInvestors(params: {
  industry?: string
  stage?: string
  minFundingUsd?: number
  maxFundingUsd?: number
  country?: string
  city?: string
}): Promise<InvestorMatch[]> {
  const response = await api.get('/api/investors/matching', { params })
  return response.data.data
}

export async function matchProjects(params: {
  industry?: string
  stage?: string
  minFundingUsd?: number
  maxFundingUsd?: number
  country?: string
}): Promise<ProjectMatch[]> {
  const response = await projectApi.get('/api/projects/matching', { params })
  return response.data.data
}
