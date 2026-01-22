import { useState } from 'react'
import { marketAnalyze, type AiToolResponse } from '../../../services/ai'

export function AiMarketAnalyzerPage() {
  const [form, setForm] = useState({
    projectName: '',
    industry: '',
    region: '',
    description: '',
    targetCustomer: '',
    competitors: '',
    differentiator: '',
    goals: '',
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
      const response = await marketAnalyze(form)
      setResult(response)
    } catch {
      setError('Unable to generate market analysis. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">AI Tool</p>
        <h1 className="display-font text-2xl font-semibold text-white md:text-3xl">Market Analyzer</h1>
        <p className="max-w-2xl text-sm text-white/70">
          Describe your startup and get a structured market snapshot with demand drivers and next steps.
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
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Industry</label>
              <input
                value={form.industry}
                onChange={handleChange('industry')}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
                placeholder="Fintech, SaaS"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Region</label>
              <input
                value={form.region}
                onChange={handleChange('region')}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
                placeholder="Southeast Asia"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Target customer</label>
              <input
                value={form.targetCustomer}
                onChange={handleChange('targetCustomer')}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
                placeholder="SMB retailers, students"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/50">Description</label>
            <textarea
              value={form.description}
              onChange={handleChange('description')}
              required
              rows={5}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
              placeholder="What problem do you solve and why now?"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Competitors</label>
              <input
                value={form.competitors}
                onChange={handleChange('competitors')}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
                placeholder="Top 3 alternatives"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Differentiator</label>
              <input
                value={form.differentiator}
                onChange={handleChange('differentiator')}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
                placeholder="Unique data, faster onboarding"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/50">Goals</label>
            <input
              value={form.goals}
              onChange={handleChange('goals')}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
              placeholder="Validate pricing, grow waitlist"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white disabled:opacity-60"
            >
              {loading ? 'Generating...' : 'Generate analysis'}
            </button>
            {error && <span className="text-sm text-rose-300">{error}</span>}
          </div>
        </div>

        <div className="card-neo rounded-3xl border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Output</p>
          {!result && (
            <p className="mt-4 text-sm text-white/60">
              Your analysis will appear here. Fill in the form and hit generate.
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
