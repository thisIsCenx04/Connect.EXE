import { Alert, Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../../app/hooks'
import { changePassword } from '../../../services/user'

interface ChangePasswordValues {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function ChangePasswordPage() {
  const user = useAppSelector((state) => state.auth.user)
  const navigate = useNavigate()
  const { register, handleSubmit, reset } = useForm<ChangePasswordValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const onSubmit = async (values: ChangePasswordValues) => {
    if (!user?.id) return
    setError(null)
    setSuccess(null)
    if (values.newPassword !== values.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSaving(true)
    try {
      await changePassword(user.id, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      setSuccess('Password updated.')
      reset()
    } catch (err) {
      const apiError = err as { response?: { data?: { code?: string } } }
      if (apiError.response?.data?.code === 'PASSWORD_NOT_SET') {
        setError('This account does not have a local password set.')
      } else if (apiError.response?.data?.code === 'INVALID_PASSWORD') {
        setError('Current password is incorrect.')
      } else {
        setError('Password update failed.')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      <Stack spacing={3} maxWidth={520}>
        <Typography variant="h4">Change password</Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <TextField
              label="Current password"
              type="password"
              {...register('currentPassword')}
              required
            />
            <TextField
              label="New password"
              type="password"
              {...register('newPassword')}
              required
            />
            <TextField
              label="Confirm new password"
              type="password"
              {...register('confirmPassword')}
              required
            />
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? <CircularProgress size={18} color="inherit" /> : 'Update password'}
              </Button>
              <Button variant="outlined" disabled={saving} onClick={() => navigate('/profile')}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}
