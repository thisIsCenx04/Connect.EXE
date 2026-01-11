import { Box, Card, CardContent, Chip, Grid, Typography } from '@mui/material'
import { useAppSelector } from '../../app/hooks'

export function HomePage() {
  const user = useAppSelector((state) => state.auth.user)

  return (
    <Box>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
        Welcome back{user?.fullName ? `, ${user.fullName}` : ''}
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, maxWidth: 680 }}>
        This is the Core Platform hub. From here, the other modules will plug into
        authentication, roles, and shared APIs.
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={6} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Profile Snapshot
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {user?.email ?? 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Role: {user?.role ?? 'USER'}
              </Typography>
              <Chip label="Core Platform" sx={{ mt: 2 }} color="secondary" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={6} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Next Steps
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add modules for projects, forum, AI, and matching when you are ready.
              </Typography>
              <Chip label="API Ready" sx={{ mt: 2 }} color="primary" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
