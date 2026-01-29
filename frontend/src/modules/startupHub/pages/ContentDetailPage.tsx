import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchContentDetail, type ContentItem } from '@/services/content'

const formatDate = (value?: string | null) => {
  if (!value) return 'Kh?ng c?'
  return new Date(value).toLocaleDateString('vi-VN')
}

export function ContentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState<ContentItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let active = true
    setLoading(true)
    setError(null)
    fetchContentDetail(id)
      .then((data) => {
        if (!active) return
        setItem(data)
      })
      .catch(() => {
        if (!active) return
        setError('Không thể tải nội dung.')
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
    return <div className="text-sm text-white/60">Đang tải nội dung...</div>
  }

  if (error || !item) {
    return <div className="text-sm text-rose-300">{error ?? 'Không tìm thấy nội dung.'}</div>
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

      <section className="card-surface overflow-hidden rounded-[28px] border border-white/10">
        <div className="relative aspect-[21/9] w-full">
          <img
            src={item.coverUrl ?? 'https://picsum.photos/seed/startup/1200/600'}
            alt={item.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex items-end px-8 pb-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">{item.type}</p>
              <h1 className="display-font text-3xl font-semibold text-white md:text-4xl">{item.title}</h1>
              <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.2em] text-white/60">
                <span>{formatDate(item.startAt ?? item.publishedAt)}</span>
                {item.location && <span>• {item.location}</span>}
                {item.externalUrl && <span>• Link ngoài</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <article className="card-neo space-y-4 rounded-3xl border border-white/10 p-6 text-white/80">
          {item.summary && <p className="text-base text-white/80">{item.summary}</p>}
          <div className="text-sm leading-relaxed text-white/70 whitespace-pre-line">
            {item.body ?? 'Nội dung đang được cập nhật.'}
          </div>
        </article>

        <aside className="card-surface rounded-3xl border border-white/10 p-6">
          <h3 className="text-xs uppercase tracking-[0.3em] text-white/50">Thông tin</h3>
          <div className="mt-4 space-y-3 text-sm text-white/70">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">Thời gian</p>
              <p className="mt-1 text-white/80">{formatDate(item.startAt ?? item.publishedAt)}</p>
            </div>
            {item.endAt && (
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Kết thúc</p>
                <p className="mt-1 text-white/80">{formatDate(item.endAt)}</p>
              </div>
            )}
            {item.location && (
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Địa điểm</p>
                <p className="mt-1 text-white/80">{item.location}</p>
              </div>
            )}
            {item.externalUrl && (
              <a
                href={item.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full border border-white/20 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-white/80 transition hover:border-white/40 hover:text-white"
              >
                Xem chi tiết
              </a>
            )}
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  )
}
