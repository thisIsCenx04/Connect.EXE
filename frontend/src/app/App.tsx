import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import axios from 'axios'
import { useEffect, useRef } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { AdminLayout } from '../layouts/AdminLayout'
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
import { ChatPage } from '../modules/chat/pages/ChatPage'
import { ForumHomePage } from '../modules/forum/pages/ForumHomePage'
import { ForumCategoryPage } from '../modules/forum/pages/ForumCategoryPage'
import { ForumPostDetailPage } from '../modules/forum/pages/ForumPostDetailPage'
import { ForumCreatePostPage } from '../modules/forum/pages/ForumCreatePostPage'
import { AboutPage } from '../modules/about/AboutPage'
import { StartupHubPage, ContentDetailPage } from '../modules/startupHub'
import { ResourcesPage, ResourceDetailPage } from '../modules/resources'
import { ContactAdminPage } from '../modules/contact/ContactAdminPage'
import {
  AiChatPage,
  AiHistoryPage,
  AiLandingPage,
  AiMarketAnalyzerPage,
  AiPitchdeckAssistantPage,
  AiProjectEvaluatorPage,
} from '../modules/ai'
import {
  AdminAiUsagePage,
  AdminContentPage,
  AdminKycPage,
  AdminOverviewPage,
  AdminProjectsPage,
  AdminRevenuePage,
  AdminUsersPage,
} from '../modules/admin'
import { BillingPage, PricingPage } from '../modules/payment'
import { getUserProfile } from '../services/user'
import { tokenStorage } from '../services/tokenStorage'
import { useAppDispatch, useAppSelector } from './hooks'
import { logout, setTokens, updateUser } from '../modules/auth/store/authSlice'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8b5cf6',
    },
    secondary: {
      main: '#38bdf8',
    },
    background: {
      default: '#05070f',
      paper: '#0f1326',
    },
    text: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
    },
  },
  typography: {
    fontFamily: '"Manrope", "Segoe UI", sans-serif',
    h1: { fontFamily: '"Sora", "Manrope", sans-serif' },
    h2: { fontFamily: '"Sora", "Manrope", sans-serif' },
    h3: { fontFamily: '"Sora", "Manrope", sans-serif' },
    h4: { fontFamily: '"Sora", "Manrope", sans-serif' },
  },
})

export function App() {
  const dispatch = useAppDispatch()
  const { accessToken, refreshToken, user } = useAppSelector((state) => state.auth)
  const lastSyncedId = useRef<string | null>(null)
  const logoutTimerRef = useRef<number | null>(null)
  const refreshInFlightRef = useRef<Promise<void> | null>(null)

  useEffect(() => {
    let cancelled = false
    if (logoutTimerRef.current !== null) {
      window.clearTimeout(logoutTimerRef.current)
      logoutTimerRef.current = null
    }

    const refreshSession = async () => {
      if (!refreshToken) {
        dispatch(logout())
        return
      }
      if (refreshInFlightRef.current) {
        await refreshInFlightRef.current
        return
      }
      const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8081'
      refreshInFlightRef.current = (async () => {
        try {
          const response = await axios.post(`${baseUrl}/api/auth/refresh`, { refreshToken })
          const data = (response.data as any).data
          if (!cancelled) {
            dispatch(setTokens({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              user: data.user,
            }))
          }
        } catch {
          if (!cancelled) {
            dispatch(logout())
          }
        } finally {
          refreshInFlightRef.current = null
        }
      })()
      await refreshInFlightRef.current
    }

    if (!accessToken) {
      if (refreshToken) {
        refreshSession()
      }
      return () => {
        cancelled = true
      }
    }
    if (tokenStorage.isTokenExpired(accessToken)) {
      refreshSession()
      return () => {
        cancelled = true
      }
    }
    const delay = tokenStorage.getLogoutDelayMs(accessToken)
    if (delay === null) {
      return () => {
        cancelled = true
      }
    }
    logoutTimerRef.current = window.setTimeout(() => {
      refreshSession()
    }, delay)
    return () => {
      cancelled = true
      if (logoutTimerRef.current !== null) {
        window.clearTimeout(logoutTimerRef.current)
        logoutTimerRef.current = null
      }
    }
  }, [accessToken, dispatch, refreshToken])

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
                <HomePage />
              }
            />
            <Route path="/projects" element={<ProjectListPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/hall-of-fame" element={<HallOfFameListPage />} />
            <Route path="/hall-of-fame/:id" element={<HallOfFameDetailPage />} />
            <Route path="/forum" element={<ForumHomePage />} />
            <Route path="/forum/categories/:slug" element={<ForumCategoryPage />} />
            <Route path="/forum/posts/:id" element={<ForumPostDetailPage />} />
            <Route path="/news" element={<StartupHubPage />} />
            <Route path="/news/:id" element={<ContentDetailPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/resources/:id" element={<ResourceDetailPage />} />
            <Route path="/contact-admin" element={<ContactAdminPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route
              path="/forum/create"
              element={
                <RequireAuth>
                  <ForumCreatePostPage />
                </RequireAuth>
              }
            />
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
              path="/chat"
              element={
                <RequireAuth>
                  <ChatPage />
                </RequireAuth>
              }
            />
            <Route
              path="/ai"
              element={
                <RequireAuth>
                  <AiLandingPage />
                </RequireAuth>
              }
            />
            <Route
              path="/ai/chat"
              element={
                <RequireAuth>
                  <AiChatPage />
                </RequireAuth>
              }
            />
            <Route
              path="/ai/market"
              element={
                <RequireAuth>
                  <AiMarketAnalyzerPage />
                </RequireAuth>
              }
            />
            <Route
              path="/ai/pitchdeck"
              element={
                <RequireAuth>
                  <AiPitchdeckAssistantPage />
                </RequireAuth>
              }
            />
            <Route
              path="/ai/evaluate"
              element={
                <RequireAuth>
                  <AiProjectEvaluatorPage />
                </RequireAuth>
              }
            />
            <Route
              path="/ai/history"
              element={
                <RequireAuth>
                  <AiHistoryPage />
                </RequireAuth>
              }
            />
            <Route
              path="/billing"
              element={
                <RequireAuth>
                  <BillingPage />
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
          <Route
            path="/admin"
            element={(
              <RequireAuth roles={['ADMIN']}>
                <AdminLayout />
              </RequireAuth>
            )}
          >
            <Route index element={<Navigate to="/admin/overview" replace />} />
            <Route path="overview" element={<AdminOverviewPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="kyc" element={<AdminKycPage />} />
            <Route path="projects" element={<AdminProjectsPage />} />
            <Route path="content" element={<AdminContentPage />} />
            <Route path="ai-usage" element={<AdminAiUsagePage />} />
            <Route path="revenue" element={<AdminRevenuePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
