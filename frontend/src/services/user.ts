import { api } from './api'

export interface UserProfile {
  id: string
  email: string
  fullName: string
  avatarUrl?: string | null
  role: string
  headline?: string | null
  bio?: string | null
  country?: string | null
  city?: string | null
  verifiedStatus: string
  verifiedAt?: string | null
  emailVerified: boolean
  emailVerifiedAt?: string | null
}

export interface KycPayload {
  id: string
  userId: string
  status: string
  legalName?: string | null
  organization?: string | null
  website?: string | null
  linkedinUrl?: string | null
  docType?: string | null
  docNumber?: string | null
  docFileUrl?: string | null
  submittedAt?: string | null
  reviewedBy?: string | null
  reviewedAt?: string | null
  reviewNote?: string | null
}

export async function getUserProfile(id: string): Promise<UserProfile> {
  const response = await api.get(`/api/users/${id}`)
  return response.data.data
}

export async function updateUserProfile(id: string, payload: Partial<UserProfile>): Promise<UserProfile> {
  const response = await api.put(`/api/users/${id}`, payload)
  return response.data.data
}

export async function submitKyc(id: string, payload: {
  legalName?: string
  organization?: string
  website?: string
  linkedinUrl?: string
  docType?: string
  docNumber?: string
  docFileUrl?: string
}): Promise<KycPayload> {
  const response = await api.post(`/api/users/${id}/kyc`, payload)
  return response.data.data
}

export async function getKyc(id: string): Promise<KycPayload> {
  const response = await api.get(`/api/users/${id}/kyc`)
  return response.data.data
}

export async function changePassword(id: string, payload: {
  currentPassword: string
  newPassword: string
}): Promise<void> {
  await api.post(`/api/users/${id}/change-password`, payload)
}
