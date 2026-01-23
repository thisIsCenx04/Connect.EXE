import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerUser } from '../../../services/auth'

interface RegisterFormValues {
  fullName: string
  email: string
  password: string
}

export function RegisterPage() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<RegisterFormValues>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const navigate = useNavigate()

  const onSubmit = async (values: RegisterFormValues) => {
    setError(null)
    try {
      await registerUser(values)
      setSuccess('Registration successful. Please check your email to activate your account.')
    } catch (err) {
      setError('Registration failed. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Full Name Input */}
      <div className="relative">
        <input
          {...register('fullName')}
          required
          className="w-full rounded-full border border-white/20 bg-[rgba(30,35,60,0.6)] px-5 py-4 text-sm text-white placeholder:text-white/50 focus:border-sky-400/60 focus:outline-none"
          placeholder="Full Name"
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

      {/* Email Input */}
      <div className="relative">
        <input
          type="email"
          {...register('email')}
          required
          className="w-full rounded-full border border-white/20 bg-[rgba(30,35,60,0.6)] px-5 py-4 text-sm text-white placeholder:text-white/50 focus:border-sky-400/60 focus:outline-none"
          placeholder="Email"
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

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </div>
      )}

      {/* Create Account Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-gradient-to-r from-[#3b82f6] to-[#1d4ed8] px-5 py-4 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:shadow-blue-500/50"
      >
        {isSubmitting ? 'Creating...' : 'Create account'}
      </button>

      {/* Sign in link */}
      <div className="pt-4 text-center text-sm text-white/60">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-white transition hover:text-sky-400">
          Sign in
        </Link>
      </div>

      {success && (
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-full rounded-full bg-[rgba(60,65,90,0.8)] px-5 py-4 text-sm font-semibold text-sky-400 transition hover:bg-[rgba(70,75,100,0.9)]"
        >
          Go to login
        </button>
      )}
    </form>
  )
}
