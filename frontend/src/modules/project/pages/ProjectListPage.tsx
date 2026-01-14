import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../../../app/hooks'
import { listProjects, type Project } from '../../../services/project'

const stages = ['IDEA', 'MVP', 'REVENUE', 'EXIT_READY']
const dealTypes = ['COFOUNDER', 'FUNDING', 'SELL_PROJECT', 'HIRE_TEAM']

export function ProjectListPage() {
  const user = useAppSelector((state) => state.auth.user)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
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
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const featured = useMemo(() => projects.slice(0, 2), [projects])
  const rest = useMemo(() => projects.slice(2), [projects])

  const resolveCover = (project: Project) =>
    project.media?.find((item) => item.role === 'COVER')?.fileUrl ?? null

  const stats = [
    { label: 'Du an noi bat', value: `${projects.length || 0}+` },
    { label: 'Mentor dong hanh', value: '20+' },
    { label: 'Vong goi von', value: '$12.4M' },
  ]

  return (
    <div className="space-y-10">
      <section className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,#1f2b57,transparent_60%)] from-[#10162b] via-[#171236] to-[#0c0f1f] p-6 shadow-xl md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Project Marketplace</p>
            <h1 className="text-3xl font-semibold md:text-4xl">Du an khoi nghiep tieu bieu 2025</h1>
            <p className="max-w-2xl text-sm text-white/70">
              Kham pha cac du an noi bat, theo doi traction va ket noi voi mentor hoac nha dau tu phu hop.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {user && (
              <Link
                to="/projects/mine"
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/90 transition hover:border-white/60"
              >
                Du an cua toi
              </Link>
            )}
            <Link
              to="/projects/new"
              className="rounded-full bg-gradient-to-r from-sky-500 to-purple-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-glow"
            >
              Tao du an
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

      <section className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-3">
          <div className="grid gap-4 md:grid-cols-2">
            {featured.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-white/30"
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
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Filters</p>
          <div className="mt-4 space-y-3 text-sm text-white/80">
            <label className="block">
              <span className="text-xs text-white/50">Giai doan</span>
              <select
                value={filters.stage}
                onChange={(event) => setFilters({ ...filters, stage: event.target.value })}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              >
                <option value="">Tat ca</option>
                {stages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-white/50">Nhu cau</span>
              <select
                value={filters.dealType}
                onChange={(event) => setFilters({ ...filters, dealType: event.target.value })}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              >
                <option value="">Tat ca</option>
                {dealTypes.map((deal) => (
                  <option key={deal} value={deal}>
                    {deal}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-white/50">Linh vuc</span>
              <input
                value={filters.industry}
                onChange={(event) => setFilters({ ...filters, industry: event.target.value })}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                placeholder="Fintech, AI, Edu..."
              />
            </label>
            <label className="block">
              <span className="text-xs text-white/50">Quoc gia</span>
              <input
                value={filters.country}
                onChange={(event) => setFilters({ ...filters, country: event.target.value })}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                placeholder="VN"
                maxLength={2}
              />
            </label>
            <button
              type="button"
              onClick={loadProjects}
              disabled={loading}
              className="w-full rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 transition hover:bg-white/20"
            >
              {loading ? 'Dang tai...' : 'Ap dung bo loc'}
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Danh sach du an</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-white/50">
            {projects.length} du an
          </span>
        </div>
        {projects.length === 0 && !loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/60">
            Chua co du an phu hop. Hay tao du an dau tien cua ban.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:border-white/30"
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
        )}
      </section>
    </div>
  )
}
