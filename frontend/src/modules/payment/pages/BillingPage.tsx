import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  cancelSubscription,
  fetchBillingSummary,
  type BillingSummary,
} from '../../../services/payment'

const formatDate = (value: string | null) => {
  if (!value) return 'Kh?ng c?'
  return new Date(value).toLocaleDateString()
}

const PREMIUM_PRICING: Record<number, number> = {
  1: 29000,
  3: 75000,
  6: 145000,
  12: 250000,
}

const vndFormatter = new Intl.NumberFormat('vi-VN')
const formatVnd = (value: number) => `${vndFormatter.format(value)} VNĐ`

const getDurationMonths = (start: string | null, end: string | null) => {
  if (!start || !end) return null
  const startDate = new Date(start)
  const endDate = new Date(end)
  const months = (endDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12
    + (endDate.getUTCMonth() - startDate.getUTCMonth())
  return months > 0 ? months : null
}

export function BillingPage() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState<BillingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    let active = true
    fetchBillingSummary()
      .then((data) => {
        if (!active) return
        setSummary(data)
      })
      .catch(() => {
        if (!active) return
        setError('Kh?ng th? t?i th?ng tin thanh to?n.')
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])
  const durationMonths = useMemo(() => {
    if (!summary) return null
    return getDurationMonths(summary.subscription.currentPeriodStart, summary.subscription.currentPeriodEnd)
  }, [summary?.subscription.currentPeriodEnd, summary?.subscription.currentPeriodStart])

  const handleCancel = async () => {
    setActionLoading(true)
    setError(null)
    try {
      const data = await cancelSubscription()
      setSummary(data)
    } catch {
      setError('Kh?ng th? h?y g?i.')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <div className="text-sm text-white/60">?ang t?i th?ng tin thanh to?n...</div>
  }

  if (error || !summary) {
    return <div className="text-sm text-rose-300">{error ?? 'Kh?ng t?m th?y th?ng tin thanh to?n.'}</div>
  }

  const { plan, subscription, entitlements } = summary
  const isFree = plan.code === 'FREE'
  const premiumPrice = durationMonths ? PREMIUM_PRICING[durationMonths] : null
  const planLabel = plan.code === 'PRO' ? 'Cao c?p' : plan.name

  return (
    <div className="space-y-8">
      <section className="card-surface rounded-[28px] border border-white/10 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Thanh to?n</p>
        <h1 className="display-font mt-2 text-3xl font-semibold text-white">Gói hiện tại</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/70">
          Quản lý gói, theo dõi quyền lợi và thời hạn thanh toán.
        </p>
        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="card-surface rounded-3xl border border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Gói hiện tại</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">{planLabel}</h3>
              <p className="text-sm text-white/60">
                {isFree && 'Miễn phí'}
                {!isFree && premiumPrice && durationMonths && `${formatVnd(premiumPrice)} / ${durationMonths} tháng`}
                {!isFree && (!premiumPrice || !durationMonths) && 'Đang cập nhật'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Trạng thái</p>
              <p className="mt-2 text-sm font-semibold text-white">{subscription.status}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 text-sm text-white/70 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Bắt đầu</p>
              <p className="mt-1 text-sm text-white/80">{formatDate(subscription.currentPeriodStart)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Hết hạn</p>
              <p className="mt-1 text-sm text-white/80">{formatDate(subscription.currentPeriodEnd)}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/pricing')}
              className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80"
            >
              Đổi gói
            </button>
            {!isFree && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={actionLoading}
                className="rounded-full border border-rose-400/40 bg-rose-500/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-rose-200 disabled:opacity-60"
              >
                Hủy gói
              </button>
            )}
          </div>
        </div>

        <div className="card-neo rounded-3xl border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Quyền lợi</p>
          <div className="mt-4 space-y-2 text-sm text-white/70">
            {entitlements.map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span>{item.key.replace(/_/g, ' ').toLowerCase()}</span>
                <span className="text-white/80">
                  {item.limitValue === null ? 'Không giới hạn' : item.limitValue}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}






