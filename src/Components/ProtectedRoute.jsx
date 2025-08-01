import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth()

  // Still checking auth state
  if (!isInitialized) {
    return <div>Loading...</div>
  }

  // Not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Authenticated, render the protected component
  return children
}

export default ProtectedRoute