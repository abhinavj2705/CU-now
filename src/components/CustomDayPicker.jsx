import './CustomInputs.css'

const DAY_OPTIONS = [
  { value: '1', label: 'Day 1', sub: 'Monday' },
  { value: '2', label: 'Day 2', sub: 'Tuesday' },
  { value: '3', label: 'Day 3', sub: 'Wednesday' },
  { value: '4', label: 'Day 4', sub: 'Thursday' },
  { value: '5', label: 'Day 5', sub: 'Friday' },
  { value: '6', label: 'Day 6', sub: 'Saturday' },
]

export default function CustomDayPicker({ name, value, onChange }) {
  return (
    <div className="custom-day-picker">
      <div className="day-scroll-container">
        {DAY_OPTIONS.map(day => (
          <button
            key={day.value}
            type="button"
            className={`day-pill ${value === day.value ? 'day-pill--active' : ''}`}
            onClick={() => onChange({ target: { name, value: day.value } })}
          >
            <span className="day-pill-label">{day.label}</span>
            <span className="day-pill-sub">{day.sub}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
