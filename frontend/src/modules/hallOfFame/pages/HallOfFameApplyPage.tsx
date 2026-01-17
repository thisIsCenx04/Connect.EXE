import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createHallOfFamePost,
  type HallOfFamePostLink,
  type HallOfFamePostMedia,
} from '../../../services/hallOfFame'

const types = ['STARTUP', 'PERSON', 'PROJECT_STORY']
const linkTypes = ['WEBSITE', 'PITCH_DECK', 'DEMO', 'REPO', 'SOCIAL', 'OTHER']

export function HallOfFameApplyPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [body, setBody] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [type, setType] = useState('STARTUP')
  const [tagsInput, setTagsInput] = useState('')
  const [links, setLinks] = useState<HallOfFamePostLink[]>([])
  const [media, setMedia] = useState<HallOfFamePostMedia[]>([])

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const payload = {
        type,
        title,
        summary: summary || undefined,
        body,
        coverUrl: coverUrl || undefined,
        tags: tagsInput
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        links: links.filter((link) => link.url && link.url.trim().length > 0),
        media: media.filter((item) => item.fileUrl && item.fileUrl.trim().length > 0),
      }
      const result = await createHallOfFamePost(payload)
      navigate(`/hall-of-fame/${result.id}`)
    } catch {
      setError('Khong the tao bai viet Hall of Fame.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <section className="card-neo rounded-[28px] p-6 md:p-10">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Admin CMS</p>
          <h1 className="display-font text-3xl font-semibold md:text-4xl">Tao bai viet Hall of Fame</h1>
          <p className="text-sm text-white/70">Bai viet se o trang thai DRAFT cho den khi publish.</p>
        </div>
      </section>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="card-surface rounded-3xl p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Type</span>
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              >
                {types.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Cover URL</span>
              <input
                value={coverUrl}
                onChange={(event) => setCoverUrl(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Tieu de</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Tom tat</span>
              <textarea
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                rows={2}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Noi dung</span>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={6}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Tags</span>
              <input
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder="story, founder, award"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              />
            </label>
          </div>
        </div>

        <div className="card-surface rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Lien ket</h2>
            <button
              type="button"
              onClick={() => setLinks((prev) => [...prev, { type: 'WEBSITE', url: '' }])}
              className="rounded-full btn-ghost px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70"
            >
              Them lien ket
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {links.map((link, index) => (
              <div key={`${link.url}-${index}`} className="grid gap-3 md:grid-cols-6">
                <select
                  value={link.type}
                  onChange={(event) =>
                    setLinks((prev) =>
                      prev.map((item, idx) => (idx === index ? { ...item, type: event.target.value } : item))
                    )
                  }
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white md:col-span-2"
                >
                  {linkTypes.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <input
                  value={link.label ?? ''}
                  onChange={(event) =>
                    setLinks((prev) =>
                      prev.map((item, idx) => (idx === index ? { ...item, label: event.target.value } : item))
                    )
                  }
                  placeholder="Label"
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white md:col-span-2"
                />
                <input
                  value={link.url}
                  onChange={(event) =>
                    setLinks((prev) =>
                      prev.map((item, idx) => (idx === index ? { ...item, url: event.target.value } : item))
                    )
                  }
                  placeholder="https://..."
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white md:col-span-2"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Media</h2>
            <button
              type="button"
              onClick={() => setMedia((prev) => [...prev, { fileUrl: '', role: 'GALLERY' }])}
              className="rounded-full btn-ghost px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70"
            >
              Them media
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {media.map((item, index) => (
              <div key={`${item.fileUrl}-${index}`} className="grid gap-3 md:grid-cols-6">
                <input
                  value={item.fileUrl}
                  onChange={(event) =>
                    setMedia((prev) =>
                      prev.map((mediaItem, idx) =>
                        idx === index ? { ...mediaItem, fileUrl: event.target.value } : mediaItem
                      )
                    )
                  }
                  placeholder="https://image..."
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white md:col-span-6"
                />
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full btn-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-glow"
          >
            {loading ? 'Dang luu...' : 'Luu bai viet'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/hall-of-fame')}
            className="rounded-full btn-ghost px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80"
          >
            Huy
          </button>
        </div>
      </form>
    </div>
  )
}
