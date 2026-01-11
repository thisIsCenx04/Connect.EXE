import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerUser } from '../../../services/auth'
import { useAppDispatch } from '../../../app/hooks'
import { setTokens } from '../store/authSlice'

interface RegisterFormValues {
  fullName: string
  email: string
  password: string
}

export function RegisterPage() {
  const { register, handleSubmit } = useForm<RegisterFormValues>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  })
  const [error, setError] = useState<string | null>(null)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const onSubmit = async (values: RegisterFormValues) => {
    setError(null)
    try {
      const payload = await registerUser(values)
      dispatch(setTokens({
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        user: payload.user,
      }))
      navigate('/')
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
        <Button type="submit" variant="contained" size="large">
          Create account
        </Button>
        <Typography variant="body2">
          Already have an account? <Link to="/login">Sign in</Link>
        </Typography>
      </Stack>
    </Box>
  )
}
