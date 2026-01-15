import { Box, Container, Paper, Typography } from '@mui/material'
import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background:
          'radial-gradient(circle at 20% 20%, rgba(88,101,242,0.18), transparent 45%), radial-gradient(circle at 80% 0%, rgba(168,85,247,0.18), transparent 50%), #0b0f1f',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.08)',
            backgroundColor: 'rgba(15,23,42,0.9)',
            color: 'text.primary',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Connect.EXE
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Core platform access for founders, investors, and mentors.
          </Typography>
          <Outlet />
        </Paper>
      </Container>
    </Box>
  )
}
