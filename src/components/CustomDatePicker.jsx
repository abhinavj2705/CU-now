import { useRef } from 'react'
import './CustomInputs.css'

export default function CustomDatePicker({ name, value, onChange, error }) {
  const inputRef = useRef(null)

  const handleContainerClick = () => {
    if (inputRef.current) {
      if (typeof inputRef.current.showPicker === 'function') {
        inputRef.current.showPicker()
      } else {
        inputRef.current.focus()
      }
    }
  }

  const formattedDate = value 
    ? new Date(value).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : 'Select Date'

  return (
    <div className="custom-input-container">
      <div 
        className={`custom-input-trigger ${error ? 'custom-input-trigger--error' : ''}`}
        onClick={handleContainerClick}
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
      
      <input
        ref={inputRef}
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        className="hidden-date-input"
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', top: '50%', left: 0 }}
      />
    </div>
  )
}
