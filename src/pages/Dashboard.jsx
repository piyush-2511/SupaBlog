import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import postService from '../supabase/postService' // Import postService directly
import { Link, useNavigate } from 'react-router-dom'
import Header from '../Components/Header/Header'
import { Calendar, User, Eye, Edit, Trash2, Plus, Search, AlertCircle, FileText, Edit3 } from 'lucide-react'

// Blog Card Component
const BlogCard = ({ post, onEdit, onDelete, onView }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return ''
    // Remove HTML tags for preview
    const textContent = content.replace(/<[^>]*>/g, '')
    return textContent.length > maxLength 
      ? `${textContent.substring(0, maxLength)}...` 
      : textContent
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Featured Image */}
      {post.featured_image && (
        <div className="h-48 bg-gray-200 overflow-hidden">
          <img
            src={post.featured_image}
            alt={post.post_title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        </div>
      )}
      
      {/* Card Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {post.post_title}
        </h3>
        
        {/* Content Preview */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {truncateContent(post.post_content)}
        </p>
        
        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDate(post.created_at)}
            </div>
            {post.profiles && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {post.profiles.full_name || post.profiles.username}
              </div>
            )}
          </div>
          
          {/* Status Badge */}
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            post.status === 'published' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {post.status === 'published' ? (
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
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onView(post.id)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(post.id)}
              className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </button>
            
            <button
              onClick={() => onDelete(post.id)}
              className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors duration-200"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading Skeleton Component
const BlogCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200"></div>
    <div className="p-6">
      <div className="h-6 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded mb-1"></div>
      <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
      <div className="flex justify-between items-center mb-4">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-200 rounded w-16"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  </div>
)

// Stats Card Component - Now clickable
const StatsCard = ({ title, value, description, icon: Icon, isActive, onClick, status }) => (
  <div 
    className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
      isActive ? 'ring-2 ring-blue-500 bg-blue-50' : ''
    }`}
    onClick={onClick}
  >
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <Icon className={`h-8 w-8 ${isActive ? 'text-blue-700' : 'text-blue-600'}`} />
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className={`text-sm font-medium truncate ${
            isActive ? 'text-blue-700' : 'text-gray-500'
          }`}>
            {title}
          </dt>
          <dd className={`text-lg font-medium ${
            isActive ? 'text-blue-900' : 'text-gray-900'
          }`}>
            {value}
          </dd>
        </dl>
      </div>
    </div>
    {description && (
      <div className="mt-4">
        <p className={`text-sm ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
          {description}
        </p>
      </div>
    )}
  </div>
)

// Filter Status Component
const FilterStatus = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { key: 'all', label: 'All Posts', icon: FileText },
    { key: 'published', label: 'Published', icon: Eye },
    { key: 'draft', label: 'Drafts', icon: Edit3 }
  ]

  return (
    <div className="flex space-x-2 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
            activeFilter === filter.key
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <filter.icon className="h-4 w-4 mr-2" />
          {filter.label}
        </button>
      ))}
    </div>
  )
}

// Main Dashboard Component
const Dashboard = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  
  // State management for posts and UI
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  const [stats, setStats] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredPosts, setFilteredPosts] = useState([])
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all') // New state for active filter

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, authLoading, navigate])

  // Fetch posts function with status filter
  const fetchPosts = async (page = 1, limit = 12, append = false, status = 'all') => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await postService.getAllPosts({ 
        page, 
        limit, 
        sortBy: 'created_at', 
        sortOrder: 'desc',
        status: status === 'all' ? null : status // Pass null for 'all' to get all posts
      })
      
      if (result.success) {
        if (append) {
          setPosts(prevPosts => [...prevPosts, ...result.data])
        } else {
          setPosts(result.data)
        }
        setPagination(result.pagination)
      } else {
        setError(result.error)
        console.error('Failed to fetch posts:', result.error)
      }
    } catch (error) {
      setError(error.message)
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats function
  const fetchStats = async () => {
    try {
      const result = await postService.getPostStats(user?.id)
      
      if (result.success) {
        setStats(result.data)
      } else {
        console.error('Failed to fetch stats:', result.error)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // Handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    setPosts([]) // Clear current posts
    setPagination({ page: 1, limit: 12, total: 0, totalPages: 0 }) // Reset pagination
    fetchPosts(1, 12, false, filter) // Fetch posts with new filter
  }

  // Handle stats card click
  const handleStatsCardClick = (status) => {
    handleFilterChange(status)
  }

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPosts(1, 12, false, activeFilter)
      fetchStats()
    }
  }, [isAuthenticated, user])

  // Filter posts based on search query (client-side filtering on already fetched posts)
  useEffect(() => {
    if (!searchQuery) {
      setFilteredPosts(posts)
    } else {
      const filtered = posts.filter(post =>
        post.post_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.post_content && post.post_content.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setFilteredPosts(filtered)
    }
  }, [posts, searchQuery])

  const handleEdit = (postId) => {
    navigate(`/edit-post/${postId}`)
  }

  const handleView = (postId) => {
    navigate(`/post/${postId}`)
  }

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      setDeleteLoading(postId)
      
      try {
        const result = await postService.deletePost(postId)
        
        if (result.success) {
          // Remove the deleted post from state
          setPosts(prevPosts => prevPosts.filter(post => post.id !== postId))
          
          // Refresh stats
          fetchStats()
        } else {
          setError(result.error)
          console.error('Failed to delete post:', result.error)
        }
      } catch (error) {
        setError(error.message)
        console.error('Error deleting post:', error)
      } finally {
        setDeleteLoading(null)
      }
    }
  }

  const handleLoadMore = async () => {
    if (pagination.page < pagination.totalPages && !loading) {
      await fetchPosts(pagination.page + 1, pagination.limit, true, activeFilter)
    }
  }

  const handleCreatePost = () => {
    navigate('/add-post')
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          {/* <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.email}!
            </h1>
            <p className="text-gray-600">
              Manage your blog posts and create new content. Click on the stats cards below to filter posts.
            </p>
          </div> */}

          {/* Stats Section - Now clickable */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatsCard
                title="Total Posts"
                value={stats.totalPosts || 0}
                description="All your posts (click to view all)"
                icon={FileText}
                isActive={activeFilter === 'all'}
                onClick={() => handleStatsCardClick('all')}
                status="all"
              />
              <StatsCard
                title="Published Posts"
                value={stats.publishedPosts || 0}
                description="Live on your blog (click to view)"
                icon={Eye}
                isActive={activeFilter === 'published'}
                onClick={() => handleStatsCardClick('published')}
                status="published"
              />
              <StatsCard
                title="Draft Posts"
                value={stats.draftPosts || 0}
                description="Unpublished drafts (click to view)"
                icon={Edit3}
                isActive={activeFilter === 'draft'}
                onClick={() => handleStatsCardClick('draft')}
                status="draft"
              />
            </div>
          )}

          {/* Filter Status Buttons */}
          <FilterStatus 
            activeFilter={activeFilter} 
            onFilterChange={handleFilterChange} 
          />

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeFilter === 'all' ? 'all posts' : activeFilter + ' posts'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              onClick={handleCreatePost}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Post
            </button>
          </div>

          {/* Current Filter Display */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {activeFilter === 'all' && 'All Posts'}
                {activeFilter === 'published' && 'Published Posts'}
                {activeFilter === 'draft' && 'Draft Posts'}
                {searchQuery && ` matching "${searchQuery}"`}
              </h2>
              <span className="text-sm text-gray-500">
                {pagination.total} {pagination.total === 1 ? 'post' : 'posts'} found
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error loading posts
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error || 'An error occurred while fetching posts'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Show loading skeletons */}
            {loading && posts.length === 0 && (
              <>
                {[...Array(6)].map((_, index) => (
                  <BlogCardSkeleton key={index} />
                ))}
              </>
            )}

            {/* Show actual posts */}
            {filteredPosts.map((post) => (
              <div key={post.id} className={deleteLoading === post.id ? 'opacity-50' : ''}>
                <BlogCard
                  post={post}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              </div>
            ))}
          </div>

          {/* Empty State */}
          {!loading && filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="h-12 w-12 mx-auto mb-4 text-gray-400">
                  {activeFilter === 'published' ? (
                    <Eye size={48} />
                  ) : activeFilter === 'draft' ? (
                    <Edit3 size={48} />
                  ) : (
                    <FileText size={48} />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? 'No posts found' : `No ${activeFilter === 'all' ? '' : activeFilter} posts yet`}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery 
                    ? `No ${activeFilter === 'all' ? '' : activeFilter} posts match your search "${searchQuery}". Try different keywords.`
                    : activeFilter === 'published'
                      ? 'You haven\'t published any posts yet. Create and publish your first post to see it here.'
                      : activeFilter === 'draft'
                        ? 'You don\'t have any draft posts. Create a new post and save it as draft.'
                        : 'Get started by creating your first blog post.'
                  }
                </p>
                {!searchQuery && (
                  <button
                    onClick={handleCreatePost}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Post
                  </button>
                )}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Load More Button */}
          {!loading && filteredPosts.length > 0 && pagination.page < pagination.totalPages && (
            <div className="text-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Loading...' : `Load More ${activeFilter === 'all' ? 'Posts' : activeFilter === 'published' ? 'Published Posts' : 'Draft Posts'}`}
              </button>
            </div>
          )}

          {/* Quick Actions Footer */}
          <div className="mt-12 bg-white rounded-lg shadow-sm p-6 border-t-4 border-blue-500">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="mb-4 sm:mb-0">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                <p className="text-sm text-gray-500">Manage your blog content efficiently</p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleCreatePost}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </button>
                <button
                  onClick={() => handleFilterChange('draft')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  View Drafts
                </button>
                <button
                  onClick={() => handleFilterChange('published')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Published
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard