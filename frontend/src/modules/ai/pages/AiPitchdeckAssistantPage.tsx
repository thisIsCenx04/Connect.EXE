import { useState } from 'react'
import { generatePitchdeck, type AiToolResponse } from '../../../services/ai'

export function AiPitchdeckAssistantPage() {
  const [form, setForm] = useState({
    projectName: '',
    problem: '',
    solution: '',
    market: '',
    businessModel: '',
    traction: '',
    team: '',
    ask: '',
    notes: '',
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
      const response = await generatePitchdeck(form)
      setResult(response)
    } catch {
      setError('Unable to generate a pitchdeck outline. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">AI Tool</p>
        <h1 className="display-font text-2xl font-semibold text-white md:text-3xl">Pitchdeck Assistant</h1>
        <p className="max-w-2xl text-sm text-white/70">
          Convert your pitch inputs into a structured 10-slide outline you can refine.
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
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Ask</label>
              <input
                value={form.ask}
                onChange={handleChange('ask')}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
                placeholder="$250k for 18 months runway"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/50">Problem</label>
            <textarea
              value={form.problem}
              onChange={handleChange('problem')}
              required
              rows={4}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
              placeholder="Describe the core pain point."
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/50">Solution</label>
            <textarea
              value={form.solution}
              onChange={handleChange('solution')}
              required
              rows={4}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
              placeholder="Explain how you solve the problem."
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Market</label>
              <textarea
                value={form.market}
                onChange={handleChange('market')}
                rows={3}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
                placeholder="TAM/SAM/SOM, growth rates"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Business model</label>
              <textarea
                value={form.businessModel}
                onChange={handleChange('businessModel')}
                rows={3}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
                placeholder="Pricing, channels, margins"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Traction</label>
              <input
                value={form.traction}
                onChange={handleChange('traction')}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
                placeholder="Pilots, revenue, waitlist"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Team</label>
              <input
                value={form.team}
                onChange={handleChange('team')}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
                placeholder="Founder bios, key hires"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/50">Notes</label>
            <input
              value={form.notes}
              onChange={handleChange('notes')}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
              placeholder="Special highlights or constraints"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-6 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white disabled:opacity-60"
            >
              {loading ? 'Generating...' : 'Generate outline'}
            </button>
            {error && <span className="text-sm text-rose-300">{error}</span>}
          </div>
        </div>

        <div className="card-neo rounded-3xl border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Output</p>
          {!result && (
            <p className="mt-4 text-sm text-white/60">
              Your pitch outline will appear here.
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
