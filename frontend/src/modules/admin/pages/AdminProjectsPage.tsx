import { useEffect, useState } from 'react'
import {
  listAdminProjects,
  reviewAdminProject,
  type AdminProjectSummary,
} from '../../../services/admin'

const projectStatusStyles: Record<string, string> = {
  PENDING: 'border-indigo-400/40 bg-indigo-500/10 text-indigo-200',
  APPROVED: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
  REJECTED: 'border-rose-400/40 bg-rose-500/10 text-rose-200',
}

export function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProjectSummary[]>([])
  const [projectStatusFilter, setProjectStatusFilter] = useState('PENDING')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const loadProjects = async () => {
      try {
        const data = await listAdminProjects(projectStatusFilter === 'ALL' ? undefined : projectStatusFilter)
        if (!isMounted) return
        setProjects(data)
      } catch {
        if (!isMounted) return
        setError('Unable to load projects.')
      }
    }
    loadProjects()
    return () => {
      isMounted = false
    }
  }, [projectStatusFilter])

  const handleReviewProject = async (item: AdminProjectSummary, status: string) => {
    setMessage(null)
    setError(null)
    try {
      const updated = await reviewAdminProject(item.id, { status })
      setProjects((prev) => prev.map((entry) => (entry.id === item.id ? updated : entry)))
      setMessage(`Project ${status.toLowerCase()}: ${updated.title}.`)
    } catch {
      setError('Unable to update project status.')
    }
  }

  const handleToggleFeatured = async (item: AdminProjectSummary) => {
    setMessage(null)
    setError(null)
    try {
      const updated = await reviewAdminProject(item.id, {
        status: item.moderationStatus,
        featured: !item.featured,
      })
      setProjects((prev) => prev.map((entry) => (entry.id === item.id ? updated : entry)))
      setMessage(`Featured flag ${updated.featured ? 'enabled' : 'removed'} for ${updated.title}.`)
    } catch {
      setError('Unable to update featured status.')
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Projects</p>
          <h2 className="display-font text-xl font-semibold text-white">Moderation queue</h2>
        </div>
        <select
          value={projectStatusFilter}
          onChange={(event) => setProjectStatusFilter(event.target.value)}
          className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs text-white"
        >
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="ALL">All</option>
        </select>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      )}

      <div className="card-surface overflow-hidden rounded-3xl border border-white/10">
        <div className="grid grid-cols-[1.4fr_0.8fr_0.6fr_0.8fr_0.8fr] gap-3 border-b border-white/10 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">
          <span>Project</span>
          <span>Stage</span>
          <span>Status</span>
          <span>Submitted</span>
          <span>Action</span>
        </div>
        <div className="divide-y divide-white/10">
          {projects.map((item) => (
            <div key={item.id} className="grid grid-cols-[1.4fr_0.8fr_0.6fr_0.8fr_0.8fr] items-center gap-3 px-6 py-4 text-sm text-white/80">
              <div>
                <div className="font-semibold text-white">{item.title}</div>
                <div className="text-xs text-white/40">{item.industry}</div>
              </div>
              <span>{item.stage}</span>
              <span>
                <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${projectStatusStyles[item.moderationStatus] ?? 'border-white/10 bg-white/5 text-white/70'}`}>
                  {item.moderationStatus}
                </span>
              </span>
              <span className="text-xs text-white/50">
                {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : '--'}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={item.moderationStatus !== 'PENDING'}
                  onClick={() => handleReviewProject(item, 'APPROVED')}
                  className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-200 disabled:opacity-40"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={item.moderationStatus !== 'PENDING'}
                  onClick={() => handleReviewProject(item, 'REJECTED')}
                  className="rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-200 disabled:opacity-40"
                >
                  Reject
                </button>
                <button
                  type="button"
                  disabled={item.moderationStatus !== 'APPROVED'}
                  onClick={() => handleToggleFeatured(item)}
                  className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70 disabled:opacity-40"
                >
                  {item.featured ? 'Unfeature' : 'Feature'}
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="px-6 py-6 text-sm text-white/50">No projects found.</div>
          )}
        </div>
      </div>
    </section>
  )
}
