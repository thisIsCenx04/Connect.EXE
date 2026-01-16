import axios from 'axios'
import { tokenStorage } from './tokenStorage'

export const forumBaseUrl = import.meta.env.VITE_FORUM_API_URL ?? ''

const forumApi = axios.create({
  baseURL: forumBaseUrl,
})

forumApi.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface ForumCategory {
  id: string
  name: string
  slug: string
  sortOrder: number
}

export interface ForumPost {
  id: string
  categoryId: string
  categoryName?: string | null
  categorySlug?: string | null
  title: string
  content: string
  status: string
  upvoteCount: number
  downvoteCount: number
  commentCount: number
  authorId: string
  authorReputation: number
  authorLevel: string
  createdAt: string
  updatedAt: string
}

export interface ForumComment {
  id: string
  postId: string
  parentId?: string | null
  authorId: string
  content: string
  authorReputation: number
  authorLevel: string
  createdAt: string
}

export type ForumSort = 'NEW' | 'TOP'

export async function listForumCategories(): Promise<ForumCategory[]> {
  const response = await forumApi.get('/api/forum/categories')
  return response.data.data
}

export async function getForumCategory(slug: string): Promise<ForumCategory | null> {
  const response = await forumApi.get(`/api/forum/categories/${slug}`)
  return response.data.data
}

export async function listForumPosts(params: {
  categoryId?: string
  categorySlug?: string
  sort?: ForumSort
  status?: string
}): Promise<ForumPost[]> {
  const response = await forumApi.get('/api/forum/posts', { params })
  return response.data.data
}

export async function getForumPost(id: string): Promise<ForumPost> {
  const response = await forumApi.get(`/api/forum/posts/${id}`)
  return response.data.data
}

export async function createForumPost(payload: {
  categoryId: string
  title: string
  content: string
}): Promise<ForumPost> {
  const response = await forumApi.post('/api/forum/posts', payload)
  return response.data.data
}

export async function updateForumPost(id: string, payload: Partial<ForumPost>): Promise<ForumPost> {
  const response = await forumApi.put(`/api/forum/posts/${id}`, payload)
  return response.data.data
}

export async function listForumComments(postId: string): Promise<ForumComment[]> {
  const response = await forumApi.get(`/api/forum/posts/${postId}/comments`)
  return response.data.data
}

export async function createForumComment(postId: string, payload: {
  content: string
  parentId?: string | null
}): Promise<ForumComment> {
  const response = await forumApi.post(`/api/forum/posts/${postId}/comments`, payload)
  return response.data.data
}

export async function voteForumPost(postId: string, vote: 'UP' | 'DOWN'): Promise<ForumPost> {
  const response = await forumApi.post(`/api/forum/posts/${postId}/votes`, { vote })
  return response.data.data
}

export function forumStreamUrl(postId: string) {
  return `${forumBaseUrl}/api/forum/posts/${postId}/stream`
}
