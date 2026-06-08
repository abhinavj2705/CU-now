// src/data/venues.js
// Static venue registry — maps venue names to blocks, images, and default directions.
// Images are served from public/venues/ to avoid Firebase Storage costs.

const VENUES = [
  // ─── Centre of Excellence (5th Block) ───
  {
    id: 'coe-frontier-material-lab',
    name: 'CoE: Frontier Material Lab',
    block: '5th Block',
    image: '/venues/fifth_block.jpg',
    defaultDirections:
      'From the Main Gate, walk along the main road. Pass Block 1, Block 2, and Block 3 on your left. The 5th Block (Centre of Excellence) is further ahead on the left side. Look for the CoE signboard at the entrance.',
  },
  {
    id: 'coe-bosch-workshop',
    name: 'CoE: Bosch Workshop',
    block: '5th Block',
    image: '/venues/fifth_block.jpg',
    defaultDirections:
      'From the Main Gate, walk along the main road. Pass Block 1, Block 2, and Block 3 on your left. The 5th Block (Centre of Excellence) is further ahead on the left side. Look for the CoE signboard at the entrance.',
  },
  {
    id: 'coe-robotics-lab',
    name: 'CoE: Robotics Lab',
    block: '5th Block',
    image: '/venues/fifth_block.jpg',
    defaultDirections:
      'From the Main Gate, walk along the main road. Pass Block 1, Block 2, and Block 3 on your left. The 5th Block (Centre of Excellence) is further ahead on the left side. Look for the CoE signboard at the entrance.',
  },
  {
    id: 'coe-automation-lab',
    name: 'CoE: Automation Lab',
    block: '5th Block',
    image: '/venues/fifth_block.jpg',
    defaultDirections:
      'From the Main Gate, walk along the main road. Pass Block 1, Block 2, and Block 3 on your left. The 5th Block (Centre of Excellence) is further ahead on the left side. Look for the CoE signboard at the entrance.',
  },

  // ─── Individual Blocks ───
  {
    id: 'block-1-audi',
    name: 'Block 1 Audi',
    block: 'Block 1',
    image: '/venues/first_block.jpg',
    defaultDirections:
      'From the Main Gate, take the main road that runs through campus. Block 1 is the first major building on your left side. The Auditorium is located inside.',
  },
  {
    id: 'pu-block',
    name: 'PU Block',
    block: 'PU Block',
    image: '/venues/pu_block.jpg',
    defaultDirections:
      'From the Main Gate, walk straight ahead. The PU Block is located on the right side of the campus. Follow the signs for PU Block.',
  },
  {
    id: 'cse-lab',
    name: 'CSE Lab Visit',
    block: '2nd Block',
    image: '/venues/second_block.jpg',
    defaultDirections:
      'From the Main Gate, walk along the main road. The 2nd Block is the second building on your left, near the open auditorium. The CSE Lab is inside the 2nd Block.',
  },
  {
    id: 'ece-lab',
    name: 'ECE Lab',
    block: '2nd Block',
    image: '/venues/second_block.jpg',
    defaultDirections:
      'From the Main Gate, walk along the main road. The 2nd Block is the second building on your left, near the open auditorium. The ECE Lab is inside the 2nd Block.',
  },
  {
    id: 'block-3-audi',
    name: 'Block 3 Audi',
    block: '3rd Block',
    image: '/venues/third_block.jpg',
    defaultDirections:
      'From the Main Gate, walk along the main road. Pass the 1st and 2nd Blocks on your left. The 3rd Block is next. The Auditorium is located inside.',
  },
  {
    id: 'eee-lab',
    name: 'EEE Lab',
    block: '3rd Block',
    image: '/venues/third_block.jpg',
    defaultDirections:
      'From the Main Gate, walk along the main road. Pass the 1st and 2nd Blocks on your left. The 3rd Block is next. The EEE Lab is located inside.',
  },
  {
    id: 'me-lab',
    name: 'ME Lab',
    block: '6th Block',
    image: '/venues/sixth_block.jpg',
    defaultDirections:
      'From the Main Gate, walk along the main road towards the far end of campus. The 6th Block is one of the last buildings. The ME Lab is located inside.',
  },
  {
    id: 'civil-lab',
    name: 'Civil Lab',
    block: '6th Block',
    image: '/venues/sixth_block.jpg',
    defaultDirections:
      'From the Main Gate, walk along the main road towards the far end of campus. The 6th Block is one of the last buildings. The Civil Lab is located inside.',
  },
  {
    id: 'open-audi',
    name: 'Open Audi',
    block: 'Open Auditorium',
    image: '/venues/open_audi.png',
    defaultDirections:
      'From the Main Gate, walk along the main road. The Open Auditorium is located near the 2nd Block on the left side of the campus.',
  },
]

/**
 * Find venue data by matching the event's venue string (case-insensitive).
 * Returns the venue object or null if not found.
 */
export function getVenueByName(venueName) {
  if (!venueName) return null
  const lower = venueName.toLowerCase().trim()
  return VENUES.find(v => v.name.toLowerCase() === lower) || null
}

/** List of venue names for admin dropdown */
export const VENUE_LIST = VENUES.map(v => v.name)

/** Get default directions for a venue name (for admin copy feature) */
export function getDefaultDirections(venueName) {
  const venue = getVenueByName(venueName)
  return venue?.defaultDirections || ''
}

export default VENUES
