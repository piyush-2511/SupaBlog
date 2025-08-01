import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useProfile } from '../../hooks/useProfile'
import { Link, useNavigate } from 'react-router-dom'

const Header = () => {
  const { user, logout } = useAuth()
  const { currentProfile } = useProfile()
  const navigate = useNavigate()
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
      console.log('Logout successful')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleNavigation = (path) => {
    console.log('Navigate to:', path)
    setIsDropdownOpen(false)
    navigate(path)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <button 
              onClick={() => handleNavigation('/')}
              className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              BlogHub
            </button>
          </div>

          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavigation('/')}
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Home
            </button>
            <button
              onClick={() => handleNavigation('/add-post')}
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Add Post
            </button>
            {/* <button
              onClick={() => handleNavigation('/trending')}
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Trending Posts
            </button> */}
            <button
              onClick={() => handleNavigation('/bloggers')}
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Bloggers
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-1"
              >
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                  {currentProfile?.avatar_url ? (
                    <img
                      src={currentProfile.avatar_url}
                      alt={currentProfile.display_name || currentProfile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-medium text-gray-600">
                      {getInitials(currentProfile?.display_name || currentProfile?.username || user?.email)}
                    </span>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {currentProfile?.display_name || currentProfile?.username || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  
                  <button
                    onClick={() => handleNavigation('/profile')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    View Profile
                  </button>
                  
                  <button
                    onClick={() => handleNavigation('/settings')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Settings
                  </button>
                  
                  <div className="border-t border-gray-200 mt-1">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleDropdown}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isDropdownOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <button
                onClick={() => handleNavigation('/')}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              >
                Home
              </button>
              <button
                onClick={() => handleNavigation('/add-post')}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              >
                Add Post
              </button>
              <button
                onClick={() => handleNavigation('/trending')}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              >
                Trending Posts
              </button>
              <button
                onClick={() => handleNavigation('/search-bloggers')}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
              >
                Search Bloggers
              </button>
              
              <div className="border-t border-gray-200 pt-2">
                <div className="flex items-center px-3 py-2">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden mr-3">
                    {currentProfile?.avatar_url ? (
                      <img
                        src={currentProfile.avatar_url}
                        alt={currentProfile.display_name || currentProfile.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium text-gray-600">
                        {getInitials(currentProfile?.display_name || currentProfile?.username || user?.email)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {currentProfile?.display_name || currentProfile?.username || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleNavigation('/profile')}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                >
                  View Profile
                </button>
                
                <button
                  onClick={() => handleNavigation('/settings')}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                >
                  Settings
                </button>
                
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Header