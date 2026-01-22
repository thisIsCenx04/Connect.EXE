import { useEffect, useMemo, useState } from 'react'
import { getRevenueSummary, type RevenueSummary } from '../../../services/admin'

export function AdminRevenuePage() {
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const loadRevenue = async () => {
      try {
        const data = await getRevenueSummary()
        if (!isMounted) return
        setRevenue(data)
      } catch {
        if (!isMounted) return
        setError('Unable to load revenue summary.')
      }
    }
    loadRevenue()
    return () => {
      isMounted = false
    }
  }, [])

  const currencyFormatter = useMemo(() => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }), [])

  const numberFormatter = useMemo(() => new Intl.NumberFormat('en-US'), [])

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Revenue</p>
        <h2 className="display-font text-xl font-semibold text-white">Subscription snapshot</h2>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="card-surface rounded-3xl border border-white/10 p-6">
          <div className="text-xs uppercase tracking-[0.3em] text-white/50">Total active</div>
          <div className="mt-2 text-2xl font-semibold text-white">
            {revenue ? numberFormatter.format(revenue.activeSubscriptions) : '--'}
          </div>
          <div className="mt-4 text-xs uppercase tracking-[0.3em] text-white/50">Estimated monthly revenue</div>
          <div className="mt-2 text-xl font-semibold text-white">
            {revenue ? currencyFormatter.format(revenue.estimatedMonthlyRevenue) : '--'}
          </div>
        </div>
        <div className="card-surface rounded-3xl border border-white/10 p-6">
          <div className="text-xs uppercase tracking-[0.3em] text-white/50">Plan breakdown</div>
          <div className="mt-4 space-y-3">
            {revenue?.planBreakdown.map((plan) => (
              <div key={plan.planCode} className="flex items-center justify-between text-sm text-white/80">
                <span>{plan.planCode}</span>
                <span>{numberFormatter.format(plan.activeSubscriptions)} subs</span>
                <span className="text-white/60">{currencyFormatter.format(plan.estimatedMonthlyRevenue)}</span>
              </div>
            ))}
            {!revenue?.planBreakdown.length && (
              <div className="text-sm text-white/50">No revenue data.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
