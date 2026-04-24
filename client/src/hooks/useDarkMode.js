import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage on initial load
    const stored = localStorage.getItem('darkMode')
    return stored === 'true'
  })

  useEffect(() => {
    // Apply or remove dark class on document element
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Persist to localStorage
    localStorage.setItem('darkMode', isDark.toString())
  }, [isDark])

  const toggle = () => setIsDark(prev => !prev)

  return { isDark, toggle }
}
