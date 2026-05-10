/**
 * Color constants used throughout the application
 * Centralized to avoid magic strings and ensure consistency
 */

export const DARK_MODE_COLORS = {
  // Backgrounds
  BG_PRIMARY: '#0B1120',
  BG_SECONDARY: 'rgba(13,21,38,0.85)',
  BG_HOVER: 'rgba(99,157,255,0.04)',
  BG_HOVER_STRONG: 'rgba(99,157,255,0.08)',
  BG_SELECTED: 'rgba(99,157,255,0.12)',
  BG_OVERLAY: 'rgba(99,157,255,0.06)',

  // Borders
  BORDER_LIGHT: 'rgba(99,157,255,0.08)',
  BORDER_MEDIUM: 'rgba(99,157,255,0.12)',
  BORDER_STRONG: 'rgba(99,157,255,0.15)',
  BORDER_ACCENT: 'rgba(99,157,255,0.2)',
  BORDER_FOCUS: 'rgba(99,157,255,0.3)',

  // Text
  TEXT_PRIMARY: '#E8EFF8',
  TEXT_SECONDARY: '#7A9CC4',
  TEXT_MUTED: '#8E8E93',

  // Accents
  BLUE: '#639DFF',
  BLUE_LIGHT: '#2C4A6F',
  BLUE_GRADIENT_START: '#2A5494',
  BLUE_GRADIENT_END: '#1E3D6B',

  // Status colors
  RED: '#FF6B6B',
  AMBER: '#FF9F0A',
  GREEN: '#34C759'
}

export const LIGHT_MODE_COLORS = {
  // Text
  TEXT_PRIMARY: '#111827',
  TEXT_SECONDARY: '#374151',
  TEXT_MUTED: '#6B7280'
}

/**
 * Helper to get appropriate color based on theme
 */
export function getThemeColor(colorKey, isDark) {
  return isDark ? DARK_MODE_COLORS[colorKey] : LIGHT_MODE_COLORS[colorKey]
}
