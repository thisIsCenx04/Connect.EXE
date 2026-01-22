import { useEffect, useState } from 'react'
import {
  listAdminKyc,
  reviewAdminKyc,
  type AdminKycSummary,
} from '../../../services/admin'

const statusBadgeStyles: Record<string, string> = {
  PENDING: 'border-amber-400/40 bg-amber-500/10 text-amber-200',
  APPROVED: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
  REJECTED: 'border-rose-400/40 bg-rose-500/10 text-rose-200',
}

export function AdminKycPage() {
  const [kycList, setKycList] = useState<AdminKycSummary[]>([])
  const [kycStatusFilter, setKycStatusFilter] = useState('PENDING')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const loadKyc = async () => {
      try {
        const data = await listAdminKyc(kycStatusFilter === 'ALL' ? undefined : kycStatusFilter)
        if (!isMounted) return
        setKycList(data)
      } catch {
        if (!isMounted) return
        setError('Unable to load KYC requests.')
      }
    }
    loadKyc()
    return () => {
      isMounted = false
    }
  }, [kycStatusFilter])

  const handleReviewKyc = async (item: AdminKycSummary, status: string) => {
    setMessage(null)
    setError(null)
    try {
      const updated = await reviewAdminKyc(item.userId, { status })
      setKycList((prev) => prev.map((entry) => (entry.id === item.id ? updated : entry)))
      setMessage(`KYC ${status.toLowerCase()} for ${updated.email ?? 'user'}.`)
    } catch {
      setError('Unable to review KYC request.')
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">KYC Review</p>
          <h2 className="display-font text-xl font-semibold text-white">Approve role upgrades</h2>
        </div>
        <select
          value={kycStatusFilter}
          onChange={(event) => setKycStatusFilter(event.target.value)}
          className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs text-white"
        >
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="ALL">All</option>
        </select>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      )}

      <div className="card-surface overflow-hidden rounded-3xl border border-white/10">
        <div className="grid grid-cols-[1.2fr_0.8fr_0.6fr_0.8fr_0.8fr] gap-3 border-b border-white/10 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">
          <span>User</span>
          <span>Requested role</span>
          <span>Status</span>
          <span>Submitted</span>
          <span>Action</span>
        </div>
        <div className="divide-y divide-white/10">
          {kycList.map((item) => (
            <div key={item.id} className="grid grid-cols-[1.2fr_0.8fr_0.6fr_0.8fr_0.8fr] items-center gap-3 px-6 py-4 text-sm text-white/80">
              <div>
                <div className="font-semibold text-white">{item.fullName || 'Unknown'}</div>
                <div className="text-xs text-white/40">{item.email || 'No email'}</div>
              </div>
              <span>{item.requestedRole || 'N/A'}</span>
              <span>
                <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${statusBadgeStyles[item.status] ?? 'border-white/10 bg-white/5 text-white/70'}`}>
                  {item.status}
                </span>
              </span>
              <span className="text-xs text-white/50">
                {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : '--'}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={item.status !== 'PENDING'}
                  onClick={() => handleReviewKyc(item, 'APPROVED')}
                  className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-200 disabled:opacity-40"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={item.status !== 'PENDING'}
                  onClick={() => handleReviewKyc(item, 'REJECTED')}
                  className="rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-200 disabled:opacity-40"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
          {kycList.length === 0 && (
            <div className="px-6 py-6 text-sm text-white/50">No KYC submissions.</div>
          )}
        </div>
      </div>
    </section>
  )
}
