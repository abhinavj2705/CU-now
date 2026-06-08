import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <div style={{ flexGrow: 1, overflowY: 'auto' }}>
        <Outlet />
      </div>
      <div style={{ flexShrink: 0 }}>
        <Navbar />
      </div>
    </div>
  )
}
