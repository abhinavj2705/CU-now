import { createContext, useContext, useEffect, useState } from 'react'
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'

const EventsContext = createContext(null)

export function useEvents() {
  const context = useContext(EventsContext)
  if (!context) throw new Error('useEvents must be used within an EventsProvider')
  return context
}

export default function EventsProvider({ children }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const { profile, isAdmin, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return

    let q;

    if (isAdmin) {
      q = query(collection(db, 'events'), orderBy('startTime', 'asc'))
    } else if (profile?.group) {
      q = query(
        collection(db, 'events'),
        where('targetGroup', 'in', ['all', profile.group]),
        orderBy('startTime', 'asc')
      )
    } else {
      setEvents([])
      setLoading(false)
      return
    }

    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    })
    
    return () => unsub()
  }, [profile?.group, isAdmin, authLoading])

  return (
    <EventsContext.Provider value={{ events, loading }}>
      {children}
    </EventsContext.Provider>
  )
}
