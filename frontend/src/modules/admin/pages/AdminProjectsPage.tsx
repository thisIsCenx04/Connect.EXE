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
        setError('Kh?ng th? t?i d? ?n.')
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
      setMessage('C?p nh?t d? ?n th?nh c?ng.')
      setActiveModal(null)
    } catch {
      setError('Kh?ng th? c?p nh?t d? ?n.')
    }
  }

  const handleX?aProject = async () => {
    if (!selectedProject) return
    setMessage(null)
    setError(null)
    try {
      await deleteProject(selectedProject.id)
      setProjects((prev) => prev.filter((entry) => entry.id !== selectedProject.id))
      setMessage('?? x?a d? ?n.')
      setActiveModal(null)
    } catch {
      setError('Kh?ng th? x?a d? ?n.')
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
      setMessage('T?o d? ?n th?nh c?ng.')
      setCreateProjectForm(createProjectDefaults)
      const data = await listAdminProjects(projectStatusFilter === 'ALL' ? undefined : projectStatusFilter)
      setProjects(data)
      setActiveModal(null)
    } catch {
      setError('Kh?ng th? t?o d? ?n.')
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

  const openX?a = (item: AdminProjectSummary) => {
    setSelectedProject(item)
    setActiveModal('delete')
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">D? ?n</p>
          <h2 className="display-font text-2xl font-semibold text-slate-900">H?ng ??i ki?m duy?t</h2>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={projectStatusFilter}
            onChange={(event) => setProjectStatusFilter(event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600"
          >
            <option value="PENDING">?ang ch?</option>
            <option value="APPROVED">?? duy?t</option>
            <option value="REJECTED">T? ch?i</option>
            <option value="ALL">T?t c?</option>
          </select>
          <AdminIconButton label="T?o d? ?n" tone="primary" onClick={() => setActiveModal('create')}>
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
          <span>D? ?n</span>
          <span>Giai ?o?n</span>
          <span>Tr?ng th?i</span>
          <span>?? g?i</span>
          <span>Thao t?c</span>
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
                <AdminIconButton label="Xem chi ti?t" onClick={() => openDetail(item)}>
                  <EyeIcon />
                </AdminIconButton>
                <AdminIconButton label="S?a d? ?n" onClick={() => openEdit(item)}>
                  <EditIcon />
                </AdminIconButton>
                <AdminIconButton label="X?a d? ?n" tone="danger" onClick={() => openX?a(item)}>
                  <TrashIcon />
                </AdminIconButton>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="px-6 py-6 text-sm text-slate-500">Kh?ng t?m th?y d? ?n.</div>
          )}
        </div>
      </div>

      <AdminModal
        open={activeModal === 'detail'}
        title="Chi ti?t d? ?n"
        onClose={() => setActiveModal(null)}
        size="md"
      >
        {selectedProject ? (
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Ti?u ??</span>
              <span>{selectedProject.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">L?nh v?c</span>
              <span>{selectedProject.industry}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Giai ?o?n</span>
              <span>{selectedProject.stage}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Hi?n th?</span>
              <span>{selectedProject.visibility}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tr?ng th?i</span>
              <span>{selectedProject.status}</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-500">Ch?n m?t d? ?n ?? xem chi ti?t.</div>
        )}
      </AdminModal>

      <AdminModal
        open={activeModal === 'edit'}
        title="S?a d? ?n"
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
                <option value="PENDING">?ang ch?</option>
                <option value="APPROVED">?? duy?t</option>
                <option value="REJECTED">T? ch?i</option>
              </select>
            </label>
            <label className="flex items-center gap-3 text-xs text-slate-500">
              <input
                type="checkbox"
                checked={projectEdit.featured}
                onChange={(event) => setProjectEdit((prev) => ({ ...prev, featured: event.target.checked }))}
                className="h-4 w-4"
              />
              ??nh d?u n?i b?t
            </label>
            <label className="text-xs text-slate-500">
              Th? h?ng n?i b?t
              <input
                value={projectEdit.featuredRank}
                onChange={(event) => setProjectEdit((prev) => ({ ...prev, featuredRank: event.target.value }))}
                placeholder="T?y ch?n"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
              />
            </label>
            <button
              type="button"
              onClick={handleSaveProject}
              className="w-full rounded-full bg-slate-900 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white"
            >
              L?u thay ??i
            </button>
          </div>
        ) : (
          <div className="text-sm text-slate-500">Ch?n m?t d? ?n ?? s?a.</div>
        )}
      </AdminModal>

      <AdminModal
        open={activeModal === 'create'}
        title="T?o d? ?n"
        onClose={() => setActiveModal(null)}
        size="lg"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-xs text-slate-500">
            Title
            <input
              value={createProjectForm.title}
              onChange={(event) => setCreateProjectForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="T?n d? ?n"
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
              placeholder="T?m t?t ng?n"
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
            Lo?i giao d?ch
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
            M?c ti?u v?n (USD)
            <input
              value={createProjectForm.fundingTargetUsd}
              onChange={(event) => setCreateProjectForm((prev) => ({ ...prev, fundingTargetUsd: event.target.value }))}
              placeholder="250000"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
            />
          </label>
          <label className="text-xs text-slate-500 md:col-span-2">
            URL pitch deck
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
              T?o d? ?n
            </button>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={activeModal === 'delete'}
        title="X?a d? ?n"
        onClose={() => setActiveModal(null)}
        size="sm"
      >
        <div className="space-y-4 text-sm text-slate-600">
          <p>B?n c? ch?c mu?n x?a d? ?n n?y?</p>
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="rounded-full border border-slate-200 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500"
            >
              H?y
            </button>
            <button
              type="button"
              onClick={handleX?aProject}
              className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-rose-600"
            >
              X?a
            </button>
          </div>
        </div>
      </AdminModal>
    </section>
  )
}

