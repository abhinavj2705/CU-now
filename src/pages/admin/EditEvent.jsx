// src/pages/admin/EditEvent.jsx
// Admin form to edit an existing event

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import Navbar from '../../components/Navbar'
import './Admin.css'

export default function EditEvent() {
  const navigate = useNavigate()
  const { eventId } = useParams()

  const [form, setForm] = useState({
    dayNumber: '1',
    name: '',
    venue: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    status: 'active',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    async function fetchEvent() {
      try {
        const snap = await getDoc(doc(db, 'events', eventId))
        if (snap.exists()) {
          const data = snap.data()
          const startDate = data.startTime?.toDate ? data.startTime.toDate() : new Date(data.startTime)
          const endDate = data.endTime?.toDate ? data.endTime.toDate() : new Date(data.endTime)

          setForm({
            dayNumber: String(data.dayNumber || 1),
            name: data.name || '',
            venue: data.venue || '',
            date: data.date || startDate.toISOString().split('T')[0],
            startTime: startDate.toTimeString().slice(0, 5),
            endTime: endDate.toTimeString().slice(0, 5),
            description: data.description || '',
            status: data.status || 'active',
          })
        }
      } catch (err) {
        console.error(err)
      } finally {
        setFetching(false)
      }
    }
    fetchEvent()
  }, [eventId])

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Event name is required'
    if (!form.venue.trim()) e.venue = 'Venue is required'
    if (!form.date) e.date = 'Date is required'
    if (!form.startTime) e.startTime = 'Start time required'
    if (!form.endTime) e.endTime = 'End time required'
    return e
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      const startTime = Timestamp.fromDate(new Date(`${form.date}T${form.startTime}`))
      const endTime = Timestamp.fromDate(new Date(`${form.date}T${form.endTime}`))

      await updateDoc(doc(db, 'events', eventId), {
        dayNumber: parseInt(form.dayNumber),
        name: form.name.trim(),
        venue: form.venue.trim(),
        date: form.date,
        startTime,
        endTime,
        description: form.description.trim(),
        status: form.status,
        updatedAt: serverTimestamp(),
      })

      navigate('/admin')
    } catch (err) {
      console.error(err)
      setErrors({ submit: 'Failed to update event' })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="admin-page">
        <div className="loading-screen"><div className="spinner" /></div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header__inner">
          <h1 className="admin-header__title">Edit Event</h1>
          <button className="admin-back-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>
      </div>

      <div className="admin-content">
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label className="form-label">Day Number *</label>
            <select name="dayNumber" value={form.dayNumber} onChange={handleChange} className="form-select">
              <option value="1">Day 1 · Monday</option>
              <option value="2">Day 2 · Tuesday</option>
              <option value="3">Day 3 · Wednesday</option>
              <option value="4">Day 4 · Thursday</option>
              <option value="5">Day 5 · Friday</option>
              <option value="6">Day 6 · Saturday</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Event Name *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Campus Tour" className={`form-input ${errors.name ? 'form-input--error' : ''}`} />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Venue *</label>
            <input name="venue" value={form.venue} onChange={handleChange} placeholder="e.g. Main Auditorium" className={`form-input ${errors.venue ? 'form-input--error' : ''}`} />
            {errors.venue && <p className="form-error">{errors.venue}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Date *</label>
            <input name="date" type="date" value={form.date} onChange={handleChange} className={`form-input ${errors.date ? 'form-input--error' : ''}`} />
            {errors.date && <p className="form-error">{errors.date}</p>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Time *</label>
              <input name="startTime" type="time" value={form.startTime} onChange={handleChange} className={`form-input ${errors.startTime ? 'form-input--error' : ''}`} />
            </div>
            <div className="form-group">
              <label className="form-label">End Time *</label>
              <input name="endTime" type="time" value={form.endTime} onChange={handleChange} className={`form-input ${errors.endTime ? 'form-input--error' : ''}`} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Event description..." className="form-textarea" rows={4} />
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="form-select">
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="postponed">Postponed</option>
            </select>
          </div>

          {errors.submit && <p className="form-error">{errors.submit}</p>}

          <button type="submit" disabled={loading} className="admin-submit-btn">
            {loading ? (
              <><div className="spinner spinner--small" /> Saving...</>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>

      <Navbar />
    </div>
  )
}
