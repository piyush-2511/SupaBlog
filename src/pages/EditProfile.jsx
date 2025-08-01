import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { Link, useNavigate } from 'react-router-dom'

const EditProfile = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    currentProfile,
    loading,
    error,
    message,
    usernameCheck,
    fetchProfile,
    updateProfile,
    uploadProfilePicture,
    checkUsernameAvailability,
    clearProfileError,
    clearProfileMessage,
    clearUsernameCheck
  } = useProfile()

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    display_name: '',
    bio: '',
    website: '',
    location: '',
    date_of_birth: ''
  })
  
  const [profilePicture, setProfilePicture] = useState(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState(null)
  const [usernameTimeout, setUsernameTimeout] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  const fileInputRef = useRef(null)

  // Load profile data on mount
  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id)
    }
  }, [user?.id])

  // Update form when profile data is loaded
  useEffect(() => {
    if (currentProfile) {
      const initialData = {
        username: currentProfile.username || '',
        display_name: currentProfile.display_name || '',
        bio: currentProfile.bio || '',
        website: currentProfile.website || '',
        location: currentProfile.location || '',
        date_of_birth: currentProfile.date_of_birth || ''
      }
      setFormData(initialData)
      setProfilePicturePreview(currentProfile.avatar_url)
    }
  }, [currentProfile])

  // Check for changes
  useEffect(() => {
    if (currentProfile) {
      const hasFormChanges = (
        formData.username !== (currentProfile.username || '') ||
        formData.display_name !== (currentProfile.display_name || '') ||
        formData.bio !== (currentProfile.bio || '') ||
        formData.website !== (currentProfile.website || '') ||
        formData.location !== (currentProfile.location || '') ||
        formData.date_of_birth !== (currentProfile.date_of_birth || '')
      )
      const hasPictureChange = profilePicture !== null
      setHasChanges(hasFormChanges || hasPictureChange)
    }
  }, [formData, profilePicture, currentProfile])

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear previous messages when user starts typing
    if (error.update) clearProfileError()
    if (message.update) clearProfileMessage()

    // Check username availability with debounce
    if (name === 'username' && value !== currentProfile?.username) {
      if (usernameTimeout) {
        clearTimeout(usernameTimeout)
      }
      
      const timeout = setTimeout(() => {
        if (value.length >= 3) {
          checkUsernameAvailability({ username: value, currentUserId: user?.id })
        } else {
          clearUsernameCheck()
        }
      }, 500)
      
      setUsernameTimeout(timeout)
    }
  }

  // Handle profile picture selection
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }

      setProfilePicture(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfilePicturePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove profile picture
  const handleRemoveProfilePicture = () => {
    setProfilePicture(null)
    setProfilePicturePreview(currentProfile?.avatar_url)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Validate form data
  const validateForm = () => {
    const errors = []
    
    if (!formData.username.trim()) {
      errors.push('Username is required')
    } else if (formData.username.length < 3) {
      errors.push('Username must be at least 3 characters')
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.push('Username can only contain letters, numbers, and underscores')
    }

    if (formData.website && !isValidUrl(formData.website)) {
      errors.push('Please enter a valid website URL')
    }

    if (formData.bio && formData.bio.length > 500) {
      errors.push('Bio cannot exceed 500 characters')
    }

    // Check if username is taken (only if different from current)
    if (formData.username !== currentProfile?.username && 
        usernameCheck.username === formData.username && 
        !usernameCheck.available) {
      errors.push('Username is not available')
    }

    return errors
  }

  // URL validation helper
  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user?.id) return

    // Validate form
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'))
      return
    }

    setIsSubmitting(true)
    
    try {
      // Upload profile picture first if selected
      if (profilePicture) {
        await uploadProfilePicture(profilePicture, user.id)
      }

      // Update profile data
      const profileData = {
        user_id: user.id,
        ...formData,
        // Ensure empty strings are converted to null for optional fields
        display_name: formData.display_name.trim() || null,
        bio: formData.bio.trim() || null,
        website: formData.website.trim() || null,
        location: formData.location.trim() || null,
        date_of_birth: formData.date_of_birth || null
      }

      await updateProfile(profileData)
      
      // If successful, navigate back to profile
      setTimeout(() => {
        navigate('/profile')
      }, 1500)
      
    } catch (error) {
      console.error('Profile update error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/profile')
      }
    } else {
      navigate('/profile')
    }
  }

  // Get username validation status
  const getUsernameStatus = () => {
    if (!formData.username || formData.username === currentProfile?.username) {
      return null
    }
    
    if (formData.username.length < 3) {
      return { type: 'invalid', message: 'Username must be at least 3 characters' }
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      return { type: 'invalid', message: 'Username can only contain letters, numbers, and underscores' }
    }
    
    if (usernameCheck.checking) {
      return { type: 'checking', message: 'Checking availability...' }
    }
    
    if (usernameCheck.username === formData.username) {
      return {
        type: usernameCheck.available ? 'available' : 'taken',
        message: usernameCheck.available ? 'Username is available' : 'Username is taken'
      }
    }
    
    return null
  }

  const usernameStatus = getUsernameStatus()

  if (loading.profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/profile" className="text-xl font-semibold text-blue-600 hover:text-blue-800">
                ← Back to Profile
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !hasChanges}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-600 mt-2">Update your profile information and settings</p>
          </div>

          {/* Profile Form */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-8">
              {/* Messages */}
              {error.update && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error.update}
                </div>
              )}

              {message.update && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  {message.update}
                </div>
              )}

              {error.upload && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error.upload}
                </div>
              )}

              {message.upload && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  {message.upload}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Profile Picture Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden">
                        {profilePicturePreview ? (
                          <img 
                            src={profilePicturePreview} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Change Photo
                      </button>
                      
                      {profilePicture && (
                        <button
                          type="button"
                          onClick={handleRemoveProfilePicture}
                          className="block px-4 py-2 text-sm text-red-600 hover:text-red-800"
                        >
                          Remove Photo
                        </button>
                      )}
                      
                      <p className="text-sm text-gray-500">
                        JPG, PNG or GIF. Max file size 5MB.
                      </p>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Username */}
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                        Username *
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="City, Country"
                      />
                    </div>

                    {/* Date of Birth */}
                    <div className="md:col-span-2">
                      <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        id="date_of_birth"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">About</h3>
                  <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={5}
                      maxLength={500}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell us about yourself..."
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {formData.bio.length}/500 characters
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !hasChanges || (usernameStatus?.type === 'taken') || (usernameStatus?.type === 'invalid')}
                    className="px-6 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Account Information (Read-only) */}
          <div className="bg-white shadow rounded-lg mt-6">
            <div className="px-6 py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                  <p className="text-gray-900 text-sm font-mono bg-gray-50 p-2 rounded">{user?.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Created</label>
                  <p className="text-gray-900">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Updated</label>
                  <p className="text-gray-900">
                    {currentProfile?.updated_at ? new Date(currentProfile.updated_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default EditProfile