// src/context/AuthContext.jsx
// Provides auth state, user profile, and role to the entire app

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../firebase'

export const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)       // Firebase Auth user
  const [profile, setProfile] = useState(null) // Firestore user document
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubProfile = null

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubProfile) unsubProfile()
      unsubProfile = null
      setUser(firebaseUser)

      if (firebaseUser) {
        // Listen to user's Firestore document in real time
        const userRef = doc(db, 'users', firebaseUser.uid)
        unsubProfile = onSnapshot(userRef, (snap) => {
          setProfile(snap.exists() ? { id: snap.id, ...snap.data() } : null)
          setLoading(false)
        })
      } else {
        // Logged out — clean up
        setProfile(null)
        setLoading(false)
      }
    })

    return () => {
      unsubAuth()
      if (unsubProfile) unsubProfile()
    }
  }, [])

  const isAdmin = profile?.role === 'admin'
  const isOnboarded = profile?.onboarded === true

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isOnboarded }}>
      {children}
    </AuthContext.Provider>
  )
}
