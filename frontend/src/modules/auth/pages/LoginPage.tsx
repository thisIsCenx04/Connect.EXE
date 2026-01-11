import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../../services/auth'
import { useAppDispatch } from '../../../app/hooks'
import { setTokens } from '../store/authSlice'

interface LoginFormValues {
  email: string
  password: string
}

export function LoginPage() {
  const { register, handleSubmit } = useForm<LoginFormValues>()
  const [error, setError] = useState<string | null>(null)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const onSubmit = async (values: LoginFormValues) => {
    setError(null)
    try {
      const payload = await login(values.email, values.password)
      dispatch(setTokens({
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        user: payload.user,
      }))
      navigate('/')
    } catch (err) {
      setError('Login failed. Please check your credentials.')
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={2}>
        <TextField label="Email" type="email" {...register('email')} required />
        <TextField label="Password" type="password" {...register('password')} required />
        {error && <Alert severity="error">{error}</Alert>}
        <Button type="submit" variant="contained" size="large">
          Sign in
        </Button>
        <Typography variant="body2">
          New here? <Link to="/register">Create an account</Link>
        </Typography>
      </Stack>
    </Box>
  )
}
