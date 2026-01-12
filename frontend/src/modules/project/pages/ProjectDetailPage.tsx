import { Box, Button, Chip, Divider, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppSelector } from '../../../app/hooks'
import { getProject, type Project } from '../../../services/project'

export function ProjectDetailPage() {
  const { id } = useParams()
  const user = useAppSelector((state) => state.auth.user)
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    if (!id) return
    getProject(id).then(setProject)
  }, [id])

  const isOwner = useMemo(() => {
    return !!project && !!user && project.ownerId === user.id
  }, [project, user])

  if (!project) {
    return <Typography>Loading...</Typography>
  }

  return (
    <Box>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <Typography variant="h4">{project.title}</Typography>
          <Chip label={project.status} size="small" />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {project.industry} · {project.stage} · {project.dealType}
        </Typography>
        <Typography variant="body1">{project.description}</Typography>
        <Divider />
        <Stack spacing={1}>
          <Typography variant="subtitle2">Funding need</Typography>
          <Typography variant="body2">{project.fundingNeedUsd ?? 'N/A'}</Typography>
          <Typography variant="subtitle2">Equity percent</Typography>
          <Typography variant="body2">{project.equityPercent ?? 'N/A'}</Typography>
          <Typography variant="subtitle2">Traction</Typography>
          <Typography variant="body2">{project.tractionSummary ?? 'N/A'}</Typography>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Button component={Link} to="/projects" variant="outlined">
            Back to list
          </Button>
          {isOwner && (
            <Button component={Link} to={`/projects/${project.id}/edit`} variant="contained">
              Edit project
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  )
}
