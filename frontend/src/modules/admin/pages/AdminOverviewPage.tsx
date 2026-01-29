import { useEffect, useMemo, useState } from 'react'
import { fetchAdminOverview, listAiUsage, type AdminOverview, type AiUsageSummary } from '../../../services/admin'

export function AdminOverviewPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [aiUsage, setAiUsage] = useState<AiUsageSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const loadOverview = async () => {
      try {
        const data = await fetchAdminOverview()
        if (!isMounted) return
        setOverview(data)
      } catch {
        if (!isMounted) return
        setError('Kh?ng th? t?i t?ng quan.')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    loadOverview()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let active = true
    const loadAiUsage = async () => {
      try {
        const data = await listAiUsage(14)
        if (!active) return
        setAiUsage(data)
      } catch {
        if (!active) return
        setAiError('Kh?ng th? t?i xu h??ng s? d?ng AI.')
      }
    }
    loadAiUsage()
    return () => {
      active = false
    }
  }, [])

  const overviewCards = useMemo(() => {
    if (!overview) return []
    return [
      { label: 'T?ng ng??i d?ng', value: overview.totalUsers },
      { label: 'Ng??i d?ng ho?t ??ng', value: overview.activeUsers },
      { label: 'KYC ?ang ch?', value: overview.pendingKyc },
      { label: 'D? ?n ?ang ch?', value: overview.pendingProjects },
      { label: 'G?i ?ang ho?t ??ng', value: overview.activeSubscriptions },
      { label: 'Y?u c?u AI (30 ng?y)', value: overview.aiRequestsLast30Days },
    ]
  }, [overview])

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
    []
  )

  const numberFormatter = useMemo(() => new Intl.NumberFormat('en-US'), [])

  const dailyAi = useMemo(() => {
    const map = new Map<string, number>()
    aiUsage.forEach((entry) => {
      const dayKey = entry.day
      map.set(dayKey, (map.get(dayKey) ?? 0) + entry.totalRequests)
    })
    return Array.from(map.entries())
      .map(([day, total]) => ({ day, total }))
      .sort((a, b) => a.day.localeCompare(b.day))
      .slice(-14)
  }, [aiUsage])

  const aiMax = useMemo(() => {
    return dailyAi.reduce((max, item) => Math.max(max, item.total), 0)
  }, [dailyAi])

  const aiLine = useMemo(() => {
    if (dailyAi.length === 0) return ''
    return dailyAi
      .map((item, index) => {
        const x = (index / Math.max(1, dailyAi.length - 1)) * 100
        const y = 40 - (aiMax === 0 ? 0 : (item.total / aiMax) * 32)
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
      })
      .join(' ')
  }, [aiMax, dailyAi])

  const activeUsers = overview?.activeUsers ?? 0
  const totalUsers = overview?.totalUsers ?? 0
  const inactiveUsers = Math.max(totalUsers - activeUsers, 0)
  const activePercent = totalUsers === 0 ? 0 : Math.round((activeUsers / totalUsers) * 100)

  const pipelineItems = useMemo(() => {
    if (!overview) return []
    return [
      { label: 'KYC ?ang ch?', value: overview.pendingKyc },
      { label: 'Pending Projects', value: overview.pendingProjects },
      { label: 'Active Subscriptions', value: overview.activeSubscriptions },
    ]
  }, [overview])

  const pipelineMax = useMemo(() => {
    return pipelineItems.reduce((max, item) => Math.max(max, item.value), 0)
  }, [pipelineItems])

  return (
    <section id="overview" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">T?ng quan</p>
          <h2 className="display-font text-2xl font-semibold text-slate-900">T?m t?t v?n h?nh</h2>
        </div>
        {overview && (
          <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-600">
            Doanh thu th?ng: {currencyFormatter.format(overview.estimatedMonthlyRevenue)}
          </div>
        )}
      </div>
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}
      {loading && <div className="text-sm text-slate-500">?ang t?i t?ng quan...</div>}
      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {overviewCards.map((card) => (
            <div
              key={card.label}
              className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
            >
              <div className="text-xs uppercase tracking-[0.3em] text-slate-400">{card.label}</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">{numberFormatter.format(card.value)}</div>
            </div>
          ))}
          {overview && (
            <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Chi ph? AI (30 ng?y)</div>
              <div className="mt-2 text-2xl font-semibold text-slate-900">
                {currencyFormatter.format(overview.aiSpendLast30Days)}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Y?u c?u AI</p>
              <h3 className="text-lg font-semibold text-slate-900">Xu h??ng 14 ng?y</h3>
            </div>
            {aiError && <span className="text-xs text-rose-500">{aiError}</span>}
          </div>
          <div className="mt-6">
            {dailyAi.length > 0 ? (
              <svg viewBox="0 0 100 40" className="h-32 w-full">
                <defs>
                  <linearGradient id="ai-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fdba74" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#fca5a5" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={`${aiLine} L 100 40 L 0 40 Z`} fill="url(#ai-area)" />
                <path d={aiLine} fill="none" stroke="#fb7185" strokeWidth="2" />
              </svg>
            ) : (
              <div className="text-sm text-slate-500">Ch?a c? xu h??ng s? d?ng AI.</div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
            <span>14 ng?y g?n ??y</span>
            <span>{numberFormatter.format(aiMax)} y?u c?u t?i ?a</span>
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">T? l? ng??i d?ng</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">Ho?t ??ng vs kh?ng ho?t ??ng</h3>
          <div className="mt-6 flex flex-wrap items-center gap-6">
            <div
              className="relative h-40 w-40 rounded-full"
              style={{
                background: `conic-gradient(#fb7185 0 ${activePercent}%, #e2e8f0 ${activePercent}% 100%)`,
              }}
            >
              <div className="absolute inset-5 rounded-full bg-white" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-semibold text-slate-900">{activePercent}%</span>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span>Ho?t ??ng: {numberFormatter.format(activeUsers)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-slate-200" />
                <span>Kh?ng ho?t ??ng: {numberFormatter.format(inactiveUsers)}</span>
              </div>
              <div className="text-xs text-slate-500">T?ng ng??i d?ng: {numberFormatter.format(totalUsers)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">T?i pipeline</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">Quy m? h?ng ??i v?n h?nh</h3>
          <div className="mt-6 space-y-4">
            {pipelineItems.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>{item.label}</span>
                  <span>{numberFormatter.format(item.value)}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-orange-300 to-rose-300"
                    style={{
                      width: pipelineMax === 0 ? '6%' : `${(item.value / pipelineMax) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {!pipelineItems.length && <div className="text-sm text-slate-500">Ch?a c? d? li?u pipeline.</div>}
          </div>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">S?c kh?e doanh thu</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">Hi?u su?t h?ng th?ng</h3>
          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Doanh thu ??c t?nh h?ng th?ng</span>
              <span className="font-semibold text-slate-900">
                {overview ? currencyFormatter.format(overview.estimatedMonthlyRevenue) : '--'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Chi ph? AI (30 ng?y)</span>
              <span className="font-semibold text-slate-900">
                {overview ? currencyFormatter.format(overview.aiSpendLast30Days) : '--'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total Y?u c?u AI</span>
              <span className="font-semibold text-slate-900">
                {overview ? numberFormatter.format(overview.totalAiRequests) : '--'}
              </span>
            </div>
          </div>
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-orange-100 via-amber-50 to-rose-50 p-4 text-xs text-slate-600">
            Gi? burn rate d??i 10% MRR ?? duy tr? bi?n l?i nhu?n l?nh m?nh.
          </div>
        </div>
      </div>
    </section>
  )
}
