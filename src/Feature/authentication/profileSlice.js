import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import profileService from '../../supabase/profileService'

// Async thunks for profile operations
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await profileService.getProfile(userId)
      if (!response.success) {
        return rejectWithValue(response.error)
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchProfileByUsername = createAsyncThunk(
  'profile/fetchProfileByUsername',
  async (username, { rejectWithValue }) => {
    try {
      const response = await profileService.getProfileByUsername(username)
      if (!response.success) {
        return rejectWithValue(response.error)
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await profileService.upsertProfile(profileData)
      if (!response.success) {
        return rejectWithValue(response.error)
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const uploadProfilePicture = createAsyncThunk(
  'profile/uploadProfilePicture',
  async ({ file, userId }, { rejectWithValue }) => {
    try {
      const response = await profileService.uploadProfilePicture(file, userId)
      if (!response.success) {
        return rejectWithValue(response.error)
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const checkUsernameAvailability = createAsyncThunk(
  'profile/checkUsernameAvailability',
  async ({ username, currentUserId }, { rejectWithValue }) => {
    try {
      const response = await profileService.checkUsernameAvailability(username, currentUserId)
      if (!response.success) {
        return rejectWithValue(response.error)
      }
      return { username, available: response.available }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const searchProfiles = createAsyncThunk(
  'profile/searchProfiles',
  async ({ query, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await profileService.searchProfiles(query, limit)
      if (!response.success) {
        return rejectWithValue(response.error)
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteProfile = createAsyncThunk(
  'profile/deleteProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await profileService.deleteProfile(userId)
      if (!response.success) {
        return rejectWithValue(response.error)
      }
      return userId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Initial state
const initialState = {
  currentProfile: null,
  viewedProfile: null, // For viewing other users' profiles
  searchResults: [],
  usernameCheck: {
    username: '',
    available: null,
    checking: false
  },
  loading: {
    profile: false,
    update: false,
    upload: false,
    search: false,
    delete: false
  },
  error: {
    profile: null,
    update: null,
    upload: null,
    search: null,
    delete: null
  },
  message: {
    update: null,
    upload: null,
    delete: null
  }
}

// Profile slice
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    // Clear errors
    clearProfileError: (state, action) => {
      const errorType = action.payload
      if (errorType) {
        state.error[errorType] = null
      } else {
        state.error = {
          profile: null,
          update: null,
          upload: null,
          search: null,
          delete: null
        }
      }
    },

    // Clear messages
    clearProfileMessage: (state, action) => {
      const messageType = action.payload
      if (messageType) {
        state.message[messageType] = null
      } else {
        state.message = {
          update: null,
          upload: null,
          delete: null
        }
      }
    },

    // Clear search results
    clearSearchResults: (state) => {
      state.searchResults = []
      state.error.search = null
    },

    // Clear username check
    clearUsernameCheck: (state) => {
      state.usernameCheck = {
        username: '',
        available: null,
        checking: false
      }
    },

    // Clear viewed profile
    clearViewedProfile: (state) => {
      state.viewedProfile = null
    },

    // Update current profile locally (for optimistic updates)
    updateCurrentProfileLocal: (state, action) => {
      if (state.currentProfile) {
        state.currentProfile = {
          ...state.currentProfile,
          ...action.payload
        }
      }
    },

    // Reset profile state
    resetProfileState: (state) => {
      return initialState
    }
  },

  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading.profile = true
        state.error.profile = null
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading.profile = false
        state.currentProfile = action.payload
        state.error.profile = null
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading.profile = false
        state.error.profile = action.payload
        state.currentProfile = null
      })

      // Fetch profile by username
      .addCase(fetchProfileByUsername.pending, (state) => {
        state.loading.profile = true
        state.error.profile = null
      })
      .addCase(fetchProfileByUsername.fulfilled, (state, action) => {
        state.loading.profile = false
        state.viewedProfile = action.payload
        state.error.profile = null
      })
      .addCase(fetchProfileByUsername.rejected, (state, action) => {
        state.loading.profile = false
        state.error.profile = action.payload
        state.viewedProfile = null
      })

      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading.update = true
        state.error.update = null
        state.message.update = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading.update = false
        state.currentProfile = action.payload
        state.error.update = null
        state.message.update = 'Profile updated successfully'
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading.update = false
        state.error.update = action.payload
        state.message.update = null
      })

      // Upload profile picture
      .addCase(uploadProfilePicture.pending, (state) => {
        state.loading.upload = true
        state.error.upload = null
        state.message.upload = null
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.loading.upload = false
        state.error.upload = null
        state.message.upload = 'Profile picture uploaded successfully'
        
        // Update current profile with new avatar URL
        if (state.currentProfile) {
          state.currentProfile.avatar_url = action.payload.url
          state.currentProfile.avatar_path = action.payload.path
        }
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.loading.upload = false
        state.error.upload = action.payload
        state.message.upload = null
      })

      // Check username availability
      .addCase(checkUsernameAvailability.pending, (state) => {
        state.usernameCheck.checking = true
      })
      .addCase(checkUsernameAvailability.fulfilled, (state, action) => {
        state.usernameCheck.checking = false
        state.usernameCheck.username = action.payload.username
        state.usernameCheck.available = action.payload.available
      })
      .addCase(checkUsernameAvailability.rejected, (state, action) => {
        state.usernameCheck.checking = false
        state.usernameCheck.available = null
      })

      // Search profiles
      .addCase(searchProfiles.pending, (state) => {
        state.loading.search = true
        state.error.search = null
      })
      .addCase(searchProfiles.fulfilled, (state, action) => {
        state.loading.search = false
        state.searchResults = action.payload
        state.error.search = null
      })
      .addCase(searchProfiles.rejected, (state, action) => {
        state.loading.search = false
        state.error.search = action.payload
        state.searchResults = []
      })

      // Delete profile
      .addCase(deleteProfile.pending, (state) => {
        state.loading.delete = true
        state.error.delete = null
        state.message.delete = null
      })
      .addCase(deleteProfile.fulfilled, (state, action) => {
        state.loading.delete = false
        state.currentProfile = null
        state.error.delete = null
        state.message.delete = 'Profile deleted successfully'
      })
      .addCase(deleteProfile.rejected, (state, action) => {
        state.loading.delete = false
        state.error.delete = action.payload
        state.message.delete = null
      })
  }
})

// Export actions
export const {
  clearProfileError,
  clearProfileMessage,
  clearSearchResults,
  clearUsernameCheck,
  clearViewedProfile,
  updateCurrentProfileLocal,
  resetProfileState
} = profileSlice.actions

// Selectors
export const selectCurrentProfile = (state) => state.profile.currentProfile
export const selectViewedProfile = (state) => state.profile.viewedProfile
export const selectSearchResults = (state) => state.profile.searchResults
export const selectUsernameCheck = (state) => state.profile.usernameCheck
export const selectProfileLoading = (state) => state.profile.loading
export const selectProfileError = (state) => state.profile.error
export const selectProfileMessage = (state) => state.profile.message

// Export reducer
export default profileSlice.reducer