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
    return <div className="text-sm text-white/70">Đang tải...</div>
  }

  return (
    <div className="space-y-8">
      {/* Main 2-Column Layout */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Cover Image + Gallery */}
        <div className="space-y-3">
          {/* Cover Image */}
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <div className="aspect-[4/3] w-full">
              {cover ? (
                <img src={cover} alt={project.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-400/20 to-blue-500/20">
                  <div className="text-center">
                    <svg className="mx-auto h-16 w-16 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gallery - 5 Thumbnails */}
          {gallery.length > 0 && (
            <div className="grid grid-cols-5 gap-2">
              {gallery.slice(0, 5).map((item, idx) => (
                <div key={item.id ?? item.fileUrl} className="aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <img src={item.fileUrl} alt={`${idx + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Content */}
        <div className="space-y-5">
          {/* Title */}
          <div>
            <h1 className="display-font text-4xl font-bold text-white lg:text-5xl">
              {project.title}
            </h1>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2.5">
            <span className="rounded-md bg-[#F5E6D3] px-4 py-2 text-sm font-medium text-gray-800">
              {project.industry}
            </span>
            <span className="rounded-md bg-[#F5E6D3] px-4 py-2 text-sm font-medium text-gray-800">
              {project.stage}
            </span>
          </div>

          {/* Content Sections - Short Form */}
          <div className="space-y-3.5 text-sm text-white/80">
            {project.summary && (
              <div>
                <div className="text-gray-800 bg-[#F5E6D3] inline-block px-2 py-0.5 rounded mb-1">Giới thiệu</div>
                <p className="line-clamp-2">{project.summary}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Social Links */}
            {(project.links ?? []).length > 0 && (
              <div className="flex items-center gap-3 rounded-full bg-orange-500 pl-5 pr-3 py-2.5">
                <span className="text-sm font-semibold text-white">Liên hệ:</span>
                <div className="flex gap-2">
                  {project.links
                    ?.filter((link) =>
                      ['SOCIAL', 'FACEBOOK', 'TWITTER', 'LINKEDIN', 'TIKTOK'].includes(link.type ?? ''),
                    )
                    .slice(0, 2)
                    .map((link) => (
                    <a
                      key={link.id ?? link.url}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-900 transition hover:bg-gray-100"
                    >
                      {link.type === 'FACEBOOK' || link.label?.toLowerCase().includes('facebook') ? (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      ) : link.type === 'TIKTOK' || link.label?.toLowerCase().includes('tiktok') ? (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Support Button */}
            {!isOwner && (
              <button
                className="rounded-full bg-orange-500 px-7 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 shadow-md hover:shadow-lg"
                onClick={() => alert('Tính năng ủng hộ sẽ được phát triển sau')}
              >
                Ứng hộ dự án tại đây
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Additional Details Section */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Full Content */}
          {(project.description || project.content) && (
            <div className="card-surface rounded-3xl p-6 space-y-6">
              {project.description && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300 mb-3">Giới thiệu chi tiết</h2>
                  <p className="text-sm text-white/80 whitespace-pre-wrap">{project.description}</p>
                </div>
              )}
              {project.content && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300 mb-3">Sứ mệnh & Tầm nhìn</h2>
                  <div className="text-sm text-white/80 whitespace-pre-wrap">{project.content}</div>
                </div>
              )}
              {(project.tags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                  {project.tags?.map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/60">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          {/* Project Info Card */}
          <div className="card-surface rounded-3xl p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Thông tin</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between text-white/70">
                <span>Lĩnh vực</span>
                <span className="font-medium text-white">{project.industry || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-white/70">
                <span>Quốc gia</span>
                <span className="font-medium text-white">{project.country || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Funding Info Card */}
          {(project.fundingTargetUsd || project.fundingNeedUsd || project.valuationUsd || project.equityPercent) && (
            <div className="card-surface rounded-3xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Thông tin gọi vốn</p>
              <div className="mt-4 space-y-3 text-sm">
                {(project.fundingTargetUsd || project.fundingNeedUsd) && (
                  <div className="flex items-center justify-between text-white/70">
                    <span>Mục tiêu</span>
                    <span className="font-medium text-white">
                      ${((project.fundingTargetUsd ?? project.fundingNeedUsd) ?? 0).toLocaleString()}
                    </span>
                  </div>
                )}
                {project.fundingRaisedUsd !== null && project.fundingRaisedUsd !== undefined && (
                  <div className="flex items-center justify-between text-white/70">
                    <span>Đã gọi</span>
                    <span className="font-medium text-white">${project.fundingRaisedUsd.toLocaleString()}</span>
                  </div>
                )}
                {project.valuationUsd && (
                  <div className="flex items-center justify-between text-white/70">
                    <span>Định giá</span>
                    <span className="font-medium text-white">${project.valuationUsd.toLocaleString()}</span>
                  </div>
                )}
                {project.equityPercent && (
                  <div className="flex items-center justify-between text-white/70">
                    <span>Cổ phần</span>
                    <span className="font-medium text-white">{project.equityPercent}%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Traction Card */}
          {(project.tractionSummary || project.tractionMetrics) && (
            <div className="card-surface rounded-3xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Traction</p>
              {project.tractionSummary && (
                <p className="mt-3 text-sm text-white/70 whitespace-pre-wrap">{project.tractionSummary}</p>
              )}
              {project.tractionMetrics && (
                <p className="mt-3 text-sm text-white/70 whitespace-pre-wrap">{project.tractionMetrics}</p>
              )}
            </div>
          )}

          {/* Pitch Deck Card */}
          {project.pitchDeckUrl && (
            <div className="card-surface rounded-3xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Pitch Deck</p>
              <a
                href={project.pitchDeckUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-sm transition hover:border-sky-400/50 hover:bg-white/5"
              >
                <span className="text-white/70">Xem Pitch Deck</span>
                <svg className="h-4 w-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}

          {/* Links Card */}
          {(project.links ?? []).length > 0 && (
            <div className="card-surface rounded-3xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Liên kết</p>
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
                    <svg className="h-4 w-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Contact Button */}
          {!isOwner && (
            <button
              className="w-full rounded-full btn-primary px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-glow"
              onClick={() => alert('Tính năng liên hệ sẽ được phát triển sau')}
            >
              Quan tâm dự án
            </button>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              to="/projects"
              className="flex-1 rounded-full btn-ghost px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:border-white/60"
            >
              Quay lại danh sách
            </Link>
            {isOwner && (
              <Link
                to={`/projects/${project.id}/edit`}
                className="flex-1 rounded-full btn-primary px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-glow"
              >
                Chỉnh sửa
              </Link>
            )}
          </div>
        </aside>
      </section>
    </div>
  )
}
