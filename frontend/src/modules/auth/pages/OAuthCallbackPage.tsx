import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { setTokens } from '../store/authSlice'

export function OAuthCallbackPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [processed, setProcessed] = useState(false)
  const { accessToken, user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (processed) return

    const params = new URLSearchParams(window.location.search)
    console.log('[OAuth] URL:', window.location.href)
    console.log('[OAuth] Params:', Object.fromEntries(params.entries()))
    
    const token = params.get('accessToken') ?? ''
    const refreshToken = params.get('refreshToken') ?? ''
    const userId = params.get('userId') ?? ''
    const email = params.get('email') ?? ''
    const fullName = params.get('fullName') ?? ''
    const role = params.get('role') ?? 'USER'
    const verifiedStatus = params.get('verifiedStatus') ?? 'NONE'
    const avatarUrl = params.get('avatarUrl') ?? ''
    const emailVerified = params.get('emailVerified') === 'true'

    console.log('[OAuth] Extracted:', { token: !!token, refreshToken: !!refreshToken, userId, email, role })

    if (!token || !refreshToken || !userId || !email) {
      console.error('[OAuth] Missing required data')
      setError('Đăng nhập Google thất bại. Thiếu dữ liệu.')
      return
    }

    console.log('[OAuth] Dispatching setTokens...')
    dispatch(setTokens({
      accessToken: token,
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
    setProcessed(true)
    console.log('[OAuth] Processed set to true')
  }, [dispatch, processed])

  // Navigate after state is updated
  useEffect(() => {
    console.log('[OAuth] State check:', { processed, accessToken: !!accessToken, user: !!user, role: user?.role })
    if (processed && accessToken && user) {
      const destination = user.role === 'ADMIN' ? '/admin' : '/'
      console.log('[OAuth] Navigating to:', destination)
      // Use window.location to force full page reload and ensure fresh state
      window.location.href = destination
    }
  }, [processed, accessToken, user])

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
