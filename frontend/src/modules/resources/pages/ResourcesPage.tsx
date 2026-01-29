import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchResourceList, type ResourceItem } from '@/services/content'

export function ResourcesPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<ResourceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true
    fetchResourceList()
      .then((data) => {
        if (!active) return
        setItems(data)
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
  }, [])

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items
    const lower = query.toLowerCase()
    return items.filter((item) =>
      item.title.toLowerCase().includes(lower) ||
      item.description?.toLowerCase().includes(lower) ||
      item.tags?.some((tag) => tag.toLowerCase().includes(lower))
    )
  }, [items, query])

  return (
    <div className="space-y-8">
      <section className="card-surface relative overflow-hidden rounded-[28px] border border-white/10 p-8">
        <div className="absolute -right-10 top-6 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="relative space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Thư viện tài nguyên</p>
          <h1 className="display-font text-3xl font-semibold text-white md:text-4xl">
            Kho học liệu khởi nghiệp
          </h1>
          <p className="max-w-2xl text-sm text-white/70 md:text-base">
            Bộ tài liệu, template, slide và link tham khảo cho founder và đội ngũ.
          </p>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="card-neo flex w-full items-center gap-2 rounded-full border border-white/10 px-4 py-2 md:w-80">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/50" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
          </svg>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm học liệu..."
            className="w-full bg-transparent text-sm text-white placeholder-white/40 outline-none"
          />
        </div>
        <span className="text-xs uppercase tracking-[0.3em] text-white/40">{filteredItems.length} mục</span>
      </section>

      {loading && <div className="text-sm text-white/60">Đang tải học liệu...</div>}
      {error && <div className="text-sm text-rose-300">{error}</div>}

      {!loading && !error && (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div key={item.id} className="card-neo rounded-3xl border border-white/10 p-5">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/50">
                <span>{item.type}</span>
                <span>{item.tags?.[0] ?? 'Tài nguyên'}</span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
              {item.description && <p className="mt-2 text-sm text-white/60 line-clamp-2">{item.description}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {item.tags?.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/resources/${item.id}`)}
                  className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white/80 transition hover:border-white/40"
                >
                  Xem chi tiết
                </button>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-gradient-to-r from-emerald-400/80 to-teal-500/80 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-white"
                >
                  Mở tài liệu
                </a>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
