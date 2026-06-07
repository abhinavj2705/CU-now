// src/context/GroupConfigContext.jsx
// Provides live group-section config from Firestore, with local fallback

import { createContext, useContext, useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { DEFAULT_GROUP_CONFIG } from '../data/groups'

const GroupConfigContext = createContext(null)

export function useGroupConfig() {
  const ctx = useContext(GroupConfigContext)
  if (!ctx) throw new Error('useGroupConfig must be used inside GroupConfigProvider')
  return ctx
}

export default function GroupConfigProvider({ children }) {
  const [groupConfig, setGroupConfig] = useState(DEFAULT_GROUP_CONFIG)
  const [configLoading, setConfigLoading] = useState(true)

  useEffect(() => {
    // Listen to appConfig/groups document in Firestore
    const unsub = onSnapshot(
      doc(db, 'appConfig', 'groups'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data()
          // Firestore stores groups as: { "1": { label, sections }, "2": ... }
          if (data.groups && typeof data.groups === 'object') {
            setGroupConfig(data.groups)
          }
        }
        // If document doesn't exist, keep the default config
        setConfigLoading(false)
      },
      (err) => {
        console.warn('Failed to load group config from Firestore, using defaults:', err)
        setConfigLoading(false)
      }
    )
    return unsub
  }, [])

  return (
    <GroupConfigContext.Provider value={{ groupConfig, configLoading }}>
      {children}
    </GroupConfigContext.Provider>
  )
}
