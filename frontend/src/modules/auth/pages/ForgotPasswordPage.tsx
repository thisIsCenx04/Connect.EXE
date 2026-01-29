import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../../../services/auth'

interface ForgotPasswordValues {
  email: string
}

export function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ForgotPasswordValues>()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const onSubmit = async (values: ForgotPasswordValues) => {
    setError(null)
    setSuccess(null)
    try {
      await forgotPassword(values.email)
      setSuccess('Nếu email tồn tại, liên kết đặt lại đã được gửi.')
    } catch {
      setError('Không thể gửi email đặt lại.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <label className="block space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
        Email
        <input
          type="email"
          {...register('email')}
          required
          className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-sky-400/60"
          placeholder="ban@email.com"
        />
      </label>
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
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full btn-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white"
      >
        {isSubmitting ? 'Đang gửi...' : 'Gửi liên kết đặt lại'}
      </button>
      <div className="text-center text-xs uppercase tracking-[0.2em] text-white/40">
        Quay lại{' '}
        <Link to="/login" className="text-white/80 hover:text-white">
          Đăng nhập
        </Link>
      </div>
    </form>
  )
}
