import React, { useMemo, useState } from 'react'
import VENUES from '../../data/venues'
import Navbar from '../../components/Navbar'
import './About.css'

const ADDITIONAL_FACILITIES = {
  'Block 1': ['Admission Office', 'Director\'s Office', 'Office of International Affairs', 'Block 1 Audi', 'University Media Team'],
  '2nd Block': ['SWO Office'],
  '3rd Block': ['CAPS Office', 'Sports Department', 'Choir'],
  'Block 4': ['Stationery', 'Indoor Canteens', 'Gym', 'Library', 'CADS Lab', 'Lathe Lab'],
  '5th Block': ['IEEE Office', 'IIIC Office', 'Office of Examination', 'Psychology Labs'],
  '6th Block': ['Physics Labs'],
  'PU Block': ['A residential college focusing on international standards curriculum for pre-university']
}

export default function About() {
  const [expandedBlock, setExpandedBlock] = useState(null)
  // Group venues by their block
  const blocks = useMemo(() => {
    const blocksMap = VENUES.reduce((acc, venue) => {
      // Use the block name as the key
      const blockKey = venue.block || 'Other'
      if (!acc[blockKey]) {
        acc[blockKey] = {
          name: blockKey,
          image: venue.image || '/venues/default.jpg',
          facilities: []
        }
      }
      // Add the venue/lab if it's different from the block name itself
      if (venue.name !== blockKey) {
        if (!acc[blockKey].facilities.includes(venue.name)) {
          acc[blockKey].facilities.push(venue.name)
        }
      }
      return acc
    }, {})

    // Add additional facilities and ensure all blocks exist
    const imageFallbacks = {
      'Block 4': '/venues/fourth_block.jpg'
    }

    Object.keys(ADDITIONAL_FACILITIES).forEach(blockKey => {
      if (!blocksMap[blockKey]) {
        blocksMap[blockKey] = {
          name: blockKey,
          image: imageFallbacks[blockKey] || '/venues/first_block.jpg',
          facilities: []
        }
      }
      ADDITIONAL_FACILITIES[blockKey].forEach(fac => {
        if (!blocksMap[blockKey].facilities.includes(fac)) {
          blocksMap[blockKey].facilities.push(fac)
        }
      })
    })

    // Convert to array
    const blocksArray = Object.values(blocksMap)

    // Define the custom order requested
    const customOrder = [
      'Block 1',
      '2nd Block',
      'Open Auditorium',
      '3rd Block',
      'Block 4',
      '5th Block',
      '6th Block',
      'PU Block'
    ]

    // Sort based on the custom order
    blocksArray.sort((a, b) => {
      const indexA = customOrder.indexOf(a.name)
      const indexB = customOrder.indexOf(b.name)
      
      if (indexA === -1 && indexB === -1) return 0
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      
      return indexA - indexB
    })

    return blocksArray
  }, [])

  return (
    <div className="about-page">
      <header className="about-header">
        <h1>Know Your Campus</h1>
        <p>in a fun and elegant way</p>
      </header>

      <div className="about-content">
        <div className="blocks-container">
          {blocks.map((block, index) => {
            const isExpanded = expandedBlock === block.name;
            return (
              <div 
                key={index} 
                className={`block-card ${isExpanded ? 'block-card--expanded' : ''}`}
                onClick={() => setExpandedBlock(isExpanded ? null : block.name)}
              >
                <div className="block-card__image-wrapper">
                  <img src={block.image} alt={block.name} className="block-card__image" loading="lazy" />
                  <div className="block-card__image-overlay">
                    <h2 className="block-card__title">{block.name}</h2>
                    <svg className={`block-card__chevron ${isExpanded ? 'open' : ''}`} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
                
                <div className={`block-card__expanded-content ${isExpanded ? 'open' : ''}`}>
                  {block.facilities.length > 0 ? (
                    <div className="block-card__content">
                      <h3 className="block-card__subtitle">Facilities & Labs</h3>
                      <ul className="block-card__list">
                        {block.facilities.map((facility, i) => (
                          <li key={i} className="block-card__list-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="list-icon">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                              <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            {facility}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="block-card__content">
                      <p className="block-card__empty">No facilities listed.</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      <div style={{ flexShrink: 0 }}>
        <Navbar />
      </div>
    </div>
  )
}
