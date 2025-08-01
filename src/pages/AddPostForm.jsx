import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Upload, X, Image, Save, Eye, EyeOff, AlertCircle, Check, FileText, Edit3 } from 'lucide-react'
import { usePostCreation } from '../hooks/usePost'
import { useAuth } from '../hooks/useAuth'

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

const AddPostForm = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const {
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
    clearError
  } = usePostCreation()

  // Form state
  const [postTitle, setPostTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [postContent, setPostContent] = useState('')
  const [featuredImage, setFeaturedImage] = useState(null)
  const [postStatus, setPostStatus] = useState('published')
  
  // UI state
  const [previewMode, setPreviewMode] = useState(false)
  const [showSlugEdit, setShowSlugEdit] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

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

  // Auto-generate slug when title changes
  useEffect(() => {
    if (postTitle && !showSlugEdit) {
      const newSlug = generateSlug(postTitle)
      if (newSlug !== slug) {
        setSlug(newSlug)
      }
    }
  }, [postTitle, showSlugEdit, generateSlug, slug])

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

  // Fixed handlers to prevent circular reference issues
  const handleInputChange = useCallback((e) => {
    // Extract only the values we need to prevent circular references
    const name = e.target.name
    const value = e.target.value
    
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

  const handleSlugChange = useCallback((e) => {
    // Extract only the value to prevent circular references
    const value = e.target.value
    const newSlug = generateSlug(value)
    setSlug(newSlug)
  }, [generateSlug])

  const handleStatusChange = useCallback((e) => {
    // Extract only the value to prevent circular references
    const value = e.target.value
    setPostStatus(value)
  }, [])

  const togglePreview = useCallback(() => {
    setPreviewMode(prev => !prev)
  }, [])

  const toggleSlugEdit = useCallback(() => {
    setShowSlugEdit(prev => !prev)
  }, [])

  // Image upload handler - fixed to handle File objects properly
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

    // Upload image - pass only the file, not any DOM elements
    const uniqueId = Date.now()
    const result = await uploadImage(file, uniqueId)
    
    if (!result.success) {
      setImagePreview(null)
      setFeaturedImage(null)
    }
  }, [uploadImage, clearError])

  const handleFileInputChange = useCallback((e) => {
    // Extract only the file to prevent circular references
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }, [handleImageUpload])

  // Drag handlers - fixed to extract only necessary data
  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    const eventType = e.type
    const isDragActive = eventType === 'dragenter' || eventType === 'dragover'
    setDragActive(isDragActive)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    // Extract only the file to prevent circular references
    const file = e.dataTransfer?.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }, [handleImageUpload])

  const handleRemoveImage = useCallback(async () => {
    if (uploadedImageUrl) {
      const imagePath = uploadedImageUrl.includes('blob:') 
        ? uploadedImageUrl 
        : `featured-images/${Date.now()}`
      await deleteImage(imagePath)
    }
    setFeaturedImage(null)
    setImagePreview(null)
    resetUploadState()
  }, [uploadedImageUrl, deleteImage, resetUploadState])

  const resetForm = useCallback(() => {
    setPostTitle('')
    setSlug('')
    setPostContent('')
    setFeaturedImage(null)
    setPostStatus('published')
    setPreviewMode(false)
    setShowSlugEdit(false)
    setDragActive(false)
    setImagePreview(null)
    setSuccessMessage('')
    resetUploadState()
    clearError()
  }, [resetUploadState, clearError])

  // Fixed submit handler to ensure clean data structure
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    
    clearError()

    if (!user) {
      console.error('User not authenticated')
      return
    }

    if (!isFormValid) {
      alert(!postTitle.trim() ? 'Post title is required' : 'Post content is required')
      return
    }

    // Create a clean data object with no circular references
    const postData = {
      post_title: postTitle.trim(),
      id: slug || generateSlug(postTitle), // Fixed: use 'id' instead of undefined 'slug' variable
      post_content: postContent.trim(),
      featured_image: featuredImage,
      user_id: user.id,
      status: postStatus,
      publish_date: postStatus === 'published' ? new Date().toISOString() : null
    }

    console.log('Submitting post data:', postData) // Debug log

    try {
      const result = await createPost(postData)
      
      if (result.success) {
        const statusText = postStatus === 'published' ? 'published' : 'saved as draft'
        setSuccessMessage(`Post ${statusText} successfully!`)
        resetForm()
      }
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }, [
    user,
    isFormValid,
    postTitle,
    slug,
    postContent,
    featuredImage,
    postStatus,
    generateSlug,
    createPost,
    resetForm,
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
          <p className="text-gray-600">Slug: /{slug || 'untitled-post'}</p>
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
  ), [imagePreview, postTitle, slug, postContent, postStatus])

  const isSubmitDisabled = isCreating || isUploading || !isFormValid

  // Loading state
  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  // Authentication check
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please log in to create a post</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Post</h1>
        <p className="text-gray-600">Fill in the details below to create your blog post</p>
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

          {/* Slug */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                Slug
              </label>
              <button
                type="button"
                onClick={toggleSlugEdit}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showSlugEdit ? 'Auto-generate' : 'Edit manually'}
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">yoursite.com/</span>
              <input
                type="text"
                id="slug"
                name="slug"
                value={slug}
                onChange={showSlugEdit ? handleSlugChange : undefined}
                placeholder="post-slug"
                className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  !showSlugEdit ? 'bg-gray-50 text-gray-600' : ''
                }`}
                readOnly={!showSlugEdit}
              />
            </div>
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

          {createError && <ErrorMessage error={createError} onClose={() => clearError('create')} />}

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitDisabled}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>
                    {postStatus === 'published' ? 'Publishing...' : 'Saving Draft...'}
                  </span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>
                    {postStatus === 'published' ? 'Publish Post' : 'Save as Draft'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default AddPostForm