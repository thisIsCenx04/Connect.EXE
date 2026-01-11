import { Box, Container, Paper, Typography } from '@mui/material'
import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'radial-gradient(circle at top, #f7f3ef 0%, #f0e6dd 45%, #ffe8d6 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={8} sx={{ p: 4, borderRadius: 3 }}>
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
