import { useEffect, useMemo, useState } from 'react'
import { fetchAiHistory, type AiHistoryItem } from '../../../services/ai'
import { AI_TOOL_LABELS } from '../data'

const FILTER_OPTIONS = ['ALL', 'LEGAL_FINANCE_BASIC', 'MARKET_RESEARCH', 'PITCH_CREATOR', 'IDEA_VALIDATOR']

export function AiHistoryPage() {
  const [history, setHistory] = useState<AiHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    let active = true
    fetchAiHistory(25)
      .then((data) => {
        if (!active) return
        setHistory(data)
        setError(null)
      })
      .catch(() => {
        if (!active) return
        setError('Không thể tải lịch sử.')
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filteredHistory = useMemo(() => {
    if (filter === 'ALL') return history
    return history.filter((item) => item.agentType === filter)
  }, [filter, history])

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Lịch sử AI</p>
          <h1 className="display-font text-2xl font-semibold text-white md:text-3xl">Lần chạy AI gần đây</h1>
        </div>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs text-white"
        >
          {FILTER_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === 'ALL' ? 'Tất cả công cụ' : AI_TOOL_LABELS[option] || option}
            </option>
          ))}
        </select>
      </header>

      {loading && (
        <div className="rounded-3xl border border-white/10 bg-black/30 p-6 text-sm text-white/60">
          Đang tải lịch sử...
        </div>
      )}

      {error && !loading && (
        <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
          {error}
        </div>
      )}

      {!loading && !error && filteredHistory.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-black/30 p-6 text-sm text-white/60">
          Chưa có lịch sử AI. Bắt đầu phân tích mới ở xem tại đây.
        </div>
      )}

      <div className="grid gap-4">
        {filteredHistory.map((item) => (
          <div key={item.id} className="card-surface rounded-3xl border border-white/10 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  {AI_TOOL_LABELS[item.agentType] || item.agentType}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">{item.status}</h3>
              </div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/40">
                {new Date(item.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Đầu vào</p>
                <p className="mt-2 text-sm text-white/70 whitespace-pre-wrap">{item.inputText}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Đầu ra</p>
                <p className="mt-2 text-sm text-white/70 whitespace-pre-wrap">
                  {item.outputText || item.errorMessage || 'Chưa có kết quả.'}
                </p>
              </div>
            </div>
            <div className="mt-4 text-[11px] uppercase tracking-[0.2em] text-white/40">
              Token: {item.promptTokens + item.completionTokens} · Chi phí: ${item.costUsd.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
