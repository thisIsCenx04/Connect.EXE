import { useEffect, useMemo, useState } from 'react'
import { fetchAdminOverview, type AdminOverview } from '../../../services/admin'

export function AdminOverviewPage() {
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [error, setError] = useState<string | null>(null)
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
        setError('Unable to load overview.')
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

  const overviewCards = useMemo(() => {
    if (!overview) return []
    return [
      { label: 'Total users', value: overview.totalUsers },
      { label: 'Active users', value: overview.activeUsers },
      { label: 'Pending KYC', value: overview.pendingKyc },
      { label: 'Pending projects', value: overview.pendingProjects },
      { label: 'Active subscriptions', value: overview.activeSubscriptions },
      { label: 'AI requests (30d)', value: overview.aiRequestsLast30Days },
    ]
  }, [overview])

  const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }), [])

  const numberFormatter = useMemo(() => new Intl.NumberFormat('en-US'), [])

  return (
    <section id="overview" className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Overview</p>
          <h2 className="display-font text-xl font-semibold text-white">Operational snapshot</h2>
        </div>
        {overview && (
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/60">
            Monthly revenue: {currencyFormatter.format(overview.estimatedMonthlyRevenue)}
          </div>
        )}
      </div>
      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}
      {loading && (
        <div className="text-sm text-white/60">Loading summary...</div>
      )}
      {!loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {overviewCards.map((card) => (
            <div key={card.label} className="card-surface rounded-3xl border border-white/10 p-5">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">{card.label}</div>
              <div className="mt-2 text-2xl font-semibold text-white">{numberFormatter.format(card.value)}</div>
            </div>
          ))}
          {overview && (
            <div className="card-surface rounded-3xl border border-white/10 p-5">
              <div className="text-xs uppercase tracking-[0.3em] text-white/50">AI spend (30d)</div>
              <div className="mt-2 text-2xl font-semibold text-white">
                {currencyFormatter.format(overview.aiSpendLast30Days)}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
