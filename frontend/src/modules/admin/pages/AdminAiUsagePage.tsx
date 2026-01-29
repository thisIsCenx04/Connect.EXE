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
        setError('Kh?ng th? t?i d? li?u s? d?ng AI.')
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
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">S? d?ng AI</p>
          <h2 className="display-font text-2xl font-semibold text-slate-900">L??ng y?u c?u</h2>
        </div>
        <select
          value={aiDays}
          onChange={(event) => setAiDays(Number(event.target.value))}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600"
        >
          <option value={7}>7 ng?y g?n ??y</option>
          <option value={14}>14 ng?y g?n ??y</option>
          <option value={30}>30 ng?y g?n ??y</option>
        </select>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Y?u c?u theo ng?y</div>
          <div className="mt-4 flex h-36 items-end gap-2">
            {dailyAi.map((item) => (
              <div key={item.day} className="flex h-full flex-1 flex-col items-center justify-end">
                <div
                  className="w-full rounded-full bg-gradient-to-t from-orange-300 to-rose-300"
                  style={{
                    height: aiMax === 0 ? '10%' : `${Math.max(12, (item.total / aiMax) * 100)}%`,
                  }}
                />
                <div className="mt-2 text-[10px] text-slate-400">{item.day.slice(5)}</div>
              </div>
            ))}
            {dailyAi.length === 0 && (
              <div className="text-sm text-slate-500">Ch?a c? d? li?u s? d?ng AI.</div>
            )}
          </div>
        </div>
        <div className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Ng??i d?ng h?ng ??u</div>
          <div className="mt-4 space-y-3">
            {aiTopUsers.map((user) => (
              <div key={user.name} className="flex items-center justify-between text-sm text-slate-700">
                <span className="truncate">{user.name}</span>
                <span className="text-slate-500">{numberFormatter.format(user.total)}</span>
              </div>
            ))}
            {aiTopUsers.length === 0 && (
              <div className="text-sm text-slate-500">Ch?a c? d? li?u.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
