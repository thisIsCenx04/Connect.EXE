import { Box, Button, Card, CardContent, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../../../app/hooks'
import { listProjects, type Project } from '../../../services/project'

const stages = ['IDEA', 'MVP', 'REVENUE', 'EXIT_READY']
const dealTypes = ['COFOUNDER', 'FUNDING', 'SELL_PROJECT', 'HIRE_TEAM']

export function ProjectListPage() {
  const user = useAppSelector((state) => state.auth.user)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    stage: '',
    industry: '',
    country: '',
    dealType: '',
  })

  const loadProjects = async () => {
    setLoading(true)
    try {
      const data = await listProjects({
        stage: filters.stage || undefined,
        industry: filters.industry || undefined,
        country: filters.country || undefined,
        dealType: filters.dealType || undefined,
      })
      setProjects(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  return (
    <Box>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <Typography variant="h4">Project Market</Typography>
          <Stack direction="row" spacing={2}>
            {user && (
              <Button component={Link} to="/projects/mine" variant="outlined">
                My projects
              </Button>
            )}
            <Button component={Link} to="/projects/new" variant="contained">
              Create project
            </Button>
          </Stack>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Stage"
            select
            value={filters.stage}
            onChange={(event) => setFilters({ ...filters, stage: event.target.value })}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All</MenuItem>
            {stages.map((stage) => (
              <MenuItem key={stage} value={stage}>
                {stage}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Deal type"
            select
            value={filters.dealType}
            onChange={(event) => setFilters({ ...filters, dealType: event.target.value })}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All</MenuItem>
            {dealTypes.map((deal) => (
              <MenuItem key={deal} value={deal}>
                {deal}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Industry"
            value={filters.industry}
            onChange={(event) => setFilters({ ...filters, industry: event.target.value })}
          />
          <TextField
            label="Country"
            value={filters.country}
            onChange={(event) => setFilters({ ...filters, country: event.target.value })}
            inputProps={{ maxLength: 2 }}
          />
          <Button variant="outlined" onClick={loadProjects} disabled={loading}>
            {loading ? 'Loading...' : 'Apply'}
          </Button>
        </Stack>

        <Stack spacing={2}>
          {projects.length === 0 && !loading && (
            <Typography color="text.secondary">No projects found.</Typography>
          )}
          {projects.map((project) => (
            <Card key={project.id} elevation={4}>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="h6">{project.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {project.industry} · {project.stage} · {project.dealType}
                  </Typography>
                  <Typography variant="body2">{project.description.slice(0, 160)}...</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={project.status} size="small" />
                    <Button component={Link} to={`/projects/${project.id}`} size="small">
                      View
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}
