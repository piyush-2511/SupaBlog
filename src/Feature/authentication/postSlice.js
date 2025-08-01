import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import postService from '../../supabase/postService'

// Async thunks for post operations

// Create a new post
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const result = await postService.createPost({
        post_title: postData.post_title,
        post_content: postData.post_content,
        featured_image: postData.featured_image,
        user_id: postData.user_id
      })
      if (!result.success) {
        return rejectWithValue(result.error)
      }
      return result.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Get all posts with pagination
export const getAllPosts = createAsyncThunk(
  'posts/getAllPosts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await postService.getAllPosts(params)
      if (!response.success) {
        return rejectWithValue(response.error)
      }
      return {
        posts: response.data,
        pagination: response.pagination
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Get posts by user
export const getPostsByUser = createAsyncThunk(
  'posts/getPostsByUser',
  async ({ userId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await postService.getPostsByUser(userId, params)
      if (!response.success) {
        return rejectWithValue(response.error)
      }
      return {
        posts: response.data,
        pagination: response.pagination,
        userId
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Get single post by ID
export const getPostById = createAsyncThunk(
  'posts/getPostById',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postService.getPostById(postId)
      if (!response.success) {
        return rejectWithValue(response.error)
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Update post
export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ postId, updates }, { rejectWithValue }) => {
    try {
      const response = await postService.updatePost(postId, updates)
      if (!response.success) {
        return rejectWithValue(response.error)
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Delete post
export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postService.deletePost(postId)
      if (!response.success) {
        return rejectWithValue(response.error)
      }
      return postId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Search posts
export const searchPosts = createAsyncThunk(
  'posts/searchPosts',
  async ({ query, params = {} }, { rejectWithValue }) => {
    try {
      const response = await postService.searchPosts(query, params)
      if (!response.success) {
        return rejectWithValue(response.error)
      }
      return {
        posts: response.data,
        pagination: response.pagination,
        query
      }
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Upload featured image
export const uploadFeaturedImage = createAsyncThunk(
  'posts/uploadFeaturedImage',
  async ({ file, postId }, { rejectWithValue }) => {
    try {
      const response = await postService.uploadFeaturedImage(file, postId)
      if (!response.success) {
        return rejectWithValue(response.error)
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Delete featured image
export const deleteFeaturedImage = createAsyncThunk(
  'posts/deleteFeaturedImage',
  async (imagePath, { rejectWithValue }) => {
    try {
      const response = await postService.deleteFeaturedImage(imagePath)
      if (!response.success) {
        return rejectWithValue(response.error)
      }
      return imagePath
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Get post statistics
export const getPostStats = createAsyncThunk(
  'posts/getPostStats',
  async (userId = null, { rejectWithValue }) => {
    try {
      const response = await postService.getPostStats(userId)
      if (!response.success) {
        return rejectWithValue(response.error)
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// Initial state
const initialState = {
  // Posts data
  posts: [],
  currentPost: null,
  userPosts: [],
  searchResults: [],
  
  // Pagination
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  
  // User posts pagination
  userPostsPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  
  // Search pagination
  searchPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  
  // Statistics
  stats: {
    totalPosts: 0,
    userId: null
  },
  
  // Loading states
  loading: {
    posts: false,
    currentPost: false,
    userPosts: false,
    search: false,
    create: false,
    update: false,
    delete: false,
    upload: false,
    stats: false
  },
  
  // Error states
  error: {
    posts: null,
    currentPost: null,
    userPosts: null,
    search: null,
    create: null,
    update: null,
    delete: null,
    upload: null,
    stats: null
  },
  
  // UI states
  searchQuery: '',
  selectedUserId: null,
  
  // Upload states
  uploadProgress: 0,
  uploadedImageUrl: null
}

// Create slice
const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // Clear errors
    clearError: (state, action) => {
      const errorType = action.payload
      if (errorType && state.error[errorType]) {
        state.error[errorType] = null
      } else {
        // Clear all errors
        Object.keys(state.error).forEach(key => {
          state.error[key] = null
        })
      }
    },
    
    // Clear current post
    clearCurrentPost: (state) => {
      state.currentPost = null
      state.error.currentPost = null
    },
    
    // Clear search results
    clearSearchResults: (state) => {
      state.searchResults = []
      state.searchQuery = ''
      state.searchPagination = initialState.searchPagination
      state.error.search = null
    },
    
    // Clear user posts
    clearUserPosts: (state) => {
      state.userPosts = []
      state.selectedUserId = null
      state.userPostsPagination = initialState.userPostsPagination
      state.error.userPosts = null
    },
    
    // Set search query
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
    },
    
    // Set selected user ID
    setSelectedUserId: (state, action) => {
      state.selectedUserId = action.payload
    },
    
    // Reset upload state
    resetUploadState: (state) => {
      state.uploadProgress = 0
      state.uploadedImageUrl = null
      state.error.upload = null
    },
    
    // Update upload progress
    updateUploadProgress: (state, action) => {
      state.uploadProgress = action.payload
    },
    
    // Reset all state
    resetPostState: () => initialState
  },
  
  extraReducers: (builder) => {
    // Create post
    builder
      .addCase(createPost.pending, (state) => {
        state.loading.create = true
        state.error.create = null
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading.create = false
        state.posts.unshift(action.payload)
        state.pagination.total += 1
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading.create = false
        state.error.create = action.payload
      })
    
    // Get all posts
    builder
      .addCase(getAllPosts.pending, (state) => {
        state.loading.posts = true
        state.error.posts = null
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.loading.posts = false
        state.posts = action.payload.posts
        state.pagination = action.payload.pagination
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.loading.posts = false
        state.error.posts = action.payload
      })
    
    // Get posts by user
    builder
      .addCase(getPostsByUser.pending, (state) => {
        state.loading.userPosts = true
        state.error.userPosts = null
      })
      .addCase(getPostsByUser.fulfilled, (state, action) => {
        state.loading.userPosts = false
        state.userPosts = action.payload.posts
        state.userPostsPagination = action.payload.pagination
        state.selectedUserId = action.payload.userId
      })
      .addCase(getPostsByUser.rejected, (state, action) => {
        state.loading.userPosts = false
        state.error.userPosts = action.payload
      })
    
    // Get post by ID
    builder
      .addCase(getPostById.pending, (state) => {
        state.loading.currentPost = true
        state.error.currentPost = null
      })
      .addCase(getPostById.fulfilled, (state, action) => {
        state.loading.currentPost = false
        state.currentPost = action.payload
      })
      .addCase(getPostById.rejected, (state, action) => {
        state.loading.currentPost = false
        state.error.currentPost = action.payload
      })
    
    // Update post
    builder
      .addCase(updatePost.pending, (state) => {
        state.loading.update = true
        state.error.update = null
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.loading.update = false
        const updatedPost = action.payload
        
        // Update in posts array
        const postIndex = state.posts.findIndex(post => post.id === updatedPost.id)
        if (postIndex !== -1) {
          state.posts[postIndex] = updatedPost
        }
        
        // Update in user posts array
        const userPostIndex = state.userPosts.findIndex(post => post.id === updatedPost.id)
        if (userPostIndex !== -1) {
          state.userPosts[userPostIndex] = updatedPost
        }
        
        // Update current post if it's the same
        if (state.currentPost && state.currentPost.id === updatedPost.id) {
          state.currentPost = updatedPost
        }
        
        // Update in search results
        const searchIndex = state.searchResults.findIndex(post => post.id === updatedPost.id)
        if (searchIndex !== -1) {
          state.searchResults[searchIndex] = updatedPost
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.loading.update = false
        state.error.update = action.payload
      })
    
    // Delete post
    builder
      .addCase(deletePost.pending, (state) => {
        state.loading.delete = true
        state.error.delete = null
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading.delete = false
        const deletedPostId = action.payload
        
        // Remove from posts array
        state.posts = state.posts.filter(post => post.id !== deletedPostId)
        
        // Remove from user posts array
        state.userPosts = state.userPosts.filter(post => post.id !== deletedPostId)
        
        // Remove from search results
        state.searchResults = state.searchResults.filter(post => post.id !== deletedPostId)
        
        // Clear current post if it's the deleted one
        if (state.currentPost && state.currentPost.id === deletedPostId) {
          state.currentPost = null
        }
        
        // Update pagination totals
        state.pagination.total = Math.max(0, state.pagination.total - 1)
        state.userPostsPagination.total = Math.max(0, state.userPostsPagination.total - 1)
        state.searchPagination.total = Math.max(0, state.searchPagination.total - 1)
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.loading.delete = false
        state.error.delete = action.payload
      })
    
    // Search posts
    builder
      .addCase(searchPosts.pending, (state) => {
        state.loading.search = true
        state.error.search = null
      })
      .addCase(searchPosts.fulfilled, (state, action) => {
        state.loading.search = false
        state.searchResults = action.payload.posts
        state.searchPagination = action.payload.pagination
        state.searchQuery = action.payload.query
      })
      .addCase(searchPosts.rejected, (state, action) => {
        state.loading.search = false
        state.error.search = action.payload
      })
    
    // Upload featured image
    builder
      .addCase(uploadFeaturedImage.pending, (state) => {
        state.loading.upload = true
        state.error.upload = null
        state.uploadProgress = 0
      })
      .addCase(uploadFeaturedImage.fulfilled, (state, action) => {
        state.loading.upload = false
        state.uploadedImageUrl = action.payload.url
        state.uploadProgress = 100
      })
      .addCase(uploadFeaturedImage.rejected, (state, action) => {
        state.loading.upload = false
        state.error.upload = action.payload
        state.uploadProgress = 0
      })
    
    // Delete featured image
    builder
      .addCase(deleteFeaturedImage.pending, (state) => {
        state.loading.upload = true
        state.error.upload = null
      })
      .addCase(deleteFeaturedImage.fulfilled, (state) => {
        state.loading.upload = false
        state.uploadedImageUrl = null
      })
      .addCase(deleteFeaturedImage.rejected, (state, action) => {
        state.loading.upload = false
        state.error.upload = action.payload
      })
    
    // Get post statistics
    builder
      .addCase(getPostStats.pending, (state) => {
        state.loading.stats = true
        state.error.stats = null
      })
      .addCase(getPostStats.fulfilled, (state, action) => {
        state.loading.stats = false
        state.stats = action.payload
      })
      .addCase(getPostStats.rejected, (state, action) => {
        state.loading.stats = false
        state.error.stats = action.payload
      })
  }
})

// Export actions
export const {
  clearError,
  clearCurrentPost,
  clearSearchResults,
  clearUserPosts,
  setSearchQuery,
  setSelectedUserId,
  resetUploadState,
  updateUploadProgress,
  resetPostState
} = postSlice.actions

// Selectors
export const selectAllPosts = (state) => state.posts.posts
export const selectCurrentPost = (state) => state.posts.currentPost
export const selectUserPosts = (state) => state.posts.userPosts
export const selectSearchResults = (state) => state.posts.searchResults
export const selectPostsPagination = (state) => state.posts.pagination
export const selectUserPostsPagination = (state) => state.posts.userPostsPagination
export const selectSearchPagination = (state) => state.posts.searchPagination
export const selectPostsLoading = (state) => state.posts.loading
export const selectPostsError = (state) => state.posts.error
export const selectPostStats = (state) => state.posts.stats
export const selectSearchQuery = (state) => state.posts.searchQuery
export const selectSelectedUserId = (state) => state.posts.selectedUserId
export const selectUploadProgress = (state) => state.posts.uploadProgress
export const selectUploadedImageUrl = (state) => state.posts.uploadedImageUrl

// Complex selectors
export const selectPostById = (state, postId) => 
  state.posts.posts.find(post => post.id === postId) ||
  state.posts.userPosts.find(post => post.id === postId) ||
  state.posts.searchResults.find(post => post.id === postId)

export const selectIsPostLoading = (state) => 
  Object.values(state.posts.loading).some(loading => loading)

export const selectHasPostError = (state) => 
  Object.values(state.posts.error).some(error => error !== null)

export default postSlice.reducer