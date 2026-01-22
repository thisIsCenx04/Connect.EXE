const ACCESS_TOKEN_KEY = 'connectexe_access_token'
const REFRESH_TOKEN_KEY = 'connectexe_refresh_token'
const USER_KEY = 'connectexe_user'
const TOKEN_EXPIRY_SKEW_MS = 5000

export const tokenStorage = {
  getTokenExpiryMs(token: string | null) {
    if (!token) {
      return null
    }
    const payload = tokenStorage.getTokenPayload(token)
    if (!payload || typeof payload.exp !== 'number') {
      return null
    }
    return payload.exp * 1000
  },
  getLogoutDelayMs(token: string | null) {
    const expiresAt = tokenStorage.getTokenExpiryMs(token)
    if (!expiresAt) {
      return null
    }
    return Math.max(0, expiresAt - Date.now() - TOKEN_EXPIRY_SKEW_MS)
  },
  isTokenExpired(token: string | null) {
    const expiresAt = tokenStorage.getTokenExpiryMs(token)
    if (!expiresAt) {
      return false
    }
    return Date.now() >= (expiresAt - TOKEN_EXPIRY_SKEW_MS)
  },
  getAccessToken(): string | null {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY)
    if (token && tokenStorage.isTokenExpired(token)) {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
      return null
    }
    return token
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },
  getUser<T>() {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) {
      return null
    }
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },
  getTokenSubject(token: string | null) {
    const payload = tokenStorage.getTokenPayload(token)
    return payload?.sub ?? null
  },
  getTokenPayload(token: string | null) {
    if (!token) {
      return null
    }
    const parts = token.split('.')
    if (parts.length < 2) {
      return null
    }
    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
      return JSON.parse(atob(padded)) as { sub?: string; exp?: number }
    } catch {
      return null
    }
  },
  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },
  setUser(user: unknown) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },
  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  },
}
