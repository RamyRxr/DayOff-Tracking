import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import EmployeesPage from './pages/EmployeesPage'
import BlockedPage from './pages/BlockedPage'
import CalendarPage from './pages/CalendarPage'
import LoginPage from './pages/LoginPage'
import { ThemeProvider } from './contexts/ThemeContext'
import { AdminProvider } from './contexts/AdminContext'

function App() {
  const [currentAdmin, setCurrentAdmin] = useState(() => {
    const savedAdmin = localStorage.getItem('currentAdmin')
    if (!savedAdmin) return null
    try {
      return JSON.parse(savedAdmin)
    } catch {
      localStorage.removeItem('currentAdmin')
      return null
    }
  })

  const handleLoginSuccess = (admin) => {
    setCurrentAdmin(admin)
    localStorage.setItem('currentAdmin', JSON.stringify(admin))
  }

  const handleLogout = () => {
    setCurrentAdmin(null)
    localStorage.removeItem('currentAdmin')
  }

  // Show login page if not authenticated
  if (!currentAdmin) {
    return (
      <ThemeProvider>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <AdminProvider admin={currentAdmin}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout currentAdmin={currentAdmin} onLogout={handleLogout} />}>
              <Route index element={<HomePage />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="blocked" element={<BlockedPage />} />
              <Route path="calendar" element={<CalendarPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </ThemeProvider>
  )
}

export default App
