import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { Link } from 'react-router-dom'

const Profile = () => {
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
  const [isEditing, setIsEditing] = useState(false)
  const [usernameTimeout, setUsernameTimeout] = useState(null)
  
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
      setFormData({
        username: currentProfile.username || '',
        display_name: currentProfile.display_name || '',
        bio: currentProfile.bio || '',
        website: currentProfile.website || '',
        location: currentProfile.location || '',
        date_of_birth: currentProfile.date_of_birth || ''
      })
      setProfilePicturePreview(currentProfile.avatar_url)
    }
  }, [currentProfile])

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Check username availability with debounce
    if (name === 'username' && value !== currentProfile?.username) {
      if (usernameTimeout) {
        clearTimeout(usernameTimeout)
      }
      
      const timeout = setTimeout(() => {
        if (value.length >= 3) {
          checkUsernameAvailability({ username: value, currentUserId: user?.id })
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user?.id) return

    try {
      // Upload profile picture first if selected
      if (profilePicture) {
        await uploadProfilePicture(profilePicture, user.id)
      }

      // Update profile data
      const profileData = {
        user_id: user.id,
        ...formData
      }

      await updateProfile(profileData)
      setIsEditing(false)
      setProfilePicture(null)
      
    } catch (error) {
      console.error('Profile update error:', error)
    }
  }

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset form
      if (currentProfile) {
        setFormData({
          username: currentProfile.username || '',
          display_name: currentProfile.display_name || '',
          bio: currentProfile.bio || '',
          website: currentProfile.website || '',
          location: currentProfile.location || '',
          date_of_birth: currentProfile.date_of_birth || ''
        })
        setProfilePicturePreview(currentProfile.avatar_url)
        setProfilePicture(null)
      }
      clearProfileError()
      clearProfileMessage()
      clearUsernameCheck()
    }
    setIsEditing(!isEditing)
  }

  // Get username validation status
  const getUsernameStatus = () => {
    if (!formData.username || formData.username === currentProfile?.username) {
      return null
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
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="text-xl font-semibold text-blue-600 hover:text-blue-800">
                ← Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/profile/edit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Profile Header */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-8">
              <div className="flex items-center space-x-6">
                {/* Profile Picture */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden">
                    {profilePicturePreview ? (
                      <img 
                        src={profilePicturePreview} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {currentProfile?.display_name || currentProfile?.username || 'User'}
                  </h1>
                  <p className="text-gray-600">@{currentProfile?.username || 'username'}</p>
                  <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
                  
                  {/* Stats */}
                  {/* <div className="flex space-x-6 mt-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">
                        {currentProfile?.posts_count || 0}
                      </div>
                      <div className="text-sm text-gray-500">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">
                        {currentProfile?.followers_count || 0}
                      </div>
                      <div className="text-sm text-gray-500">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">
                        {currentProfile?.following_count || 0}
                      </div>
                      <div className="text-sm text-gray-500">Following</div>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {isEditing ? 'Edit Profile' : 'Profile Information'}
              </h2>

              {/* Messages */}
              {error.update && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error.update}
                </div>
              )}

              {message.update && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  {message.update}
                </div>
              )}

              {error.upload && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error.upload}
                </div>
              )}

              {message.upload && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  {message.upload}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Username */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      Username *
                    </label>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter username"
                        />
                        {usernameStatus && (
                          <p className={`mt-1 text-sm ${
                            usernameStatus.type === 'available' ? 'text-green-600' :
                            usernameStatus.type === 'taken' ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {usernameStatus.message}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-900">@{currentProfile?.username || 'Not set'}</p>
                    )}
                  </div>

                  {/* Display Name */}
                  <div>
                    <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        id="display_name"
                        name="display_name"
                        value={formData.display_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter display name"
                      />
                    ) : (
                      <p className="text-gray-900">{currentProfile?.display_name || 'Not set'}</p>
                    )}
                  </div>

                  {/* Website */}
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {currentProfile?.website ? (
                          <a 
                            href={currentProfile.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {currentProfile.website}
                          </a>
                        ) : (
                          'Not set'
                        )}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="City, Country"
                      />
                    ) : (
                      <p className="text-gray-900">{currentProfile?.location || 'Not set'}</p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="md:col-span-2">
                    <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        id="date_of_birth"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {currentProfile?.date_of_birth ? 
                          new Date(currentProfile.date_of_birth).toLocaleDateString() : 
                          'Not set'
                        }
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {currentProfile?.bio || 'No bio added yet.'}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                {isEditing && (
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleEditToggle}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading.update || loading.upload}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading.update || loading.upload ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white shadow rounded-lg mt-6">
            <div className="px-6 py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                  <p className="text-gray-900 text-sm font-mono">{user?.id}</p>
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

export default Profile