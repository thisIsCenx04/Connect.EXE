import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'

export function RequireAuth({
  children,
  roles,
}: {
  children: ReactNode
  roles?: string[]
}) {
  const { accessToken, user } = useAppSelector((state) => state.auth)

  if (!accessToken) {
    return <Navigate to="/login" replace />
  }

  if (roles && (!user || !roles.includes(user.role))) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
