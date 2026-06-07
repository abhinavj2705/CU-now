import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore'
import { db } from '../firebase'

export function useUnreadAnnouncements() {
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    let currentLatestId = null

    const checkUnread = () => {
      if (!currentLatestId) return
      const lastReadId = localStorage.getItem('lastReadAnnouncementId')
      setHasUnread(currentLatestId !== lastReadId)
    }

    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(1))
    
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        currentLatestId = snap.docs[0].id
        checkUnread()
      } else {
        currentLatestId = null
        setHasUnread(false)
      }
    })

    // Listen to custom event dispatched when announcements are viewed
    const handleRead = () => checkUnread()
    window.addEventListener('announcementsRead', handleRead)
    
    return () => {
      unsub()
      window.removeEventListener('announcementsRead', handleRead)
    }
  }, [])

  return { hasUnread }
}
