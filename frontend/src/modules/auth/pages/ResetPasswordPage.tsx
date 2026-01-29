import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { resetPassword } from '../../../services/auth'

interface ResetPasswordValues {
  newPassword: string
  confirmPassword: string
}

export function ResetPasswordPage() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ResetPasswordValues>()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const navigate = useNavigate()

  const onSubmit = async (values: ResetPasswordValues) => {
    setError(null)
    setSuccess(null)
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (!token) {
      setError('Thiếu token đặt lại mật khẩu.')
      return
    }
    if (values.newPassword !== values.confirmPassword) {
      setError('Mật khẩu không khớp.')
      return
    }
    try {
      await resetPassword(token, values.newPassword)
      setSuccess('Mật khẩu đã được đặt lại. Bạn có thể đăng nhập ngay.')
      setTimeout(() => navigate('/login'), 1500)
    } catch {
      setError('Đặt lại thất bại. Liên kết có thể đã hết hạn.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <label className="block space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
        Mật khẩu mới
        <input
          type="password"
          {...register('newPassword')}
          required
          className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-sky-400/60"
          placeholder="Tạo mật khẩu mạnh"
        />
      </label>
      <label className="block space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
        Xác nhận mật khẩu
        <input
          type="password"
          {...register('confirmPassword')}
          required
          className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-sky-400/60"
          placeholder="Nhập lại mật khẩu"
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
        {isSubmitting ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
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
