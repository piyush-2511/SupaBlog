import { createClient } from '@supabase/supabase-js'
import conf from '../config/config.js'

class AuthService {
  constructor() {
    this.supabase = createClient(conf.supabaseUrl, conf.supabaseKey)
    this.user = null
    this.session = null
    
    // Listen for auth state changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.session = session
      this.user = session?.user || null
      
      if (conf.isDevelopment) {
        console.log('Auth state changed:', event, session?.user?.email)
      }
    })
  }

  // Sign up new user
  async signUp({ email, password, options = {} }) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options
      })

      if (error) throw error
      
      return {
        success: true,
        data,
        message: 'Sign up successful. Please check your email for verification.',
        needsConfirmation: !data.user?.email_confirmed_at
      }

    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error signing up:', error)
      }

      return {
        success: false,
        error: error.message,
        code: error.status
      }
    } 
  }

  // Sign in user
  async login({ email, password }) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      this.user = data.user
      this.session = data.session
      
      return {
        type: 'auth/login/fulfilled',
        success: true,
        data,
        message: 'Login successful'
      }
    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error logging in:', error)
      }
      
      // Handle specific error cases
      let errorMessage = error.message
      let errorCode = 'UNKNOWN_ERROR'
      
      if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link before signing in.'
        errorCode = 'EMAIL_NOT_CONFIRMED'
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.'
        errorCode = 'INVALID_CREDENTIALS'
      }
      
      return {
        type: 'auth/login/rejected',
        success: false,
        error: errorMessage,
        code: error.status,
        errorCode,
        payload: {
          error: errorMessage,
          message: errorMessage
        }
      }
    }
  }

  // Resend confirmation email
  async resendConfirmation(email) {
    try {
      const { error } = await this.supabase.auth.resend({
        type: 'signup',
        email: email
      })
      
      if (error) throw error
      
      return {
        success: true,
        message: 'Confirmation email resent. Please check your inbox.'
      }
    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error resending confirmation:', error)
      }
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Sign out user
  async logout() {
    try {
      const { error } = await this.supabase.auth.signOut()
      
      if (error) throw error

      this.user = null
      this.session = null
      
      return {
        success: true,
        message: 'Logout successful'
      }
    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error logging out:', error)
      }
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      
      if (error) throw error
      
      this.user = user
      return user
    } catch (error) {
      if (conf.isDevelopment) {
        console.error('getCurrentUser error:', error)
      }
      this.user = null
      return null
    }
  }

  // Get current session
  getCurrentSession() {
    return this.session
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.user && !!this.session
  }

  // Reset password
  async resetPassword(email) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) throw error
      
      return {
        success: true,
        message: 'Password reset email sent'
      }
    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error resetting password:', error)
      }
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Update password
  async updatePassword(newPassword) {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      
      return {
        success: true,
        message: 'Password updated successfully'
      }
    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error updating password:', error)
      }
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Update user profile
  async updateProfile(updates) {
    try {
      const { error } = await this.supabase.auth.updateUser({
        data: updates
      })
      
      if (error) throw error
      
      return {
        success: true,
        message: 'Profile updated successfully'
      }
    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error updating profile:', error)
      }
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  // OAuth sign in (Google, GitHub, etc.)
  async signInWithProvider(provider, options = {}) {
    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options
      })
      
      if (error) throw error
      
      return {
        success: true,
        message: `Redirecting to ${provider} login...`
      }
    } catch (error) {
      if (conf.isDevelopment) {
        console.error(`Error signing in with ${provider}:`, error)
      }
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get user profile from database (if you have a profiles table)
  async getUserProfile(userId = null) {
    try {
      const id = userId || this.user?.id
      if (!id) throw new Error('No user ID provided')
      
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      
      return data
    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error fetching user profile:', error)
      }
      return null
    }
  }
}

// Create singleton instance
const authService = new AuthService()

export default authService