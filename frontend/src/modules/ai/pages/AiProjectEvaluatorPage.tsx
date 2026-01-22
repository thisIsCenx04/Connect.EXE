import { useState } from 'react'
import { evaluateProject, type AiToolResponse } from '../../../services/ai'

export function AiProjectEvaluatorPage() {
  const [form, setForm] = useState({
    projectName: '',
    summary: '',
    stage: '',
    metrics: '',
    fundingNeed: '',
    team: '',
    strengths: '',
    risks: '',
  })
  const [result, setResult] = useState<AiToolResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await evaluateProject(form)
      setResult(response)
    } catch {
      setError('Unable to run the evaluation. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">AI Tool</p>
        <h1 className="display-font text-2xl font-semibold text-white md:text-3xl">Project Evaluator</h1>
        <p className="max-w-2xl text-sm text-white/70">
          Get an instant scorecard with strengths, risks, and next-step recommendations.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card-surface rounded-3xl border border-white/10 p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Project name</label>
              <input
                value={form.projectName}
                onChange={handleChange('projectName')}
                required
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
                placeholder="NovaPay"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Stage</label>
              <input
                value={form.stage}
                onChange={handleChange('stage')}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
                placeholder="Pre-seed, Seed"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/50">Summary</label>
            <textarea
              value={form.summary}
              onChange={handleChange('summary')}
              required
              rows={4}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
              placeholder="Explain your product, customer, and traction."
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/50">Metrics</label>
            <input
              value={form.metrics}
              onChange={handleChange('metrics')}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
              placeholder="MRR, activation rate, pilot results"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Funding need</label>
              <input
                value={form.fundingNeed}
                onChange={handleChange('fundingNeed')}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
                placeholder="$150k runway 12 months"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Team</label>
              <input
                value={form.team}
                onChange={handleChange('team')}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
                placeholder="CEO ex-Stripe, CTO ex-Grab"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Strengths</label>
              <textarea
                value={form.strengths}
                onChange={handleChange('strengths')}
                rows={3}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
                placeholder="Unique data, speed to market"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Risks</label>
              <textarea
                value={form.risks}
                onChange={handleChange('risks')}
                rows={3}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
                placeholder="Distribution, regulations"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white disabled:opacity-60"
            >
              {loading ? 'Generating...' : 'Generate evaluation'}
            </button>
            {error && <span className="text-sm text-rose-300">{error}</span>}
          </div>
        </div>

        <div className="card-neo rounded-3xl border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Output</p>
          {!result && (
            <p className="mt-4 text-sm text-white/60">
              Your evaluation will appear here.
            </p>
          )}
          {result && (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/80 whitespace-pre-wrap">
                {result.outputText}
              </div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                Tokens: {result.promptTokens + result.completionTokens} · Cost: ${result.costUsd.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
