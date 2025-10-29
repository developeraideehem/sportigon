import { Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'

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

// Auth Components
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

// Hooks and Stores
import { useAuthStore } from '@/stores/authStore'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#363636',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <div className="min-h-screen bg-gray-50 flex">
          {/* Sidebar - Only show if authenticated */}
          {isAuthenticated && <Sidebar />}

          {/* Main Content */}
          <div className={`flex-1 flex flex-col ${isAuthenticated ? 'ml-64' : ''}`}>
            {/* Header */}
            {isAuthenticated && <Header />}

            {/* Main Content Area */}
            <main className="flex-1 p-6">
              <Routes>
                <Route path="/" element={isAuthenticated ? <Navigate to="/feed" replace /> : <Home />} />
                <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/feed" replace />} />
                <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/feed" replace />} />
                <Route
                  path="/feed"
                  element={
                    <ProtectedRoute>
                      <Feed />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sports"
                  element={
                    <ProtectedRoute>
                      <Sports />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/live-scores"
                  element={
                    <ProtectedRoute>
                      <LiveScores />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile/:username"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {/* Footer - Only show if authenticated */}
            {isAuthenticated && <Footer />}
          </div>
        </div>
      </HelmetProvider>
    </ErrorBoundary>
  )
}

export default App