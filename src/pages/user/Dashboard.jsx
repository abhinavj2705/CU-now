// src/pages/user/Dashboard.jsx
// Home dashboard — "Happening Now" + "Up Next" sections

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../hooks/useAuth'
import { useUnreadAnnouncements } from '../../hooks/useUnreadAnnouncements'
import { formatTime, getCountdown } from '../../utils/formatters'
import Navbar from '../../components/Navbar'
import christLogo from '../../assets/christ-logo.png'
import './Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { hasUnread } = useUnreadAnnouncements()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(new Date())

  // Live clock — update every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  // Listen to events collection
  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('startTime', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setEvents(data)
      setLoading(false)
    })
    return unsub
  }, [])

  // Determine current, upcoming events
  const activeEvents = events.filter(e => e.status === 'active')

  const happeningNow = activeEvents.filter(e => {
    const start = e.startTime?.toDate ? e.startTime.toDate() : new Date(e.startTime)
    const end = e.endTime?.toDate ? e.endTime.toDate() : new Date(e.endTime)
    return now >= start && now <= end
  })

  const upNext = activeEvents.filter(e => {
    const start = e.startTime?.toDate ? e.startTime.toDate() : new Date(e.startTime)
    return start > now
  }).slice(0, 3)

  const firstName = user?.displayName?.split(' ')[0] || 'there'

  // Day of week display
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const todayName = dayNames[now.getDay()]

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header__inner">
          <div className="dashboard-header__left" onClick={() => navigate('/profile')}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="dashboard-avatar" />
            ) : (
              <div className="dashboard-avatar dashboard-avatar--placeholder">
                {firstName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="dashboard-greeting">Hey, {firstName}</h1>
              <p className="dashboard-date">{todayName} · Orientation</p>
            </div>
          </div>
          <img src={christLogo} alt="Christ" className="dashboard-logo" />
        </div>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {loading ? (
          <div className="dashboard-skeleton">
            <div className="skeleton-block skeleton-block--lg" />
            <div className="skeleton-block skeleton-block--md" />
            <div className="skeleton-block skeleton-block--md" />
          </div>
        ) : (
          <>
            {/* ===== ANNOUNCEMENT BANNER ===== */}
            {hasUnread && (
              <div className="dashboard-alert" onClick={() => navigate('/announcements')}>
                <span className="dashboard-alert__icon">🔔</span>
                <div className="dashboard-alert__content">
                  <p className="dashboard-alert__title">New Update Available</p>
                  <p className="dashboard-alert__desc">Kindly check the updates section for new announcements.</p>
                </div>
                <svg className="dashboard-alert__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            )}

            {/* ===== HAPPENING NOW ===== */}
            <section className="dashboard-section">
              <div className="section-header">
                <div className="section-header__dot section-header__dot--live" />
                <h2 className="section-title">Happening Now</h2>
              </div>

              {happeningNow.length > 0 ? (
                happeningNow.map(event => (
                  <div key={event.id} className="now-card">
                    <div className="now-card__badge">LIVE</div>
                    <h3 className="now-card__name">{event.name}</h3>
                    <div className="now-card__details">
                      <div className="now-card__detail">
                        <svg className="now-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        <span>{event.venue}</span>
                      </div>
                      <div className="now-card__detail">
                        <svg className="now-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span>{formatTime(event.startTime)} – {formatTime(event.endTime)}</span>
                      </div>
                    </div>
                    {event.description && (
                      <p className="now-card__desc">{event.description}</p>
                    )}
                    <div className="now-card__countdown">
                      <svg className="now-card__countdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      Ends in {getCountdown(event.endTime)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <span className="empty-state__emoji">☕</span>
                  <p className="empty-state__text">Nothing happening right now</p>
                  <p className="empty-state__sub">Check the schedule for upcoming events</p>
                </div>
              )}
            </section>

            {/* ===== UP NEXT ===== */}
            <section className="dashboard-section">
              <h2 className="section-title">
                <svg className="section-title__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <polyline points="13 17 18 12 13 7" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="6 17 11 12 6 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Up Next
              </h2>

              {upNext.length > 0 ? (
                <div className="next-list">
                  {upNext.map(event => (
                    <div key={event.id} className="next-card">
                      <div className="next-card__time">
                        {formatTime(event.startTime)}
                      </div>
                      <div className="next-card__info">
                        <h4 className="next-card__name">{event.name}</h4>
                        <div className="next-card__venue">
                          <svg className="next-card__venue-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          {event.venue}
                        </div>
                      </div>
                      <div className="next-card__countdown">
                        Starts in {getCountdown(event.startTime)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state empty-state--small">
                  <p className="empty-state__text">No upcoming events today</p>
                </div>
              )}
            </section>

            {/* Quick link to full schedule */}
            <button className="dashboard-schedule-btn" onClick={() => navigate('/schedule')}>
              View Full Schedule →
            </button>
          </>
        )}
      </div>

      <Navbar />
    </div>
  )
}
