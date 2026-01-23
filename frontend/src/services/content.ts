import axios from 'axios'
import { tokenStorage } from './tokenStorage'

const contentApi = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_URL ?? 'http://localhost:8088',
})

const adminContentApi = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_API_URL ?? 'http://localhost:8088',
})

adminContentApi.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export type ContentType = 'ARTICLE' | 'EVENT' | 'COMPETITION' | 'TREND'
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type ResourceType = 'FILE' | 'LINK'

export interface ContentItem {
  id: string
  type: ContentType
  status: ContentStatus
  title: string
  slug?: string | null
  summary?: string | null
  body?: string | null
  coverUrl?: string | null
  tags: string[]
  startAt?: string | null
  endAt?: string | null
  location?: string | null
  externalUrl?: string | null
  createdBy?: string | null
  publishedAt?: string | null
  createdAt?: string | null
}

export interface ResourceItem {
  id: string
  title: string
  description?: string | null
  type: ResourceType
  url: string
  tags: string[]
  status: ContentStatus
  createdBy?: string | null
  createdAt?: string | null
}

export async function fetchContentList(type?: ContentType): Promise<ContentItem[]> {
  const response = await contentApi.get('/api/content', { params: type ? { type } : undefined })
  return response.data.data
}

export async function fetchContentDetail(id: string): Promise<ContentItem> {
  const response = await contentApi.get(`/api/content/${id}`)
  return response.data.data
}

export async function fetchResourceList(): Promise<ResourceItem[]> {
  const response = await contentApi.get('/api/resources')
  return response.data.data
}

export async function fetchResourceDetail(id: string): Promise<ResourceItem> {
  const response = await contentApi.get(`/api/resources/${id}`)
  return response.data.data
}

export async function adminCreateContent(payload: Partial<ContentItem>) {
  const response = await adminContentApi.post('/api/admin/content', payload)
  return response.data.data
}

export async function adminFetchContentList(type?: ContentType, status?: ContentStatus): Promise<ContentItem[]> {
  const response = await adminContentApi.get('/api/admin/content', {
    params: {
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
    },
  })
  return response.data.data
}

export async function adminUpdateContent(id: string, payload: Partial<ContentItem>) {
  const response = await adminContentApi.patch(`/api/admin/content/${id}`, payload)
  return response.data.data
}

export async function adminDeleteContent(id: string) {
  const response = await adminContentApi.delete(`/api/admin/content/${id}`)
  return response.data.data
}

export async function adminFetchResourceList(status?: ContentStatus): Promise<ResourceItem[]> {
  const response = await adminContentApi.get('/api/admin/content/resources', {
    params: status ? { status } : undefined,
  })
  return response.data.data
}

export async function adminCreateResource(payload: Partial<ResourceItem>) {
  const response = await adminContentApi.post('/api/admin/content/resources', payload)
  return response.data.data
}

export async function adminUpdateResource(id: string, payload: Partial<ResourceItem>) {
  const response = await adminContentApi.patch(`/api/admin/content/resources/${id}`, payload)
  return response.data.data
}

export async function adminDeleteResource(id: string) {
  const response = await adminContentApi.delete(`/api/admin/content/resources/${id}`)
  return response.data.data
}
