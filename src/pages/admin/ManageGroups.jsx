// src/pages/admin/ManageGroups.jsx
// Admin page to view/remap section-to-group assignments
// Touch-friendly: each section shows 3 tappable group buttons

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useGroupConfig } from '../../context/GroupConfigContext'
import { DEFAULT_GROUP_CONFIG } from '../../data/groups'
import Navbar from '../../components/Navbar'
import './Admin.css'

const ALL_SECTION_LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P']

export default function ManageGroups() {
  const navigate = useNavigate()
  const { groupConfig } = useGroupConfig()
  
  // Local editable copy of group config
  const [localConfig, setLocalConfig] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Initialize local config from live config
  useEffect(() => {
    setLocalConfig(JSON.parse(JSON.stringify(groupConfig)))
  }, [groupConfig])

  if (!localConfig) {
    return (
      <div className="admin-page">
        <div className="loading-screen"><div className="spinner" /></div>
      </div>
    )
  }

  // Find which group a section belongs to
  function findGroupForSection(section) {
    for (const [groupNum, config] of Object.entries(localConfig)) {
      if (config.sections.includes(section)) return parseInt(groupNum)
    }
    return null
  }

  // Assign a section to a group
  function assignSection(section, toGroup) {
    setLocalConfig(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      // Remove from all groups first
      for (const config of Object.values(next)) {
        config.sections = config.sections.filter(s => s !== section)
      }
      // Add to target group
      if (next[toGroup]) {
        next[toGroup].sections.push(section)
        next[toGroup].sections.sort()
      }
      return next
    })
    setSaved(false)
  }

  // Save to Firestore
  async function handleSave() {
    setSaving(true)
    try {
      await setDoc(doc(db, 'appConfig', 'groups'), {
        groups: localConfig,
        updatedAt: serverTimestamp(),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Failed to save group config:', err)
      alert('Failed to save. Check console for details.')
    } finally {
      setSaving(false)
    }
  }

  // Reset to defaults
  function handleReset() {
    setLocalConfig(JSON.parse(JSON.stringify(DEFAULT_GROUP_CONFIG)))
    setSaved(false)
  }

  // Check if config changed
  const hasChanges = JSON.stringify(localConfig) !== JSON.stringify(groupConfig)

  // Group summaries
  const groupSummaries = Object.entries(localConfig).map(([num, config]) => ({
    num: parseInt(num),
    label: config.label,
    count: config.sections.length,
    sections: config.sections.join(', ') || 'None',
  }))

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header__inner">
          <h1 className="admin-header__title">Manage Groups</h1>
          <button className="admin-back-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>
      </div>

      <div className="admin-content">
        {/* Group summary cards */}
        <div className="mg-summary-row">
          {groupSummaries.map(g => (
            <div key={g.num} className="mg-summary-card">
              <span className={`mg-summary-dot mg-summary-dot--g${g.num}`} />
              <div className="mg-summary-info">
                <span className="mg-summary-label">{g.label}</span>
                <span className="mg-summary-sections">{g.sections}</span>
              </div>
              <span className="mg-summary-count">{g.count}</span>
            </div>
          ))}
        </div>

        {/* Section assignment list */}
        <div className="mg-section-list">
          <div className="mg-section-list__header">
            <span className="mg-section-list__col">Section</span>
            <span className="mg-section-list__col mg-section-list__col--groups">
              <span className="mg-group-col-label">G1</span>
              <span className="mg-group-col-label">G2</span>
              <span className="mg-group-col-label">G3</span>
            </span>
          </div>

          {ALL_SECTION_LETTERS.map(section => {
            const currentGroup = findGroupForSection(section)
            return (
              <div key={section} className="mg-section-row">
                <span className="mg-section-letter">{section}</span>
                <div className="mg-group-btns">
                  {[1, 2, 3].map(g => (
                    <button
                      key={g}
                      type="button"
                      className={`mg-group-btn mg-group-btn--g${g} ${currentGroup === g ? 'mg-group-btn--active' : ''}`}
                      onClick={() => assignSection(section, g)}
                    >
                      {currentGroup === g ? '●' : '○'}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Actions */}
        <div className="mg-actions">
          <button
            className="admin-submit-btn"
            disabled={saving || !hasChanges}
            onClick={handleSave}
          >
            {saving ? (
              <><div className="spinner spinner--small" /> Saving...</>
            ) : saved ? (
              '✓ Saved!'
            ) : hasChanges ? (
              'Save Changes'
            ) : (
              'No Changes'
            )}
          </button>
          <button
            type="button"
            className="mg-reset-btn"
            onClick={handleReset}
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      <div style={{ flexShrink: 0 }}>
        <Navbar />
      </div>
    </div>
  )
}
