import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { getGoogleLoginUrl, login } from '../../../services/auth'
import { useAppDispatch } from '../../../app/hooks'
import { setTokens } from '../store/authSlice'

interface LoginFormValues {
  email: string
  password: string
}

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  EMAIL_NOT_VERIFIED: 'Email not verified. Check your inbox for the verification link.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  UNAUTHORIZED: 'Invalid email or password.',
  USER_NOT_FOUND: 'Account not found.',
  VALIDATION_ERROR: 'Please enter both email and password.',
  CONFIG_ERROR: 'Login is temporarily unavailable. Please try again later.',
  INTERNAL_ERROR: 'Server error. Please try again later.',
}

export function LoginPage() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<LoginFormValues>()
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const onSubmit = async (values: LoginFormValues) => {
    setError(null)
    try {
      const payload = await login(values.email, values.password)
      dispatch(setTokens({
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        user: payload.user,
      }))
      const destination = payload.user.role === 'ADMIN' ? '/admin' : '/'
      navigate(destination)
    } catch (err) {
      const apiError = err as { response?: { status?: number; data?: { code?: string; message?: string } } }
      if (!apiError.response) {
        setError('Unable to reach the server. Please check your connection.')
        return
      }
      const code = apiError.response.data?.code
      const message = apiError.response.data?.message
      if (code && LOGIN_ERROR_MESSAGES[code]) {
        setError(LOGIN_ERROR_MESSAGES[code])
        return
      }
      if (message) {
        setError(message)
        return
      }
      if (apiError.response.status === 401) {
        setError('Invalid email or password.')
        return
      }
      setError('Login failed. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* User Name Input */}
      <div className="relative">
        <input
          type="email"
          {...register('email')}
          required
          className="w-full rounded-full border border-white/20 bg-[rgba(30,35,60,0.6)] px-5 py-4 text-sm text-white placeholder:text-white/50 focus:border-sky-400/60 focus:outline-none"
          placeholder="User Name"
        />
        <button
          type="button"
          className="group absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/30 bg-transparent transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-500"
        >
          <svg className="h-4 w-4 text-emerald-400 transition-colors duration-200 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Password Input */}
      <div className="relative">
        <input
          type="password"
          {...register('password')}
          required
          className="w-full rounded-full border border-white/20 bg-[rgba(30,35,60,0.6)] px-5 py-4 text-sm text-white placeholder:text-white/50 focus:border-sky-400/60 focus:outline-none"
          placeholder="Password"
        />
        <button
          type="button"
          className="group absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/30 bg-transparent transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-500"
        >
          <svg className="h-4 w-4 text-emerald-400 transition-colors duration-200 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Remember me & Forgot password */}
      <div className="flex items-center justify-between text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-white/70">
          <div className="relative">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-5 w-5 rounded border border-white/30 bg-transparent peer-checked:border-violet-500 peer-checked:bg-violet-500">
              {rememberMe && (
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          Remember me
        </label>
        <Link to="/forgot-password" className="text-white/70 transition hover:text-white">
          Forgot password?
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {/* Login Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/50"
      >
        {isSubmitting ? 'Signing in...' : 'Login'}
      </button>

      {/* Google Login Button */}
      <button
        type="button"
        disabled={isSubmitting}
        onClick={() => window.location.assign(getGoogleLoginUrl())}
        className="w-full rounded-full bg-[rgba(60,65,90,0.8)] px-5 py-4 text-sm font-semibold text-sky-400 transition hover:bg-[rgba(70,75,100,0.9)]"
      >
        Log in with Google
      </button>

      {/* Sign up link */}
      <div className="pt-4 text-center text-sm text-white/60">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-white transition hover:text-sky-400">
          Signup
        </Link>
      </div>
    </form>
  )
}
