import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
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

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f4c5c',
    },
    secondary: {
      main: '#e36414',
    },
    background: {
      default: '#f7f3ef',
    },
  },
  typography: {
    fontFamily: '"Source Sans 3", "Segoe UI", sans-serif',
  },
})

export function App() {
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
