import { Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import toast, { Toaster } from 'react-hot-toast'

// Layout Components
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import Footer from '@/components/layout/Footer'

// Pages
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Profile from '@/pages/Profile'
import Feed from '@/pages/Feed'
import Messages from '@/pages/Messages'
import Sports from '@/pages/Sports'
import LiveScores from '@/pages/LiveScores'
import NotFound from '@/pages/NotFound'

// Hooks and Stores
import { useAuthStore } from '@/stores/authStore'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar - Only show if authenticated */}
        {isAuthenticated && <Sidebar />}

        {/* Main Content */}
        <div className={`flex-1 flex flex-col ${isAuthenticated ? 'ml-64' : ''}`}>
          {/* Header */}
          <Header />

          {/* Main Content Area */}
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/sports" element={<Sports />} />
              <Route path="/live-scores" element={<LiveScores />} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          {/* Footer - Only show if authenticated */}
          {isAuthenticated && <Footer />}
        </div>
      </div>
    </HelmetProvider>
  )
}

export default App