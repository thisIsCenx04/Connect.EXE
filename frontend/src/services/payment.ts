import axios from 'axios'
import { tokenStorage } from './tokenStorage'

const paymentApi = axios.create({
  baseURL: import.meta.env.VITE_PAYMENT_API_URL ?? 'http://localhost:8087',
})

paymentApi.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface PlanEntitlement {
  key: string
  limitValue: number | null
}

export interface Plan {
  code: string
  name: string
  priceMonthUsd: number
  entitlements: PlanEntitlement[]
}

export interface Subscription {
  id: string
  planCode: string
  status: string
  provider: string
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
}

export interface BillingSummary {
  plan: Plan
  subscription: Subscription
  entitlements: PlanEntitlement[]
}

export interface ManualPaymentInfo {
  qrImageUrl: string | null
  bankName: string | null
  bankAccountName: string | null
  bankAccountNumber: string | null
  bankBranch: string | null
  transferNotePrefix: string | null
}

export interface ManualCheckoutResponse {
  orderCode: string
  amountVnd: number
  transferContent: string
  qrImageUrl: string | null
  bankName: string | null
  bankAccountName: string | null
  bankAccountNumber: string | null
  bankBranch: string | null
}

export interface PaymentOrderAdmin {
  userId: string
  planCode: string
  durationMonths: number
  amountVnd: number
  provider: string
  status: string
  orderCode: string
  createdAt: string
  updatedAt: string
}

export async function fetchPlans(): Promise<Plan[]> {
  const response = await paymentApi.get('/api/billing/plans')
  return response.data.data
}

export async function fetchBillingSummary(): Promise<BillingSummary> {
  const response = await paymentApi.get('/api/billing/subscription')
  return response.data.data
}

export async function subscribePlan(planCode: string, durationMonths?: number): Promise<BillingSummary> {
  const response = await paymentApi.post('/api/billing/subscribe', { planCode, durationMonths })
  return response.data.data
}

export async function createCheckout(planCode: string, durationMonths: number): Promise<ManualCheckoutResponse> {
  const response = await paymentApi.post('/api/billing/checkout', { planCode, durationMonths })
  return response.data.data
}

export async function cancelSubscription(): Promise<BillingSummary> {
  const response = await paymentApi.post('/api/billing/cancel')
  return response.data.data
}

export async function fetchManualPaymentInfo(): Promise<ManualPaymentInfo> {
  const response = await paymentApi.get('/api/billing/manual/info')
  return response.data.data
}

export async function listPaymentOrders(status?: string): Promise<PaymentOrderAdmin[]> {
  const response = await paymentApi.get('/api/admin/payments/orders', {
    params: status ? { status } : undefined,
  })
  return response.data.data
}

export async function reviewPaymentOrder(orderCode: string, payload: {
  action: 'APPROVE' | 'REJECT'
  applyTo?: 'SUBSCRIPTION' | 'WALLET'
}): Promise<PaymentOrderAdmin> {
  const response = await paymentApi.patch(`/api/admin/payments/orders/${orderCode}`, payload)
  return response.data.data
}
