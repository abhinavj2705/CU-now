// src/pages/admin/CreateEvent.jsx
// Admin form to create a new orientation event

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../hooks/useAuth'
import Navbar from '../../components/Navbar'
import CustomDayPicker from '../../components/CustomDayPicker'
import CustomDatePicker from '../../components/CustomDatePicker'
import CustomTimePicker from '../../components/CustomTimePicker'
import './Admin.css'

export default function CreateEvent() {
  const navigate = useNavigate()
  const { user } = useAuth()

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

      await addDoc(collection(db, 'events'), {
        dayNumber: parseInt(form.dayNumber),
        name: form.name.trim(),
        venue: form.venue.trim(),
        date: form.date,
        startTime,
        endTime,
        description: form.description.trim(),
        status: form.status,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      navigate('/admin')
    } catch (err) {
      console.error(err)
      setErrors({ submit: 'Failed to create event' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header__inner">
          <h1 className="admin-header__title">Create Event</h1>
          <button className="admin-back-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>
      </div>

      <div className="admin-content">
        <form onSubmit={handleSubmit} className="admin-form">
          {/* Day Number */}
          <div className="form-group">
            <label className="form-label">Day Number *</label>
            <CustomDayPicker 
              name="dayNumber" 
              value={form.dayNumber} 
              onChange={handleChange} 
            />
          </div>

          {/* Event Name */}
          <div className="form-group">
            <label className="form-label">Event Name *</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Campus Tour" className={`form-input ${errors.name ? 'form-input--error' : ''}`} />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          {/* Venue */}
          <div className="form-group">
            <label className="form-label">Venue *</label>
            <input name="venue" value={form.venue} onChange={handleChange} placeholder="e.g. Main Auditorium" className={`form-input ${errors.venue ? 'form-input--error' : ''}`} />
            {errors.venue && <p className="form-error">{errors.venue}</p>}
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label">Date *</label>
            <CustomDatePicker 
              name="date" 
              value={form.date} 
              onChange={handleChange} 
              error={errors.date} 
            />
            {errors.date && <p className="form-error">{errors.date}</p>}
          </div>

          {/* Times */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Time *</label>
              <CustomTimePicker 
                name="startTime" 
                value={form.startTime} 
                onChange={handleChange} 
                error={errors.startTime} 
              />
              {errors.startTime && <p className="form-error">{errors.startTime}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">End Time *</label>
              <CustomTimePicker 
                name="endTime" 
                value={form.endTime} 
                onChange={handleChange} 
                error={errors.endTime} 
              />
              {errors.endTime && <p className="form-error">{errors.endTime}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Event description..." className="form-textarea" rows={4} />
          </div>

          {/* Status */}
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
              <><div className="spinner spinner--small" /> Creating...</>
            ) : (
              'Create Event'
            )}
          </button>
        </form>
      </div>

      <Navbar />
    </div>
  )
}
