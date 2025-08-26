import { useState } from 'react'
import './App.css'
import { Toaster } from 'react-hot-toast'
import { AdminDashboard, ProtectedRoute, UserDashboard, FactCheckDetail, AuthModal } from './components'
import { HomePage } from './pages'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

function App() {
  const [count, setCount] = useState(0)
  const { isAuthModalOpen, setIsAuthModalOpen } = useAuth()


  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/fact-check/:id" element={<FactCheckDetail />} />
      </Routes>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
      <Toaster />
    </>
  )
}

export default App
