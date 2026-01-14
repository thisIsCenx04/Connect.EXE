import { Outlet, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { logout } from '../modules/auth/store/authSlice'

export function MainLayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#0b0f1f] text-white">
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(88,101,242,0.18),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.18),transparent_45%)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-lg font-semibold tracking-wide"
          >
            Connect.EXE
          </button>
          <div className="hidden items-center gap-6 text-sm text-white/80 md:flex">
            <button onClick={() => navigate('/')} className="transition hover:text-white">
              Trang chủ
            </button>
            <button onClick={() => navigate('/projects')} className="transition hover:text-white">
              Dự án
            </button>
            <button onClick={() => navigate('/hall-of-fame')} className="transition hover:text-white">
              Hall of Fame
            </button>
            <button onClick={() => navigate('/profile')} className="transition hover:text-white">
              Profile
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs uppercase tracking-[0.2em] text-white/60 sm:inline">
              {user?.fullName ?? 'Guest'}
            </span>
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/90 transition hover:border-white/60"
            >
              Projects
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-gradient-to-r from-sky-500 to-purple-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-glow"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
