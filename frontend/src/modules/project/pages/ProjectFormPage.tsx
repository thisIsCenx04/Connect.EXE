import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createProject,
  getProject,
  type ProjectLink,
  type ProjectMedia,
  updateProject,
} from '../../../services/project'

const stages = ['IDEA', 'MVP', 'REVENUE', 'EXIT_READY']
const dealTypes = ['COFOUNDER', 'FUNDING', 'SELL_PROJECT', 'HIRE_TEAM']
const linkTypes = ['WEBSITE', 'PITCH_DECK', 'DEMO', 'REPO', 'SOCIAL', 'OTHER']
const mediaRoles = ['COVER', 'GALLERY', 'DOCUMENT']

interface ProjectFormValues {
  title: string
  summary: string
  description: string
  content: string
  stage: string
  industry: string
  dealType: string
  country: string
  fundingTargetUsd: string
  fundingNeedUsd: string
  fundingRaisedUsd: string
  valuationUsd: string
  equityPercent: string
  tractionSummary: string
  fundingTimeline: string
  tractionMetrics: string
  pitchDeckUrl: string
}

export function ProjectFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tagsInput, setTagsInput] = useState('')
  const [links, setLinks] = useState<ProjectLink[]>([])
  const [media, setMedia] = useState<ProjectMedia[]>([])

  const { register, handleSubmit, reset, watch } = useForm<ProjectFormValues>({
    defaultValues: {
      title: '',
      summary: '',
      description: '',
      content: '',
      stage: 'IDEA',
      industry: '',
      dealType: 'FUNDING',
      country: '',
      fundingTargetUsd: '',
      fundingNeedUsd: '',
      fundingRaisedUsd: '',
      valuationUsd: '',
      equityPercent: '',
      tractionSummary: '',
      fundingTimeline: '',
      tractionMetrics: '',
      pitchDeckUrl: '',
    },
  })

  const stageValue = watch('stage')
  const showFunding = useMemo(() => ['MVP', 'REVENUE', 'EXIT_READY'].includes(stageValue), [stageValue])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getProject(id)
      .then((project) => {
        reset({
          title: project.title,
          summary: project.summary ?? '',
          description: project.description,
          content: project.content ?? '',
          stage: project.stage,
          industry: project.industry,
          dealType: project.dealType,
          country: project.country ?? '',
          fundingTargetUsd: project.fundingTargetUsd?.toString() ?? '',
          fundingNeedUsd: project.fundingNeedUsd?.toString() ?? '',
          fundingRaisedUsd: project.fundingRaisedUsd?.toString() ?? '',
          valuationUsd: project.valuationUsd?.toString() ?? '',
          equityPercent: project.equityPercent?.toString() ?? '',
          tractionSummary: project.tractionSummary ?? '',
          fundingTimeline: project.fundingTimeline ?? '',
          tractionMetrics: project.tractionMetrics ?? '',
          pitchDeckUrl: project.pitchDeckUrl ?? '',
        })
        setTagsInput((project.tags ?? []).join(', '))
        setLinks(project.links ?? [])
        setMedia(project.media ?? [])
      })
      .catch(() => setError('Khong the tai du an.'))
      .finally(() => setLoading(false))
  }, [id, reset])

  const onSubmit = async (values: ProjectFormValues) => {
    setError(null)
    setLoading(true)
    const payload = {
      title: values.title,
      summary: values.summary || undefined,
      description: values.description,
      content: values.content || undefined,
      stage: values.stage,
      industry: values.industry,
      dealType: values.dealType,
      country: values.country || undefined,
      fundingTargetUsd: values.fundingTargetUsd ? Number(values.fundingTargetUsd) : undefined,
      fundingNeedUsd: values.fundingNeedUsd ? Number(values.fundingNeedUsd) : undefined,
      fundingRaisedUsd: values.fundingRaisedUsd ? Number(values.fundingRaisedUsd) : undefined,
      valuationUsd: values.valuationUsd ? Number(values.valuationUsd) : undefined,
      equityPercent: values.equityPercent ? Number(values.equityPercent) : undefined,
      tractionSummary: values.tractionSummary || undefined,
      fundingTimeline: values.fundingTimeline || undefined,
      tractionMetrics: values.tractionMetrics || undefined,
      pitchDeckUrl: values.pitchDeckUrl || undefined,
      tags: tagsInput
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      links: links.filter((link) => link.url && link.url.trim().length > 0),
      media: media.filter((item) => item.fileUrl && item.fileUrl.trim().length > 0),
    }
    try {
      if (id) {
        await updateProject(id, payload)
      } else {
        await createProject(payload)
      }
      navigate(id ? `/projects/${id}` : '/projects')
    } catch {
      setError('Khong the luu du an.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <section className="card-neo rounded-[28px] p-6 md:p-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Project Workspace</p>
            <h1 className="display-font text-2xl font-semibold text-white md:text-3xl">
              {id ? 'Chinh sua du an' : 'Tao du an moi'}
            </h1>
            <p className="mt-2 text-sm text-white/70">
              Dien day du noi dung de tang kha nang duoc duyet va hien thi noi bat.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="rounded-full btn-ghost px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:border-white/60"
          >
            Quay lai danh sach
          </button>
        </div>
      </section>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card-surface rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-white">Thong tin co ban</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Tieu de</span>
              <input
                {...register('title')}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Tom tat</span>
              <textarea
                {...register('summary')}
                rows={2}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Mo ta</span>
              <textarea
                {...register('description')}
                rows={4}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Noi dung chi tiet</span>
              <textarea
                {...register('content')}
                rows={6}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Giai doan</span>
              <select
                {...register('stage')}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              >
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Nhu cau</span>
              <select
                {...register('dealType')}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              >
                {dealTypes.map((deal) => (
                  <option key={deal} value={deal}>
                    {deal}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Linh vuc</span>
              <input
                {...register('industry')}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Quoc gia</span>
              <input
                {...register('country')}
                maxLength={2}
                placeholder="VN"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Tags</span>
              <input
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder="AI, Edu, SaaS"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              />
            </label>
          </div>
        </div>

        {showFunding && (
          <div className="card-surface rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-white">Goi von</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">Muc tieu (USD)</span>
                <input
                  {...register('fundingTargetUsd')}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">Da goi (USD)</span>
                <input
                  {...register('fundingRaisedUsd')}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">Dinh gia (USD)</span>
                <input
                  {...register('valuationUsd')}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">Co phan (%)</span>
                <input
                  {...register('equityPercent')}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                />
              </label>
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/50">Ke hoach goi von</span>
                <input
                  {...register('fundingTimeline')}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                />
              </label>
            </div>
          </div>
        )}

        <div className="card-surface rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-white">Traction & Pitch</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Traction summary</span>
              <textarea
                {...register('tractionSummary')}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Traction metrics</span>
              <textarea
                {...register('tractionMetrics')}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50">Pitch deck URL</span>
              <input
                {...register('pitchDeckUrl')}
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
                  {linkTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
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
                <select
                  value={item.role ?? 'GALLERY'}
                  onChange={(event) =>
                    setMedia((prev) =>
                      prev.map((mediaItem, idx) =>
                        idx === index ? { ...mediaItem, role: event.target.value } : mediaItem
                      )
                    )
                  }
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white md:col-span-2"
                >
                  {mediaRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
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
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white md:col-span-4"
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
            {loading ? 'Dang luu...' : 'Luu du an'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            disabled={loading}
            className="rounded-full btn-ghost px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80"
          >
            Huy
          </button>
        </div>
      </form>
    </div>
  )
}
