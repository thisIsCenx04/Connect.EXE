import { useEffect, useRef, useState, type ReactNode } from 'react'
import axios from 'axios'
import { Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { tokenStorage } from '../../services/tokenStorage'
import { logout, setTokens } from './store/authSlice'

export function RequireAuth({
  children,
  roles,
}: {
  children: ReactNode
  roles?: string[]
}) {
  const dispatch = useAppDispatch()
  const { accessToken, refreshToken, user } = useAppSelector((state) => state.auth)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const refreshAttemptedRef = useRef(false)

  useEffect(() => {
    const needsRefresh = (!accessToken || tokenStorage.isTokenExpired(accessToken)) && !!refreshToken
    if (!needsRefresh || refreshAttemptedRef.current) {
      return
    }
    refreshAttemptedRef.current = true
    setIsRefreshing(true)
    const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8081'
    axios.post(`${baseUrl}/api/auth/refresh`, { refreshToken })
      .then((response) => {
        const data = (response.data as any).data
        dispatch(setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        }))
      })
      .catch(() => {
        dispatch(logout())
      })
      .finally(() => {
        setIsRefreshing(false)
      })
  }, [accessToken, dispatch, refreshToken])

  if ((!accessToken || tokenStorage.isTokenExpired(accessToken)) && refreshToken) {
    if (isRefreshing) {
      return (
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-white/60">
          Đang khôi phục phiên làm việc...
        </div>
      )
    }
    return <Navigate to="/login" replace />
  }

  if (!accessToken || tokenStorage.isTokenExpired(accessToken)) {
    return <Navigate to="/login" replace />
  }

  if (roles && (!user || !roles.includes(user.role))) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
