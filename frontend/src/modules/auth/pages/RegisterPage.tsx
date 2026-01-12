import { Alert, Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerUser } from '../../../services/auth'

interface RegisterFormValues {
  fullName: string
  email: string
  password: string
}

export function RegisterPage() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<RegisterFormValues>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const navigate = useNavigate()

  const onSubmit = async (values: RegisterFormValues) => {
    setError(null)
    try {
      await registerUser(values)
      setSuccess('Registration successful. Please check your email to activate your account.')
    } catch (err) {
      setError('Registration failed. Please try again.')
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <TextField label="Full name" {...register('fullName')} required />
        <TextField label="Email" type="email" {...register('email')} required />
        <TextField label="Password" type="password" {...register('password')} required />
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Create account'}
        </Button>
        <Typography variant="body2">
          Already have an account? <Link to="/login">Sign in</Link>
        </Typography>
        {success && (
          <Button variant="text" onClick={() => navigate('/login')}>
            Go to login
          </Button>
        )}
      </Stack>
    </Box>
  )
}
