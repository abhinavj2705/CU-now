// src/pages/auth/Onboarding.jsx
// Profile completion — auto-detected regNumber (read-only), course + section input

import { useState, useMemo } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAuth } from '../../hooks/useAuth'
import { useGroupConfig } from '../../context/GroupConfigContext'
import { extractRegNumber } from '../../utils/formatters'
import { getGroupBySection, getSectionOptions } from '../../data/groups'
import CustomSelect from '../../components/CustomSelect'
import christLogo from '../../assets/christ-logo.png'
import './Onboarding.css'

export default function Onboarding() {
  const { user, profile } = useAuth()
  const { groupConfig } = useGroupConfig()
  const navigate = useNavigate()

  // Auto-detect reg number from display name
  const regNumber = useMemo(() => {
    return profile?.regNumber || extractRegNumber(user?.displayName) || ''
  }, [profile, user])

  const [courseInput, setCourseInput] = useState('')
  const [sectionInput, setSectionInput] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function validate() {
    const e = {}
    if (!regNumber) e.regNumber = 'Could not detect registration number. Contact admin.'
    if (!courseInput.trim()) e.course = 'Course is required (e.g. 1BTPHY)'
    if (!sectionInput) e.section = 'Section is required'
    return e
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
      const course = courseInput.trim().toUpperCase()
      const section = sectionInput.toUpperCase()
      const group = getGroupBySection(section, groupConfig)

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        regNumber,
        class: `${course} ${section}`,
        course,
        section,
        group,
        onboarded: true,
        updatedAt: serverTimestamp(),
      }, { merge: true })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error(err)
      setErrors({ submit: 'Failed to save profile. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <Navigate to="/login" replace />

  const sectionOptions = getSectionOptions(groupConfig)

  // Show group preview when section is selected
  const selectedGroup = sectionInput ? getGroupBySection(sectionInput, groupConfig) : null

  return (
    <div className="onboarding-page">
      {/* Ambient glow */}
      <div className="onboarding-glow" />

      <div className="onboarding-card">
        {/* Header */}
        <div className="onboarding-header">
          <img src={christLogo} alt="Christ University" className="onboarding-logo" />
          <h1 className="onboarding-title">Complete your profile</h1>
          <p className="onboarding-subtitle">
            Hey {user?.displayName?.split(' ')[0]}! Just a few details to get you in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-form">
          {/* Registration Number — Auto-detected, Read-only */}
          <div className="form-group">
            <label className="form-label">Registration Number</label>
            <input
              id="regNumber"
              type="text"
              value={regNumber}
              readOnly
              className="form-input form-input--readonly"
            />
            <p className="form-hint form-hint--success">
              <svg className="form-hint__check" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Auto-detected from your Christ email
            </p>
            {errors.regNumber && (
              <p className="form-error">{errors.regNumber}</p>
            )}
          </div>

          {/* Course */}
          <div className="form-group">
            <label className="form-label">
              Course <span className="form-required">*</span>
            </label>
            <input
              id="course"
              name="course"
              type="text"
              value={courseInput}
              onChange={(e) => { setCourseInput(e.target.value); setErrors(prev => ({ ...prev, course: '' })) }}
              placeholder="e.g. 1BTPHY, 1BTCS"
              className={`form-input ${errors.course ? 'form-input--error' : ''}`}
            />
            {errors.course ? (
              <p className="form-error">{errors.course}</p>
            ) : (
              <p className="form-hint">
                Enter your course code (without section letter)
              </p>
            )}
          </div>

          {/* Section */}
          <div className="form-group">
            <label className="form-label">
              Section <span className="form-required">*</span>
            </label>
            <CustomSelect
              value={sectionInput}
              options={sectionOptions}
              onChange={(val) => { setSectionInput(val); setErrors(prev => ({ ...prev, section: '' })) }}
              error={errors.section}
              placeholder="Select your section"
            />
            {errors.section && (
              <p className="form-error">{errors.section}</p>
            )}
            {selectedGroup && (
              <p className="form-hint form-hint--success">
                <svg className="form-hint__check" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                You'll be assigned to Group {selectedGroup}
              </p>
            )}
          </div>

          {/* Submit error */}
          {errors.submit && (
            <p className="form-error form-error--box">{errors.submit}</p>
          )}

          {/* Submit */}
          <button
            id="onboarding-submit-btn"
            type="submit"
            disabled={loading}
            className="onboarding-submit"
          >
            {loading ? (
              <>
                <div className="spinner spinner--small" />
                Saving...
              </>
            ) : (
              'Complete Setup →'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
