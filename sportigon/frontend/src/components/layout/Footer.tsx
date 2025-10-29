import React from 'react'

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-4 mt-auto">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-6">
          <span>&copy; 2024 Sportigon</span>
          <a href="#" className="hover:text-gray-900">About</a>
          <a href="#" className="hover:text-gray-900">Privacy</a>
          <a href="#" className="hover:text-gray-900">Terms</a>
        </div>
        <div className="flex items-center space-x-4">
          <span>Built with ❤️ for sports fans</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer