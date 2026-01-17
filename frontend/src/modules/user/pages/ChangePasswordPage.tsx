import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../../app/hooks'
import { changePassword } from '../../../services/user'

interface ChangePasswordValues {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function ChangePasswordPage() {
  const user = useAppSelector((state) => state.auth.user)
  const navigate = useNavigate()
  const { register, handleSubmit, reset } = useForm<ChangePasswordValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const onSubmit = async (values: ChangePasswordValues) => {
    if (!user?.id) return
    setError(null)
    setSuccess(null)
    if (values.newPassword !== values.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSaving(true)
    try {
      await changePassword(user.id, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      setSuccess('Password updated.')
      reset()
    } catch (err) {
      const apiError = err as { response?: { data?: { code?: string } } }
      if (apiError.response?.data?.code === 'PASSWORD_NOT_SET') {
        setError('This account does not have a local password set.')
      } else if (apiError.response?.data?.code === 'INVALID_PASSWORD') {
        setError('Current password is incorrect.')
      } else {
        setError('Password update failed.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Settings</p>
        <h1 className="display-font text-2xl font-semibold text-white">Change password</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="card-surface max-w-xl rounded-3xl p-6">
        <div className="grid gap-4">
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Current password
            <input
              type="password"
              {...register('currentPassword')}
              required
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-sky-400/60"
            />
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            New password
            <input
              type="password"
              {...register('newPassword')}
              required
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-sky-400/60"
            />
          </label>
          <label className="space-y-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Confirm new password
            <input
              type="password"
              {...register('confirmPassword')}
              required
              className="w-full rounded-full border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-sky-400/60"
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
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full btn-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white"
            >
              {saving ? 'Updating...' : 'Update password'}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => navigate('/profile')}
              className="rounded-full btn-ghost px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white/80"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
