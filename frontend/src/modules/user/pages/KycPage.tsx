import { Alert, Box, Button, CircularProgress, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../../app/hooks'
import { getKyc, submitKyc } from '../../../services/user'

interface KycFormValues {
  legalName: string
  organization: string
  website: string
  linkedinUrl: string
  docType: string
  docNumber: string
  docFileUrl: string
}

export function KycPage() {
  const user = useAppSelector((state) => state.auth.user)
  const navigate = useNavigate()
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, reset } = useForm<KycFormValues>({
    defaultValues: {
      legalName: '',
      organization: '',
      website: '',
      linkedinUrl: '',
      docType: 'ID_CARD',
      docNumber: '',
      docFileUrl: '',
    },
  })

  useEffect(() => {
    const loadKyc = async () => {
      if (!user?.id) return
      try {
        const kyc = await getKyc(user.id)
        setStatus(kyc.status)
        reset({
          legalName: kyc.legalName ?? '',
          organization: kyc.organization ?? '',
          website: kyc.website ?? '',
          linkedinUrl: kyc.linkedinUrl ?? '',
          docType: kyc.docType ?? 'ID_CARD',
          docNumber: kyc.docNumber ?? '',
          docFileUrl: kyc.docFileUrl ?? '',
        })
      } catch {
        setStatus('NOT_SUBMITTED')
      }
    }
    loadKyc()
  }, [reset, user?.id])

  const onSubmit = async (values: KycFormValues) => {
    if (!user?.id) return
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      const kyc = await submitKyc(user.id, values)
      setStatus(kyc.status)
      setSuccess('KYC submitted successfully.')
    } catch {
      setError('KYC submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (user?.role !== 'INVESTOR') {
    return (
      <Box>
        <Typography variant="h5">KYC is only required for investors.</Typography>
        <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/profile')}>
          Back to profile
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Stack spacing={3} maxWidth={720}>
        <Stack spacing={1}>
          <Typography variant="h4">Investor verification</Typography>
          <Typography variant="body2">Current status: {status ?? '...'}</Typography>
        </Stack>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <TextField label="Legal name" {...register('legalName')} />
            <TextField label="Organization" {...register('organization')} />
            <TextField label="Website" {...register('website')} />
            <TextField label="LinkedIn URL" {...register('linkedinUrl')} />
            <TextField select label="Document type" {...register('docType')}>
              <MenuItem value="ID_CARD">ID Card</MenuItem>
              <MenuItem value="PASSPORT">Passport</MenuItem>
              <MenuItem value="DRIVER_LICENSE">Driver license</MenuItem>
              <MenuItem value="BUSINESS_LICENSE">Business license</MenuItem>
            </TextField>
            <TextField label="Document number" {...register('docNumber')} />
            <TextField label="Document file URL" {...register('docFileUrl')} />
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? <CircularProgress size={18} color="inherit" /> : 'Submit KYC'}
              </Button>
              <Button variant="outlined" disabled={submitting} onClick={() => navigate('/profile')}>
                Back to profile
              </Button>
              <Button variant="text" disabled={submitting} onClick={() => navigate('/')}>
                Back to home
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}
