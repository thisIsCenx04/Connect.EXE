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
    { label: 'Dự án nổi bật', value: `${projects.length || 0}+` },
    { label: 'Mentor đồng hành', value: '20+' },
    { label: 'Vòng gọi vốn', value: '$12.4M' },
  ]

  return (
    <div className="space-y-10">
      <section className="card-neo rounded-[28px] p-6 md:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Sàn Dự Án</p>
            <h1 className="display-font text-3xl font-semibold md:text-4xl">Dự án khởi nghiệp tiêu biểu 2025</h1>
            <p className="max-w-2xl text-sm text-white/70">
              Khám phá các dự án nổi bật, theo dõi traction và kết nối với mentor hoặc nhà đầu tư phù hợp.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {user && (
              <Link
                to="/projects/mine"
                className="rounded-full btn-ghost px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/90 transition hover:border-white/60"
              >
                Dự án của tôi
              </Link>
            )}
            <Link
              to="/projects/new"
              className="rounded-full btn-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-glow"
            >
              Tạo dự án
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
          </div>
        </div>
        <div className="card-surface rounded-2xl p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Bộ lọc</p>
          <div className="mt-4 space-y-3 text-sm text-white/80">
            <label className="block">
              <span className="text-xs text-white/50">Giai đoạn</span>
              <select
                value={filters.stage}
                onChange={(event) => setFilters({ ...filters, stage: event.target.value })}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white [color-scheme:dark]"
              >
                <option value="" className="bg-[#111827] text-white">Tất cả</option>
                {stages.map((stage) => (
                  <option key={stage} value={stage} className="bg-[#111827] text-white">
                    {stage}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-white/50">Nhu cầu</span>
              <select
                value={filters.dealType}
                onChange={(event) => setFilters({ ...filters, dealType: event.target.value })}
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white [color-scheme:dark]"
              >
                <option value="" className="bg-[#111827] text-white">Tất cả</option>
                {dealTypes.map((deal) => (
                  <option key={deal} value={deal} className="bg-[#111827] text-white">
                    {deal}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-white/50">Lĩnh vực</span>
              <input
                value={filters.industry}
                onChange={(event) => setFilters({ ...filters, industry: event.target.value })}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                placeholder="Fintech, AI, Edu..."
              />
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
            <button
              type="button"
              onClick={loadProjects}
              disabled={loading}
              className="w-full rounded-full btn-ghost px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 transition hover:bg-white/20"
            >
              {loading ? 'Đang tải...' : 'Áp dụng bộ lọc'}
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="display-font text-xl font-semibold text-white">Danh sách dự án</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-white/50">
            {projects.length} dự án
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
        )}
      </section>
    </div>
  )
}
