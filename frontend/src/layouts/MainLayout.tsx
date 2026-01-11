import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { logout } from '../modules/auth/store/authSlice'

export function MainLayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f7f3ef 0%, #f0e6dd 100%)' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: '#0f4c5c' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Connect.EXE</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2">{user?.fullName ?? 'Guest'}</Typography>
            <Button color="secondary" variant="contained" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ px: { xs: 2, md: 6 }, py: 4 }}>
        <Outlet />
      </Box>
    </Box>
  )
}
