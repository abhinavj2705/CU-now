// src/pages/admin/AdminDashboard.jsx
// Admin dashboard — list events, quick stats, manage

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { formatTime } from '../../utils/formatters'
import Navbar from '../../components/Navbar'
import ConfirmModal from '../../components/ConfirmModal'
import './Admin.css'

const DAY_LABELS = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6']

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    const q1 = query(collection(db, 'events'), orderBy('dayNumber', 'asc'), orderBy('startTime', 'asc'))
    const unsub1 = onSnapshot(q1, snap => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    const q2 = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'))
    const unsub2 = onSnapshot(q2, snap => {
      setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => { unsub1(); unsub2() }
  }, [])

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteDoc(doc(db, 'events', deleteTarget.id))
    } catch (err) {
      console.error(err)
    }
    setDeleteTarget(null)
  }

  const totalEvents = events.length
  const activeEvents = events.filter(e => e.status === 'active').length

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header__inner">
          <div>
            <h1 className="admin-header__title">Admin Panel</h1>
            <p className="admin-header__sub">{totalEvents} events · {announcements.length} announcements</p>
          </div>
          <button className="admin-back-btn" onClick={() => navigate('/dashboard')}>
            ← Back
          </button>
        </div>
      </div>

      <div className="admin-content">
        {/* Quick Actions */}
        <div className="admin-actions">
          <button className="admin-action-btn admin-action-btn--primary" onClick={() => navigate('/admin/create-event')}>
            <span className="admin-action-btn__icon">+</span>
            Add Event
          </button>
          <button className="admin-action-btn" onClick={() => navigate('/admin/create-announcement')}>
            <span className="admin-action-btn__icon">📢</span>
            Announcement
          </button>
        </div>

        {/* Stats */}
        <div className="admin-stats">
          <div className="admin-stat">
            <span className="admin-stat__number">{totalEvents}</span>
            <span className="admin-stat__label">Total Events</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat__number">{activeEvents}</span>
            <span className="admin-stat__label">Active</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat__number">{announcements.length}</span>
            <span className="admin-stat__label">Updates</span>
          </div>
        </div>

        {/* Events by Day */}
        {loading ? (
          <div className="admin-skeleton">
            {[1, 2, 3].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : (
          DAY_LABELS.map((label, i) => {
            const day = i + 1
            const dayEvents = events.filter(e => e.dayNumber === day)
            if (dayEvents.length === 0) return null
            return (
              <div key={day} className="admin-day-group">
                <h3 className="admin-day-title">{label}</h3>
                <div className="admin-event-list">
                  {dayEvents.map(event => (
                    <div key={event.id} className="admin-event-card">
                      <div className="admin-event-info">
                        <span className={`admin-event-status admin-event-status--${event.status}`}>
                          {event.status}
                        </span>
                        <h4 className="admin-event-name">{event.name}</h4>
                        <p className="admin-event-meta">
                          {formatTime(event.startTime)} – {formatTime(event.endTime)} · {event.venue}
                        </p>
                      </div>
                      <div className="admin-event-actions">
                        <button className="admin-icon-btn" onClick={() => navigate(`/admin/edit-event/${event.id}`)}>
                          ✏️
                        </button>
                        <button className="admin-icon-btn admin-icon-btn--danger" onClick={() => setDeleteTarget(event)}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Event"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <Navbar />
    </div>
  )
}
