import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useAppSelector } from '../app/hooks'
import { Logo } from '../components/Logo'

const navItems = [
  { id: 'overview', label: 'Overview', path: '/admin/overview' },
  { id: 'users', label: 'Users', path: '/admin/users' },
  { id: 'kyc', label: 'KYC Review', path: '/admin/kyc' },
  { id: 'projects', label: 'Projects', path: '/admin/projects' },
  { id: 'ai', label: 'AI Usage', path: '/admin/ai-usage' },
  { id: 'revenue', label: 'Revenue', path: '/admin/revenue' },
]

export function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppSelector((state) => state.auth.user)

  const initials = useMemo(() => {
    const name = user?.fullName ?? 'Admin'
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }, [user?.fullName])

  return (
    <div className="page-shell text-white">
      <div className="app-sheen" aria-hidden="true" />
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col gap-6 px-6 py-8 lg:flex-row">
        <aside className="card-surface flex w-full flex-col gap-6 rounded-3xl border border-white/10 bg-black/40 p-6 lg:w-72">
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Admin</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60"
            >
              Back
            </button>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-semibold">
                {initials}
              </span>
              <div>
                <div className="text-sm font-semibold text-white">{user?.fullName ?? 'Admin User'}</div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/50">{user?.role ?? 'ADMIN'}</div>
              </div>
            </div>
          </div>
          <nav className="grid gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.25em] transition ${
                    isActive
                      ? 'border-sky-400/40 bg-sky-500/10 text-white'
                      : 'border-white/10 bg-black/30 text-white/70 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {item.label}
                  <span className="text-white/30">&gt;</span>
                </button>
              )
            })}
          </nav>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
            Keep moderation crisp. Approvals update user roles and project visibility in real time.
          </div>
        </aside>

        <div className="flex-1">
          <header className="card-surface rounded-3xl border border-white/10 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Admin Console</p>
                <h1 className="display-font text-2xl font-semibold text-white">Platform Control Center</h1>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/admin/overview')}
                  className="rounded-full btn-primary px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white"
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="rounded-full btn-ghost px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/80"
                >
                  Return to site
                </button>
              </div>
            </div>
          </header>
          <main className="mt-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
