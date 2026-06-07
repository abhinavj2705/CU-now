import { useState, useEffect, useRef } from 'react'
import './CustomInputs.css'

export default function CustomTimePicker({ name, value, onChange, error, alignRight }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Parse initial 24h value (e.g. "14:30")
  const [hour, setHour] = useState('12')
  const [minute, setMinute] = useState('00')
  const [ampm, setAmpm] = useState('AM')

  useEffect(() => {
    if (value) {
      const [h24, m] = value.split(':')
      let h = parseInt(h24, 10)
      const isPm = h >= 12
      if (h === 0) h = 12
      else if (h > 12) h -= 12
      
      setHour(h.toString().padStart(2, '0'))
      setMinute(m)
      setAmpm(isPm ? 'PM' : 'AM')
    }
  }, [value])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function updateValue(h, m, ap) {
    let h24 = parseInt(h, 10)
    if (ap === 'PM' && h24 < 12) h24 += 12
    if (ap === 'AM' && h24 === 12) h24 = 0

    const newValue = `${h24.toString().padStart(2, '0')}:${m}`
    onChange({ target: { name, value: newValue } })
  }

  const handleHourChange = (newHour) => {
    setHour(newHour)
    updateValue(newHour, minute, ampm)
  }

  const handleMinuteChange = (newMinute) => {
    setMinute(newMinute)
    updateValue(hour, newMinute, ampm)
  }

  const handleAmpmChange = (newAmpm) => {
    setAmpm(newAmpm)
    updateValue(hour, minute, newAmpm)
  }

  const hoursList = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
  const minutesList = ['00', '15', '30', '45'] // Standard intervals for cleaner UI

  return (
    <div className="custom-input-container" ref={dropdownRef}>
      <div 
        className={`custom-input-trigger ${error ? 'custom-input-trigger--error' : ''} ${isOpen ? 'custom-input-trigger--active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="custom-input-value">
          {value ? `${hour}:${minute} ${ampm}` : 'Select Time'}
        </span>
        <svg className="custom-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>

      {isOpen && (
        <div className={`custom-picker-dropdown custom-time-dropdown ${alignRight ? 'custom-picker-dropdown--right' : ''}`}>
          <div className="time-picker-columns">
            {/* Hours */}
            <div className="time-column">
              <span className="time-column-label">Hour</span>
              <div className="time-scroll">
                {hoursList.map(h => (
                  <button
                    key={h}
                    type="button"
                    className={`time-option ${hour === h ? 'time-option--active' : ''}`}
                    onClick={() => handleHourChange(h)}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Minutes */}
            <div className="time-column">
              <span className="time-column-label">Minute</span>
              <div className="time-scroll">
                {minutesList.map(m => (
                  <button
                    key={m}
                    type="button"
                    className={`time-option ${minute === m ? 'time-option--active' : ''}`}
                    onClick={() => handleMinuteChange(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            
            {/* AM/PM */}
            <div className="time-column time-column--ampm">
              <span className="time-column-label">Period</span>
              <div className="ampm-toggle">
                <button
                  type="button"
                  className={`ampm-btn ${ampm === 'AM' ? 'ampm-btn--active' : ''}`}
                  onClick={() => handleAmpmChange('AM')}
                >
                  AM
                </button>
                <button
                  type="button"
                  className={`ampm-btn ${ampm === 'PM' ? 'ampm-btn--active' : ''}`}
                  onClick={() => handleAmpmChange('PM')}
                >
                  PM
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
