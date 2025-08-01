import { createClient } from '@supabase/supabase-js'
import conf from '../config/config.js'

class PostService {
  constructor() {
    this.supabase = createClient(conf.supabaseUrl, conf.supabaseKey)
  }

  // Create a new blog post
  async createPost({ post_title, post_content, featured_image, user_id, status, id, publish_date }) {
    try {
      // Validate required fields
      if (!post_title || !post_content || !user_id) {
        throw new Error('Post title, content, and user ID are required')
      }
      
      // Prepare the insert object
      const insertData = {
        post_title,
        post_content,
        user_id,
        status: status || 'draft', // Default to draft if not specified
        // id: id || post_title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') // Fixed: use 'id' parameter instead of undefined 'slug'
      }
      
      // Only add featured_image if it exists and is not null/undefined
      if (featured_image) {
        insertData.featured_image = featured_image
      }

      // Only add publish_date if status is published
      if (status === 'published' && publish_date) {
        insertData.publish_date = publish_date
      }
      
      const { data, error } = await this.supabase
        .from('posts')
        .insert([insertData])
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        data,
        message: 'Post created successfully'
      }

    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error creating post:', error)
      }

      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get all posts with optional status filtering (with pagination)
  async getAllPosts({ page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc', status = null } = {}) {
    try {
      const from = (page - 1) * limit
      const to = from + limit - 1

      let query = this.supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(from, to)

      // Apply status filter if provided
      if (status && status !== 'all') {
        query = query.eq('status', status)
      }

      const { data, error, count } = await query

      if (error) throw error
      return {
        success: true,
        data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        },
        message: 'Posts retrieved successfully'
      }

    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error fetching posts:', error)
      }

      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get posts by user ID with optional status filtering
  async getPostsByUser(userId, { page = 1, limit = 10, status = null } = {}) {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }

      const from = (page - 1) * limit
      const to = from + limit - 1

      let query = this.supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(from, to)

      // Apply status filter if provided
      if (status && status !== 'all') {
        query = query.eq('status', status)
      }

      const { data, error, count } = await query

      if (error) throw error

      return {
        success: true,
        data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        },
        message: 'User posts retrieved successfully'
      }

    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error fetching user posts:', error)
      }

      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get single post by ID
  async getPostById(postId) {
    try {
      if (!postId) {
        throw new Error('Post ID is required')
      }

      const { data, error } = await this.supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            user_id,
            username,
            avatar_url
          )
        `)
        .eq('id', postId)
        .single()

      if (error) throw error

      if (!data) {
        throw new Error('Post not found')
      }

      return {
        success: true,
        data,
        message: 'Post retrieved successfully'
      }

    } catch (error) {
      console.error('Error fetching post:', error)

      return {
        success: false,
        error: error.message
      }
    }
  }

  // Update post
  async updatePost(postId, updates) {
    try {
      if (!postId) {
        throw new Error('Post ID is required')
      }

      // Filter out undefined values
      const filteredUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value
        }
        return acc
      }, {})

      // Add updated_at timestamp
      filteredUpdates.updated_at = new Date().toISOString()

      // If changing status to published and no publish_date is set, set it now
      if (filteredUpdates.status === 'published' && !filteredUpdates.publish_date) {
        filteredUpdates.publish_date = new Date().toISOString()
      }

      // If changing status to draft, clear publish_date
      if (filteredUpdates.status === 'draft') {
        filteredUpdates.publish_date = null
      }

      const { data, error } = await this.supabase
        .from('posts')
        .update(filteredUpdates)
        .eq('id', postId)
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        data,
        message: 'Post updated successfully'
      }

    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error updating post:', error)
      }

      return {
        success: false,
        error: error.message
      }
    }
  }

  // Delete post
  async deletePost(postId) {
    try {
      if (!postId) {
        throw new Error('Post ID is required')
      }

      const { error } = await this.supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) throw error

      return {
        success: true,
        message: 'Post deleted successfully'
      }

    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error deleting post:', error)
      }

      return {
        success: false,
        error: error.message
      }
    }
  }

  // Search posts with optional status filtering
  async searchPosts(query, { page = 1, limit = 10, status = null } = {}) {
    try {
      if (!query) {
        throw new Error('Search query is required')
      }

      const from = (page - 1) * limit
      const to = from + limit - 1

      let searchQuery = this.supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `, { count: 'exact' })
        .or(`post_title.ilike.%${query}%,post_content.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .range(from, to)

      // Apply status filter if provided
      if (status && status !== 'all') {
        searchQuery = searchQuery.eq('status', status)
      }

      const { data, error, count } = await searchQuery

      if (error) throw error

      return {
        success: true,
        data,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        },
        message: 'Search completed successfully'
      }

    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error searching posts:', error)
      }

      return {
        success: false,
        error: error.message
      }
    }
  }

  // Upload featured image with better error handling and validation
  async uploadFeaturedImage(file, postId) {
    try {
      // Enhanced validation
      if (!file) {
        throw new Error('File is required')
      }

      // Check file size (example: 5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 5MB limit')
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed')
      }

      // Get file extension properly
      const fileExt = file.name.split('.').pop().toLowerCase()
      const fileName = `${postId || Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `featured-images/${fileName}`

      console.log('Uploading file:', { fileName, filePath, fileType: file.type, fileSize: file.size })

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('blog-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error details:', uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      console.log('Upload successful:', uploadData)

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath)

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded image')
      }

      return {
        success: true,
        data: {
          url: urlData.publicUrl,
          path: filePath,
          fileName: fileName
        },
        message: 'Image uploaded successfully'
      }

    } catch (error) {
      console.error('Error uploading image:', error)
      
      return {
        success: false,
        error: error.message || 'Unknown error occurred during upload'
      }
    }
  }

  // Delete featured image
  async deleteFeaturedImage(imagePath) {
    try {
      if (!imagePath) {
        throw new Error('Image path is required')
      }

      const { error } = await this.supabase.storage
        .from('blog-images')
        .remove([imagePath])

      if (error) throw error

      return {
        success: true,
        message: 'Image deleted successfully'
      }

    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error deleting image:', error)
      }

      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get post statistics with status breakdown
  async getPostStats(userId = null) {
    try {
      let query = this.supabase
        .from('posts')
        .select('id, status, created_at', { count: 'exact' })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error, count } = await query

      if (error) throw error

      // Count posts by status
      const stats = {
        totalPosts: count || 0,
        publishedPosts: 0,
        draftPosts: 0,
        userId
      }

      if (data) {
        stats.publishedPosts = data.filter(post => post.status === 'published').length
        stats.draftPosts = data.filter(post => post.status === 'draft').length
      }

      return {
        success: true,
        data: stats,
        message: 'Stats retrieved successfully'
      }

    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error fetching post stats:', error)
      }

      return {
        success: false,
        error: error.message
      }
    }
  }

  // Check if user can edit post
  async canUserEditPost(postId, userId) {
    try {
      if (!postId || !userId) {
        throw new Error('Post ID and User ID are required')
      }

      const { data, error } = await this.supabase
        .from('posts')
        .select('user_id')
        .eq('id', postId)
        .single()

      if (error) throw error

      return data.user_id === userId

    } catch (error) {
      if (conf.isDevelopment) {
        console.error('Error checking post permissions:', error)
      }
      return false
    }
  }
}

// Create singleton instance
const postService = new PostService()

export default postService