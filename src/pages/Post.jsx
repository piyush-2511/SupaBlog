import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import postService from '../supabase/postService'
import Header from '../Components/Header/Header'
import { 
  Calendar, 
  User, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Eye, 
  AlertCircle, 
  FileText,
  Edit3,
  Clock,
  Share2
} from 'lucide-react'

// Loading Skeleton Component
const PostSkeleton = () => (
  <div className="animate-pulse">
    {/* Header Skeleton */}
    <div className="mb-8">
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="flex items-center space-x-4 mb-6">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
    
    {/* Featured Image Skeleton */}
    <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
    
    {/* Content Skeleton */}
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      <div className="h-4 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  </div>
)

// Status Badge Component
const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
    status === 'published' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800'
  }`}>
    {status === 'published' ? (
      <>
        <FileText size={14} className="mr-1" />
        Published
      </>
    ) : (
      <>
        <Edit3 size={14} className="mr-1" />
        Draft
      </>
    )}
  </span>
)

// Share Button Component
const ShareButton = ({ post }) => {
  const [showCopied, setShowCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share && navigator.share.canShare && navigator.share.canShare({ url, title: post.post_title })) {
      try {
        await navigator.share({
          title: post.post_title,
          text: post.post_content ? post.post_content.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : '',
          url: url
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url)
        setShowCopied(true)
        setTimeout(() => setShowCopied(false), 2000)
      } catch (error) {
        console.log('Error copying to clipboard:', error)
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
    >
      <Share2 className="h-4 w-4 mr-1" />
      {showCopied ? 'Copied!' : 'Share'}
    </button>
  )
}

const Post = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return
      
      setLoading(true)
      setError(null)
      
      try {
        const result = await postService.getPostById(id)
        
        if (result.success) {
          setPost(result.data)
          console.log('Post data:', result.data) // Debug log
        } else {
          setError(result.error)
          console.error('Failed to fetch post:', result.error)
        }
      } catch (error) {
        setError(error.message)
        console.error('Error fetching post:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Handle edit
  const handleEdit = () => {
    navigate(`/edit-post/${id}`)
  }

  // Handle delete
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      setDeleteLoading(true)
      
      try {
        const result = await postService.deletePost(id)
        
        if (result.success) {
          navigate('/dashboard')
        } else {
          setError(result.error)
          console.error('Failed to delete post:', result.error)
        }
      } catch (error) {
        setError(error.message)
        console.error('Error deleting post:', error)
      } finally {
        setDeleteLoading(false)
      }
    }
  }

  // Check if current user owns the post
  const isPostOwner = isAuthenticated && user && post && post.user_id === user.id

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error loading post
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Post Content */}
          <article className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8">
                <PostSkeleton />
              </div>
            ) : post ? (
              <>
                {/* Post Header */}
                <div className="p-8 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <StatusBadge status={post.status} />
                    
                    {/* Action Buttons - Only show if user owns the post */}
                    {isPostOwner && (
                      <div className="flex space-x-2">
                        <ShareButton post={post} />
                        <button
                          onClick={handleEdit}
                          className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={handleDelete}
                          disabled={deleteLoading}
                          className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors duration-200 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {deleteLoading ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    )}
                    
                    {/* Share button for non-owners */}
                    {!isPostOwner && (
                      <ShareButton post={post} />
                    )}
                  </div>

                  {/* Post Title */}
                  <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                    {post.post_title}
                  </h1>

                  {/* Post Meta */}
                  <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Created: {formatDate(post.created_at)}</span>
                    </div>
                    
                    {post.updated_at && post.updated_at !== post.created_at && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Updated: {formatDate(post.updated_at)}</span>
                      </div>
                    )}
                    
                    {post.profiles && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>By {post.profiles.full_name || post.profiles.username || 'Anonymous'}</span>
                      </div>
                    )}
                    
                    {post.status === 'published' && (
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-2" />
                        <span>Published</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Featured Image */}
                {post.featured_image && (
                  <div className="relative">
                    <img
                      src={post.featured_image}
                      alt={post.post_title}
                      className="w-full h-64 md:h-96 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}

                {/* Post Content */}
                <div className="p-8">
                  {post.post_content ? (
                    <div 
                      className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 prose-blockquote:text-gray-700 prose-code:text-gray-800 prose-pre:bg-gray-100"
                      dangerouslySetInnerHTML={{ __html: post.post_content }}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No content available for this post.</p>
                    </div>
                  )}
                </div>

                {/* Post Footer */}
                <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                      </button>
                    </div>
                    
                    {/* Quick Actions for Post Owner */}
                    {isPostOwner && (
                      <div className="flex items-center space-x-2">
                        <Link
                          to="/add-post"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                        >
                          Create New Post
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Post not found</h3>
                <p className="text-gray-500 mb-4">
                  The post you're looking for doesn't exist or has been removed.
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </button>
              </div>
            )}
          </article>
        </div>
      </main>
    </div>
  )
}

export default Post