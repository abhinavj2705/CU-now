// src/pages/auth/AdminOnboarding.jsx
// Admin request/onboarding flow

import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { auth, db } from '../../firebase'
import { useAuth } from '../../hooks/useAuth'
import christLogo from '../../assets/christ-logo.png'
import './Onboarding.css'

export default function AdminOnboarding() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    designation: profile?.designation || '',
    organization: profile?.organization || '',
    adminRequestReason: profile?.adminRequestReason || '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  if (!user) return <Navigate to="/login" replace />

  // Already approved admin
  if (profile?.role === 'admin' && profile?.onboarded) {
    return <Navigate to="/admin" replace />
  }

  // Pending approval
  if (profile?.adminStatus === 'pending') {
    return (
      <div className="onboarding-page">
        <div className="onboarding-card" style={{ textAlign: 'center' }}>
          <img src={christLogo} alt="Christ University" className="onboarding-logo" />
          <h1 className="onboarding-title">Request Pending</h1>
          <p className="onboarding-subtitle" style={{ marginBottom: 20 }}>
            Your admin access request has been submitted. Please wait for an existing admin to approve it.
          </p>
          <button className="onboarding-submit" onClick={async () => {
            await signOut(auth)
            navigate('/login')
          }}>
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  // Rejected
  if (profile?.adminStatus === 'rejected') {
    return (
      <div className="onboarding-page">
        <div className="onboarding-card" style={{ textAlign: 'center' }}>
          <img src={christLogo} alt="Christ University" className="onboarding-logo" />
          <h1 className="onboarding-title">Request Denied</h1>
          <p className="onboarding-subtitle" style={{ marginBottom: 20 }}>
            Your admin access request was not approved. Contact an existing admin for help.
          </p>
          <button className="onboarding-submit" onClick={async () => {
            await signOut(auth)
            navigate('/login')
          }}>
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = {}
    if (!form.designation.trim()) validationErrors.designation = 'Designation is required'
    if (!form.organization.trim()) validationErrors.organization = 'Organization is required'
    if (!form.adminRequestReason.trim()) validationErrors.adminRequestReason = 'Please explain why'

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      await setDoc(doc(db, 'users', user.uid), {
        designation: form.designation.trim(),
        organization: form.organization.trim(),
        adminRequestReason: form.adminRequestReason.trim(),
        adminStatus: 'pending',
        onboarded: true,
        requestedAdminAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true })
    } catch (err) {
      console.error(err)
      setErrors({ submit: 'Failed to submit request.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-glow" />
      <div className="onboarding-card">
        <div className="onboarding-header">
          <img src={christLogo} alt="Christ University" className="onboarding-logo" />
          <h1 className="onboarding-title">Request Admin Access</h1>
          <p className="onboarding-subtitle">
            Fill in the details below. An existing admin will review your request.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="form-group">
            <label className="form-label">Designation *</label>
            <input name="designation" value={form.designation} onChange={handleChange} placeholder="e.g. Faculty, Coordinator" className={`form-input ${errors.designation ? 'form-input--error' : ''}`} />
            {errors.designation && <p className="form-error">{errors.designation}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Organization / Department *</label>
            <input name="organization" value={form.organization} onChange={handleChange} placeholder="e.g. Developers Society" className={`form-input ${errors.organization ? 'form-input--error' : ''}`} />
            {errors.organization && <p className="form-error">{errors.organization}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Why do you need admin access? *</label>
            <textarea name="adminRequestReason" value={form.adminRequestReason} onChange={handleChange} placeholder="Explain your role and why you need access..." className={`form-input ${errors.adminRequestReason ? 'form-input--error' : ''}`} rows={3} style={{ height: 'auto', padding: '12px 16px' }} />
            {errors.adminRequestReason && <p className="form-error">{errors.adminRequestReason}</p>}
          </div>

          {errors.submit && <p className="form-error form-error--box">{errors.submit}</p>}

          <button type="submit" disabled={loading} className="onboarding-submit">
            {loading ? 'Submitting...' : 'Submit Request →'}
          </button>
        </form>
      </div>
    </div>
  )
}
