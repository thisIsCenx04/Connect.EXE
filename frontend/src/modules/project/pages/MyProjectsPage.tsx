import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { submitProject, listMyProjects, type Project } from '../../../services/project'

export function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProjects = async () => {
    setLoading(true)
    try {
      const data = await listMyProjects()
      setProjects(data)
    } catch {
      setError('Không thể tải dự án của bạn.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleSubmit = async (id: string) => {
    setLoading(true)
    try {
      await submitProject(id)
      await loadProjects()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <section className="card-neo flex flex-col items-start justify-between gap-4 rounded-3xl p-6 md:flex-row md:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Bảng điều khiển</p>
          <h1 className="display-font text-2xl font-semibold text-white">Dự án của tôi</h1>
          <p className="mt-2 text-sm text-white/70">Theo dõi trạng thái duyệt và cập nhật nội dung.</p>
        </div>
        <Link
          to="/projects/new"
          className="rounded-full btn-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-glow"
        >
          Tạo dự án
        </Link>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {projects.length === 0 && !loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/60">
          Chưa có dự án nào.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <div key={project.id} className="card-surface rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-white/50">
                    {project.stage} · {project.dealType}
                  </p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/60">
                  {project.moderationStatus ?? 'PENDING'}
                </span>
              </div>
              <p className="mt-3 text-sm text-white/70">
                {(project.summary ?? project.description).slice(0, 120)}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to={`/projects/${project.id}`}
                  className="rounded-full btn-ghost px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80"
                >
                  Xem
                </Link>
                <Link
                  to={`/projects/${project.id}/edit`}
                  className="rounded-full btn-ghost px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80"
                >
                  Chỉnh sửa
                </Link>
                <button
                  type="button"
                  onClick={() => handleSubmit(project.id)}
                  className="rounded-full btn-ghost px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80"
                >
                  Gửi duyệt
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
