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
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Bộ công cụ AI</p>
          <h1 className="display-font text-3xl font-semibold text-white md:text-4xl">Ra quyết định startup sắc bén hơn</h1>
          <p className="max-w-2xl text-sm text-white/70 md:text-base">
            Chạy quét thị trường, dàn ý pitch deck và đánh giá dự án chỉ trong vài phút. Mỗi lần chạy được lưu
            vào lịch sử AI để bạn lặp nhanh.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate(AI_TOOL_ROUTES.market)}
              className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white"
            >
              Bắt đầu quét thị trường
            </button>
            <button
              type="button"
              onClick={() => navigate(AI_TOOL_ROUTES.chat)}
              className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80"
            >
              Mở trò chuyện AI
            </button>
            <button
              type="button"
              onClick={() => navigate(AI_TOOL_ROUTES.history)}
              className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80"
            >
              Xem lịch sử
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
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Trò chuyện AI</p>
          <h3 className="mt-3 text-lg font-semibold text-white">Hỏi và phân tích ngay</h3>
          <p className="mt-2 text-sm text-white/60">
            Trợ lý hội thoại để khám phá ý tưởng, thị trường và bước tiếp theo.
          </p>
        </button>
        <button
          type="button"
          onClick={() => navigate(AI_TOOL_ROUTES.market)}
          className="card-surface flex flex-col items-start rounded-3xl border border-white/10 p-6 text-left transition hover:border-white/30"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Phân tích thị trường</p>
          <h3 className="mt-3 text-lg font-semibold text-white">Vẽ bản đồ nhu cầu và cạnh tranh</h3>
          <p className="mt-2 text-sm text-white/60">
            Biến mô tả ý tưởng thành phân khúc, đối thủ và bước tiếp theo.
          </p>
        </button>
        <button
          type="button"
          onClick={() => navigate(AI_TOOL_ROUTES.pitchdeck)}
          className="card-surface flex flex-col items-start rounded-3xl border border-white/10 p-6 text-left transition hover:border-white/30"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Trợ lý Pitch Deck</p>
          <h3 className="mt-3 text-lg font-semibold text-white">Tạo dàn ý slide</h3>
          <p className="mt-2 text-sm text-white/60">
            Tạo câu chuyện 10 slide rõ ràng với traction, mô hình kinh doanh và đề nghị.
          </p>
        </button>
        <button
          type="button"
          onClick={() => navigate(AI_TOOL_ROUTES.evaluate)}
          className="card-surface flex flex-col items-start rounded-3xl border border-white/10 p-6 text-left transition hover:border-white/30"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Đánh giá dự án</p>
          <h3 className="mt-3 text-lg font-semibold text-white">Chấm điểm rủi ro chính nhanh chóng</h3>
          <p className="mt-2 text-sm text-white/60">
            Nhận đánh giá có cấu trúc với điểm mạnh, rủi ro và khuyến nghị.
          </p>
        </button>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="card-neo rounded-3xl border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Cách hoạt động</p>
          <div className="mt-4 space-y-3 text-sm text-white/70">
            <p>1) Thêm bối cảnh (vấn đề, giải pháp, chỉ số).</p>
            <p>2) Tạo đầu ra AI để có insight nhanh.</p>
            <p>3) Lưu và lặp lại từ lịch sử.</p>
          </div>
        </div>
        <div className="card-surface rounded-3xl border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Lần chạy gần đây</p>
          <div className="mt-4 space-y-3">
            {recentRuns.length === 0 && (
              <p className="text-sm text-white/60">Chưa có lần chạy AI. Bắt đầu phân tích mới.</p>
            )}
            {recentRuns.map((run) => (
              <div key={run.id} className="rounded-2xl border border-white/10 bg-black/30 p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">
                  {AI_TOOL_LABELS[run.agentType] ?? run.agentType}
                </div>
                <div className="mt-1 max-h-10 overflow-hidden text-sm text-white/80">
                  {run.outputText ?? 'Đang chờ kết quả'}
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
