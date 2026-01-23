import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchContentList, type ContentItem, type ContentType } from '@/services/content'

const CONTENT_TABS: { key: ContentType; label: string; description: string }[] = [
  { key: 'ARTICLE', label: 'Bài viết', description: 'Phân tích, chia sẻ kiến thức và góc nhìn thị trường.' },
  { key: 'EVENT', label: 'Sự kiện', description: 'Workshop, demo day, networking và các buổi gặp gỡ.' },
  { key: 'COMPETITION', label: 'Cuộc thi', description: 'Cuộc thi khởi nghiệp, gọi vốn, pitch battle.' },
  { key: 'TREND', label: 'Xu hướng', description: 'Insight, tín hiệu thị trường, case study nổi bật.' },
]

const formatDate = (value?: string | null) => {
  if (!value) return null
  return new Date(value).toLocaleDateString('vi-VN')
}

export function StartupHubPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = (searchParams.get('tab') as ContentType | null) ?? 'ARTICLE'
  const [activeTab, setActiveTab] = useState<ContentType>(initialTab)
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    fetchContentList(activeTab)
      .then((data) => {
        if (!active) return
        setItems(data)
      })
      .catch(() => {
        if (!active) return
        setError('Không thể tải nội dung. Vui lòng thử lại.')
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [activeTab])

  const selectedTab = useMemo(
    () => CONTENT_TABS.find((tab) => tab.key === activeTab) ?? CONTENT_TABS[0],
    [activeTab]
  )

  return (
    <div className="space-y-8">
      <section className="card-surface relative overflow-hidden rounded-[28px] border border-white/10 p-8">
        <div className="absolute -right-10 top-6 h-40 w-40 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="relative space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Startup Hub</p>
          <h1 className="display-font text-3xl font-semibold text-white md:text-4xl">
            Tin tức & xu hướng khởi nghiệp
          </h1>
          <p className="max-w-2xl text-sm text-white/70 md:text-base">
            Tổng hợp bài viết, sự kiện, cuộc thi và insight giúp founder ra quyết định nhanh hơn.
          </p>
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        {CONTENT_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key)
              setSearchParams({ tab: tab.key })
            }}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] ${
              activeTab === tab.key
                ? 'border-sky-400/60 bg-sky-500/20 text-sky-100'
                : 'border-white/15 bg-white/5 text-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </section>

      <section className="card-neo rounded-3xl border border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">{selectedTab.label}</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{selectedTab.description}</h2>
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-white/40">
            {items.length} mục
          </span>
        </div>
      </section>

      {loading && <div className="text-sm text-white/60">Đang tải nội dung...</div>}
      {error && <div className="text-sm text-rose-300">{error}</div>}

      {!loading && !error && (
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(`/news/${item.id}`)}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left transition hover:border-white/20"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={item.coverUrl ?? 'https://picsum.photos/seed/startup/600/400'}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="space-y-2 p-4">
                <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.2em] text-white/50">
                  {formatDate(item.startAt ?? item.publishedAt) ?? '—'}
                  {item.location ? <span>• {item.location}</span> : null}
                </div>
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                {item.summary && <p className="text-sm text-white/60 line-clamp-2">{item.summary}</p>}
                <div className="flex flex-wrap gap-2">
                  {item.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </section>
      )}
    </div>
  )
}
