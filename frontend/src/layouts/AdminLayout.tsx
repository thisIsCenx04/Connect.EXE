import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { logout } from '../modules/auth/store/authSlice'

const navItems = [
  {
    id: 'overview',
    label: 'Bảng điều khiển',
    path: '/admin/overview',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 3H4a1 1 0 0 0-1 1v6m7-7 10 10m0 0v7a1 1 0 0 1-1 1h-6m7-8H3" />
      </svg>
    ),
  },
  {
    id: 'users',
    label: 'Người dùng',
    path: '/admin/users',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm5 9a9 9 0 0 0-18 0" />
      </svg>
    ),
  },
  {
    id: 'kyc',
    label: 'Duyệt KYC',
    path: '/admin/kyc',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 4 7v5c0 5 3.5 9 8 10 4.5-1 8-5 8-10V7l-8-4Z" />
      </svg>
    ),
  },
  {
    id: 'projects',
    label: 'Dự án',
    path: '/admin/projects',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v6H4zM4 14h16v6H4z" />
      </svg>
    ),
  },
  {
    id: 'content',
    label: 'Nội dung',
    path: '/admin/content',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h8" />
      </svg>
    ),
  },
  {
    id: 'ai',
    label: 'Sử dụng AI',
    path: '/admin/ai-usage',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v6m0 6v6M3 12h6m6 0h6" />
      </svg>
    ),
  },
  {
    id: 'revenue',
    label: 'Doanh thu',
    path: '/admin/revenue',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M7 16V8m5 8V5m5 11v-6" />
      </svg>
    ),
  },
  {
    id: 'payments',
    label: 'Thanh toán',
    path: '/admin/payments',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M5 11h14M6 15h6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      </svg>
    ),
  },
]

export function AdminLayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAppSelector((state) => state.auth.user)
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('admin-theme') === 'dark'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('admin-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div
      className={`admin-shell min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#f6f4f9] text-slate-900'}`}
      style={{ colorScheme: isDark ? 'dark' : 'light' }}
    >
      <div className="mx-auto min-h-screen w-full max-w-[1440px] px-6 py-8">
        <aside
          className={`admin-sidebar fixed top-8 bottom-8 hidden w-[250px] flex-col gap-6 overflow-y-auto rounded-[28px] border px-5 py-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] lg:flex ${
            isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
          }`}
          style={{ left: 'max(24px, calc(50% - 720px + 24px))' }}
        >
          <nav className="grid gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] transition ${
                    isActive
                      ? `${isDark ? 'bg-slate-800 text-white' : 'bg-slate-900 text-white'} shadow-[0_12px_30px_rgba(15,23,42,0.18)]`
                      : `${isDark ? 'text-slate-300 hover:bg-slate-800/60' : 'text-slate-500 hover:bg-slate-100'}`
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : isDark
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
          <div className="mt-auto">
            <button
              type="button"
              onClick={handleLogout}
              className={`w-full rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] ${
                isDark
                  ? 'border-slate-800 text-slate-300 hover:border-slate-600'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              Đăng xuất
            </button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-6 lg:pl-[280px]">
          <header
            className={`rounded-[28px] border px-6 py-5 shadow-[0_25px_60px_rgba(15,23,42,0.08)] ${
              isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Bảng điều khiển</p>
                <h1 className={`text-2xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Bảng quản trị</h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 ${
                    isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
                  </svg>
                  <input
                    placeholder="Tìm kiếm..."
                    className={`w-56 bg-transparent text-sm outline-none ${isDark ? 'text-slate-200' : 'text-slate-600'}`}
                  />
                </div>
                <button
                  type="button"
                  className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                    isDark ? 'border-slate-800 bg-slate-900 text-slate-300' : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                    isDark ? 'border-slate-800 bg-slate-900 text-slate-300' : 'border-slate-200 bg-white text-slate-500'
                  }`}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Zm7.4-2.1-.8 1.3a2 2 0 0 1-2.4.8l-1.3-.5a7.4 7.4 0 0 1-1.6.9l-.2 1.4a2 2 0 0 1-2 1.7h-1.6a2 2 0 0 1-2-1.7l-.2-1.4a7.4 7.4 0 0 1-1.6-.9l-1.3.5a2 2 0 0 1-2.4-.8l-.8-1.3a2 2 0 0 1 .4-2.5l1.1-.9a7.4 7.4 0 0 1 0-1.8l-1.1-.9a2 2 0 0 1-.4-2.5l.8-1.3a2 2 0 0 1 2.4-.8l1.3.5a7.4 7.4 0 0 1 1.6-.9l.2-1.4a2 2 0 0 1 2-1.7h1.6a2 2 0 0 1 2 1.7l.2 1.4a7.4 7.4 0 0 1 1.6.9l1.3-.5a2 2 0 0 1 2.4.8l.8 1.3a2 2 0 0 1-.4 2.5l-1.1.9c.1.6.1 1.2 0 1.8l1.1.9a2 2 0 0 1 .4 2.5Z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDark((prev) => !prev)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                    isDark ? 'border-slate-800 bg-slate-900 text-slate-300' : 'border-slate-200 bg-white text-slate-500'
                  }`}
                  aria-label="Đổi giao diện"
                >
                  {isDark ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <circle cx="12" cy="12" r="4" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
                    </svg>
                  )}
                </button>
                <div
                  className={`flex items-center gap-3 rounded-full border px-3 py-1.5 ${
                    isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
                  }`}
                >
                  <span className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-700'}`}>
                    {user?.fullName ?? 'Quản trị viên'}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Quản trị</span>
                  <span className={`h-9 w-9 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                </div>
              </div>
            </div>
          </header>

          <div className="grid gap-6">
            <main className="min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
