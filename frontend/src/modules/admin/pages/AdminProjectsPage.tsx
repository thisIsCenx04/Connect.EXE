import { useEffect, useState } from 'react'
import {
  listAdminProjects,
  reviewAdminProject,
  type AdminProjectSummary,
} from '../../../services/admin'
import { createProject, deleteProject } from '../../../services/project'
import { AdminIconButton, AdminModal } from '../components/AdminUi'

const projectStatusStyles: Record<string, string> = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
  APPROVED: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  REJECTED: 'border-rose-200 bg-rose-50 text-rose-600',
}

const PROJECT_STAGES = ['IDEA', 'MVP', 'REVENUE', 'EXIT_READY']
const DEAL_TYPES = ['COFOUNDER', 'FUNDING', 'SELL_PROJECT', 'HIRE_TEAM']

const createProjectDefaults = {
  title: '',
  summary: '',
  description: '',
  stage: PROJECT_STAGES[0],
  industry: '',
  dealType: DEAL_TYPES[0],
  country: '',
  fundingTargetUsd: '',
  pitchDeckUrl: '',
}

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EditIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4 20 4.5-1 9-9-3.5-3.5-9 9L4 20Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m14 6 3.5 3.5" />
  </svg>
)

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M10 11v6m4-6v6" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7l1-3h8l1 3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
  </svg>
)

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
  </svg>
)

export function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProjectSummary[]>([])
  const [projectStatusFilter, setProjectStatusFilter] = useState('PENDING')
  const [selectedProject, setSelectedProject] = useState<AdminProjectSummary | null>(null)
  const [projectEdit, setProjectEdit] = useState({
    status: 'PENDING',
    featured: false,
    featuredRank: '',
  })
  const [createProjectForm, setCreateProjectForm] = useState(createProjectDefaults)
  const [activeModal, setActiveModal] = useState<null | 'detail' | 'edit' | 'create' | 'delete'>(null)
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

  const handleSaveProject = async () => {
    if (!selectedProject) return
    setMessage(null)
    setError(null)
    try {
      const rankValue = projectEdit.featuredRank.trim()
      const parsedRank = rankValue ? Number(rankValue) : null
      const updated = await reviewAdminProject(selectedProject.id, {
        status: projectEdit.status,
        featured: projectEdit.featured,
        featuredRank: Number.isFinite(parsedRank ?? NaN) ? parsedRank : null,
      })
      setProjects((prev) => prev.map((entry) => (entry.id === selectedProject.id ? updated : entry)))
      setMessage('Project updated successfully.')
      setActiveModal(null)
    } catch {
      setError('Unable to update project.')
    }
  }

  const handleDeleteProject = async () => {
    if (!selectedProject) return
    setMessage(null)
    setError(null)
    try {
      await deleteProject(selectedProject.id)
      setProjects((prev) => prev.filter((entry) => entry.id !== selectedProject.id))
      setMessage('Project deleted.')
      setActiveModal(null)
    } catch {
      setError('Unable to delete project.')
    }
  }

  const handleCreateProject = async () => {
    setMessage(null)
    setError(null)
    try {
      const fundingTargetValue = createProjectForm.fundingTargetUsd.trim()
      const parsedFundingTarget = fundingTargetValue ? Number(fundingTargetValue) : undefined
      await createProject({
        title: createProjectForm.title.trim(),
        description: createProjectForm.description.trim(),
        summary: createProjectForm.summary.trim() || undefined,
        stage: createProjectForm.stage,
        industry: createProjectForm.industry.trim(),
        dealType: createProjectForm.dealType,
        country: createProjectForm.country.trim() || undefined,
        fundingTargetUsd: Number.isFinite(parsedFundingTarget ?? NaN) ? parsedFundingTarget : undefined,
        pitchDeckUrl: createProjectForm.pitchDeckUrl.trim() || undefined,
      })
      setMessage('Project created successfully.')
      setCreateProjectForm(createProjectDefaults)
      const data = await listAdminProjects(projectStatusFilter === 'ALL' ? undefined : projectStatusFilter)
      setProjects(data)
      setActiveModal(null)
    } catch {
      setError('Unable to create project.')
    }
  }

  const openDetail = (item: AdminProjectSummary) => {
    setSelectedProject(item)
    setActiveModal('detail')
  }

  const openEdit = (item: AdminProjectSummary) => {
    setSelectedProject(item)
    setProjectEdit({
      status: item.moderationStatus,
      featured: item.featured,
      featuredRank: item.featuredRank?.toString() ?? '',
    })
    setActiveModal('edit')
  }

  const openDelete = (item: AdminProjectSummary) => {
    setSelectedProject(item)
    setActiveModal('delete')
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Projects</p>
          <h2 className="display-font text-2xl font-semibold text-slate-900">Moderation queue</h2>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={projectStatusFilter}
            onChange={(event) => setProjectStatusFilter(event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600"
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="ALL">All</option>
          </select>
          <AdminIconButton label="Create project" tone="primary" onClick={() => setActiveModal('create')}>
            <PlusIcon />
          </AdminIconButton>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          {message}
        </div>
      )}

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <div className="grid grid-cols-[1.4fr_0.8fr_0.6fr_0.8fr_0.8fr] gap-3 border-b border-slate-200 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
          <span>Project</span>
          <span>Stage</span>
          <span>Status</span>
          <span>Submitted</span>
          <span>Action</span>
        </div>
        <div className="divide-y divide-slate-200">
          {projects.map((item) => (
            <div key={item.id} className="grid grid-cols-[1.4fr_0.8fr_0.6fr_0.8fr_0.8fr] items-center gap-3 px-6 py-4 text-sm">
              <div>
                <div className="font-semibold text-slate-900">{item.title}</div>
                <div className="text-xs text-slate-400">{item.industry}</div>
              </div>
              <span className="text-slate-600">{item.stage}</span>
              <span>
                <span
                  className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.2em] ${
                    projectStatusStyles[item.moderationStatus] ?? 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  {item.moderationStatus}
                </span>
              </span>
              <span className="text-xs text-slate-500">
                {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : '--'}
              </span>
              <div className="flex items-center gap-2">
                <AdminIconButton label="View detail" onClick={() => openDetail(item)}>
                  <EyeIcon />
                </AdminIconButton>
                <AdminIconButton label="Edit project" onClick={() => openEdit(item)}>
                  <EditIcon />
                </AdminIconButton>
                <AdminIconButton label="Delete project" tone="danger" onClick={() => openDelete(item)}>
                  <TrashIcon />
                </AdminIconButton>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="px-6 py-6 text-sm text-slate-500">No projects found.</div>
          )}
        </div>
      </div>

      <AdminModal
        open={activeModal === 'detail'}
        title="Project detail"
        onClose={() => setActiveModal(null)}
        size="md"
      >
        {selectedProject ? (
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Title</span>
              <span>{selectedProject.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Industry</span>
              <span>{selectedProject.industry}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Stage</span>
              <span>{selectedProject.stage}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Visibility</span>
              <span>{selectedProject.visibility}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Status</span>
              <span>{selectedProject.status}</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-500">Select a project to view details.</div>
        )}
      </AdminModal>

      <AdminModal
        open={activeModal === 'edit'}
        title="Edit project"
        onClose={() => setActiveModal(null)}
        size="sm"
      >
        {selectedProject ? (
          <div className="space-y-4">
            <label className="text-xs text-slate-500">
              Status
              <select
                value={projectEdit.status}
                onChange={(event) => setProjectEdit((prev) => ({ ...prev, status: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
              >
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </label>
            <label className="flex items-center gap-3 text-xs text-slate-500">
              <input
                type="checkbox"
                checked={projectEdit.featured}
                onChange={(event) => setProjectEdit((prev) => ({ ...prev, featured: event.target.checked }))}
                className="h-4 w-4"
              />
              Mark as featured
            </label>
            <label className="text-xs text-slate-500">
              Featured rank
              <input
                value={projectEdit.featuredRank}
                onChange={(event) => setProjectEdit((prev) => ({ ...prev, featuredRank: event.target.value }))}
                placeholder="Optional"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
              />
            </label>
            <button
              type="button"
              onClick={handleSaveProject}
              className="w-full rounded-full bg-slate-900 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white"
            >
              Save changes
            </button>
          </div>
        ) : (
          <div className="text-sm text-slate-500">Select a project to edit.</div>
        )}
      </AdminModal>

      <AdminModal
        open={activeModal === 'create'}
        title="Create project"
        onClose={() => setActiveModal(null)}
        size="lg"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-xs text-slate-500">
            Title
            <input
              value={createProjectForm.title}
              onChange={(event) => setCreateProjectForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Project name"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
            />
          </label>
          <label className="text-xs text-slate-500">
            Industry
            <input
              value={createProjectForm.industry}
              onChange={(event) => setCreateProjectForm((prev) => ({ ...prev, industry: event.target.value }))}
              placeholder="Fintech"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
            />
          </label>
          <label className="text-xs text-slate-500 md:col-span-2">
            Summary
            <input
              value={createProjectForm.summary}
              onChange={(event) => setCreateProjectForm((prev) => ({ ...prev, summary: event.target.value }))}
              placeholder="Short summary"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
            />
          </label>
          <label className="text-xs text-slate-500 md:col-span-2">
            Description
            <textarea
              value={createProjectForm.description}
              onChange={(event) => setCreateProjectForm((prev) => ({ ...prev, description: event.target.value }))}
              rows={3}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
            />
          </label>
          <label className="text-xs text-slate-500">
            Stage
            <select
              value={createProjectForm.stage}
              onChange={(event) => setCreateProjectForm((prev) => ({ ...prev, stage: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
            >
              {PROJECT_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-500">
            Deal type
            <select
              value={createProjectForm.dealType}
              onChange={(event) => setCreateProjectForm((prev) => ({ ...prev, dealType: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
            >
              {DEAL_TYPES.map((deal) => (
                <option key={deal} value={deal}>
                  {deal}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-500">
            Country
            <input
              value={createProjectForm.country}
              onChange={(event) => setCreateProjectForm((prev) => ({ ...prev, country: event.target.value }))}
              placeholder="Vietnam"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
            />
          </label>
          <label className="text-xs text-slate-500">
            Funding target (USD)
            <input
              value={createProjectForm.fundingTargetUsd}
              onChange={(event) => setCreateProjectForm((prev) => ({ ...prev, fundingTargetUsd: event.target.value }))}
              placeholder="250000"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
            />
          </label>
          <label className="text-xs text-slate-500 md:col-span-2">
            Pitch deck URL
            <input
              value={createProjectForm.pitchDeckUrl}
              onChange={(event) => setCreateProjectForm((prev) => ({ ...prev, pitchDeckUrl: event.target.value }))}
              placeholder="https://..."
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={handleCreateProject}
              className="w-full rounded-full bg-slate-900 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white"
            >
              Create project
            </button>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={activeModal === 'delete'}
        title="Delete project"
        onClose={() => setActiveModal(null)}
        size="sm"
      >
        <div className="space-y-4 text-sm text-slate-600">
          <p>Are you sure you want to delete this project?</p>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="rounded-full border border-slate-200 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteProject}
              className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-600"
            >
              Delete
            </button>
          </div>
        </div>
      </AdminModal>
    </section>
  )
}

