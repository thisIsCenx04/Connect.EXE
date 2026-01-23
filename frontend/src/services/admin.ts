import axios from 'axios'
import { tokenStorage } from './tokenStorage'

const adminApi = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_URL ?? 'http://localhost:8088',
})

adminApi.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface AdminOverview {
  totalUsers: number
  activeUsers: number
  pendingKyc: number
  pendingProjects: number
  totalProjects: number
  activeSubscriptions: number
  totalAiRequests: number
  aiRequestsLast30Days: number
  aiSpendLast30Days: number
  estimatedMonthlyRevenue: number
}

export interface AdminUserSummary {
  id: string
  email: string
  fullName: string
  role: string
  verifiedStatus: string
  active: boolean
  emailVerified: boolean
  createdAt: string
}

export interface AdminKycSummary {
  id: string
  userId: string
  email: string | null
  fullName: string | null
  status: string
  requestedRole: string | null
  legalName: string | null
  organization: string | null
  website: string | null
  linkedinUrl: string | null
  docType: string | null
  docNumber: string | null
  docFileUrl: string | null
  submittedAt: string | null
  reviewedAt: string | null
  reviewNote: string | null
}

export interface AdminProjectSummary {
  id: string
  ownerId: string
  title: string
  stage: string
  industry: string
  moderationStatus: string
  visibility: string
  status: string
  featured: boolean
  featuredRank?: number | null
  submittedAt?: string | null
  reviewedAt?: string | null
  createdAt: string
}

export interface AiUsageSummary {
  userId: string
  email?: string | null
  fullName?: string | null
  day: string
  totalRequests: number
  promptTokens: number
  completionTokens: number
  costUsd: number
}

export interface RevenuePlanSummary {
  planCode: string
  activeSubscriptions: number
  estimatedMonthlyRevenue: number
}

export interface RevenueSummary {
  activeSubscriptions: number
  estimatedMonthlyRevenue: number
  planBreakdown: RevenuePlanSummary[]
}

export async function fetchAdminOverview(): Promise<AdminOverview> {
  const response = await adminApi.get('/api/admin/overview')
  return response.data.data
}

export async function listAdminUsers(params?: {
  query?: string
  active?: boolean
}): Promise<AdminUserSummary[]> {
  const response = await adminApi.get('/api/admin/users', { params })
  return response.data.data
}

export async function updateAdminUserStatus(id: string, active: boolean): Promise<AdminUserSummary> {
  const response = await adminApi.patch(`/api/admin/users/${id}`, { active })
  return response.data.data
}

export async function listAdminKyc(status?: string): Promise<AdminKycSummary[]> {
  const response = await adminApi.get('/api/admin/kyc', {
    params: status ? { status } : undefined,
  })
  return response.data.data
}

export async function reviewAdminKyc(userId: string, payload: {
  status: string
  reviewNote?: string
}): Promise<AdminKycSummary> {
  const response = await adminApi.patch(`/api/admin/kyc/${userId}`, payload)
  return response.data.data
}

export async function listAdminProjects(status?: string): Promise<AdminProjectSummary[]> {
  const response = await adminApi.get('/api/admin/projects', {
    params: status ? { status } : undefined,
  })
  return response.data.data
}

export async function reviewAdminProject(id: string, payload: {
  status: string
  featured?: boolean
  featuredRank?: number | null
}): Promise<AdminProjectSummary> {
  const response = await adminApi.patch(`/api/admin/projects/${id}`, payload)
  return response.data.data
}

export async function listAiUsage(days?: number): Promise<AiUsageSummary[]> {
  const response = await adminApi.get('/api/admin/ai/usage', {
    params: days ? { days } : undefined,
  })
  return response.data.data
}

export async function getRevenueSummary(): Promise<RevenueSummary> {
  const response = await adminApi.get('/api/admin/revenue/summary')
  return response.data.data
}
