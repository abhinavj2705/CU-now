// src/pages/user/Announcements.jsx
// Announcements feed — chronological list of admin updates

import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'
import { timeAgo } from '../../utils/formatters'
import Navbar from '../../components/Navbar'
import './Announcements.css'

const URGENCY_CONFIG = {
  urgent: { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>, className: 'announcement--urgent', label: 'Urgent' },
  important: { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, className: 'announcement--important', label: 'Important' },
  normal: { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>, className: 'announcement--normal', label: '' },
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setAnnouncements(docs)
      setLoading(false)
      
      if (docs.length > 0) {
        localStorage.setItem('lastReadAnnouncementId', docs[0].id)
        window.dispatchEvent(new Event('announcementsRead'))
      }
    })
    return unsub
  }, [])

  return (
    <div className="announcements-page">
      {/* Header */}
      <div className="announcements-header">
        <div className="announcements-header__inner">
          <h1 className="announcements-header__title">Updates</h1>
          <p className="announcements-header__sub">Stay informed about changes</p>
        </div>
      </div>

      {/* Content */}
      <div className="announcements-content">
        {loading ? (
          <div className="announcements-skeleton">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton-announcement" />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="announcements-empty">
            <span className="announcements-empty__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
            </span>
            <p className="announcements-empty__text">No announcements yet</p>
            <p className="announcements-empty__sub">
              Updates about schedule changes, cancellations, and important info will appear here.
            </p>
          </div>
        ) : (
          <div className="announcements-list">
            {announcements.map((a, idx) => {
              const config = URGENCY_CONFIG[a.urgency] || URGENCY_CONFIG.normal
              return (
                <div
                  key={a.id}
                  className={`announcement-card ${config.className}`}
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className="announcement-card__header">
                    <span className="announcement-card__icon">{config.icon}</span>
                    <div className="announcement-card__meta">
                      {config.label && (
                        <span className={`announcement-urgency announcement-urgency--${a.urgency}`}>
                          {config.label}
                        </span>
                      )}
                      <span className="announcement-card__time">{timeAgo(a.createdAt)}</span>
                    </div>
                  </div>
                  <h3 className="announcement-card__title">{a.title}</h3>
                  <p className="announcement-card__message">{a.message}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Navbar />
    </div>
  )
}
