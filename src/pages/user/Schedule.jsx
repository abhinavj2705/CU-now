// src/pages/user/Schedule.jsx
// Day-by-day schedule with expandable event cards

import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../../firebase'
import { formatTime } from '../../utils/formatters'
import { getVenueByName } from '../../data/venues'
import Navbar from '../../components/Navbar'
import VenueDirections from '../../components/VenueDirections'
import './Schedule.css'

const DAY_LABELS = ['Day 1 · Mon', 'Day 2 · Tue', 'Day 3 · Wed', 'Day 4 · Thu', 'Day 5 · Fri', 'Day 6 · Sat']

export default function Schedule() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(1)
  const [expandedId, setExpandedId] = useState(null)
  const [venueModal, setVenueModal] = useState(null) // { venue, directions }

  useEffect(() => {
    const q = query(collection(db, 'events'), orderBy('startTime', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  // Auto-select today's day based on orientation start
  useEffect(() => {
    const now = new Date()
    const dayOfWeek = now.getDay() // 0=Sun, 1=Mon ... 6=Sat
    if (dayOfWeek >= 1 && dayOfWeek <= 6) {
      setSelectedDay(dayOfWeek) // Mon=1, Tue=2... Sat=6
    }
  }, [])

  const dayEvents = events.filter(e => e.dayNumber === selectedDay && e.status === 'active')

  function toggleExpand(id) {
    setExpandedId(prev => prev === id ? null : id)
  }

  function getStatusBadge(event) {
    const now = new Date()
    const start = event.startTime?.toDate ? event.startTime.toDate() : new Date(event.startTime)
    const end = event.endTime?.toDate ? event.endTime.toDate() : new Date(event.endTime)

    if (now >= start && now <= end) return { label: 'LIVE', type: 'live' }
    if (now > end) return { label: 'Done', type: 'done' }
    return null
  }

  return (
    <div className="schedule-page">
      {/* Header */}
      <div className="schedule-header">
        <div className="schedule-header__inner">
          <h1 className="schedule-header__title">Schedule</h1>
          <p className="schedule-header__sub">Orientation Week</p>
        </div>

        {/* Day selector */}
        <div className="day-selector">
          <div className="day-selector__scroll">
            {DAY_LABELS.map((label, i) => {
              const day = i + 1
              const count = events.filter(e => e.dayNumber === day && e.status === 'active').length
              return (
                <button
                  key={day}
                  className={`day-pill ${selectedDay === day ? 'day-pill--active' : ''}`}
                  onClick={() => { setSelectedDay(day); setExpandedId(null) }}
                >
                  <span className="day-pill__label">{label}</span>
                  {count > 0 && <span className="day-pill__count">{count}</span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="schedule-content">
        {loading ? (
          <div className="schedule-skeleton">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : dayEvents.length === 0 ? (
          <div className="schedule-empty">
            <span className="schedule-empty__icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </span>
            <p className="schedule-empty__text">No events for {DAY_LABELS[selectedDay - 1]}</p>
            <p className="schedule-empty__sub">Events will appear here once the admin adds them.</p>
          </div>
        ) : (
          <div className="schedule-list">
            {dayEvents.map((event, idx) => {
              const isExpanded = expandedId === event.id
              const badge = getStatusBadge(event)
              return (
                <div
                  key={event.id}
                  className={`schedule-card ${isExpanded ? 'schedule-card--expanded' : ''}`}
                  onClick={() => toggleExpand(event.id)}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Timeline dot */}
                  <div className="schedule-card__timeline">
                    <div className={`timeline-dot ${badge?.type === 'live' ? 'timeline-dot--live' : badge?.type === 'done' ? 'timeline-dot--done' : ''}`} />
                    {idx < dayEvents.length - 1 && <div className="timeline-line" />}
                  </div>

                  <div className="schedule-card__body">
                    {/* Collapsed view */}
                    <div className="schedule-card__header">
                      <div className="schedule-card__time">
                        {formatTime(event.startTime)}
                        {event.endTime && ` – ${formatTime(event.endTime)}`}
                      </div>
                      {badge && (
                        <span className={`schedule-badge schedule-badge--${badge.type}`}>
                          {badge.label}
                        </span>
                      )}
                    </div>
                    <h3 className="schedule-card__name">{event.name}</h3>
                    <div className="schedule-card__venue">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      {event.venue}
                    </div>

                    {/* Expanded details */}
                    <div className={`schedule-card__details ${isExpanded ? 'schedule-card__details--open' : ''}`}>
                      {event.description && (
                        <div className="schedule-detail">
                          <h4 className="schedule-detail__label">Description</h4>
                          <p className="schedule-detail__text">{event.description}</p>
                        </div>
                      )}
                      <div className="schedule-detail">
                        <h4 className="schedule-detail__label">Venue</h4>
                        <p className="schedule-detail__text">{event.venue}</p>
                      </div>
                      <div className="schedule-detail">
                        <h4 className="schedule-detail__label">Time</h4>
                        <p className="schedule-detail__text">
                          {formatTime(event.startTime)} – {formatTime(event.endTime)}
                        </p>
                      </div>
                      {/* Get Directions button */}
                      {(() => {
                        const venueData = getVenueByName(event.venue)
                        if (!venueData) return null
                        return (
                          <button
                            className="schedule-directions-btn"
                            onClick={e => {
                              e.stopPropagation()
                              setVenueModal({ venue: venueData, directions: event.venueDirections || '' })
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            Get Directions
                          </button>
                        )
                      })()}
                    </div>

                    {/* Expand indicator */}
                    <div className="schedule-card__expand">
                      <svg
                        className={`schedule-card__chevron ${isExpanded ? 'schedule-card__chevron--open' : ''}`}
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                      >
                        <polyline points="6 9 12 15 18 9" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="schedule-card__expand-text">
                        {isExpanded ? 'Less' : 'Details'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Venue Directions Modal */}
      {venueModal && (
        <VenueDirections
          venue={venueModal.venue}
          directions={venueModal.directions}
          onClose={() => setVenueModal(null)}
        />
      )}

      <Navbar />
    </div>
  )
}
