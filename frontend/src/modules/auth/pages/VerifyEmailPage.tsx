import { Alert, Box, Button, Stack, Typography } from '@mui/material'
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
    <Box>
      <Stack spacing={2}>
        <Typography variant="h4">Email verification</Typography>
        {status === 'loading' && <Typography>Verifying your email...</Typography>}
        {status === 'success' && (
          <Alert severity="success">Your email has been verified. You can now sign in.</Alert>
        )}
        {status === 'error' && (
          <Alert severity="error">Verification failed or link expired.</Alert>
        )}
        <Button variant="contained" component={Link} to="/login">
          Go to login
        </Button>
      </Stack>
    </Box>
  )
}
