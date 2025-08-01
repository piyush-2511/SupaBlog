import { createClient } from '@supabase/supabase-js'
import conf from '../config/config.js'

class ProfileService {
  constructor() {
    this.supabase = createClient(conf.supabaseUrl, conf.supabaseKey)
  }

  // Create or update user profile
  async upsertProfile(profileData) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .upsert([profileData], { 
          onConflict: 'user_id',
          returning: 'representation'
        })
        .select('*')
        .single()

      if (error) throw error

      return {
        success: true,
        data,
        message: 'Profile updated successfully'
      }
    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error upserting profile:', error)
      }

      return {
        success: false,
        error: error.message,
        code: error.code
      }
    }
  }

  // Get user profile by user ID
  async getProfile(userId) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error

      return {
        success: true,
        data,
        message: 'Profile fetched successfully'
      }
    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error fetching profile:', error)
      }

      return {
        success: false,
        error: error.message,
        code: error.code
      }
    }
  }

  // Get profile by username (for public profiles)
  async getProfileByUsername(username) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error) throw error

      return {
        success: true,
        data,
        message: 'Profile fetched successfully'
      }
    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error fetching profile by username:', error)
      }

      return {
        success: false,
        error: error.message,
        code: error.code
      }
    }
  }

  // Upload profile picture
  async uploadProfilePicture(file, userId) {
    try {
      // Get current user session to ensure authentication
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Ensure the user can only upload their own profile picture
      if (user.id !== userId) {
        throw new Error('Unauthorized: Can only upload your own profile picture')
      }

      // Get current profile to check for existing avatar
      const { data: currentProfile } = await this.supabase
        .from('profiles')
        .select('avatar_path')
        .eq('user_id', userId)
        .single()

      // Delete old avatar if exists
      if (currentProfile?.avatar_path) {
        await this.supabase.storage
          .from('profiles')
          .remove([currentProfile.avatar_path])
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `avatar.${fileExt}`
      const filePath = `${userId}/${fileName}`

      // Upload new avatar
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('profiles')
        .getPublicUrl(filePath)

      // Update profile table with new avatar info
      const { error: updateError } = await this.supabase
        .from('profiles')
        .update({
          avatar_url: urlData.publicUrl,
          avatar_path: filePath
        })
        .eq('user_id', userId)

      if (updateError) throw updateError

      return {
        success: true,
        data: {
          path: filePath,
          url: urlData.publicUrl
        },
        message: 'Profile picture uploaded successfully'
      }
    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error uploading profile picture:', error)
      }

      return {
        success: false,
        error: error.message,
        code: error.code
      }
    }
  }

  // Delete profile picture
  async deleteProfilePicture(userId) {
    try {
      // Get current user session to ensure authentication
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Ensure the user can only delete their own profile picture
      if (user.id !== userId) {
        throw new Error('Unauthorized: Can only delete your own profile picture')
      }

      // Get current profile to get avatar path
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('avatar_path')
        .eq('user_id', userId)
        .single()

      if (profileError) throw profileError

      if (profile?.avatar_path) {
        // Delete from storage
        const { error: deleteError } = await this.supabase.storage
          .from('profiles')
          .remove([profile.avatar_path])

        if (deleteError) throw deleteError

        // Update profile table to remove avatar info
        const { error: updateError } = await this.supabase
          .from('profiles')
          .update({
            avatar_url: null,
            avatar_path: null
          })
          .eq('user_id', userId)

        if (updateError) throw updateError
      }

      return {
        success: true,
        message: 'Profile picture deleted successfully'
      }
    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error deleting profile picture:', error)
      }

      return {
        success: false,
        error: error.message,
        code: error.code
      }
    }
  }

  // Check if username is available
  async checkUsernameAvailability(username, currentUserId = null) {
    try {
      let query = this.supabase
        .from('profiles')
        .select('user_id')
        .eq('username', username)

      // Exclude current user when checking availability
      if (currentUserId) {
        query = query.neq('user_id', currentUserId)
      }

      const { data, error } = await query

      if (error) throw error

      return {
        success: true,
        available: data.length === 0,
        message: data.length === 0 ? 'Username is available' : 'Username is taken'
      }
    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error checking username availability:', error)
      }

      return {
        success: false,
        error: error.message,
        code: error.code
      }
    }
  }

  // Get multiple profiles (for followers/following lists)
  async getProfiles(userIds) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, bio, is_verified')
        .in('user_id', userIds)

      if (error) throw error

      return {
        success: true,
        data,
        message: 'Profiles fetched successfully'
      }
    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error fetching profiles:', error)
      }

      return {
        success: false,
        error: error.message,
        code: error.code
      }
    }
  }

  // Update profile stats (followers, following, posts count)
  async updateProfileStats(userId, stats) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update(stats)
        .eq('user_id', userId)
        .select('*')
        .single()

      if (error) throw error

      return {
        success: true,
        data,
        message: 'Profile stats updated successfully'
      }
    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error updating profile stats:', error)
      }

      return {
        success: false,
        error: error.message,
        code: error.code
      }
    }
  }

  // Search profiles by username or display name
  async searchProfiles(query, limit = 10) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, bio, is_verified')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(limit)

      if (error) throw error

      return {
        success: true,
        data,
        message: 'Profiles search completed'
      }
    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error searching profiles:', error)
      }

      return {
        success: false,
        error: error.message,
        code: error.code
      }
    }
  }

  // Get profile with public info only (for non-authenticated requests)
  async getPublicProfile(userId) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select(`
          user_id,
          username,
          display_name,
          bio,
          avatar_url,
          website,
          location,
          followers_count,
          following_count,
          posts_count,
          is_private,
          is_verified,
          created_at
        `)
        .eq('user_id', userId)
        .single()

      if (error) throw error

      return {
        success: true,
        data,
        message: 'Public profile fetched successfully'
      }
    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error fetching public profile:', error)
      }

      return {
        success: false,
        error: error.message,
        code: error.code
      }
    }
  }

  // Update profile visibility
  async updateProfileVisibility(userId, isPrivate) {
    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      
      if (userError || !user || user.id !== userId) {
        throw new Error('Unauthorized')
      }

      const { data, error } = await this.supabase
        .from('profiles')
        .update({ is_private: isPrivate })
        .eq('user_id', userId)
        .select('*')
        .single()

      if (error) throw error

      return {
        success: true,
        data,
        message: `Profile ${isPrivate ? 'set to private' : 'set to public'} successfully`
      }
    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error updating profile visibility:', error)
      }

      return {
        success: false,
        error: error.message,
        code: error.code
      }
    }
  }

  // Delete profile and all associated data
  async deleteProfile(userId) {
    try {
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      
      if (userError || !user || user.id !== userId) {
        throw new Error('Unauthorized')
      }

      // Get profile to check for avatar
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('avatar_path')
        .eq('user_id', userId)
        .single()

      // Delete avatar if exists
      if (profile?.avatar_path) {
        await this.supabase.storage
          .from('profiles')
          .remove([profile.avatar_path])
      }

      // Delete profile record
      const { error } = await this.supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId)

      if (error) throw error

      return {
        success: true,
        message: 'Profile deleted successfully'
      }
    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error deleting profile:', error)
      }

      return {
        success: false,
        error: error.message,
        code: error.code
      }
    }
  }
}

// Create singleton instance
const profileService = new ProfileService()

export default profileService