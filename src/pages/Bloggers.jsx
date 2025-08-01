import React, { useState, useEffect } from 'react';
import { User, Calendar, MapPin, Globe, Search, Users, FileText, Eye, ArrowLeft } from 'lucide-react';

// Import your actual services
import profileService from '../supabase/profileService';
import postService from '../supabase/postService';

// Bloggers Grid Component
const Bloggers = ({ onBloggerSelect }) => {
  const [bloggers, setBloggers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBloggers();
  }, []);

  const fetchBloggers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // If there's a search query, use search, otherwise get all profiles
      let response;
      if (searchQuery.trim()) {
        response = await profileService.searchProfiles(searchQuery, 50);
      } else {
        // Since there's no getAllProfiles method, we'll use search with empty query
        // or you can create a getAllProfiles method in your profileService
        response = await profileService.searchProfiles('', 50);
      }
      
      if (response.success) {
        setBloggers(response.data || []);
      } else {
        setError(response.error || 'Failed to fetch bloggers');
        setBloggers([]);
      }
    } catch (error) {
      console.error('Error fetching bloggers:', error);
      setError(error.message || 'An error occurred while fetching bloggers');
      setBloggers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    await fetchBloggers();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <User className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Bloggers</h3>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={fetchBloggers}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Bloggers</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore our community of talented writers and content creators sharing their expertise and insights.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-12">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search bloggers by username or name..."
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bloggers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {bloggers.map((blogger) => (
          <div
            key={blogger.user_id}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
          >
            {/* Featured Image/Avatar */}
            <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-xl overflow-hidden">
              {blogger.avatar_url ? (
                <img
                  src={blogger.avatar_url}
                  alt={blogger.display_name || blogger.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-16 h-16 text-white opacity-80" />
                </div>
              )}
              {blogger.is_verified && (
                <div className="absolute top-3 right-3 bg-blue-600 text-white p-1.5 rounded-full">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold text-gray-900 truncate">
                  {blogger.display_name || blogger.username}
                </h3>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">@{blogger.username}</p>
              
              <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
                {blogger.bio || 'No bio available'}
              </p>

              {/* View Profile Button */}
              <button
                onClick={() => onBloggerSelect(blogger.user_id)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {bloggers.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bloggers found</h3>
          <p className="text-gray-600">
            {searchQuery ? 'Try adjusting your search criteria.' : 'No bloggers available at the moment.'}
          </p>
        </div>
      )}
    </div>
  );
};

// Blogger Profile Component
const BloggerProfile = ({ bloggerId, onBack }) => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postsError, setPostsError] = useState(null);

  useEffect(() => {
    if (bloggerId) {
      fetchProfile();
      fetchPosts();
    }
  }, [bloggerId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await profileService.getPublicProfile(bloggerId);
      
      if (response.success) {
        setProfile(response.data);
      } else {
        setError(response.error || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.message || 'An error occurred while fetching the profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      setPostsError(null);
      
      const response = await postService.getPostsByUser(bloggerId, {
        status: 'published',
        limit: 20,
        page: 1
      });
      
      if (response.success) {
        setPosts(response.data || []);
      } else {
        setPostsError(response.error || 'Failed to fetch posts');
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPostsError(error.message || 'An error occurred while fetching posts');
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bloggers
        </button>
        
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <User className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {error ? 'Error Loading Profile' : 'Profile Not Found'}
            </h3>
            <p className="text-sm">{error || 'The requested profile could not be found'}</p>
          </div>
          <button
            onClick={fetchProfile}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Bloggers
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        
        <div className="px-8 pb-8">
          <div className="flex flex-col items-center text-center -mt-16 relative">
            {/* Avatar */}
            <div className="relative mb-4">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name || profile.username}
                  className="w-40 h-40 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
              {profile.is_verified && (
                <div className="absolute bottom-2 right-2 bg-blue-600 text-white p-1.5 rounded-full">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="w-full">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-gray-600 text-lg mb-4">@{profile.username}</p>
              
              {profile.is_private && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mb-4">
                  Private Profile
                </span>
              )}

              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-700 text-lg leading-relaxed mb-4 max-w-2xl mx-auto">
                  {profile.bio}
                </p>
              )}
              
              {/* Profile Details */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <div className="flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    <a 
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}
                {profile.created_at && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(profile.created_at)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Published Posts</h2>
        
        {postsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : postsError ? (
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Error Loading Posts</h3>
              <p className="text-sm">{postsError}</p>
            </div>
            <button
              onClick={fetchPosts}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <article key={post.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                <div className="flex gap-4">
                  {post.featured_image && (
                    <img
                      src={post.featured_image}
                      alt={post.post_title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                      {post.post_title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3">
                      {truncateContent(post.post_content)}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <time dateTime={post.publish_date || post.created_at}>
                        {formatDate(post.publish_date || post.created_at)}
                      </time>
                      
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-blue-600 hover:text-blue-700 cursor-pointer">
                          <Eye className="w-4 h-4" />
                          Read more
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No published posts yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main App Component
const BloggersApp = () => {
  const [selectedBlogger, setSelectedBlogger] = useState(null);

  const handleBloggerSelect = (bloggerId) => {
    setSelectedBlogger(bloggerId);
  };

  const handleBack = () => {
    setSelectedBlogger(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {selectedBlogger ? (
        <BloggerProfile 
          bloggerId={selectedBlogger} 
          onBack={handleBack}
        />
      ) : (
        <Bloggers onBloggerSelect={handleBloggerSelect} />
      )}
    </div>
  );
};

export default BloggersApp;