import { Alert, Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material'
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
      setError('Reset token is missing.')
      return
    }
    if (values.newPassword !== values.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    try {
      await resetPassword(token, values.newPassword)
      setSuccess('Password has been reset. You can now sign in.')
      setTimeout(() => navigate('/login'), 1500)
    } catch {
      setError('Reset failed. The link may be expired.')
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <Typography variant="h4">Set a new password</Typography>
        <TextField label="New password" type="password" {...register('newPassword')} required />
        <TextField label="Confirm password" type="password" {...register('confirmPassword')} required />
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Reset password'}
        </Button>
        <Typography variant="body2">
          Back to <Link to="/login">Sign in</Link>
        </Typography>
      </Stack>
    </Box>
  )
}
