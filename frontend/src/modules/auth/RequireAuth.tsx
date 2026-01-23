import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { tokenStorage } from '../../services/tokenStorage'

export function RequireAuth({
  children,
  roles,
}: {
  children: ReactNode
  roles?: string[]
}) {
  const { accessToken, refreshToken, user } = useAppSelector((state) => state.auth)

  if ((!accessToken || tokenStorage.isTokenExpired(accessToken)) && refreshToken) {
    return null
  }

  if (!accessToken || tokenStorage.isTokenExpired(accessToken)) {
    return <Navigate to="/login" replace />
  }

  if (roles && (!user || !roles.includes(user.role))) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
