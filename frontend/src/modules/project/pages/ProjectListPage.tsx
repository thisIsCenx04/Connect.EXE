import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../../../app/hooks'
import { listProjects, listIndustries, type Project } from '../../../services/project'
import { PROJECT_STAGES, DEAL_TYPES, PROJECT_SECTIONS } from '@/constants/project'

export function ProjectListPage() {
  const user = useAppSelector((state) => state.auth.user)
  const [projects, setProjects] = useState<Project[]>([])
  const [industries, setIndustries] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'funding'>('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const [filters, setFilters] = useState({
    stage: '',
    industry: '',
    country: '',
    dealType: '',
  })

  const loadProjects = async () => {
    setLoading(true)
    try {
      const data = await listProjects({
        stage: filters.stage || undefined,
        industry: filters.industry || undefined,
        country: filters.country || undefined,
        dealType: filters.dealType || undefined,
      })
      setProjects(data)
      setCurrentPage(1) // Reset to first page when filters change
    } finally {
      setLoading(false)
    }
  }

  const handleApplyFilters = () => {
    loadProjects()
  }

  const handleResetFilters = () => {
    setFilters({ stage: '', industry: '', country: '', dealType: '' })
    setSearchTerm('')
    setSortBy('newest')
  }

  useEffect(() => {
    loadProjects()
    listIndustries().then(setIndustries).catch(() => {})
  }, [])

  // Filter by search term
  const searchFiltered = useMemo(() => {
    if (!searchTerm.trim()) return projects
    const term = searchTerm.toLowerCase()
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        (p.description ?? '').toLowerCase().includes(term) ||
        (p.summary ?? '').toLowerCase().includes(term)
    )
  }, [projects, searchTerm])

  // Sort projects
  const sorted = useMemo(() => {
    const arr = [...searchFiltered]
    if (sortBy === 'newest') {
      return arr.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    } else if (sortBy === 'oldest') {
      return arr.sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime())
    } else if (sortBy === 'funding') {
      return arr.sort((a, b) => (b.fundingTargetUsd ?? 0) - (a.fundingTargetUsd ?? 0))
    }
    return arr
  }, [searchFiltered, sortBy])

  // Pagination
  const totalPages = Math.ceil(sorted.length / itemsPerPage)
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sorted.slice(start, start + itemsPerPage)
  }, [sorted, currentPage])

  const featured = useMemo(() => paginatedProjects.slice(0, 2), [paginatedProjects])
  const rest = useMemo(() => paginatedProjects.slice(2), [paginatedProjects])

  const resolveCover = (project: Project) =>
    project.media?.find((item) => item.role === 'COVER')?.fileUrl ?? null

  return (
    <div className="space-y-10">
      <section className="card-neo rounded-[28px] p-6 md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">{PROJECT_SECTIONS.hero.label}</p>
            <h1 className="display-font text-3xl font-semibold md:text-4xl">{PROJECT_SECTIONS.hero.title}</h1>
            <p className="max-w-2xl text-sm text-white/70">
              {PROJECT_SECTIONS.hero.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {user && (
              <Link
                to="/projects/mine"
                className="rounded-full btn-ghost px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/90 transition hover:border-white/60"
              >
                {PROJECT_SECTIONS.hero.myProjectsButton}
              </Link>
            )}
            <Link
              to="/projects/new"
              className="rounded-full btn-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-glow"
            >
              {PROJECT_SECTIONS.hero.createButton}
            </Link>
          </div>
        </div>
        {/* Search & Sort */}
        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Tìm kiếm dự án..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pl-10 text-sm text-white placeholder:text-white/40"
            />
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/50">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white [color-scheme:dark]"
            >
              <option value="newest" className="bg-[#111827]">Mới nhất</option>
              <option value="oldest" className="bg-[#111827]">Cũ nhất</option>
              <option value="funding" className="bg-[#111827]">Mục tiêu cao nhất</option>
            </select>
          </div>
        </div>
        {/* Bộ lọc */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60 mb-4">{PROJECT_SECTIONS.filter.label}</p>
          <div className="grid gap-4 md:grid-cols-5 items-end">
            <label className="block">
              <span className="text-xs text-white/50">{PROJECT_SECTIONS.filter.stage.label}</span>
              <select
                value={filters.stage}
                onChange={(event) => setFilters({ ...filters, stage: event.target.value })}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white [color-scheme:dark]"
              >
                <option value="" className="bg-[#111827] text-white">{PROJECT_SECTIONS.filter.stage.placeholder}</option>
                {PROJECT_STAGES.map((stage) => (
                  <option key={stage} value={stage} className="bg-[#111827] text-white">
                    {stage}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-white/50">{PROJECT_SECTIONS.filter.dealType.label}</span>
              <select
                value={filters.dealType}
                onChange={(event) => setFilters({ ...filters, dealType: event.target.value })}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white [color-scheme:dark]"
              >
                <option value="" className="bg-[#111827] text-white">{PROJECT_SECTIONS.filter.dealType.placeholder}</option>
                {DEAL_TYPES.map((deal) => (
                  <option key={deal} value={deal} className="bg-[#111827] text-white">
                    {deal}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-white/50">Lĩnh vực</span>
              <select
                value={filters.industry}
                onChange={(event) => setFilters({ ...filters, industry: event.target.value })}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white [color-scheme:dark]"
              >
                <option value="" className="bg-[#111827] text-white">Tất cả</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry} className="bg-[#111827] text-white">
                    {industry}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-white/50">Quốc gia</span>
              <input
                value={filters.country}
                onChange={(event) => setFilters({ ...filters, country: event.target.value })}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                placeholder="VN"
                maxLength={2}
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleApplyFilters}
                disabled={loading}
                className="flex-1 rounded-full btn-primary px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-glow disabled:opacity-50"
              >
                {loading ? 'Đang tải...' : 'Áp dụng'}
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 rounded-full btn-ghost px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:bg-white/20 border border-white/10"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="grid gap-4 md:grid-cols-2">
          {featured.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="group card-surface overflow-hidden rounded-2xl transition hover:border-white/30"
            >
              <div className="aspect-[16/9] w-full overflow-hidden bg-white/10">
                {resolveCover(project) ? (
                  <img
                    src={resolveCover(project) as string}
                    alt={project.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.2em] text-white/40">
                    Cover
                  </div>
                )}
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-white/50">
                  <span>{project.industry}</span>
                  <span>{project.stage}</span>
                </div>
                <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                <p className="text-sm text-white/70">
                  {(project.summary ?? project.description ?? '').slice(0, 120)}
                </p>
                <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.2em] text-white/50">
                  <span>{project.dealType}</span>
                  <span>{project.status}</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="display-font text-xl font-semibold text-white">Danh sách dự án</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-white/50">
            {sorted.length} dự án
          </span>
        </div>
        {sorted.length === 0 && !loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/60">
            Chưa có dự án phù hợp. Hãy tạo dự án đầu tiên của bạn.
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="group card-surface flex h-full flex-col overflow-hidden rounded-2xl transition hover:border-white/30"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-white/10">
                    {resolveCover(project) ? (
                      <img
                        src={resolveCover(project) as string}
                        alt={project.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.2em] text-white/40">
                        Gallery
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-white/50">
                      <span>{project.stage}</span>
                      <span>{project.dealType}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                    <p className="text-sm text-white/70">
                      {(project.summary ?? project.description ?? '').slice(0, 140)}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-2">
                      {(project.tags ?? []).slice(0, 3).map((tag) => (
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
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-10 w-10 rounded-full text-xs font-semibold transition ${
                        currentPage === page
                          ? 'bg-sky-500 text-white'
                          : 'border border-white/10 text-white/70 hover:border-white/30'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
