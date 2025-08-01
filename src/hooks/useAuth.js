// hooks/useAuth.js
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useCallback } from 'react'
import { 
  loginUser, 
  signUpUser, 
  logoutUser, 
  getCurrentUser, 
  resetPassword, 
  updatePassword, 
  updateProfile, 
  signInWithProvider, 
  getUserProfile,
  clearError,
  clearMessage,
  setAuthState
} from '../Feature/authentication/authSlice'
import authService from '../supabase/authService'

export const useAuth = () => {
  const dispatch = useDispatch()
  
  // Get auth state from Redux store
  const authState = useSelector((state) => state.auth)
  
  const {
    user,
    session,
    userProfile,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    message
  } = authState

  // Initialize auth state on mount
  useEffect(() => {
    if (!isInitialized) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, isInitialized])

  // Listen for auth state changes from Supabase
  useEffect(() => {
    let subscription = null
    
    try {
      const { data } = authService.supabase.auth.onAuthStateChange(
        (event, session) => {
          dispatch(setAuthState({
            user: session?.user || null,
            session: session || null 
          }))
        }
      )
      
      subscription = data.subscription
    } catch (error) {
      console.error('Error setting up auth state listener:', error)
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [dispatch])

  // Memoized action creators to prevent unnecessary re-renders
  const login = useCallback(async (credentials) => {
    try {
      const result = await dispatch(loginUser(credentials))
      return result
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }, [dispatch])

  const signUp = useCallback(async (credentials) => {
    try {
      const result = await dispatch(signUpUser(credentials))
      return result
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }, [dispatch])

  const logout = useCallback(async () => {
    try {
      const result = await dispatch(logoutUser())
      return result
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }, [dispatch])

  const resetUserPassword = useCallback(async (email) => {
    try {
      const result = await dispatch(resetPassword(email))
      return result
    } catch (error) {
      console.error('Reset password error:', error)
      throw error
    }
  }, [dispatch])

  const updateUserPassword = useCallback(async (newPassword) => {
    try {
      const result = await dispatch(updatePassword(newPassword))
      return result
    } catch (error) {
      console.error('Update password error:', error)
      throw error
    }
  }, [dispatch])

  const updateUserProfile = useCallback(async (updates) => {
    try {
      const result = await dispatch(updateProfile(updates))
      return result
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }, [dispatch])

  const signInWithOAuth = useCallback(async (provider, options) => {
    try {
      const result = await dispatch(signInWithProvider({ provider, options }))
      return result
    } catch (error) {
      console.error('OAuth sign in error:', error)
      throw error
    }
  }, [dispatch])

  const fetchUserProfile = useCallback(async (userId) => {
    try {
      const result = await dispatch(getUserProfile(userId))
      return result
    } catch (error) {
      console.error('Fetch user profile error:', error)
      throw error
    }
  }, [dispatch])

  const clearAuthError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  const clearAuthMessage = useCallback(() => {
    dispatch(clearMessage())
  }, [dispatch])

  return {
    // State
    user,
    session,
    userProfile,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    message,
    
    // Actions
    login,
    signUp,
    logout,
    resetUserPassword,
    updateUserPassword,
    updateUserProfile,
    signInWithOAuth,
    fetchUserProfile,
    clearAuthError,
    clearAuthMessage
  }
}

// Default export
export default useAuth