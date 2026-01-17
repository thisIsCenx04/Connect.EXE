import { Outlet, useLocation } from 'react-router-dom'

export function AuthLayout() {
  const location = useLocation()
  const authCopy = {
    '/login': {
      title: 'Login',
      subtitle: 'Welcome back please login to your account',
    },
    '/register': {
      title: 'Signup',
      subtitle: 'Create your account to start building your startup story.',
    },
    '/forgot-password': {
      title: 'Reset password',
      subtitle: 'We will send a reset link to your email.',
    },
    '/reset-password': {
      title: 'New password',
      subtitle: 'Choose a strong password for your account.',
    },
    '/verify-email': {
      title: 'Verify email',
      subtitle: 'Confirm your email to unlock full access.',
    },
    '/oauth2/callback': {
      title: 'Authenticating',
      subtitle: 'Completing secure sign-in.',
    },
  } as const
  const copy = authCopy[location.pathname as keyof typeof authCopy] ?? authCopy['/login']

  return (
    <div className="page-shell relative flex min-h-screen items-center justify-center px-6 py-12 text-white">
      <div className="app-sheen" aria-hidden="true" />
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[rgba(20,22,45,0.75)] via-[rgba(25,28,55,0.7)] to-[rgba(35,25,60,0.65)] shadow-2xl backdrop-blur-xl">
        <div className="grid lg:grid-cols-[1.3fr_0.7fr]">
          {/* Left side - Form */}
          <div className="space-y-6 px-12 py-12 sm:px-16 sm:py-14">
            <div>
              <h1 className="text-5xl font-bold text-white">{copy.title}</h1>
              <p className="mt-3 text-sm font-medium text-white/60">{copy.subtitle}</p>
            </div>
            <div className="w-full">
              <Outlet />
            </div>
          </div>
          {/* Right side - Image */}
          <div className="hidden items-center justify-center p-4 lg:flex">
            <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1663970206512-9d785d57b5dd?w=800&auto=format&fit=crop&q=100"
                alt="Circuit board"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
