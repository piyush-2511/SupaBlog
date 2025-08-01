import { useSelector, useDispatch } from 'react-redux'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  // Async actions
  createPost,
  getAllPosts,
  getPostsByUser,
  getPostById,
  updatePost,
  deletePost,
  searchPosts,
  uploadFeaturedImage,
  deleteFeaturedImage,
  getPostStats,
  
  // Sync actions
  clearError,
  clearCurrentPost,
  clearSearchResults,
  clearUserPosts,
  setSearchQuery,
  setSelectedUserId,
  resetUploadState,
  updateUploadProgress,
  resetPostState,
  
  // Selectors
  selectAllPosts,
  selectCurrentPost,
  selectUserPosts,
  selectSearchResults,
  selectPostsPagination,
  selectUserPostsPagination,
  selectSearchPagination,
  selectPostsLoading,
  selectPostsError,
  selectPostStats,
  selectSearchQuery,
  selectSelectedUserId,
  selectUploadProgress,
  selectUploadedImageUrl,
  selectPostById,
  selectIsPostLoading,
  selectHasPostError
} from '../Feature/authentication/postSlice'

/**
 * Custom hook for managing posts
 * Provides a clean interface for post operations and state management
 */
const usePost = () => {
  const dispatch = useDispatch()
  
  // Selectors
  const posts = useSelector(selectAllPosts)
  const currentPost = useSelector(selectCurrentPost)
  const userPosts = useSelector(selectUserPosts)
  const searchResults = useSelector(selectSearchResults)
  const pagination = useSelector(selectPostsPagination)
  const userPostsPagination = useSelector(selectUserPostsPagination)
  const searchPagination = useSelector(selectSearchPagination)
  const loading = useSelector(selectPostsLoading)
  const error = useSelector(selectPostsError)
  const stats = useSelector(selectPostStats)
  const searchQuery = useSelector(selectSearchQuery)
  const selectedUserId = useSelector(selectSelectedUserId)
  const uploadProgress = useSelector(selectUploadProgress)
  const uploadedImageUrl = useSelector(selectUploadedImageUrl)
  const isLoading = useSelector(selectIsPostLoading)
  const hasError = useSelector(selectHasPostError)

  // All useCallback hooks at the top level
  const handleCreatePost = useCallback(async (postData) => {
    try {
      const result = await dispatch(createPost(postData)).unwrap()
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch])

  const handleGetAllPosts = useCallback(async (params = {}) => {
    try {
      const result = await dispatch(getAllPosts(params)).unwrap()
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch])

  const handleGetPostsByUser = useCallback(async (userId, params = {}) => {
    try {
      const result = await dispatch(getPostsByUser({ userId, params })).unwrap()
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch])

  const handleGetPostById = useCallback(async (postId) => {
    try {
      const result = await dispatch(getPostById(postId)).unwrap()
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch])

  const handleUpdatePost = useCallback(async (postId, updates) => {
    try {
      const result = await dispatch(updatePost({ postId, updates })).unwrap()
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch])

  const handleDeletePost = useCallback(async (postId) => {
    try {
      await dispatch(deletePost(postId)).unwrap()
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch])

  const handleSearchPosts = useCallback(async (query, params = {}) => {
    try {
      const result = await dispatch(searchPosts({ query, params })).unwrap()
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch])

  const handleUploadImage = useCallback(async (file, postId) => {
    try {
      const result = await dispatch(uploadFeaturedImage({ file, postId })).unwrap()
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch])

  const handleDeleteImage = useCallback(async (imagePath) => {
    try {
      await dispatch(deleteFeaturedImage(imagePath)).unwrap()
      return { success: true }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch])

  const handleGetStats = useCallback(async (userId = null) => {
    try {
      const result = await dispatch(getPostStats(userId)).unwrap()
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error }
    }
  }, [dispatch])

  // Sync action callbacks
  const handleClearError = useCallback((errorType = null) => {
    dispatch(clearError(errorType))
  }, [dispatch])

  const handleClearCurrentPost = useCallback(() => {
    dispatch(clearCurrentPost())
  }, [dispatch])

  const handleClearSearchResults = useCallback(() => {
    dispatch(clearSearchResults())
  }, [dispatch])

  const handleClearUserPosts = useCallback(() => {
    dispatch(clearUserPosts())
  }, [dispatch])

  const handleSetSearchQuery = useCallback((query) => {
    dispatch(setSearchQuery(query))
  }, [dispatch])

  const handleSetSelectedUserId = useCallback((userId) => {
    dispatch(setSelectedUserId(userId))
  }, [dispatch])

  const handleResetUploadState = useCallback(() => {
    dispatch(resetUploadState())
  }, [dispatch])

  const handleUpdateUploadProgress = useCallback((progress) => {
    dispatch(updateUploadProgress(progress))
  }, [dispatch])

  const handleResetPostState = useCallback(() => {
    dispatch(resetPostState())
  }, [dispatch])

  // Utility callbacks
  const getPostByIdUtil = useCallback((postId) => {
    return posts.find(post => post.id === postId) ||
           userPosts.find(post => post.id === postId) ||
           searchResults.find(post => post.id === postId) ||
           null
  }, [posts, userPosts, searchResults])

  const isLoadingOperation = useCallback((operation) => {
    return loading[operation] || false
  }, [loading])

  const hasOperationError = useCallback((operation) => {
    return error[operation] !== null
  }, [error])

  const getOperationError = useCallback((operation) => {
    return error[operation]
  }, [error])

  // Async operations object
  const operations = useMemo(() => ({
    createPost: handleCreatePost,
    getAllPosts: handleGetAllPosts,
    getPostsByUser: handleGetPostsByUser,
    getPostById: handleGetPostById,
    updatePost: handleUpdatePost,
    deletePost: handleDeletePost,
    searchPosts: handleSearchPosts,
    uploadImage: handleUploadImage,
    deleteImage: handleDeleteImage,
    getStats: handleGetStats
  }), [
    handleCreatePost,
    handleGetAllPosts,
    handleGetPostsByUser,
    handleGetPostById,
    handleUpdatePost,
    handleDeletePost,
    handleSearchPosts,
    handleUploadImage,
    handleDeleteImage,
    handleGetStats
  ])

  // Sync operations object
  const actions = useMemo(() => ({
    clearError: handleClearError,
    clearCurrentPost: handleClearCurrentPost,
    clearSearchResults: handleClearSearchResults,
    clearUserPosts: handleClearUserPosts,
    setSearchQuery: handleSetSearchQuery,
    setSelectedUserId: handleSetSelectedUserId,
    resetUploadState: handleResetUploadState,
    updateUploadProgress: handleUpdateUploadProgress,
    resetPostState: handleResetPostState
  }), [
    handleClearError,
    handleClearCurrentPost,
    handleClearSearchResults,
    handleClearUserPosts,
    handleSetSearchQuery,
    handleSetSelectedUserId,
    handleResetUploadState,
    handleUpdateUploadProgress,
    handleResetPostState
  ])

  // Utility functions object
  const utils = useMemo(() => ({
    getPostById: getPostByIdUtil,
    isLoadingOperation,
    hasOperationError,
    getOperationError,
    hasPosts: posts.length > 0,
    hasUserPosts: userPosts.length > 0,
    hasSearchResults: searchResults.length > 0,
    canLoadMore: pagination.page < pagination.totalPages,
    canLoadMoreUserPosts: userPostsPagination.page < userPostsPagination.totalPages,
    canLoadMoreSearchResults: searchPagination.page < searchPagination.totalPages,
    nextPage: pagination.page + 1,
    nextUserPostsPage: userPostsPagination.page + 1,
    nextSearchPage: searchPagination.page + 1
  }), [
    getPostByIdUtil,
    isLoadingOperation,
    hasOperationError,
    getOperationError,
    posts.length,
    userPosts.length,
    searchResults.length,
    pagination.page,
    pagination.totalPages,
    userPostsPagination.page,
    userPostsPagination.totalPages,
    searchPagination.page,
    searchPagination.totalPages
  ])

  // Auto-clear errors effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (hasError) {
        dispatch(clearError())
      }
    }, 5000)

    return () => clearTimeout(timeout)
  }, [hasError, dispatch])

  return {
    // State
    posts,
    currentPost,
    userPosts,
    searchResults,
    pagination,
    userPostsPagination,
    searchPagination,
    loading,
    error,
    stats,
    searchQuery,
    selectedUserId,
    uploadProgress,
    uploadedImageUrl,
    isLoading,
    hasError,

    // Operations
    ...operations,

    // Actions
    ...actions,

    // Utilities
    ...utils
  }
}

export default usePost

// Additional specialized hooks for specific use cases

/**
 * Hook for post creation form
 */
export const usePostCreation = () => {
  const {
    createPost,
    uploadImage,
    deleteImage,
    loading,
    error,
    uploadProgress,
    uploadedImageUrl,
    resetUploadState,
    clearError
  } = usePost()

  const isCreating = loading.create
  const isUploading = loading.upload
  const createError = error.create
  const uploadError = error.upload

  const handleClearError = useCallback((type) => clearError(type), [clearError])

  return {
    createPost,
    uploadImage,
    deleteImage,
    isCreating,
    isUploading,
    createError,
    uploadError,
    uploadProgress,
    uploadedImageUrl,
    resetUploadState,
    clearError: handleClearError
  }
}

/**
 * Hook for post editing
 */
export const usePostEdit = (postId) => {
  const {
    currentPost,
    getPostById,
    updatePost,
    deletePost,
    uploadImage,
    deleteImage,
    loading,
    error,
    uploadProgress,
    uploadedImageUrl,
    resetUploadState,
    clearError
  } = usePost()

  // Auto-fetch post if not in state
  useEffect(() => {
    if (postId && (!currentPost || currentPost.id !== postId)) {
      getPostById(postId)
    }
  }, [postId, currentPost, getPostById])

  const isUpdating = loading.update
  const isDeleting = loading.delete
  const isUploading = loading.upload
  const updateError = error.update
  const deleteError = error.delete
  const uploadError = error.upload

  const handleUpdatePost = useCallback((updates) => updatePost(postId, updates), [updatePost, postId])
  const handleDeletePost = useCallback(() => deletePost(postId), [deletePost, postId])
  const handleClearError = useCallback((type) => clearError(type), [clearError])

  return {
    post: currentPost,
    updatePost: handleUpdatePost,
    deletePost: handleDeletePost,
    uploadImage,
    deleteImage,
    isUpdating,
    isDeleting,
    isUploading,
    updateError,
    deleteError,
    uploadError,
    uploadProgress,
    uploadedImageUrl,
    resetUploadState,
    clearError: handleClearError
  }
}

/**
 * Hook for post listing with pagination
 */
export const usePostList = (initialParams = {}) => {
  const {
    posts,
    pagination,
    getAllPosts,
    loading,
    error,
    canLoadMore,
    nextPage
  } = usePost()

  const [params, setParams] = useState(initialParams)

  useEffect(() => {
    getAllPosts(params)
  }, [getAllPosts, params])

  const loadMore = useCallback(() => {
    if (canLoadMore) {
      getAllPosts({ ...params, page: nextPage })
    }
  }, [getAllPosts, params, canLoadMore, nextPage])

  const refresh = useCallback(() => {
    getAllPosts({ ...params, page: 1 })
  }, [getAllPosts, params])

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }))
  }, [])

  return {
    posts,
    pagination,
    loading: loading.posts,
    error: error.posts,
    loadMore,
    refresh,
    updateParams,
    canLoadMore
  }
}

/**
 * Hook for post search
 */
export const usePostSearch = () => {
  const {
    searchResults,
    searchPagination,
    searchQuery,
    searchPosts,
    setSearchQuery,
    clearSearchResults,
    loading,
    error,
    canLoadMoreSearchResults,
    nextSearchPage
  } = usePost()

  const search = useCallback((query, params = {}) => {
    setSearchQuery(query)
    return searchPosts(query, params)
  }, [searchPosts, setSearchQuery])

  const loadMoreResults = useCallback(() => {
    if (canLoadMoreSearchResults && searchQuery) {
      searchPosts(searchQuery, { page: nextSearchPage })
    }
  }, [searchPosts, searchQuery, canLoadMoreSearchResults, nextSearchPage])

  return {
    searchResults,
    searchPagination,
    searchQuery,
    search,
    loadMoreResults,
    clearSearchResults,
    loading: loading.search,
    error: error.search,
    canLoadMore: canLoadMoreSearchResults
  }
}