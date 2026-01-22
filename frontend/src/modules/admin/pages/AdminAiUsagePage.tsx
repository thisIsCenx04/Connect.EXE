import { useEffect, useMemo, useState } from 'react'
import { listAiUsage, type AiUsageSummary } from '../../../services/admin'

export function AdminAiUsagePage() {
  const [aiUsage, setAiUsage] = useState<AiUsageSummary[]>([])
  const [aiDays, setAiDays] = useState(30)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const loadAiUsage = async () => {
      try {
        const data = await listAiUsage(aiDays)
        if (!isMounted) return
        setAiUsage(data)
      } catch {
        if (!isMounted) return
        setError('Unable to load AI usage.')
      }
    }
    loadAiUsage()
    return () => {
      isMounted = false
    }
  }, [aiDays])

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

  const aiTopUsers = useMemo(() => {
    const map = new Map<string, { name: string; total: number }>()
    aiUsage.forEach((entry) => {
      const key = entry.userId
      const name = entry.fullName ?? entry.email ?? entry.userId
      const current = map.get(key) ?? { name, total: 0 }
      map.set(key, { name, total: current.total + entry.totalRequests })
    })
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [aiUsage])

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">AI Usage</p>
          <h2 className="display-font text-xl font-semibold text-white">Request volume</h2>
        </div>
        <select
          value={aiDays}
          onChange={(event) => setAiDays(Number(event.target.value))}
          className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs text-white"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="card-surface rounded-3xl border border-white/10 p-6">
          <div className="text-xs uppercase tracking-[0.3em] text-white/50">Requests by day</div>
          <div className="mt-4 flex h-36 items-end gap-2">
            {dailyAi.map((item) => (
              <div key={item.day} className="flex h-full flex-1 flex-col items-center justify-end">
                <div
                  className="w-full rounded-full bg-gradient-to-t from-sky-500/70 to-indigo-400/70"
                  style={{
                    height: aiMax === 0 ? '10%' : `${Math.max(12, (item.total / aiMax) * 100)}%`,
                  }}
                />
                <div className="mt-2 text-[10px] text-white/40">{item.day.slice(5)}</div>
              </div>
            ))}
            {dailyAi.length === 0 && (
              <div className="text-sm text-white/50">No AI usage yet.</div>
            )}
          </div>
        </div>
        <div className="card-surface rounded-3xl border border-white/10 p-6">
          <div className="text-xs uppercase tracking-[0.3em] text-white/50">Top users</div>
          <div className="mt-4 space-y-3">
            {aiTopUsers.map((user) => (
              <div key={user.name} className="flex items-center justify-between text-sm text-white/80">
                <span className="truncate">{user.name}</span>
                <span className="text-white/60">{numberFormatter.format(user.total)}</span>
              </div>
            ))}
            {aiTopUsers.length === 0 && (
              <div className="text-sm text-white/50">No usage data.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
