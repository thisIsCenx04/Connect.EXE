import axios from 'axios'

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
}

export interface ConversationSummary {
  id: string
  created_at: string
  type: string
  last_read_at?: string | null
}

export const chatApi = axios.create({
  baseURL: import.meta.env.VITE_CHAT_API_URL ?? 'http://localhost:8090',
})

export const chatSocketUrl = import.meta.env.VITE_CHAT_SOCKET_URL ?? 'http://localhost:8090'

export async function createConversation(participantIds: string[]): Promise<{ conversationId: string }> {
  const response = await chatApi.post('/api/conversations', { participantIds })
  return response.data
}

export async function listConversations(userId: string): Promise<ConversationSummary[]> {
  const response = await chatApi.get('/api/conversations', { params: { userId } })
  return response.data.conversations
}

export async function listMessages(conversationId: string, limit = 50): Promise<ChatMessage[]> {
  const response = await chatApi.get(`/api/messages/${conversationId}`, { params: { limit } })
  return response.data.messages
}
