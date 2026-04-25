import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // Read from localStorage on first render
    const saved = localStorage.getItem('theme')
    return saved === 'dark'
  })

  useEffect(() => {
    // Apply or remove 'dark' class on documentElement
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])  // runs every time isDark changes

  const toggle = () => setIsDark(prev => !prev)

  return { isDark, toggle }
}
