// src/components/Navbar.jsx
// Bottom tab bar — 4 tabs: Home, Schedule, Announcements, Profile

import { NavLink } from 'react-router-dom'
import './Navbar.css'

function NavItem({ to, label, icon, iconActive }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-item ${isActive ? 'nav-item--active' : ''}`
      }
    >
      {({ isActive }) => (
        <>
          <span className="nav-item__icon" dangerouslySetInnerHTML={{ __html: isActive ? iconActive : icon }} />
          <span className="nav-item__label">{label}</span>
        </>
      )}
    </NavLink>
  )
}

// SVG icons as strings
const icons = {
  home: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  homeActive: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="0"><path d="M12 2L3 9v11a2 2 0 002 2h4v-8h6v8h4a2 2 0 002-2V9L12 2z"/></svg>`,
  schedule: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  scheduleActive: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="0"><path d="M16 2v4M8 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"/></svg>`,
  announcements: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  announcementsActive: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="0"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z"/><path d="M13.73 21a2 2 0 01-3.46 0" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`,
  profile: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  profileActive: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="0"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2h16z"/><circle cx="12" cy="7" r="4"/></svg>`,
}

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <NavItem to="/dashboard" label="Home" icon={icons.home} iconActive={icons.homeActive} />
        <NavItem to="/schedule" label="Schedule" icon={icons.schedule} iconActive={icons.scheduleActive} />
        <NavItem to="/announcements" label="Updates" icon={icons.announcements} iconActive={icons.announcementsActive} />
        <NavItem to="/profile" label="Profile" icon={icons.profile} iconActive={icons.profileActive} />
      </div>
    </nav>
  )
}
