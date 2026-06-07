// src/pages/admin/CreateAnnouncement.jsx
// Admin form to create an announcement

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../hooks/useAuth'
import Navbar from '../../components/Navbar'
import './Admin.css'

export default function CreateAnnouncement() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState({
    title: '',
    message: '',
    urgency: 'normal',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = {}
    if (!form.title.trim()) validationErrors.title = 'Title is required'
    if (!form.message.trim()) validationErrors.message = 'Message is required'
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      await addDoc(collection(db, 'announcements'), {
        title: form.title.trim(),
        message: form.message.trim(),
        urgency: form.urgency,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      })
      navigate('/admin')
    } catch (err) {
      console.error(err)
      setErrors({ submit: 'Failed to create announcement' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header__inner">
          <h1 className="admin-header__title">New Announcement</h1>
          <button className="admin-back-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>
      </div>

      <div className="admin-content">
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Venue Change for Campus Tour" className={`form-input ${errors.title ? 'form-input--error' : ''}`} />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Message *</label>
            <textarea name="message" value={form.message} onChange={handleChange} placeholder="Details about the update..." className={`form-textarea ${errors.message ? 'form-textarea--error' : ''}`} rows={5} />
            {errors.message && <p className="form-error">{errors.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Urgency</label>
            <select name="urgency" value={form.urgency} onChange={handleChange} className="form-select">
              <option value="normal">Normal</option>
              <option value="important">Important</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {errors.submit && <p className="form-error">{errors.submit}</p>}

          <button type="submit" disabled={loading} className="admin-submit-btn">
            {loading ? (
              <><div className="spinner spinner--small" /> Posting...</>
            ) : (
              'Post Announcement'
            )}
          </button>
        </form>
      </div>

      <div style={{ flexShrink: 0 }}>
        <Navbar />
      </div>
    </div>
  )
}
