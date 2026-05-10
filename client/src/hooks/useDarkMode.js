import { useState, useEffect } from 'react'

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const toggle = () => setIsDark(prev => !prev)
  return { isDark, toggle }
}

/**
 * Hook to handle dark mode hover effects consistently
 * Provides onMouseEnter and onMouseLeave handlers for buttons
 */
export function useDarkHoverStyle(
  isDark,
  baseColor = 'transparent',
  hoverColor = 'rgba(99,157,255,0.08)'
) {
  if (!isDark) {
    return {}
  }

  return {
    onMouseEnter: (e) => {
      e.currentTarget.style.backgroundColor = hoverColor
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.backgroundColor = baseColor
    }
  }
}
