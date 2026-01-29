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
      setError('Không thể tạo phân tích thị trường. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Công cụ AI</p>
        <h1 className="display-font text-2xl font-semibold text-white md:text-3xl">Phân tích thị trường</h1>
        <p className="max-w-2xl text-sm text-white/70">
          Mô tả startup của bạn và nhận bản tóm tắt thị trường có cấu trúc với động lực nhu cầu và bước tiếp theo.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card-surface rounded-3xl border border-white/10 p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Tên dự án</label>
              <input
                value={form.projectName}
                onChange={handleChange('projectName')}
                required
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
                placeholder="NovaPay"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Lĩnh vực</label>
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
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Khu vực</label>
              <input
                value={form.region}
                onChange={handleChange('region')}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
                placeholder="Southeast Asia"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Khách hàng mục tiêu</label>
              <input
                value={form.targetCustomer}
                onChange={handleChange('targetCustomer')}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
                placeholder="SMB retailers, students"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/50">M? t?</label>
            <textarea
              value={form.description}
              onChange={handleChange('description')}
              required
              rows={5}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white"
              placeholder="Bạn giải quyết vấn đề gì và vì sao là bây giờ?"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">?i th?</label>
              <input
                value={form.competitors}
                onChange={handleChange('competitors')}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
                placeholder="Top 3 lựa chọn thay thế"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-white/50">Điểm khác biệt</label>
              <input
                value={form.differentiator}
                onChange={handleChange('differentiator')}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
                placeholder="Dữ liệu độc đáo, onboarding nhanh hơn"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.2em] text-white/50">Mục tiêu</label>
            <input
              value={form.goals}
              onChange={handleChange('goals')}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm text-white"
              placeholder="Xác thực giả, tăng danh sách chờ"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white disabled:opacity-60"
            >
              {loading ? 'Đang tạo...' : 'Tạo phân tích'}
            </button>
            {error && <span className="text-sm text-rose-300">{error}</span>}
          </div>
        </div>

        <div className="card-neo rounded-3xl border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Kết quả</p>
          {!result && (
            <p className="mt-4 text-sm text-white/60">
              Kết quả phân tích sẽ hiển thị ở đây. Điền form và nhấn tạo.
            </p>
          )}
          {result && (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/80 whitespace-pre-wrap">
                {result.outputText}
              </div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                Token: {result.promptTokens + result.completionTokens} · Chi ph?: ${result.costUsd.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
