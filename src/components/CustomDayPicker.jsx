import './CustomInputs.css'

const DAY_OPTIONS = [
  { value: '1', label: 'Day 1', sub: 'Mon' },
  { value: '2', label: 'Day 2', sub: 'Tue' },
  { value: '3', label: 'Day 3', sub: 'Wed' },
  { value: '4', label: 'Day 4', sub: 'Thu' },
  { value: '5', label: 'Day 5', sub: 'Fri' },
  { value: '6', label: 'Day 6', sub: 'Sat' },
]

export default function CustomDayPicker({ name, value, onChange }) {
  return (
    <div className="admin-day-picker">
      <div className="admin-day-grid">
        {DAY_OPTIONS.map(day => (
          <button
            key={day.value}
            type="button"
            className={`admin-day-btn ${value === day.value ? 'admin-day-btn--active' : ''}`}
            onClick={() => onChange({ target: { name, value: day.value } })}
          >
            <span className="admin-day-btn__label">{day.label}</span>
            <span className="admin-day-btn__sub">{day.sub}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
