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
    { label: 'Bai viet', value: `${entries.length || 0}+` },
    { label: 'Nhan vat noi bat', value: '12+' },
    { label: 'Du an truyen cam hung', value: '30+' },
  ]

  return (
    <div className="space-y-10">
      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,#2f1e5b,transparent_60%)] from-[#10162b] via-[#171236] to-[#0c0f1f] p-6 shadow-xl md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Hall of Fame</p>
            <h1 className="text-3xl font-semibold md:text-4xl">Cau chuyen truyen cam hung</h1>
            <p className="max-w-2xl text-sm text-white/70">
              Bai viet noi bat do admin tuyen chon hoac chuyen tu Project Marketplace.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/hall-of-fame/apply"
              className="rounded-full bg-gradient-to-r from-sky-500 to-purple-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-glow"
            >
              Tao bai viet
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
        <span className="text-xs uppercase tracking-[0.2em] text-white/60">Bo loc</span>
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80"
        >
          <option value="">Tat ca</option>
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
          className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80"
        >
          {loading ? 'Dang tai...' : 'Ap dung'}
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {entries.length === 0 && !loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/60 md:col-span-2 lg:col-span-3">
            Chua co bai viet Hall of Fame.
          </div>
        ) : (
          entries.map((entry) => (
            <Link
              key={entry.id}
              to={`/hall-of-fame/${entry.id}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-white/30"
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
