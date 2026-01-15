import { Alert, Box, Button, Chip, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../../app/hooks'
import { getKyc, getUserProfile, updateUserProfile, type UserProfile } from '../../../services/user'
import { updateUser } from '../../auth/store/authSlice'

interface ProfileFormValues {
  fullName: string
  avatarUrl: string
  headline: string
  bio: string
  country: string
  city: string
}

export function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [kycStatus, setKycStatus] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset } = useForm<ProfileFormValues>({
    defaultValues: {
      fullName: '',
      avatarUrl: '',
      headline: '',
      bio: '',
      country: '',
      city: '',
    },
  })

  const isVerified = useMemo(() => {
    return profile?.role && ['FOUNDER', 'INVESTOR'].includes(profile.role) && profile.verifiedStatus === 'APPROVED'
  }, [profile])

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return
      try {
        const profile = await getUserProfile(user.id)
        setProfile(profile)
        dispatch(updateUser({
          id: profile.id,
          email: profile.email,
          fullName: profile.fullName,
          role: profile.role,
          verifiedStatus: profile.verifiedStatus,
          avatarUrl: profile.avatarUrl ?? null,
          emailVerified: profile.emailVerified,
        }))
        reset({
          fullName: profile.fullName ?? '',
          avatarUrl: profile.avatarUrl ?? '',
          headline: profile.headline ?? '',
          bio: profile.bio ?? '',
          country: profile.country ?? '',
          city: profile.city ?? '',
        })
        if (profile.role === 'INVESTOR') {
          try {
            const kyc = await getKyc(profile.id)
            setKycStatus(kyc.status)
          } catch {
            setKycStatus('NOT_SUBMITTED')
          }
        }
      } catch {
        setError('Unable to load profile.')
      }
    }
    loadProfile()
  }, [reset, user?.id])

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user?.id) return
    setError(null)
    setSuccess(null)
    setSaving(true)
    try {
      const updated = await updateUserProfile(user.id, values)
      setProfile(updated)
      dispatch(updateUser({
        id: updated.id,
        email: updated.email,
        fullName: updated.fullName,
        role: updated.role,
        verifiedStatus: updated.verifiedStatus,
        avatarUrl: updated.avatarUrl ?? null,
        emailVerified: updated.emailVerified,
      }))
      setSuccess('Profile updated.')
    } catch {
      setError('Profile update failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Box>
      <Stack spacing={3} maxWidth={720}>
        <Stack spacing={1}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h4">Your profile</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">Role: {profile?.role ?? user?.role ?? 'USER'}</Typography>
            {isVerified && <Chip color="secondary" label="Verified" size="small" />}
          </Stack>
          {(profile?.role ?? user?.role) === 'INVESTOR' && (
            <Typography variant="body2">
              KYC status: {kycStatus ?? '...'}
            </Typography>
          )}
        </Stack>

        <Paper
          elevation={4}
          sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(15,23,42,0.85)',
          }}
        >
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <TextField label="Full name" {...register('fullName')} InputLabelProps={{ shrink: true }} />
              <TextField label="Avatar URL" {...register('avatarUrl')} InputLabelProps={{ shrink: true }} />
              <TextField label="Headline" {...register('headline')} InputLabelProps={{ shrink: true }} />
              <TextField label="Bio" {...register('bio')} multiline minRows={3} InputLabelProps={{ shrink: true }} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label="Country code" {...register('country')} inputProps={{ maxLength: 2 }} InputLabelProps={{ shrink: true }} />
                <TextField label="City" {...register('city')} InputLabelProps={{ shrink: true }} />
              </Stack>
              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">{success}</Alert>}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button type="submit" variant="contained" disabled={saving}>
                  {saving ? <CircularProgress size={18} color="inherit" /> : 'Save changes'}
                </Button>
                <Button variant="outlined" disabled={saving} onClick={() => navigate('/')}>
                  Back to home
                </Button>
                <Button variant="outlined" disabled={saving} onClick={() => navigate('/change-password')}>
                  Change password
                </Button>
                {(profile?.role ?? user?.role) === 'INVESTOR' && (
                  <Button variant="outlined" disabled={saving} onClick={() => navigate('/kyc')}>
                    Submit KYC
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Stack>
    </Box>
  )
}
