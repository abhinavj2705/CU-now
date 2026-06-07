import { useState, useRef, useEffect } from 'react'
import './CustomInputs.css'

export default function CustomDatePicker({ name, value, onChange, error }) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date())
  const ref = useRef(null)

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

  // Reset viewDate when opening
  const handleToggle = () => {
    if (!open) {
      setViewDate(value ? new Date(value) : new Date())
    }
    setOpen(!open)
  }

  const formattedDate = value 
    ? new Date(value).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : 'Select Date'

  const handleDayClick = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
    const offset = newDate.getTimezoneOffset()
    const formatted = new Date(newDate.getTime() - (offset*60*1000)).toISOString().split('T')[0]
    
    onChange({ target: { name, value: formatted } })
    setOpen(false)
  }

  const prevMonth = (e) => {
    e.stopPropagation()
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  const nextMonth = (e) => {
    e.stopPropagation()
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  // Generate calendar days
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  
  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const isSelected = (day) => {
    if (!value || !day) return false
    const d = new Date(value)
    return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year
  }

  const isToday = (day) => {
    if (!day) return false
    const today = new Date()
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
  }

  return (
    <div className="custom-input-container" ref={ref}>
      <div 
        className={`custom-input-trigger ${open ? 'custom-input-trigger--active' : ''} ${error ? 'custom-input-trigger--error' : ''}`}
        onClick={handleToggle}
      >
        <span className={`custom-input-value ${!value ? 'custom-input-value--placeholder' : ''}`}>
          {formattedDate}
        </span>
        <svg className="custom-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>

      {open && (
        <div className="custom-picker-dropdown date-picker-dropdown" onClick={e => e.stopPropagation()}>
          <div className="date-picker-header">
            <button type="button" className="date-picker-nav" onClick={prevMonth}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div className="date-picker-month">
              {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <button type="button" className="date-picker-nav" onClick={nextMonth}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          
          <div className="date-picker-weekdays">
            {WEEKDAYS.map(d => <div key={d}>{d}</div>)}
          </div>
          
          <div className="date-picker-grid">
            {days.map((day, idx) => (
              <div 
                key={idx} 
                className={`date-picker-day ${day ? '' : 'date-picker-day--empty'} ${isSelected(day) ? 'date-picker-day--selected' : ''} ${isToday(day) && !isSelected(day) ? 'date-picker-day--today' : ''}`}
                onClick={() => day && handleDayClick(day)}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
