import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listHallOfFamePosts, type HallOfFamePost } from '../../../services/hallOfFame'

const types = ['STARTUP', 'PERSON', 'PROJECT_STORY']

export function HallOfFameListPage() {
  const [entries, setEntries] = useState<HallOfFamePost[]>([])
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState('')

  const loadEntries = async () => {
    setLoading(true)
    try {
      const data = await listHallOfFamePosts({ type: type || undefined })
      setEntries(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEntries()
  }, [])

  const stats = [
    { label: 'Bài viết', value: `${entries.length || 0}+` },
    { label: 'Nhân vật nổi bật', value: '12+' },
    { label: 'Dự án truyền cảm hứng', value: '30+' },
  ]

  return (
    <div className="space-y-10">
      <section className="card-neo rounded-[28px] p-6 md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Sảnh Danh Vọng</p>
            <h1 className="display-font text-3xl font-semibold md:text-4xl">Câu chuyện truyền cảm hứng</h1>
            <p className="max-w-2xl text-sm text-white/70">
              Bài viết nổi bật do admin tuyển chọn hoặc chuyển từ Sàn Dự Án.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/hall-of-fame/apply"
              className="rounded-full btn-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-glow"
            >
              Tạo bài viết
            </Link>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-white/50">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-3">
        <span className="text-xs uppercase tracking-[0.2em] text-white/60">Bộ lọc</span>
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80"
        >
          <option value="">Tất cả</option>
          {types.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={loadEntries}
          disabled={loading}
          className="rounded-full btn-ghost px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80"
        >
          {loading ? 'Đang tải...' : 'Áp dụng'}
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {entries.length === 0 && !loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/60 md:col-span-2 lg:col-span-3">
            Chưa có bài viết Sảnh Danh Vọng.
          </div>
        ) : (
          entries.map((entry) => (
            <Link
              key={entry.id}
              to={`/hall-of-fame/${entry.id}`}
              className="group card-surface flex h-full flex-col overflow-hidden rounded-2xl transition hover:border-white/30"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-white/10">
                {entry.coverUrl ? (
                  <img
                    src={entry.coverUrl}
                    alt={entry.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.2em] text-white/40">
                    Cover
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-white/50">
                  <span>{entry.type}</span>
                  <span>{entry.status}</span>
                </div>
                <h3 className="text-lg font-semibold text-white">{entry.title}</h3>
                <p className="text-sm text-white/70">{(entry.summary ?? entry.body ?? '').slice(0, 140)}</p>
                <div className="mt-auto flex flex-wrap gap-2">
                  {(entry.tags ?? []).slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))
        )}
      </section>
    </div>
  )
}
