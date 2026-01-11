import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { tokenStorage } from './tokenStorage'
import { store } from '../app/store'
import { setTokens, logout } from '../modules/auth/store/authSlice'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8081',
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config
    if (error.response?.status === 401 && original && !(original as any)._retry) {
      ;(original as any)._retry = true
      const refreshToken = tokenStorage.getRefreshToken()
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(
            `${api.defaults.baseURL}/api/auth/refresh`,
            { refreshToken }
          )
          const data = (refreshResponse.data as any).data
          tokenStorage.setTokens(data.accessToken, data.refreshToken)
          store.dispatch(setTokens({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            user: data.user,
          }))
          original.headers = original.headers ?? {}
          original.headers.Authorization = `Bearer ${data.accessToken}`
          return api.request(original)
        } catch (refreshError) {
          store.dispatch(logout())
        }
      }
    }
    return Promise.reject(error)
  }
)

export { api }
