import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { useEffect, useRef } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { HomePage } from '../modules/home/HomePage'
import { LoginPage } from '../modules/auth/pages/LoginPage'
import { RegisterPage } from '../modules/auth/pages/RegisterPage'
import { RequireAuth } from '../modules/auth/RequireAuth'
import { ProfilePage } from '../modules/user/pages/ProfilePage'
import { KycPage } from '../modules/user/pages/KycPage'
import { ChangePasswordPage } from '../modules/user/pages/ChangePasswordPage'
import { ForgotPasswordPage } from '../modules/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '../modules/auth/pages/ResetPasswordPage'
import { VerifyEmailPage } from '../modules/auth/pages/VerifyEmailPage'
import { OAuthCallbackPage } from '../modules/auth/pages/OAuthCallbackPage'
import { ProjectListPage } from '../modules/project/pages/ProjectListPage'
import { ProjectDetailPage } from '../modules/project/pages/ProjectDetailPage'
import { ProjectFormPage } from '../modules/project/pages/ProjectFormPage'
import { MyProjectsPage } from '../modules/project/pages/MyProjectsPage'
import { HallOfFameListPage } from '../modules/hallOfFame/pages/HallOfFameListPage'
import { HallOfFameDetailPage } from '../modules/hallOfFame/pages/HallOfFameDetailPage'
import { HallOfFameApplyPage } from '../modules/hallOfFame/pages/HallOfFameApplyPage'
import { getUserProfile } from '../services/user'
import { tokenStorage } from '../services/tokenStorage'
import { useAppDispatch, useAppSelector } from './hooks'
import { updateUser } from '../modules/auth/store/authSlice'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#38bdf8',
    },
    secondary: {
      main: '#a855f7',
    },
    background: {
      default: '#0b0f1f',
      paper: '#0f172a',
    },
    text: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Source Sans 3", "Segoe UI", sans-serif',
  },
})

export function App() {
  const dispatch = useAppDispatch()
  const { accessToken, user } = useAppSelector((state) => state.auth)
  const lastSyncedId = useRef<string | null>(null)

  useEffect(() => {
    if (!accessToken) {
      return
    }
    const userId = user?.id ?? tokenStorage.getTokenSubject(accessToken)
    if (!userId || lastSyncedId.current === userId) {
      return
    }
    lastSyncedId.current = userId
    getUserProfile(userId)
      .then((profile) => {
        dispatch(updateUser({
          id: profile.id,
          email: profile.email,
          fullName: profile.fullName,
          role: profile.role,
          verifiedStatus: profile.verifiedStatus,
          avatarUrl: profile.avatarUrl ?? null,
          emailVerified: profile.emailVerified,
        }))
      })
      .catch(() => null)
  }, [accessToken, dispatch, user?.id])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route
              index
              element={
                <RequireAuth>
                  <HomePage />
                </RequireAuth>
              }
            />
            <Route path="/projects" element={<ProjectListPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/hall-of-fame" element={<HallOfFameListPage />} />
            <Route path="/hall-of-fame/:id" element={<HallOfFameDetailPage />} />
            <Route
              path="/hall-of-fame/apply"
              element={
                <RequireAuth>
                  <HallOfFameApplyPage />
                </RequireAuth>
              }
            />
            <Route
              path="/projects/new"
              element={
                <RequireAuth>
                  <ProjectFormPage />
                </RequireAuth>
              }
            />
            <Route
              path="/projects/:id/edit"
              element={
                <RequireAuth>
                  <ProjectFormPage />
                </RequireAuth>
              }
            />
            <Route
              path="/projects/mine"
              element={
                <RequireAuth>
                  <MyProjectsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              }
            />
            <Route
              path="/change-password"
              element={
                <RequireAuth>
                  <ChangePasswordPage />
                </RequireAuth>
              }
            />
            <Route
              path="/kyc"
              element={
                <RequireAuth>
                  <KycPage />
                </RequireAuth>
              }
            />
          </Route>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
