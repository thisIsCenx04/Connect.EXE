import { Alert, Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../../../services/auth'

interface ForgotPasswordValues {
  email: string
}

export function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<ForgotPasswordValues>()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const onSubmit = async (values: ForgotPasswordValues) => {
    setError(null)
    setSuccess(null)
    try {
      await forgotPassword(values.email)
      setSuccess('If the email exists, a reset link has been sent.')
    } catch {
      setError('Could not send reset email.')
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <Typography variant="h4">Reset your password</Typography>
        <TextField label="Email" type="email" {...register('email')} required />
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Send reset link'}
        </Button>
        <Typography variant="body2">
          Back to <Link to="/login">Sign in</Link>
        </Typography>
      </Stack>
    </Box>
  )
}
