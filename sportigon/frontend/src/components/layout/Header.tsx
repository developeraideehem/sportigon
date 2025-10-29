import React from 'react'
import { Link } from 'react-router-dom'
import { Search, Bell, MessageCircle, User } from 'lucide-react'

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Sportigon</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search sports, teams, players..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Navigation Icons */}
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <Bell className="w-6 h-6" />
          </button>
          <Link to="/messages" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <MessageCircle className="w-6 h-6" />
          </Link>
          <Link to="/profile" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <User className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header