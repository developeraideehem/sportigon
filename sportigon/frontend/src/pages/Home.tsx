import { useState, useEffect } from 'react';
import axios from 'axios'

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [feed, setFeed] = useState<any[]>([])

  useEffect(() => {
    // Test backend connection
    const checkBackend = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/health')
        setBackendStatus(response.data)
      } catch (error) {
        setBackendStatus({ error: 'Backend not connected' })
      }
    }

    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/users')
        setUsers(response.data.users)
      } catch (error) {
        console.error('Failed to fetch users:', error)
      }
    }

    const fetchFeed = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/feed')
        setFeed(response.data.posts)
      } catch (error) {
        console.error('Failed to fetch feed:', error)
      }
    }

    checkBackend()
    fetchUsers()
    fetchFeed()
  }, [])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🏆 Welcome to Sportigon
        </h1>
        <p className="text-xl text-gray-600">
          Your ultimate sports social network - Connect with fans, get live scores, and share your passion!
        </p>
      </div>

      {/* Backend Status */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">🖥️ Backend Status</h2>
        {backendStatus ? (
          <div className="space-y-2">
            <p className="text-green-600 font-medium">✅ Backend Connected!</p>
            <p><strong>Status:</strong> {backendStatus.status}</p>
            <p><strong>Message:</strong> {backendStatus.message}</p>
            <p><strong>Version:</strong> {backendStatus.version}</p>
            <p><strong>Uptime:</strong> {Math.floor(backendStatus.uptime)}s</p>
          </div>
        ) : (
          <p className="text-red-600">❌ Backend not responding</p>
        )}
      </div>

      {/* Users Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">👥 Community</h2>
        {users.length > 0 ? (
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{user.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-gray-600">@{user.username}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No users found</p>
        )}
      </div>

      {/* Feed Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">📱 Latest Posts</h2>
        {feed.length > 0 ? (
          <div className="space-y-4">
            {feed.map((post) => (
              <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">{post.author.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="font-medium">@{post.author}</span>
                  <span className="text-gray-500 text-sm">{new Date(post.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-800">{post.content}</p>
                <div className="mt-2 text-sm text-gray-600">
                  ❤️ {post.likes} likes
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No posts yet</p>
        )}
      </div>
    </div>
  )
}
