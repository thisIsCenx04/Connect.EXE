import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listMyProjects, type Project } from '../../../services/project'

export function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    listMyProjects()
      .then(setProjects)
      .finally(() => setLoading(false))
  }, [])

  return (
    <Box>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <Typography variant="h4">My projects</Typography>
          <Button component={Link} to="/projects/new" variant="contained">
            Create project
          </Button>
        </Stack>
        {loading && <Typography>Loading...</Typography>}
        {!loading && projects.length === 0 && (
          <Typography color="text.secondary">No projects yet.</Typography>
        )}
        <Stack spacing={2}>
          {projects.map((project) => (
            <Card key={project.id} elevation={4}>
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                  <Stack spacing={1} flex={1}>
                    <Typography variant="h6">{project.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {project.status} · {project.stage} · {project.dealType}
                    </Typography>
                  </Stack>
                  <Button component={Link} to={`/projects/${project.id}`} size="small">
                    View
                  </Button>
                  <Button component={Link} to={`/projects/${project.id}/edit`} size="small" variant="outlined">
                    Edit
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}
