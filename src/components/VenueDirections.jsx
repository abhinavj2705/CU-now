// src/components/VenueDirections.jsx
// Bottom-sheet modal showing venue image and directions

import './VenueDirections.css'

export default function VenueDirections({ venue, directions, onClose }) {
  if (!venue) return null

  // Use custom admin-provided directions, or fall back to default
  const displayDirections = directions || venue.defaultDirections || ''

  return (
    <div className="venue-backdrop" onClick={onClose}>
      <div className="venue-sheet" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="venue-sheet__header">
          <div>
            <h2 className="venue-sheet__title">{venue.name}</h2>
            <p className="venue-sheet__block">{venue.block}</p>
          </div>
          <button className="venue-sheet__close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Venue Image */}
        {venue.image && (
          <div className="venue-sheet__image-wrap">
            <img
              src={venue.image}
              alt={`${venue.block} building`}
              className="venue-sheet__image"
              loading="lazy"
            />
          </div>
        )}

        {/* Directions */}
        {displayDirections && (
          <div className="venue-sheet__directions">
            <h3 className="venue-sheet__directions-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              How to get there
            </h3>
            <p className="venue-sheet__directions-text">{displayDirections}</p>
          </div>
        )}
      </div>
    </div>
  )
}
