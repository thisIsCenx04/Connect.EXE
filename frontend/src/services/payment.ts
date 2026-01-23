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

export interface CheckoutResponse {
  orderCode: string
  payUrl: string
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

export async function createCheckout(planCode: string, durationMonths: number, provider: 'VNPAY' | 'MOMO'): Promise<CheckoutResponse> {
  const response = await paymentApi.post('/api/billing/checkout', { planCode, durationMonths, provider })
  return response.data.data
}

export async function cancelSubscription(): Promise<BillingSummary> {
  const response = await paymentApi.post('/api/billing/cancel')
  return response.data.data
}
