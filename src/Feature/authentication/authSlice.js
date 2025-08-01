// store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import authService from '../../supabase/authService' // Adjust path as needed

// Async thunks for authentication actions
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login({ email, password })
      if (!response.success) {
        return rejectWithValue(response.error)
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const signUpUser = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, options }, { rejectWithValue }) => {
    try {
      const response = await authService.signUp({ email, password, options })
      if (!response.success) {
        return rejectWithValue(response.error)
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.logout()
      if (!response.success) {
        return rejectWithValue(response.error)
      }
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser()
      const session = authService.getCurrentSession()
      return { user, session }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(email)
      if (!response.success) {
        return rejectWithValue(response.error)
      }
      return response.message
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (newPassword, { rejectWithValue }) => {
    try {
      const response = await authService.updatePassword(newPassword)
      if (!response.success) {
        return rejectWithValue(response.error)
      }
      return response.message
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updates, { rejectWithValue }) => {
    try {
      const response = await authService.updateProfile(updates)
      if (!response.success) {
        return rejectWithValue(response.error)
      }
      return response.message
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const signInWithProvider = createAsyncThunk(
  'auth/signInWithProvider',
  async ({ provider, options }, { rejectWithValue }) => {
    try {
      const response = await authService.signInWithProvider(provider, options)
      if (!response.success) {
        return rejectWithValue(response.error)
      }
      return response.message
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const profile = await authService.getUserProfile(userId)
      return profile
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  user: null,
  session: null,
  userProfile: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  message: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearMessage: (state) => {
      state.message = null
    },
    setAuthState: (state, action) => {
      const { user, session } = action.payload
      state.user = user
      state.session = session
      state.isAuthenticated = !!(user && session)
      state.isInitialized = true
    },
    resetAuthState: (state) => {
      state.user = null
      state.session = null
      state.userProfile = null
      state.isAuthenticated = false
      state.error = null
      state.message = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.session = action.payload.session
        state.isAuthenticated = true
        state.message = 'Login successful'
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
      })

      // Sign Up
      .addCase(signUpUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.session = action.payload.session
        state.message = 'Sign up successful. Please check your email for verification.'
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.session = null
        state.userProfile = null
        state.isAuthenticated = false
        state.message = 'Logout successful'
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.session = action.payload.session
        state.isAuthenticated = !!(action.payload.user && action.payload.session)
        state.isInitialized = true
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
        state.isAuthenticated = false
        state.isInitialized = true
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false
        state.message = action.payload
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update Password
      .addCase(updatePassword.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updatePassword.fulfilled, (state, action) => {
        state.isLoading = false
        state.message = action.payload
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.message = action.payload
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Sign In With Provider
      .addCase(signInWithProvider.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signInWithProvider.fulfilled, (state, action) => {
        state.isLoading = false
        state.message = action.payload
      })
      .addCase(signInWithProvider.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

      // Get User Profile
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.userProfile = action.payload
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { clearError, clearMessage, setAuthState, resetAuthState } = authSlice.actions

export default authSlice.reducer