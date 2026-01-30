import { useEffect, useMemo, useState } from 'react'
import { listPaymentOrders, reviewPaymentOrder, type PaymentOrderAdmin } from '../../../services/payment'

const statusBadgeStyles: Record<string, string> = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
  PAID: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  REJECTED: 'border-rose-200 bg-rose-50 text-rose-600',
}

export function AdminPaymentsPage() {
  const [orders, setOrders] = useState<PaymentOrderAdmin[]>([])
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const currencyFormatter = useMemo(
    () => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }),
    []
  )

  useEffect(() => {
    let active = true
    setError(null)
    const loadOrders = async () => {
      try {
        const data = await listPaymentOrders(statusFilter === 'ALL' ? undefined : statusFilter)
        if (!active) return
        setOrders(data)
      } catch {
        if (!active) return
        setError('Không thể tải đơn thanh toán.')
      }
    }
    loadOrders()
    return () => {
      active = false
    }
  }, [statusFilter])

  const handleReview = async (order: PaymentOrderAdmin, action: 'APPROVE' | 'REJECT', applyTo?: 'SUBSCRIPTION' | 'WALLET') => {
    setMessage(null)
    setError(null)
    setLoadingId(order.orderCode)
    try {
      const updated = await reviewPaymentOrder(order.orderCode, { action, applyTo })
      setOrders((prev) => prev.map((item) => (item.orderCode === order.orderCode ? updated : item)))
      setMessage('Cập nhật đơn thành công.')
    } catch {
      setError('Không thể duyệt đơn thanh toán.')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Thanh toán</p>
          <h2 className="display-font text-2xl font-semibold text-slate-900">Duyệt nạp tiền thẻ cứng</h2>
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600"
        >
          <option value="PENDING">Đang chờ</option>
          <option value="PAID">Đã duyệt</option>
          <option value="REJECTED">Từ chối</option>
          <option value="ALL">Tất cả</option>
        </select>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          {message}
        </div>
      )}

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <div className="grid grid-cols-[1.1fr_0.7fr_0.7fr_0.6fr_0.8fr_0.9fr] gap-3 border-b border-slate-200 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
          <span>Đơn</span>
          <span>Người dùng</span>
          <span>Gói</span>
          <span>Số tiền</span>
          <span>Trạng thái</span>
          <span>Thao tác</span>
        </div>
        <div className="divide-y divide-slate-200">
          {orders.map((order) => (
            <div key={order.orderCode} className="grid grid-cols-[1.1fr_0.7fr_0.7fr_0.6fr_0.8fr_0.9fr] items-center gap-3 px-6 py-4 text-sm">
              <div>
                <div className="font-semibold text-slate-900">{order.orderCode}</div>
                <div className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-xs text-slate-500">{order.userId}</div>
              <div>
                <div className="text-slate-700">{order.planCode}</div>
                <div className="text-xs text-slate-400">{order.durationMonths} tháng</div>
              </div>
              <div className="text-slate-700">{currencyFormatter.format(order.amountVnd)}</div>
              <span>
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${
                    statusBadgeStyles[order.status] ?? 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  {order.status}
                </span>
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleReview(order, 'APPROVE', 'SUBSCRIPTION')}
                  disabled={loadingId === order.orderCode || order.status !== 'PENDING'}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700 disabled:opacity-50"
                >
                  Duyệt gói
                </button>
                <button
                  type="button"
                  onClick={() => handleReview(order, 'APPROVE', 'WALLET')}
                  disabled={loadingId === order.orderCode || order.status !== 'PENDING'}
                  className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-700 disabled:opacity-50"
                >
                  Cộng ví
                </button>
                <button
                  type="button"
                  onClick={() => handleReview(order, 'REJECT')}
                  disabled={loadingId === order.orderCode || order.status !== 'PENDING'}
                  className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-600 disabled:opacity-50"
                >
                  Từ chối
                </button>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="px-6 py-6 text-sm text-slate-500">Không có đơn thanh toán.</div>
          )}
        </div>
      </div>
    </section>
  )
}
