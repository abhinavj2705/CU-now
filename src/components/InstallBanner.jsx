// src/components/InstallBanner.jsx
import { useState, useEffect } from 'react'
import { usePWAInstall } from '../hooks/usePWAInstall'
import './InstallBanner.css'

export default function InstallBanner() {
  const { isInstallable, promptToInstall } = usePWAInstall()
  const [isDismissed, setIsDismissed] = useState(true) // Default to true to prevent hydration flicker

  useEffect(() => {
    // Only show if not previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed') === 'true'
    setIsDismissed(dismissed)
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true')
    setIsDismissed(true)
  }

  // If not installable (e.g., already installed, not supported, or event hasn't fired) or dismissed, render nothing
  if (!isInstallable || isDismissed) {
    return null
  }

  return (
    <div className="install-banner-overlay">
      <div className="install-banner">
        <div className="install-banner__content">
          <div className="install-banner__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18"></line>
            </svg>
          </div>
          <div className="install-banner__text">
            <p className="install-banner__title">Install CU Now</p>
            <p className="install-banner__desc">Add to your home screen for the best experience.</p>
          </div>
        </div>
        <div className="install-banner__actions">
          <button className="install-banner__btn install-banner__btn--skip" onClick={handleDismiss}>
            Not Now
          </button>
          <button className="install-banner__btn install-banner__btn--install" onClick={promptToInstall}>
            Install App
          </button>
        </div>
      </div>
    </div>
  )
}
