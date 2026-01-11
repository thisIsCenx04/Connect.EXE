import { Alert, Box, Stack, Typography } from '@mui/material'
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
      setError('Google login failed. Missing data.')
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
    navigate('/')
  }, [dispatch, navigate])

  return (
    <Box>
      <Stack spacing={2}>
        <Typography variant="h4">Signing you in...</Typography>
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </Box>
  )
}
