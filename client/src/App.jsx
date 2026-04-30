import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import EmployeesPage from './pages/EmployeesPage'
import BlockedPage from './pages/BlockedPage'
import CalendarPage from './pages/CalendarPage'
import LoginPage from './pages/LoginPage'
import { ThemeProvider } from './contexts/ThemeContext'
import { AdminProvider } from './contexts/AdminContext'

function App() {
  // Use sessionStorage for login persistence on refresh, but clear on browser close
  const [currentAdmin, setCurrentAdmin] = useState(() => {
    const savedAdmin = sessionStorage.getItem('currentAdmin')
    if (!savedAdmin) return null
    try {
      return JSON.parse(savedAdmin)
    } catch {
      sessionStorage.removeItem('currentAdmin')
      return null
    }
  })

  const handleLoginSuccess = (admin) => {
    setCurrentAdmin(admin)
    sessionStorage.setItem('currentAdmin', JSON.stringify(admin))
  }

  const handleLogout = () => {
    setCurrentAdmin(null)
    sessionStorage.removeItem('currentAdmin')
  }

  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    if (!currentAdmin) {
      return <Navigate to="/" replace />
    }
    return children
  }

  return (
    <ThemeProvider>
      <AdminProvider admin={currentAdmin}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                currentAdmin
                  ? <Navigate to="/home" replace />
                  : <LoginPage onLoginSuccess={handleLoginSuccess} />
              }
            />
            <Route
              path="/login"
              element={
                currentAdmin
                  ? <Navigate to="/home" replace />
                  : <LoginPage onLoginSuccess={handleLoginSuccess} />
              }
            />
            <Route
              element={
                <ProtectedRoute>
                  <Layout currentAdmin={currentAdmin} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            >
              <Route path="/home" element={<HomePage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/blocked" element={<BlockedPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </ThemeProvider>
  )
}

export default App
