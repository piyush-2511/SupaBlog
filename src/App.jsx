import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import LoadingSpinner from './components/LoadingSpinner'

// Import your pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'
import EditProfile from './pages/EditProfile'
import AddPostForm from './pages/AddPostForm'
import Post from './pages/Post'
import EditPost from './pages/EditPost'
import Bloggers from './pages/Bloggers'

const App = () => {
  const { isInitialized, isLoading } = useAuth()

  // Show loading while checking auth state
  if (!isInitialized || isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="App">
      <Routes>
        {/* Public routes - redirect to dashboard if authenticated */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        <Route path="/signup" element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } />
        
        <Route path="/reset-password" element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        } />

        {/* Protected routes - require authentication */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/bloggers" element={
          <ProtectedRoute>
            <Bloggers />
          </ProtectedRoute>
        } />
        <Route path="/add-post" element={
          <ProtectedRoute>
            <AddPostForm />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/profile/edit" element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
        } />
        <Route path="/post/:id" element={
                <ProtectedRoute>
                  <Post />
                </ProtectedRoute>
        } />
        <Route path="/edit-post/:id" element={
                <ProtectedRoute>
                  <EditPost />
                </ProtectedRoute>
        } />

        {/* Default route */}
        <Route path="/" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
