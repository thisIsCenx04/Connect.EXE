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

  const maxPlanValue = useMemo(() => {
    return revenue?.planBreakdown.reduce((max, plan) => Math.max(max, plan.activeSubscriptions), 0) ?? 0
  }, [revenue])

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Revenue</p>
        <h2 className="display-font text-2xl font-semibold text-slate-900">Subscription snapshot</h2>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Total active</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {revenue ? numberFormatter.format(revenue.activeSubscriptions) : '--'}
          </div>
          <div className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-400">Estimated monthly revenue</div>
          <div className="mt-2 text-xl font-semibold text-slate-900">
            {revenue ? currencyFormatter.format(revenue.estimatedMonthlyRevenue) : '--'}
          </div>
        </div>
        <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Plan breakdown</div>
          <div className="mt-4 space-y-4">
            {revenue?.planBreakdown.map((plan) => (
              <div key={plan.planCode} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>{plan.planCode}</span>
                  <span>{numberFormatter.format(plan.activeSubscriptions)} subs</span>
                  <span className="text-slate-500">{currencyFormatter.format(plan.estimatedMonthlyRevenue)}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-orange-300 to-rose-300"
                    style={{
                      width: maxPlanValue === 0 ? '8%' : `${(plan.activeSubscriptions / maxPlanValue) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            {!revenue?.planBreakdown.length && (
              <div className="text-sm text-slate-500">No revenue data.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
