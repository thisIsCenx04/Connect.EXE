import { Alert, Box, Button, CircularProgress, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { createProject, getProject, updateProject } from '../../../services/project'

const stages = ['IDEA', 'MVP', 'REVENUE', 'EXIT_READY']
const dealTypes = ['COFOUNDER', 'FUNDING', 'SELL_PROJECT', 'HIRE_TEAM']
const statuses = ['DRAFT', 'PUBLISHED', 'MATCHING', 'IN_DEAL', 'CLOSED', 'HIDDEN']

interface ProjectFormValues {
  title: string
  description: string
  stage: string
  industry: string
  dealType: string
  country: string
  fundingNeedUsd: string
  equityPercent: string
  tractionSummary: string
  pitchDeckUrl: string
  status: string
}

export function ProjectFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const labelProps = id ? { shrink: true } : undefined
  const { control, register, handleSubmit, reset } = useForm<ProjectFormValues>({
    defaultValues: {
      title: '',
      description: '',
      stage: 'IDEA',
      industry: '',
      dealType: 'FUNDING',
      country: '',
      fundingNeedUsd: '',
      equityPercent: '',
      tractionSummary: '',
      pitchDeckUrl: '',
      status: 'DRAFT',
    },
  })

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getProject(id)
      .then((project) => {
        reset({
          title: project.title,
          description: project.description,
          stage: project.stage,
          industry: project.industry,
          dealType: project.dealType,
          country: project.country ?? '',
          fundingNeedUsd: project.fundingNeedUsd?.toString() ?? '',
          equityPercent: project.equityPercent?.toString() ?? '',
          tractionSummary: project.tractionSummary ?? '',
          pitchDeckUrl: project.pitchDeckUrl ?? '',
          status: project.status,
        })
      })
      .catch(() => setError('Unable to load project.'))
      .finally(() => setLoading(false))
  }, [id, reset])

  const onSubmit = async (values: ProjectFormValues) => {
    setError(null)
    setLoading(true)
    const payload = {
      title: values.title,
      description: values.description,
      stage: values.stage,
      industry: values.industry,
      dealType: values.dealType,
      country: values.country || undefined,
      fundingNeedUsd: values.fundingNeedUsd ? Number(values.fundingNeedUsd) : undefined,
      equityPercent: values.equityPercent ? Number(values.equityPercent) : undefined,
      tractionSummary: values.tractionSummary || undefined,
      pitchDeckUrl: values.pitchDeckUrl || undefined,
    }
    try {
      if (id) {
        await updateProject(id, { ...payload, status: values.status })
      } else {
        await createProject(payload)
      }
      navigate(id ? `/projects/${id}` : '/projects')
    } catch {
      setError('Unable to save project.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Stack spacing={3} maxWidth={720}>
        <Typography variant="h4">{id ? 'Edit project' : 'Create project'}</Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <TextField label="Title" {...register('title')} required InputLabelProps={labelProps} />
            <TextField
              label="Description"
              {...register('description')}
              multiline
              minRows={4}
              required
              InputLabelProps={labelProps}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller
                name="stage"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Stage"
                    select
                    required
                    InputLabelProps={labelProps}
                    fullWidth
                    sx={{ minWidth: 200 }}
                  >
                    {stages.map((stage) => (
                      <MenuItem key={stage} value={stage}>
                        {stage}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                name="dealType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Deal type"
                    select
                    required
                    InputLabelProps={labelProps}
                    fullWidth
                    sx={{ minWidth: 200 }}
                  >
                    {dealTypes.map((deal) => (
                      <MenuItem key={deal} value={deal}>
                        {deal}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Stack>
            <TextField label="Industry" {...register('industry')} required InputLabelProps={labelProps} />
            <TextField label="Country" {...register('country')} inputProps={{ maxLength: 2 }} InputLabelProps={labelProps} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Funding need (USD)" {...register('fundingNeedUsd')} InputLabelProps={labelProps} />
              <TextField label="Equity percent" {...register('equityPercent')} InputLabelProps={labelProps} />
            </Stack>
            <TextField label="Traction summary" {...register('tractionSummary')} InputLabelProps={labelProps} />
            <TextField label="Pitch deck URL" {...register('pitchDeckUrl')} InputLabelProps={labelProps} />
            {id && (
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Status" select InputLabelProps={labelProps}>
                    {statuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            )}
            {error && <Alert severity="error">{error}</Alert>}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={18} color="inherit" /> : 'Save project'}
              </Button>
              <Button variant="outlined" onClick={() => navigate('/projects')} disabled={loading}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}
