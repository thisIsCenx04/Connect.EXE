import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { verifyEmail } from '../../../services/auth'

export function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (!token) {
      setStatus('error')
      return
    }
    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [])

  return (
    <div className="space-y-4">
      {status === 'loading' && (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
          Đang xác thực email...
        </div>
      )}
      {status === 'success' && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Email đã được xác thực. Bạn có thể đăng nhập ngay.
        </div>
      )}
      {status === 'error' && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          Xác thực thất bại hoặc liên kết đã hết hạn.
        </div>
      )}
      <Link
        to="/login"
        className="inline-flex w-full justify-center rounded-full btn-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-white"
      >
        Tới trang đăng nhập
      </Link>
    </div>
  )
}
