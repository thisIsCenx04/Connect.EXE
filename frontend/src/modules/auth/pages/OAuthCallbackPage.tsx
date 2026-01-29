import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../../app/hooks'
import { setTokens } from '../store/authSlice'

export function OAuthCallbackPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('accessToken') ?? ''
    const refreshToken = params.get('refreshToken') ?? ''
    const userId = params.get('userId') ?? ''
    const email = params.get('email') ?? ''
    const fullName = params.get('fullName') ?? ''
    const role = params.get('role') ?? 'USER'
    const verifiedStatus = params.get('verifiedStatus') ?? 'NONE'
    const avatarUrl = params.get('avatarUrl') ?? ''
    const emailVerified = params.get('emailVerified') === 'true'

    if (!accessToken || !refreshToken || !userId || !email) {
      setError('Đăng nhập Google thất bại. Thiếu dữ liệu.')
      return
    }

    dispatch(setTokens({
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email,
        fullName,
        role,
        verifiedStatus,
        avatarUrl: avatarUrl || null,
        emailVerified,
      },
    }))
    const destination = role === 'ADMIN' ? '/admin' : '/'
    navigate(destination)
  }, [dispatch, navigate])

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
        Đang đăng nhập...
      </div>
      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}
    </div>
  )
}
