// src/utils/formatters.js
// Date/time formatting + Christ University name parsing utilities

import { format } from 'date-fns'

/**
 * Format a Firestore timestamp to readable date string
 * @param {Object} timestamp - Firestore timestamp or Date
 * @returns {string} Formatted date (e.g. "Apr 25, 2026")
 */
export function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return format(date, 'MMM d, yyyy')
}

/**
 * Format a Firestore timestamp to readable date + time
 * @param {Object} timestamp - Firestore timestamp or Date
 * @returns {string} Formatted date-time (e.g. "Apr 25, 2026 at 3:00 PM")
 */
export function formatDateTime(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return format(date, "MMM d, yyyy 'at' h:mm a")
}

/**
 * Format time only (e.g. "3:00 PM")
 */
export function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return format(date, 'h:mm a')
}

/**
 * Get relative time (e.g. "2 hours ago", "in 3 days")
 */
export function timeAgo(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

/**
 * Get countdown string (e.g. "Ends in 25 mins", "Starts in 1hr 30mins")
 */
export function getCountdown(targetDate) {
  if (!targetDate) return ''
  const target = targetDate.toDate ? targetDate.toDate() : new Date(targetDate)
  const now = new Date()
  const diff = target.getTime() - now.getTime()

  if (diff <= 0) return 'Already passed'

  const totalMinutes = Math.floor(diff / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60

  if (hours > 0 && mins > 0) return `${hours}hr ${mins}min`
  if (hours > 0) return `${hours}hr`
  return `${mins} min`
}

/**
 * Extract the registration number from a Christ University display name.
 * Format: "MANDAR SACHIN WAIGAONKAR 2460476" → "2460476"
 */
export function extractRegNumber(displayName) {
  if (!displayName) return ''
  const parts = displayName.trim().split(/\s+/)
  const lastPart = parts[parts.length - 1]
  return /^\d+$/.test(lastPart) ? lastPart : ''
}

/**
 * Extract the clean name (without reg number) and title-case it.
 * "MANDAR SACHIN WAIGAONKAR 2460476" → "Mandar Sachin Waigaonkar"
 */
export function extractCleanName(displayName) {
  if (!displayName) return displayName || ''
  const parts = displayName.trim().split(/\s+/)
  const lastPart = parts[parts.length - 1]
  const nameParts = /^\d+$/.test(lastPart) ? parts.slice(0, -1) : parts
  return nameParts
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}
