import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppSelector } from '../../../app/hooks'
import { getProject, type Project } from '../../../services/project'

export function ProjectDetailPage() {
  const { id } = useParams()
  const user = useAppSelector((state) => state.auth.user)
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    if (!id) return
    getProject(id).then(setProject)
  }, [id])

  const isOwner = useMemo(() => {
    return !!project && !!user && project.ownerId === user.id
  }, [project, user])

  const cover = project?.media?.find((item) => item.role === 'COVER')?.fileUrl ?? null
  const gallery = project?.media?.filter((item) => item.role !== 'COVER') ?? []

  if (!project) {
    return <div className="text-sm text-white/70">Dang tai...</div>
  }

  return (
    <div className="space-y-8">
      <section className="card-neo rounded-[28px] p-6 md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Project Story</p>
            <h1 className="display-font text-3xl font-semibold md:text-4xl">{project.title}</h1>
            <p className="text-sm text-white/70">{project.summary ?? project.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-white/20 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white/70">
              {project.stage}
            </span>
            <span className="rounded-full border border-white/20 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white/70">
              {project.dealType}
            </span>
            <span className="rounded-full border border-white/20 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white/70">
              {project.status}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card-surface overflow-hidden rounded-3xl">
            <div className="aspect-[16/9] w-full bg-white/10">
              {cover ? (
                <img src={cover} alt={project.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.2em] text-white/40">
                  Cover image
                </div>
              )}
            </div>
            <div className="space-y-4 p-6">
              <div className="flex flex-wrap gap-2">
                {(project.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="space-y-4 text-sm text-white/70">
                <p>{project.content ?? project.description}</p>
              </div>
            </div>
          </div>

          {gallery.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3">
              {gallery.map((item) => (
                <div key={item.id ?? item.fileUrl} className="overflow-hidden rounded-2xl border border-white/10">
                  <img src={item.fileUrl} alt="Gallery" className="h-40 w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="card-surface rounded-3xl p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Thong tin goi von</p>
            <div className="mt-4 space-y-3 text-sm text-white/80">
              <div className="flex items-center justify-between">
                <span>Muc tieu</span>
                <span>{project.fundingTargetUsd ?? project.fundingNeedUsd ?? 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Da goi</span>
                <span>{project.fundingRaisedUsd ?? 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Dinh gia</span>
                <span>{project.valuationUsd ?? 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Co phan</span>
                <span>{project.equityPercent ?? 'N/A'}%</span>
              </div>
            </div>
          </div>

          <div className="card-surface rounded-3xl p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Traction</p>
            <p className="mt-3 text-sm text-white/70">{project.tractionSummary ?? 'Chua cap nhat'}</p>
            <p className="mt-3 text-sm text-white/70">{project.tractionMetrics ?? ''}</p>
          </div>

          {(project.links ?? []).length > 0 && (
            <div className="card-surface rounded-3xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Lien ket</p>
              <div className="mt-4 space-y-2 text-sm text-white/70">
                {project.links?.map((link) => (
                  <a
                    key={link.id ?? link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 transition hover:border-white/30"
                  >
                    <span>{link.label ?? link.type}</span>
                    <span className="text-xs text-white/50">Mo</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Link
              to="/projects"
              className="rounded-full btn-ghost px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:border-white/60"
            >
              Quay lai danh sach
            </Link>
            {isOwner && (
              <Link
                to={`/projects/${project.id}/edit`}
                className="rounded-full btn-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-glow"
              >
                Chinh sua
              </Link>
            )}
          </div>
        </aside>
      </section>
    </div>
  )
}
