import { useState, useEffect } from 'react'
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import './FeedbackPopup.css'

const SKIPPED_COOLDOWN = 1 * 60 * 60 * 1000 // 1 hour in ms

// Simple SVG Star icon
const StarIcon = ({ filled, onClick, onMouseEnter, onMouseLeave }) => (
  <svg
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className={`star-icon ${filled ? 'filled' : ''}`}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

export default function FeedbackPopup() {
  const { user, profile, isOnboarded } = useAuth()
  
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [uiRating, setUiRating] = useState(0)
  const [hoverUiRating, setHoverUiRating] = useState(0)
  
  const [helpRating, setHelpRating] = useState(0)
  const [hoverHelpRating, setHoverHelpRating] = useState(0)
  
  const [comment, setComment] = useState('')

  useEffect(() => {
    const handleForceShow = () => setIsVisible(true)
    window.addEventListener('showFeedbackPopup', handleForceShow)

    const isPendingAdmin = profile?.role === 'pending_admin' || profile?.adminStatus === 'pending' || profile?.adminStatus === 'rejected'

    if (!user || !profile || profile.hasSubmittedFeedback || !isOnboarded || isPendingAdmin) {
      setIsVisible(false)
      return () => window.removeEventListener('showFeedbackPopup', handleForceShow)
    }

    // Check if skipped within last 2 hours
    if (profile.feedbackSkippedAt) {
      // Handle both Firestore Timestamp and plain numbers
      const skippedTime = profile.feedbackSkippedAt.toMillis 
        ? profile.feedbackSkippedAt.toMillis() 
        : profile.feedbackSkippedAt
        
      if (Date.now() - skippedTime < SKIPPED_COOLDOWN) {
        setIsVisible(false)
        return () => window.removeEventListener('showFeedbackPopup', handleForceShow) // Still in cooldown
      }
    }

    // Show immediately
    setIsVisible(true)

    return () => window.removeEventListener('showFeedbackPopup', handleForceShow)
  }, [user, profile, isOnboarded])

  const handleSkip = async () => {
    setIsVisible(false)
    try {
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        feedbackSkippedAt: Date.now() // Store current time as number for simplicity
      })
    } catch (err) {
      console.error('Failed to skip feedback:', err)
    }
  }

  const handleUiRatingClick = (rating) => {
    setUiRating(rating)
    if (!isExpanded) {
      setIsExpanded(true)
    }
  }

  const handleSubmit = async () => {
    if (uiRating === 0 || helpRating === 0) {
      toast.error('Please provide both ratings before submitting.')
      return
    }

    if (!comment.trim()) {
      toast.error('Please provide a comment before submitting.')
      return
    }

    setIsSubmitting(true)
    try {
      // 1. Save feedback
      await addDoc(collection(db, 'feedbacks'), {
        userId: user.uid,
        uiRating,
        helpRating,
        comment: comment.trim(),
        createdAt: serverTimestamp()
      })

      // 2. Update user profile to never show again
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        hasSubmittedFeedback: true
      })

      toast.success('Thank you for your feedback!')
      setIsVisible(false)
    } catch (err) {
      console.error('Failed to submit feedback:', err)
      toast.error('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="feedback-popup">
      <div className="feedback-popup__content">
        <div className="feedback-popup__header">
          <h3>Quick Feedback ✨</h3>
        </div>

        <div className="feedback-popup__body">
          <div className="rating-group">
            <label>How is the UI/UX?</label>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  filled={star <= (hoverUiRating || uiRating)}
                  onClick={() => handleUiRatingClick(star)}
                  onMouseEnter={() => setHoverUiRating(star)}
                  onMouseLeave={() => setHoverUiRating(0)}
                />
              ))}
            </div>
          </div>

          {/* Progressively disclosed section */}
          <div className={`feedback-popup__expanded ${isExpanded ? 'show' : ''}`}>
            <div>
              <div className="rating-group">
                <label>How helpful is the app?</label>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      filled={star <= (hoverHelpRating || helpRating)}
                      onClick={() => setHelpRating(star)}
                      onMouseEnter={() => setHoverHelpRating(star)}
                      onMouseLeave={() => setHoverHelpRating(0)}
                    />
                  ))}
                </div>
              </div>

              <div className="rating-group">
                <label>Any suggestions? (Required)</label>
                <textarea
                  placeholder="Tell us what we can do better..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="feedback-popup__actions">
                <button 
                  className="btn-skip" 
                  onClick={handleSkip}
                  disabled={isSubmitting}
                >
                  Skip for Now
                </button>
                <button 
                  className="btn-submit" 
                  onClick={handleSubmit}
                  disabled={isSubmitting || uiRating === 0 || helpRating === 0 || !comment.trim()}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
