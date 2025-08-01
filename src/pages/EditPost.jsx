import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Upload, X, Image, Save, Eye, EyeOff, AlertCircle, Check, FileText, Edit3, ArrowLeft } from 'lucide-react'
import { usePostCreation } from '../hooks/usePost'
import { useAuth } from '../hooks/useAuth'
import postService from '../supabase/postService'
import Header from '../Components/Header/Header'

// Memoized components to prevent unnecessary re-renders
const SuccessMessage = React.memo(({ message }) => (
  <div className="mb-6 flex items-center p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
    <Check size={20} className="mr-2" />
    <span>{message}</span>
  </div>
))

const ErrorMessage = React.memo(({ error, onClose }) => (
  <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-center text-red-700">
      <AlertCircle size={20} className="mr-2" />
      <span>{error}</span>
    </div>
    <button
      type="button"
      onClick={onClose}
      className="text-red-600 hover:text-red-800"
    >
      <X size={16} />
    </button>
  </div>
))

const ImagePreview = React.memo(({ 
  imagePreview, 
  onRemove, 
  isUploading, 
  uploadProgress, 
  disabled 
}) => (
  <div className="relative">
    <img
      src={imagePreview}
      alt="Preview"
      className="w-full h-64 object-cover rounded-lg border border-gray-300"
    />
    <button
      type="button"
      onClick={onRemove}
      disabled={disabled}
      className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white rounded-full transition-colors"
    >
      <X size={16} />
    </button>
    {isUploading && (
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
        <div className="text-white text-center">
          <div className="mb-2">Uploading...</div>
          <div className="w-32 h-2 bg-gray-300 rounded-full">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <div className="text-sm mt-1">{uploadProgress}%</div>
        </div>
      </div>
    )}
  </div>
))

const PostStatusRadio = React.memo(({ status, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-3">
      Post Status *
    </label>
    <div className="flex space-x-6">
      <div className="flex items-center">
        <input
          id="status-draft"
          name="postStatus"
          type="radio"
          value="draft"
          checked={status === 'draft'}
          onChange={onChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
        />
        <label htmlFor="status-draft" className="ml-2 flex items-center text-sm text-gray-700 cursor-pointer">
          <Edit3 size={16} className="mr-1 text-gray-500" />
          Draft
        </label>
      </div>
      <div className="flex items-center">
        <input
          id="status-published"
          name="postStatus"
          type="radio"
          value="published"
          checked={status === 'published'}
          onChange={onChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
        />
        <label htmlFor="status-published" className="ml-2 flex items-center text-sm text-gray-700 cursor-pointer">
          <FileText size={16} className="mr-1 text-green-500" />
          Published
        </label>
      </div>
    </div>
    <p className="mt-1 text-xs text-gray-500">
      {status === 'draft' ? 'Save as draft - only you can see this post' : 'Publish immediately - post will be visible to everyone'}
    </p>
  </div>
))

// Loading Skeleton Component
const EditPostSkeleton = () => (
  <div className="animate-pulse">
    <div className="mb-6">
      <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-96"></div>
    </div>
    
    <div className="space-y-6">
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
      
      <div>
        <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
      
      <div>
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
      
      <div>
        <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
        <div className="h-48 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
)

const EditPost = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const {
    updatePost,
    uploadImage,
    deleteImage,
    isCreating: isUpdating,
    isUploading,
    createError: updateError,
    uploadError,
    uploadProgress,
    uploadedImageUrl,
    resetUploadState,
    clearError
  } = usePostCreation()

  // Post loading state
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  // Form state
  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')
  const [featuredImage, setFeaturedImage] = useState(null)
  const [postStatus, setPostStatus] = useState('published')
  
  // UI state
  const [previewMode, setPreviewMode] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [originalImageUrl, setOriginalImageUrl] = useState(null)

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return
      
      setLoading(true)
      setLoadError(null)
      
      try {
        const result = await postService.getPostById(id)
        
        if (result.success) {
          const postData = result.data
          setPost(postData)
          
          // Pre-fill form with existing data
          setPostTitle(postData.post_title || '')
          setPostContent(postData.post_content || '')
          setFeaturedImage(postData.featured_image || null)
          setPostStatus(postData.status || 'published')
          
          // Set image preview if exists
          if (postData.featured_image) {
            setImagePreview(postData.featured_image)
            setOriginalImageUrl(postData.featured_image)
          }
        } else {
          setLoadError(result.error)
        }
      } catch (error) {
        setLoadError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  // Check if current user owns the post
  const isPostOwner = isAuthenticated && user && post && post.user_id === user.id

  // Redirect if not post owner
  useEffect(() => {
    if (!loading && !authLoading && isAuthenticated && post && !isPostOwner) {
      navigate('/dashboard')
    }
  }, [loading, authLoading, isAuthenticated, post, isPostOwner, navigate])

  // Memoized slug generation function
  const generateSlug = useCallback((title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }, [])

  // Auto-generate slug when title changes (only if not manually editing)
  // Removed since slug column doesn't exist

  // Update image preview when uploadedImageUrl changes
  useEffect(() => {
    if (uploadedImageUrl) {
      setImagePreview(uploadedImageUrl)
      setFeaturedImage(uploadedImageUrl)
    }
  }, [uploadedImageUrl])

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Memoized validation
  const isFormValid = useMemo(() => {
    return postTitle.trim() && postContent.trim()
  }, [postTitle, postContent])

  // Memoized handlers
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    
    if (name === 'postTitle') {
      setPostTitle(value)
    } else if (name === 'postContent') {
      setPostContent(value)
    }
    
    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage('')
    }
  }, [successMessage])

  const handleStatusChange = useCallback((e) => {
    setPostStatus(e.target.value)
  }, [])

  const togglePreview = useCallback(() => {
    setPreviewMode(prev => !prev)
  }, [])

  // Image upload handler
  const handleImageUpload = useCallback(async (file) => {
    if (!file) return

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      clearError('upload')
      setTimeout(() => alert('Please select an image file'), 100)
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      clearError('upload')
      setTimeout(() => alert('Image size should be less than 5MB'), 100)
      return
    }

    // Create temporary preview while uploading
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target.result)
    }
    reader.readAsDataURL(file)

    // Upload image
    const result = await uploadImage(file, Date.now())
    if (!result.success) {
      setImagePreview(originalImageUrl)
      setFeaturedImage(originalImageUrl)
    }
  }, [uploadImage, clearError, originalImageUrl])

  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files[0]
    if (file) handleImageUpload(file)
  }, [handleImageUpload])

  // Drag handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    const isDragActive = e.type === 'dragenter' || e.type === 'dragover'
    setDragActive(isDragActive)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImageUpload(file)
  }, [handleImageUpload])

  const handleRemoveImage = useCallback(async () => {
    if (uploadedImageUrl && uploadedImageUrl !== originalImageUrl) {
      const imagePath = uploadedImageUrl.includes('blob:') 
        ? uploadedImageUrl 
        : `featured-images/${Date.now()}`
      await deleteImage(imagePath)
    }
    setFeaturedImage(null)
    setImagePreview(null)
    resetUploadState()
  }, [uploadedImageUrl, originalImageUrl, deleteImage, resetUploadState])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    clearError()

    if (!user || !post) {
      console.error('User not authenticated or post not loaded')
      return
    }

    if (!isFormValid) {
      alert(!postTitle.trim() ? 'Post title is required' : 'Post content is required')
      return
    }

    const postData = {
      post_title: postTitle.trim(),
      post_content: postContent.trim(),
      featured_image: featuredImage,
      status: postStatus,
      updated_at: new Date().toISOString(),
      // Only update publish_date if changing from draft to published
      publish_date: postStatus === 'published' && post.status === 'draft' 
        ? new Date().toISOString() 
        : post.publish_date
    }

    const result = await postService.updatePost(id, postData)
    
    if (result.success) {
      const statusText = postStatus === 'published' ? 'updated and published' : 'updated as draft'
      setSuccessMessage(`Post ${statusText} successfully!`)
      
      // Update the local post state
      setPost(prev => ({ ...prev, ...postData }))
      
      // Navigate back to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    }
  }, [
    user,
    post,
    isFormValid,
    postTitle,
    postContent,
    featuredImage,
    postStatus,
    updatePost,
    id,
    navigate,
    clearError
  ])

  // Memoized preview content
  const previewContent = useMemo(() => (
    <div className="prose max-w-none">
      <div className="mb-6">
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Featured"
            className="w-full h-64 object-cover rounded-lg mb-4"
          />
        )}
        <h1 className="text-3xl font-bold mb-2">{postTitle || 'Untitled Post'}</h1>
        <div className="flex items-center space-x-2 mb-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            postStatus === 'published' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {postStatus === 'published' ? (
              <>
                <FileText size={12} className="mr-1" />
                Published
              </>
            ) : (
              <>
                <Edit3 size={12} className="mr-1" />
                Draft
              </>
            )}
          </span>
        </div>
      </div>
      <div className="whitespace-pre-wrap">
        {postContent || 'No content added yet...'}
      </div>
    </div>
  ), [imagePreview, postTitle, postContent, postStatus])

  const isSubmitDisabled = isUpdating || isUploading || !isFormValid

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <EditPostSkeleton />
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
              <p className="text-gray-600 mb-6">Please log in to edit posts</p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Error loading post
  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="mb-6">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </button>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error loading post
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {loadError}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Post not found or not owner
  if (!post || !isPostOwner) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {!post ? 'Post not found' : 'Access denied'}
              </h3>
              <p className="text-gray-500 mb-4">
                {!post 
                  ? "The post you're looking for doesn't exist or has been removed."
                  : "You don't have permission to edit this post."
                }
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => navigate(`/post/${id}`)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Post
              </button>
            </div>

            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Post</h1>
              <p className="text-gray-600">Update your blog post content and settings</p>
            </div>

            {successMessage && <SuccessMessage message={successMessage} />}

            {/* Preview Toggle */}
            <div className="mb-6">
              <button
                type="button"
                onClick={togglePreview}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {previewMode ? <EyeOff size={20} /> : <Eye size={20} />}
                <span>{previewMode ? 'Edit Mode' : 'Preview Mode'}</span>
              </button>
            </div>

            {previewMode ? previewContent : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Post Title */}
                <div>
                  <label htmlFor="postTitle" className="block text-sm font-medium text-gray-700 mb-2">
                    Post Title *
                  </label>
                  <input
                    type="text"
                    id="postTitle"
                    name="postTitle"
                    value={postTitle}
                    onChange={handleInputChange}
                    placeholder="Enter your post title..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    required
                  />
                </div>

                {/* Post Status Radio Buttons */}
                <PostStatusRadio status={postStatus} onChange={handleStatusChange} />

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image
                  </label>
                  
                  {imagePreview ? (
                    <ImagePreview
                      imagePreview={imagePreview}
                      onRemove={handleRemoveImage}
                      isUploading={isUploading}
                      uploadProgress={uploadProgress}
                      disabled={isUploading}
                    />
                  ) : (
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg text-gray-600 mb-2">
                        Drag and drop an image here, or click to select
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Supports: JPG, PNG, GIF up to 5MB
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                        id="image-upload"
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="image-upload"
                        className={`inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg cursor-pointer transition-colors ${
                          isUploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Image size={20} className="mr-2" />
                        {isUploading ? 'Uploading...' : 'Choose Image'}
                      </label>
                    </div>
                  )}
                  
                  {uploadError && (
                    <div className="mt-2">
                      <ErrorMessage error={uploadError} onClose={() => clearError('upload')} />
                    </div>
                  )}
                </div>

                {/* Post Content */}
                <div>
                  <label htmlFor="postContent" className="block text-sm font-medium text-gray-700 mb-2">
                    Post Content *
                  </label>
                  <textarea
                    id="postContent"
                    name="postContent"
                    value={postContent}
                    onChange={handleInputChange}
                    placeholder="Write your post content here..."
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                    required
                  />
                </div>

                {updateError && <ErrorMessage error={updateError} onClose={() => clearError('create')} />}

                {/* Submit Button */}
                <div className="flex items-center justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/post/${id}`)}
                    disabled={isSubmitDisabled}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                  >
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        <span>Update Post</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default EditPost