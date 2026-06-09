// src/App.jsx — Root component with React Router v6 routing
// Route-level code splitting with React.lazy

import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import AuthProvider from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import GroupConfigProvider from './context/GroupConfigContext'
import EventsProvider from './context/EventsContext'
import { Analytics } from '@vercel/analytics/react'

// Route guards
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import InstallBanner from './components/InstallBanner'
import FeedbackPopup from './components/FeedbackPopup'
import Layout from './components/Layout'

// Loading spinner
function RouteFallback() {
  return (
    <div className="loading-screen">
      <div className="spinner" />
    </div>
  )
}

// Auth pages
const Login = lazy(() => import('./pages/auth/Login'))
const Onboarding = lazy(() => import('./pages/auth/Onboarding'))
const AdminOnboarding = lazy(() => import('./pages/auth/AdminOnboarding'))

// User pages
const Dashboard = lazy(() => import('./pages/user/Dashboard'))
const Schedule = lazy(() => import('./pages/user/Schedule'))
const Announcements = lazy(() => import('./pages/user/Announcements'))
const Profile = lazy(() => import('./pages/user/Profile'))

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const CreateEvent = lazy(() => import('./pages/admin/CreateEvent'))
const EditEvent = lazy(() => import('./pages/admin/EditEvent'))
const CreateAnnouncement = lazy(() => import('./pages/admin/CreateAnnouncement'))
const ManageGroups = lazy(() => import('./pages/admin/ManageGroups'))

export default function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <GroupConfigProvider>
      <AuthProvider>
        <EventsProvider>
        {/* Global toast notifications */}
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '8px',
              fontSize: '14px',
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-bg-border)',
            },
          }}
        />

        <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Onboarding */}
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/admin-onboarding" element={<AdminOnboarding />} />

          {/* Protected user routes wrapped in Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/schedule" element={
              <ProtectedRoute><Schedule /></ProtectedRoute>
            } />
            <Route path="/announcements" element={
              <ProtectedRoute><Announcements /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Profile /></ProtectedRoute>
            } />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />
          <Route path="/admin/create-event" element={
            <AdminRoute><CreateEvent /></AdminRoute>
          } />
          <Route path="/admin/edit-event/:eventId" element={
            <AdminRoute><EditEvent /></AdminRoute>
          } />
          <Route path="/admin/create-announcement" element={
            <AdminRoute><CreateAnnouncement /></AdminRoute>
          } />
          <Route path="/admin/manage-groups" element={
            <AdminRoute><ManageGroups /></AdminRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </Suspense>
        
        {/* Global Feedback Popup */}
        <FeedbackPopup />

        {/* Global PWA Install Banner */}
        <InstallBanner />
        </EventsProvider>
      </AuthProvider>
      </GroupConfigProvider>
    </BrowserRouter>
    <Analytics />
    </ThemeProvider>
  )
}
