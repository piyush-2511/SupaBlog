import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchProfile,
  fetchProfileByUsername,
  updateProfile,
  uploadProfilePicture,
  checkUsernameAvailability,
  searchProfiles,
  deleteProfile,
  clearProfileError,
  clearProfileMessage,
  clearSearchResults,
  clearUsernameCheck,
  clearViewedProfile,
  updateCurrentProfileLocal,
  resetProfileState,
  selectCurrentProfile,
  selectViewedProfile,
  selectSearchResults,
  selectUsernameCheck,
  selectProfileLoading,
  selectProfileError,
  selectProfileMessage
} from '../Feature/authentication/profileSlice'

export const useProfile = () => {
  const dispatch = useDispatch()
  
  // Selectors
  const currentProfile = useSelector(selectCurrentProfile)
  const viewedProfile = useSelector(selectViewedProfile)
  const searchResults = useSelector(selectSearchResults)
  const usernameCheck = useSelector(selectUsernameCheck)
  const loading = useSelector(selectProfileLoading)
  const error = useSelector(selectProfileError)
  const message = useSelector(selectProfileMessage)

  // Action creators
  const profileActions = {
    // Fetch operations
    fetchProfile: (userId) => dispatch(fetchProfile(userId)),
    fetchProfileByUsername: (username) => dispatch(fetchProfileByUsername(username)),
    
    // Update operations
    updateProfile: (profileData) => dispatch(updateProfile(profileData)),
    uploadProfilePicture: (file, userId) => dispatch(uploadProfilePicture({ file, userId })),
    updateCurrentProfileLocal: (updates) => dispatch(updateCurrentProfileLocal(updates)),
    
    // Username operations
    checkUsernameAvailability: (data) => dispatch(checkUsernameAvailability(data)),
    
    // Search operations
    searchProfiles: (query, limit = 10) => dispatch(searchProfiles({ query, limit })),
    
    // Delete operations
    deleteProfile: (userId) => dispatch(deleteProfile(userId)),
    
    // Clear operations
    clearProfileError: (errorType) => dispatch(clearProfileError(errorType)),
    clearProfileMessage: (messageType) => dispatch(clearProfileMessage(messageType)),
    clearSearchResults: () => dispatch(clearSearchResults()),
    clearUsernameCheck: () => dispatch(clearUsernameCheck()),
    clearViewedProfile: () => dispatch(clearViewedProfile()),
    
    // Reset operations
    resetProfileState: () => dispatch(resetProfileState())
  }

  // Helper functions
  const isCurrentUserProfile = (userId) => {
    return currentProfile?.user_id === userId
  }

  const isProfileComplete = () => {
    return currentProfile?.username && currentProfile?.display_name
  }

  const getProfileCompletionPercentage = () => {
    if (!currentProfile) return 0
    
    const fields = [
      'username',
      'display_name',
      'bio',
      'avatar_url',
      'website',
      'location'
    ]
    
    const completedFields = fields.filter(field => 
      currentProfile[field] && currentProfile[field].trim() !== ''
    )
    
    return Math.round((completedFields.length / fields.length) * 100)
  }

  const formatProfileForDisplay = (profile) => {
    if (!profile) return null
    
    return {
      ...profile,
      displayName: profile.display_name || profile.username || 'Unknown User',
      formattedBio: profile.bio || 'No bio available',
      formattedWebsite: profile.website ? 
        (profile.website.startsWith('http') ? profile.website : `https://${profile.website}`) 
        : null,
      joinDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : null,
      lastUpdated: profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : null
    }
  }

  return {
    // State
    currentProfile,
    viewedProfile,
    searchResults,
    usernameCheck,
    loading,
    error,
    message,
    
    // Actions
    ...profileActions,
    
    // Helper functions
    isCurrentUserProfile,
    isProfileComplete,
    getProfileCompletionPercentage,
    formatProfileForDisplay,
    
    // Formatted data
    formattedCurrentProfile: formatProfileForDisplay(currentProfile),
    formattedViewedProfile: formatProfileForDisplay(viewedProfile),
    profileCompletionPercentage: getProfileCompletionPercentage()
  }
}