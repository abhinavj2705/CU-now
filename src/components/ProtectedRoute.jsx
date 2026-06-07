// src/components/ProtectedRoute.jsx
// Guards routes that require authenticated + onboarded users

import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { user, profile, loading, isOnboarded } = useAuth()

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />
  if (profile && !isOnboarded) return <Navigate to="/onboarding" replace />

  return children
}
