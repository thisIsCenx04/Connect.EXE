import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { tokenStorage } from '../../../services/tokenStorage'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: {
    id: string
    email: string
    fullName: string
    role: string
    verifiedStatus: string
    avatarUrl?: string | null
    emailVerified: boolean
  } | null
}

const initialState: AuthState = {
  accessToken: tokenStorage.getAccessToken(),
  refreshToken: tokenStorage.getRefreshToken(),
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens: (
      state,
      action: PayloadAction<{
        accessToken: string
        refreshToken: string
        user: AuthState['user']
      }>
    ) => {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.user = action.payload.user
      tokenStorage.setTokens(action.payload.accessToken, action.payload.refreshToken)
    },
    logout: (state) => {
      state.accessToken = null
      state.refreshToken = null
      state.user = null
      tokenStorage.clear()
    },
    updateUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload
    },
  },
})

export const { setTokens, logout, updateUser } = authSlice.actions
export const authReducer = authSlice.reducer
