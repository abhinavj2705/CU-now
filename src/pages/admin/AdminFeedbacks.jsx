import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, query, orderBy, getDocs, where, documentId } from 'firebase/firestore'
import { db } from '../../firebase'
import Navbar from '../../components/Navbar'
import './Admin.css'

export default function AdminFeedbacks() {
  const navigate = useNavigate()
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeedbacks() {
      try {
        // 1. Fetch feedbacks
        const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'))
        const snap = await getDocs(q)
        const feedbackList = snap.docs.map(d => ({ id: d.id, ...d.data() }))

        // 2. Extract unique userIds
        const userIds = [...new Set(feedbackList.map(f => f.userId).filter(Boolean))]

        // 3. Fetch user details in chunks of 30 (Firestore 'in' limit)
        const userMap = {}
        const chunks = []
        for (let i = 0; i < userIds.length; i += 30) {
          chunks.push(userIds.slice(i, i + 30))
        }

        for (const chunk of chunks) {
          if (chunk.length === 0) continue
          const usersQ = query(collection(db, 'users'), where(documentId(), 'in', chunk))
          const usersSnap = await getDocs(usersQ)
          usersSnap.docs.forEach(doc => {
            userMap[doc.id] = doc.data()
          })
        }

        // 4. Map user data back to feedbacks
        const feedbacksWithUsers = feedbackList.map(f => ({
          ...f,
          name: f.userId && userMap[f.userId] ? userMap[f.userId].name : 'Anonymous',
          email: f.userId && userMap[f.userId] ? userMap[f.userId].email : 'No email provided',
          photoURL: f.userId && userMap[f.userId] ? userMap[f.userId].photoURL : null
        }))

        setFeedbacks(feedbacksWithUsers)
      } catch (err) {
        console.error('Failed to fetch feedbacks:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFeedbacks()
  }, [])

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header__inner">
          <div>
            <h1 className="admin-header__title">User Feedbacks</h1>
            <p className="admin-header__sub">{feedbacks.length} feedbacks received</p>
          </div>
          <button className="admin-back-btn" onClick={() => navigate('/admin')}>
            ← Back
          </button>
        </div>
      </div>

      <div className="admin-content">
        {loading ? (
          <div className="admin-skeleton">
            {[1, 2, 3].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="admin-empty-state">
            <p>No feedback received yet.</p>
          </div>
        ) : (
          <div className="admin-event-list">
            {feedbacks.map(f => (
              <div key={f.id} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-bg-border)',
                borderRadius: 'var(--radius)',
                padding: '16px',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0, paddingRight: '16px' }}>
                      {f.photoURL ? (
                        <img src={f.photoURL} alt={f.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-bg-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                          {(f.name && f.name !== 'Anonymous') ? f.name.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <h4 className="admin-event-name" style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</h4>
                        <p className="admin-event-meta" style={{ margin: 0, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.email}</p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <span className="admin-event-group-badge" style={{ display: 'flex', gap: '6px', alignItems: 'center', margin: 0 }}>
                        <span>UI/UX:</span>
                        <span style={{ color: 'var(--color-accent)' }}>{f.uiRating ? '★'.repeat(f.uiRating) : 'None'}</span>
                      </span>
                      <span className="admin-event-group-badge" style={{ display: 'flex', gap: '6px', alignItems: 'center', margin: 0 }}>
                        <span>Helpful:</span>
                        <span style={{ color: 'var(--color-accent)' }}>{f.helpRating ? '★'.repeat(f.helpRating) : 'None'}</span>
                      </span>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'var(--color-bg-body)', borderRadius: '8px', border: '1px solid var(--color-bg-border)' }}>
                    <p style={{ margin: 0, color: 'var(--color-text-primary)', fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {f.comment || <span style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>No comment provided</span>}
                    </p>
                  </div>

                  <p className="admin-event-meta" style={{ marginTop: '12px', fontSize: '0.8rem', textAlign: 'right' }}>
                    {f.createdAt ? new Date(f.createdAt.toMillis ? f.createdAt.toMillis() : f.createdAt).toLocaleString() : 'Unknown date'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ flexShrink: 0 }}>
        <Navbar />
      </div>
    </div>
  )
}
