import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useWorkoutStore } from './store/useWorkoutStore'
import HomePage from './pages/HomePage'
import DailyWorkoutPage from './pages/DailyWorkoutPage'
import WorkoutsPage from './pages/WorkoutsPage'
import TemplateDetailPage from './pages/TemplateDetailPage'
import ProfilePage from './pages/ProfilePage'
import AuthPage from './pages/AuthPage'

export default function App() {
  const initializeStore = useWorkoutStore(s => s.initializeStore)

  useEffect(() => {
    initializeStore()
  }, [initializeStore])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<HomePage />} />
        <Route path="/day/:date"      element={<DailyWorkoutPage />} />
        <Route path="/workouts"       element={<WorkoutsPage />} />
        <Route path="/workouts/new"   element={<TemplateDetailPage isNew />} />
        <Route path="/templates/:id"  element={<TemplateDetailPage />} />
        <Route path="/profile"        element={<ProfilePage />} />
        <Route path="/auth"           element={<AuthPage />} />
        <Route path="*"               element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
