// src/components/CustomVenuePicker.jsx
// Custom dropdown for selecting venues — works in both light and dark mode

import { useState, useRef, useEffect } from 'react'
import './CustomVenuePicker.css'

export default function CustomVenuePicker({ value, options, onChange, error, placeholder = 'Select a venue' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  function handleSelect(name) {
    onChange(name)
    setOpen(false)
  }

  return (
    <div className={`venue-picker ${error ? 'venue-picker--error' : ''}`} ref={ref}>
      <button
        type="button"
        className={`venue-picker__trigger ${open ? 'venue-picker__trigger--open' : ''} ${!value ? 'venue-picker__trigger--placeholder' : ''}`}
        onClick={() => setOpen(prev => !prev)}
      >
        <span className="venue-picker__value">{value || placeholder}</span>
        <svg
          className={`venue-picker__chevron ${open ? 'venue-picker__chevron--open' : ''}`}
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="venue-picker__dropdown">
          {options.map(name => (
            <button
              key={name}
              type="button"
              className={`venue-picker__option ${value === name ? 'venue-picker__option--active' : ''}`}
              onClick={() => handleSelect(name)}
            >
              {name}
              {value === name && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
