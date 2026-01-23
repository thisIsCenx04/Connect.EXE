import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchResourceDetail, type ResourceItem } from '@/services/content'

export function ResourceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState<ResourceItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let active = true
    fetchResourceDetail(id)
      .then((data) => {
        if (!active) return
        setItem(data)
      })
      .catch(() => {
        if (!active) return
        setError('Không thể tải học liệu.')
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return <div className="text-sm text-white/60">Đang tải học liệu...</div>
  }

  if (error || !item) {
    return <div className="text-sm text-rose-300">{error ?? 'Không tìm thấy học liệu.'}</div>
  }

  return (
    <div className="space-y-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-xs uppercase tracking-[0.3em] text-white/50 hover:text-white"
      >
        ← Quay lại
      </button>

      <section className="card-surface rounded-[28px] border border-white/10 p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">{item.type}</p>
        <h1 className="display-font mt-2 text-3xl font-semibold text-white">{item.title}</h1>
        {item.description && <p className="mt-3 text-sm text-white/70">{item.description}</p>}
        <div className="mt-5 flex flex-wrap gap-2">
          {item.tags?.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-gradient-to-r from-emerald-400/80 to-teal-500/80 px-5 py-2 text-[10px] uppercase tracking-[0.3em] text-white"
          >
            Mở tài liệu
          </a>
        </div>
      </section>
    </div>
  )
}
