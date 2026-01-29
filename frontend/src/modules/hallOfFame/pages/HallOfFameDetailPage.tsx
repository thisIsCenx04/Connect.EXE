import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getHallOfFamePost, type HallOfFamePost } from '../../../services/hallOfFame'

export function HallOfFameDetailPage() {
  const { id } = useParams()
  const [entry, setEntry] = useState<HallOfFamePost | null>(null)

  useEffect(() => {
    if (!id) return
    getHallOfFamePost(id).then(setEntry)
  }, [id])

  if (!entry) {
    return <div className="text-sm text-white/70">Đang tải...</div>
  }

  return (
    <div className="space-y-8">
      <section className="card-neo rounded-[28px] p-6 md:p-10">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Sảnh danh vọng</p>
          <h1 className="display-font text-3xl font-semibold md:text-4xl">{entry.title}</h1>
          <p className="text-sm text-white/70">{entry.summary ?? ''}</p>
          <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-white/50">
            <span>{entry.type}</span>
            <span>{entry.status}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card-surface overflow-hidden rounded-3xl">
            <div className="aspect-[16/9] w-full bg-white/10">
              {entry.coverUrl ? (
                <img src={entry.coverUrl} alt={entry.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.2em] text-white/40">
                  Ảnh bìa
                </div>
              )}
            </div>
            <div className="space-y-4 p-6 text-sm text-white/70">
              <p>{entry.body}</p>
            </div>
          </div>

          {(entry.media ?? []).length > 0 && (
            <div className="grid gap-4 md:grid-cols-3">
              {entry.media?.map((item) => (
                <div key={item.id ?? item.fileUrl} className="overflow-hidden rounded-2xl border border-white/10">
                  <img src={item.fileUrl} alt="Gallery" className="h-40 w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          {(entry.tags ?? []).length > 0 && (
            <div className="card-surface rounded-3xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Th?</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {entry.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(entry.links ?? []).length > 0 && (
            <div className="card-surface rounded-3xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Liên kết</p>
              <div className="mt-4 space-y-2 text-sm text-white/70">
                {entry.links?.map((link) => (
                  <a
                    key={link.id ?? link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 transition hover:border-white/30"
                  >
                    <span>{link.label ?? link.type}</span>
                    <span className="text-xs text-white/50">M?</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <Link
            to="/hall-of-fame"
            className="inline-flex rounded-full btn-ghost px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80"
          >
            Quay lại danh sách
          </Link>
        </aside>
      </section>
    </div>
  )
}
