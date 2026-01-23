import axios from 'axios'
import { tokenStorage } from './tokenStorage'

const aiApi = axios.create({
  baseURL: import.meta.env.VITE_AI_API_URL ?? 'http://localhost:8086',
})

aiApi.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface MarketAnalyzePayload {
  projectName: string
  industry?: string
  region?: string
  description: string
  targetCustomer?: string
  competitors?: string
  differentiator?: string
  goals?: string
}

export interface PitchdeckPayload {
  projectName: string
  problem: string
  solution: string
  market?: string
  businessModel?: string
  traction?: string
  team?: string
  ask?: string
  notes?: string
}

export interface ProjectEvaluatePayload {
  projectName: string
  summary: string
  stage?: string
  metrics?: string
  fundingNeed?: string
  team?: string
  risks?: string
  strengths?: string
}

export interface AiToolResponse {
  id: string
  agentType: string
  outputText: string
  outputJson?: string | null
  promptTokens: number
  completionTokens: number
  costUsd: number
  createdAt: string
}

export interface AiChatMessage {
  role: 'user' | 'assistant'
  content: string
  attachments?: AiChatAttachment[]
}

export interface AiChatAttachment {
  name?: string | null
  url: string
  contentType?: string | null
  size?: number | null
}

export interface AiChatResponse {
  id: string
  reply: string
  promptTokens: number
  completionTokens: number
  costUsd: number
  createdAt: string
}

export interface AiHistoryItem {
  id: string
  agentType: string
  status: string
  inputText: string
  outputText?: string | null
  errorMessage?: string | null
  promptTokens: number
  completionTokens: number
  costUsd: number
  createdAt: string
}

export async function marketAnalyze(payload: MarketAnalyzePayload): Promise<AiToolResponse> {
  const response = await aiApi.post('/api/ai/market-analyze', payload)
  return response.data.data
}

export async function generatePitchdeck(payload: PitchdeckPayload): Promise<AiToolResponse> {
  const response = await aiApi.post('/api/ai/pitchdeck', payload)
  return response.data.data
}

export async function evaluateProject(payload: ProjectEvaluatePayload): Promise<AiToolResponse> {
  const response = await aiApi.post('/api/ai/project-evaluate', payload)
  return response.data.data
}

export async function sendAiChat(payload: {
  message: string
  history?: AiChatMessage[]
  attachments?: AiChatAttachment[]
}): Promise<AiChatResponse> {
  const response = await aiApi.post('/api/ai/chat', payload)
  return response.data.data
}

export async function fetchAiHistory(limit = 15): Promise<AiHistoryItem[]> {
  const response = await aiApi.get('/api/ai/history', { params: { limit } })
  return response.data.data
}

export async function fetchAiChatHistory(limit = 200): Promise<AiChatMessage[]> {
  const response = await aiApi.get('/api/ai/chat-history', { params: { limit } })
  return response.data.data
}

export async function uploadAiChatAttachment(file: File): Promise<AiChatAttachment> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await aiApi.post('/api/ai/chat/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data.data
}
