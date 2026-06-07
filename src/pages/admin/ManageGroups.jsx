// src/pages/admin/ManageGroups.jsx
// Admin page to view/remap section-to-group assignments

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
  const [dragSection, setDragSection] = useState(null)

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

  // Move a section from one group to another
  function moveSection(section, toGroup) {
    setLocalConfig(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      // Remove from current group
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

  // Unassigned sections
  const assignedSections = Object.values(localConfig).flatMap(g => g.sections)
  const unassigned = ALL_SECTION_LETTERS.filter(s => !assignedSections.includes(s))

  // Save to Firestore
  async function handleSave() {
    setSaving(true)
    try {
      await setDoc(doc(db, 'appConfig', 'groups'), {
        groups: localConfig,
        updatedAt: serverTimestamp(),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save group config:', err)
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

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header__inner">
          <h1 className="admin-header__title">Manage Groups</h1>
          <button className="admin-back-btn" onClick={() => navigate(-1)}>← Back</button>
        </div>
      </div>

      <div className="admin-content">
        <p className="manage-groups-desc">
          Drag and drop sections between groups, or tap a section to move it.
          Changes are saved to Firestore and apply app-wide immediately.
        </p>

        {/* Group cards */}
        {Object.entries(localConfig).map(([groupNum, config]) => (
          <div
            key={groupNum}
            className="group-card"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (dragSection) {
                moveSection(dragSection, groupNum)
                setDragSection(null)
              }
            }}
          >
            <div className="group-card__header">
              <h3 className="group-card__title">{config.label}</h3>
              <span className="group-card__count">{config.sections.length} sections</span>
            </div>
            <div className="group-card__sections">
              {config.sections.length === 0 ? (
                <p className="group-card__empty">No sections assigned</p>
              ) : (
                config.sections.map(section => (
                  <button
                    key={section}
                    className="section-chip"
                    draggable
                    onDragStart={() => setDragSection(section)}
                    onDragEnd={() => setDragSection(null)}
                    title={`Move section ${section}`}
                  >
                    {section}
                    <span className="section-chip__actions">
                      {Object.keys(localConfig)
                        .filter(g => g !== groupNum)
                        .map(targetGroup => (
                          <span
                            key={targetGroup}
                            className="section-chip__move"
                            onClick={(e) => {
                              e.stopPropagation()
                              moveSection(section, targetGroup)
                            }}
                            title={`Move to ${localConfig[targetGroup].label}`}
                          >
                            →G{targetGroup}
                          </span>
                        ))}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        ))}

        {/* Unassigned sections */}
        {unassigned.length > 0 && (
          <div className="group-card group-card--unassigned">
            <div className="group-card__header">
              <h3 className="group-card__title">Unassigned</h3>
              <span className="group-card__count">{unassigned.length} sections</span>
            </div>
            <div className="group-card__sections">
              {unassigned.map(section => (
                <button
                  key={section}
                  className="section-chip section-chip--unassigned"
                  draggable
                  onDragStart={() => setDragSection(section)}
                  onDragEnd={() => setDragSection(null)}
                >
                  {section}
                  <span className="section-chip__actions">
                    {Object.keys(localConfig).map(targetGroup => (
                      <span
                        key={targetGroup}
                        className="section-chip__move"
                        onClick={(e) => {
                          e.stopPropagation()
                          moveSection(section, targetGroup)
                        }}
                        title={`Assign to ${localConfig[targetGroup].label}`}
                      >
                        →G{targetGroup}
                      </span>
                    ))}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="manage-groups-actions">
          <button
            className="admin-submit-btn"
            disabled={saving || !hasChanges}
            onClick={handleSave}
          >
            {saving ? (
              <><div className="spinner spinner--small" /> Saving...</>
            ) : saved ? (
              '✓ Saved!'
            ) : (
              'Save Changes'
            )}
          </button>
          <button
            className="admin-back-btn"
            style={{ marginTop: 8 }}
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
