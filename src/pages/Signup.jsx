import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../hooks/useAuth'
import authService from '../supabase/authService'

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showResendConfirmation, setShowResendConfirmation] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false)
  
  const navigate = useNavigate()
  const {
    signup,
    signInWithOAuth,
    isLoading,
    error,
    message,
    clearAuthError,
    clearAuthMessage
  } = useAuth()

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
    clearErrors
  } = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    mode: 'onChange' // Validate on change for better UX
  })

  // Watch values for validation and resend confirmation
  const watchedEmail = watch('email')
  const watchedPassword = watch('password')

  // Clear messages when component mounts
  useEffect(() => {
    if (clearAuthError) clearAuthError()
    if (clearAuthMessage) clearAuthMessage()
    setShowResendConfirmation(false)
    setResendMessage('')
    setShowConfirmationMessage(false)
  }, [clearAuthError, clearAuthMessage])

  // Clear resend confirmation UI when user starts typing
  useEffect(() => {
    if (showResendConfirmation && (watchedEmail || watch('password') || watch('username'))) {
      setShowResendConfirmation(false)
      setResendMessage('')
    }
    
    // Clear confirmation message when user starts typing
    if (showConfirmationMessage && (watchedEmail || watch('password') || watch('username'))) {
      setShowConfirmationMessage(false)
    }
  }, [watchedEmail, watch('password'), watch('username'), showResendConfirmation, showConfirmationMessage])

  const onSubmit = async (data) => {
    if (clearAuthError) clearAuthError()
    setShowResendConfirmation(false)
    setResendMessage('')
    setShowConfirmationMessage(false)
    
    // Remove confirmPassword from data before sending to signup
    const { confirmPassword, ...signupData } = data
    
    try {
      const result = await signup(signupData)
      
      console.log('Signup result:', result) // Debug log
      
      // Handle successful signup
      if (result?.type === 'auth/signup/fulfilled' || result?.success === true) {
        setShowConfirmationMessage(true)
        // Don't navigate immediately - user needs to confirm email first
        return
      }
      
      // Handle signup errors
      if (result?.type === 'auth/signup/rejected' || result?.success === false) {
        // Extract error message from different possible structures
        const errorMessage = 
          result?.error || 
          result?.payload?.error || 
          result?.payload?.message ||
          'Signup failed'
        
        console.log('Signup error message:', errorMessage) // Debug log
        
        // Check if the error is related to email confirmation
        const confirmationKeywords = [
          'email not confirmed',
          'Email not confirmed',
          'email confirmation required',
          'please confirm your email',
          'verify your email',
          'confirmation required',
          'confirm your email'
        ]
        
        const needsConfirmation = confirmationKeywords.some(keyword => 
          errorMessage.toLowerCase().includes(keyword.toLowerCase())
        )
            
        if (needsConfirmation) {
          console.log('Email confirmation required, showing resend option') // Debug log
          setShowResendConfirmation(true)
          setShowConfirmationMessage(true)
        }
      }
    } catch (error) {
      console.error('Signup submission error:', error)
      
      // Check if it's a confirmation error
      const errorMessage = error?.message || error?.toString() || ''
      if (errorMessage.toLowerCase().includes('confirm')) {
        setShowResendConfirmation(true)
        setShowConfirmationMessage(true)
      }
    }
  }

  const handleResendConfirmation = async () => {
    if (!watchedEmail) {
      setResendMessage('Please enter your email address first.')
      return
    }

    setResendLoading(true)
    setResendMessage('')
    
    try {
      console.log('Resending confirmation to:', watchedEmail) // Debug log
      const result = await authService.resendConfirmation(watchedEmail)
      
      console.log('Resend result:', result) // Debug log
      
      if (result.success) {
        setResendMessage('Confirmation email sent! Please check your inbox and spam folder.')
        setShowResendConfirmation(false)
        
        // Hide the success message after 5 seconds
        setTimeout(() => {
          setResendMessage('')
        }, 5000)
      } else {
        setResendMessage(result.error || 'Failed to send confirmation email. Please try again.')
      }
    } catch (error) {
      console.error('Resend confirmation error:', error)
      setResendMessage('Failed to send confirmation email. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.username ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Username"
                {...register('username', {
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters long'
                  },
                  maxLength: {
                    value: 20,
                    message: 'Username must be no more than 20 characters long'
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_-]+$/,
                    message: 'Username can only contain letters, numbers, underscores, and hyphens'
                  }
                })}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address'
                  }
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div className="relative">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters long'
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
                  }
                })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="relative">
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={`appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Confirm Password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => 
                    value === watchedPassword || 'Passwords do not match'
                })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {showConfirmationMessage && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">
                    Account created successfully! Please check your email and click the confirmation link to verify your account before signing in.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{error}</p>
                  
                  {showResendConfirmation && (
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <p className="text-sm text-red-600 mb-2">
                        Please verify your email address to continue.
                      </p>
                      <button
                        type="button"
                        onClick={handleResendConfirmation}
                        disabled={resendLoading}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resendLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-red-700" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          'Resend Confirmation Email'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{message}</p>
                </div>
              </div>
            </div>
          )}

          {resendMessage && (
            <div className={`border px-4 py-3 rounded ${
              resendMessage.includes('sent') || resendMessage.includes('check') 
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-yellow-50 border-yellow-200 text-yellow-700'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {resendMessage.includes('sent') || resendMessage.includes('check') ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm">{resendMessage}</p>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading || isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SignUp