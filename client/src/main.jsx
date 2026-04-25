import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'

// Apply saved theme before React renders to prevent flash
const savedTheme = localStorage.getItem('theme')
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
