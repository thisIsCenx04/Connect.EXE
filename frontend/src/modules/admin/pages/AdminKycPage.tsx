import { useEffect, useState } from 'react'
import {
  listAdminKyc,
  reviewAdminKyc,
  type AdminKycSummary,
} from '../../../services/admin'
import { AdminIconButton, AdminModal } from '../components/AdminUi'

const statusBadgeStyles: Record<string, string> = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
  APPROVED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  REJECTED: 'border-rose-200 bg-rose-50 text-rose-600',
}

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EditIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4 20 4.5-1 9-9-3.5-3.5-9 9L4 20Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m14 6 3.5 3.5" />
  </svg>
)

export function AdminKycPage() {
  const [kycList, setKycList] = useState<AdminKycSummary[]>([])
  const [kycStatusFilter, setKycStatusFilter] = useState('PENDING')
  const [selectedKyc, setSelectedKyc] = useState<AdminKycSummary | null>(null)
  const [reviewForm, setDuy?tForm] = useState({ status: 'PENDING', reviewNote: '' })
  const [activeModal, setActiveModal] = useState<null | 'detail' | 'review'>(null)
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
        setError('Kh?ng th? t?i y?u c?u KYC.')
      }
    }
    loadKyc()
    return () => {
      isMounted = false
    }
  }, [kycStatusFilter])

  const handleDuy?tKyc = async () => {
    if (!selectedKyc) return
    setMessage(null)
    setError(null)
    try {
      const updated = await reviewAdminKyc(selectedKyc.userId, {
        status: reviewForm.status,
        reviewNote: reviewForm.reviewNote || undefined,
      })
      setKycList((prev) => prev.map((entry) => (entry.id === selectedKyc.id ? updated : entry)))
      setMessage('L?u ??nh gi? th?nh c?ng.')
      setActiveModal(null)
    } catch {
      setError('Kh?ng th? duy?t y?u c?u KYC.')
    }
  }

  const openDetail = (item: AdminKycSummary) => {
    setSelectedKyc(item)
    setActiveModal('detail')
  }

  const openDuy?t = (item: AdminKycSummary) => {
    setSelectedKyc(item)
    setDuy?tForm({
      status: item.status ?? 'PENDING',
      reviewNote: item.reviewNote ?? '',
    })
    setActiveModal('review')
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Duy?t KYC</p>
          <h2 className="display-font text-2xl font-semibold text-slate-900">Duy?t n?ng c?p vai tr?</h2>
        </div>
        <select
          value={kycStatusFilter}
          onChange={(event) => setKycStatusFilter(event.target.value)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600"
        >
          <option value="PENDING">?ang ch?</option>
          <option value="APPROVED">?? duy?t</option>
          <option value="REJECTED">T? ch?i</option>
          <option value="ALL">T?t c?</option>
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
        <div className="grid grid-cols-[1.2fr_0.8fr_0.6fr_0.8fr_0.6fr] gap-3 border-b border-slate-200 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
          <span>Ng??i d?ng</span>
          <span>Vai tr? y?u c?u</span>
          <span>Tr?ng th?i</span>
          <span>?? g?i</span>
          <span>Thao t?c</span>
        </div>
        <div className="divide-y divide-slate-200">
          {kycList.map((item) => (
            <div key={item.id} className="grid grid-cols-[1.2fr_0.8fr_0.6fr_0.8fr_0.6fr] items-center gap-3 px-6 py-4 text-sm">
              <div>
                <div className="font-semibold text-slate-900">{item.fullName || 'Kh?ng r?'}</div>
                <div className="text-xs text-slate-400">{item.email || 'Kh?ng c? email'}</div>
              </div>
              <span className="text-slate-600">{item.requestedRole || 'N/A'}</span>
              <span>
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${
                    statusBadgeStyles[item.status] ?? 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  {item.status}
                </span>
              </span>
              <span className="text-xs text-slate-500">
                {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : '--'}
              </span>
              <div className="flex items-center gap-2">
                <AdminIconButton label="Xem chi ti?t" onClick={() => openDetail(item)}>
                  <EyeIcon />
                </AdminIconButton>
                <AdminIconButton label="Duy?t" onClick={() => openDuy?t(item)}>
                  <EditIcon />
                </AdminIconButton>
              </div>
            </div>
          ))}
          {kycList.length === 0 && (
            <div className="px-6 py-6 text-sm text-slate-500">Ch?a c? y?u c?u KYC.</div>
          )}
        </div>
      </div>

      <AdminModal
        open={activeModal === 'detail'}
        title="Chi ti?t KYC"
        onClose={() => setActiveModal(null)}
        size="md"
      >
        {selectedKyc ? (
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Email</span>
              <span>{selectedKyc.email || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">T? ch?c</span>
              <span>{selectedKyc.organization || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">T?i li?u</span>
              <span>{selectedKyc.docType || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">S? t?i li?u</span>
              <span>{selectedKyc.docNumber || '—'}</span>
            </div>
            {selectedKyc.docFileUrl && (
              <a
                href={selectedKyc.docFileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
              >
                Xem t?i li?u
              </a>
            )}
          </div>
        ) : (
          <div className="text-sm text-slate-500">Ch?n m?t y?u c?u KYC ?? xem chi ti?t.</div>
        )}
      </AdminModal>

      <AdminModal
        open={activeModal === 'review'}
        title="Duy?t KYC"
        onClose={() => setActiveModal(null)}
        size="sm"
      >
        {selectedKyc ? (
          <div className="space-y-4">
            <label className="text-xs text-slate-500">
              Status
              <select
                value={reviewForm.status}
                onChange={(event) => setDuy?tForm((prev) => ({ ...prev, status: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
              >
                <option value="PENDING">?ang ch?</option>
                <option value="APPROVED">?? duy?t</option>
                <option value="REJECTED">T? ch?i</option>
              </select>
            </label>
            <label className="text-xs text-slate-500">
              Duy?t note
              <textarea
                value={reviewForm.reviewNote}
                onChange={(event) => setDuy?tForm((prev) => ({ ...prev, reviewNote: event.target.value }))}
                rows={3}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
              />
            </label>
            <button
              type="button"
              onClick={handleDuy?tKyc}
              className="w-full rounded-full bg-slate-900 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white"
            >
              L?u ??nh gi?
            </button>
          </div>
        ) : (
          <div className="text-sm text-slate-500">Ch?n m?t y?u c?u KYC ?? duy?t.</div>
        )}
      </AdminModal>
    </section>
  )
}
