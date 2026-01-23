import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchAiHistory, type AiHistoryItem } from '../../services/ai'
import { AI_TOOL_LABELS, AI_TOOL_ROUTES } from './data'

export function AiLandingPage() {
  const navigate = useNavigate()
  const [recentRuns, setRecentRuns] = useState<AiHistoryItem[]>([])

  useEffect(() => {
    let active = true
    fetchAiHistory(3)
      .then((data) => {
        if (!active) return
        setRecentRuns(data)
      })
      .catch(() => {
        if (!active) return
        setRecentRuns([])
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-10">
      <section className="card-surface relative overflow-hidden rounded-[28px] border border-white/10 p-8">
        <div className="absolute -right-10 top-6 h-40 w-40 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">AI Toolkit</p>
          <h1 className="display-font text-3xl font-semibold text-white md:text-4xl">Build sharper startup decisions</h1>
          <p className="max-w-2xl text-sm text-white/70 md:text-base">
            Run market scans, pitchdeck outlines, and project evaluations in minutes. Each run is stored
            in your AI history so you can iterate fast.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(AI_TOOL_ROUTES.market)}
              className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white"
            >
              Start Market Scan
            </button>
            <button
              type="button"
              onClick={() => navigate(AI_TOOL_ROUTES.chat)}
              className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80"
            >
              Open AI Chat
            </button>
            <button
              type="button"
              onClick={() => navigate(AI_TOOL_ROUTES.history)}
              className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80"
            >
              View History
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <button
          type="button"
          onClick={() => navigate(AI_TOOL_ROUTES.chat)}
          className="card-surface flex flex-col items-start rounded-3xl border border-white/10 p-6 text-left transition hover:border-white/30"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">AI Chat</p>
          <h3 className="mt-3 text-lg font-semibold text-white">Ask and analyze instantly</h3>
          <p className="mt-2 text-sm text-white/60">
            A conversational assistant to explore ideas, markets, and next steps.
          </p>
        </button>
        <button
          type="button"
          onClick={() => navigate(AI_TOOL_ROUTES.market)}
          className="card-surface flex flex-col items-start rounded-3xl border border-white/10 p-6 text-left transition hover:border-white/30"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Market Analyzer</p>
          <h3 className="mt-3 text-lg font-semibold text-white">Map demand and competition</h3>
          <p className="mt-2 text-sm text-white/60">
            Turn your idea description into segments, competitors, and next steps.
          </p>
        </button>
        <button
          type="button"
          onClick={() => navigate(AI_TOOL_ROUTES.pitchdeck)}
          className="card-surface flex flex-col items-start rounded-3xl border border-white/10 p-6 text-left transition hover:border-white/30"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Pitchdeck Assistant</p>
          <h3 className="mt-3 text-lg font-semibold text-white">Generate a slide outline</h3>
          <p className="mt-2 text-sm text-white/60">
            Create a clean 10-slide story with traction, business model, and ask.
          </p>
        </button>
        <button
          type="button"
          onClick={() => navigate(AI_TOOL_ROUTES.evaluate)}
          className="card-surface flex flex-col items-start rounded-3xl border border-white/10 p-6 text-left transition hover:border-white/30"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Project Evaluator</p>
          <h3 className="mt-3 text-lg font-semibold text-white">Score key risks quickly</h3>
          <p className="mt-2 text-sm text-white/60">
            Get a structured evaluation with strengths, risks, and recommendations.
          </p>
        </button>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="card-neo rounded-3xl border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">How it works</p>
          <div className="mt-4 space-y-3 text-sm text-white/70">
            <p>1) Add your context (problem, solution, metrics).</p>
            <p>2) Generate an AI output for quick insights.</p>
            <p>3) Save and iterate from your history.</p>
          </div>
        </div>
        <div className="card-surface rounded-3xl border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Recent runs</p>
          <div className="mt-4 space-y-3">
            {recentRuns.length === 0 && (
              <p className="text-sm text-white/60">No AI runs yet. Start a new analysis.</p>
            )}
            {recentRuns.map((run) => (
              <div key={run.id} className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">
                  {AI_TOOL_LABELS[run.agentType] ?? run.agentType}
                </div>
                <div className="mt-1 max-h-10 overflow-hidden text-sm text-white/80">
                  {run.outputText ?? 'Pending output'}
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-white/40">
                  {new Date(run.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
