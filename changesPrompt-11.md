Read CLAUDE.md in this project.
You are doing TWO things only:
1. Fix dark mode so it applies instantly without reload
2. Change ALL dark mode colors to a deep dark blue / night glass palette

Do NOT touch any backend files. Only modify files inside client/src/
Work through each step in order. Commit after each major step.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1 — THE NEW DARK MODE COLOR PALETTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
These are the ONLY dark mode colors to use everywhere.
Replace every existing dark mode color with these values.
This palette is deep dark blue / night glass / ocean night style.

BACKGROUNDS (from deepest to most elevated):
  Deepest bg (page):     #080C14  (very deep navy near-black)
  App bg:                #0B1120  (deep midnight navy)
  Sidebar:               #0D1526  (slightly lighter navy)
  Top bar:               #0D1526  (same as sidebar)
  Card surface:          #111E35  (elevated dark navy card)
  Card hover:            #162540  (lighter navy on hover)
  Modal bg:              #0F1A2E  (dark navy modal)
  Modal elevated:        #132035  (slightly lighter inside modal)
  Input fill:            rgba(255,255,255,0.05)  (glass input)
  Table header:          rgba(255,255,255,0.03)
  Table row hover:       rgba(255,255,255,0.03)
  Dropdown panel:        #111E35
  Dropdown option hover: #162540

GLASS EFFECT SURFACES (for cards and panels):
  Glass card bg:    rgba(17,30,53,0.85)  + backdrop-filter: blur(20px)
  Glass sidebar:    rgba(13,21,38,0.95)  + backdrop-filter: blur(24px)
  Glass top bar:    rgba(13,21,38,0.90)  + backdrop-filter: blur(16px)
  Glass modal:      rgba(15,26,46,0.97)

BORDERS AND DIVIDERS:
  Subtle border:    rgba(99,157,255,0.08)   (blue-tinted subtle border)
  Default border:   rgba(99,157,255,0.12)   (slightly more visible)
  Strong border:    rgba(99,157,255,0.2)    (accent border)
  Divider:          rgba(255,255,255,0.05)

SHADOWS (dark mode — blue-tinted glows):
  Card shadow:
    0 0 0 1px rgba(99,157,255,0.08),
    0 4px 16px rgba(0,0,0,0.5),
    0 1px 0 rgba(255,255,255,0.03) inset

  Card hover shadow:
    0 0 0 1px rgba(99,157,255,0.15),
    0 8px 32px rgba(0,0,0,0.6),
    0 1px 0 rgba(255,255,255,0.05) inset

  Modal shadow:
    0 0 0 1px rgba(99,157,255,0.12),
    0 24px 64px rgba(0,0,0,0.7),
    0 0 80px rgba(26,47,79,0.3)

  Sidebar shadow:
    2px 0 24px rgba(0,0,0,0.4)

  Input shadow (unfocused):
    inset 0 1px 3px rgba(0,0,0,0.4),
    inset 0 0 0 1px rgba(99,157,255,0.08)

  Input shadow (focused):
    0 0 0 2px rgba(99,157,255,0.4),
    inset 0 1px 3px rgba(0,0,0,0.3)

  Button primary shadow:
    0 4px 16px rgba(26,47,79,0.5),
    inset 0 1px 0 rgba(255,255,255,0.1)

TEXT COLORS:
  Primary text:     #E8EFF8  (soft white with blue tint)
  Secondary text:   #7A9CC4  (muted blue-gray)
  Tertiary text:    #4A6A8A  (dimmer blue-gray)
  Placeholder:      #2A4A6A  (very dim blue)
  Link / accent:    #639DFF  (bright blue accent)

NAVIGATION:
  Active nav bg:
    rgba(99,157,255,0.12)
    + inset 0 1px 0 rgba(255,255,255,0.06)
    + border-left 2px solid #639DFF (or left-accent)
  Active nav text:    #E8EFF8
  Inactive nav text:  #4A6A8A
  Inactive nav hover:
    rgba(99,157,255,0.06)
    text: #7A9CC4

BUTTONS:
  Primary button:
    background: linear-gradient(145deg, #1E3D6B, #122645)
    boxShadow: 0 4px 16px rgba(26,47,79,0.5), inset 0 1px 0 rgba(255,255,255,0.1)
    color: #E8EFF8
    border: 1px solid rgba(99,157,255,0.2)
  Primary hover:
    background: linear-gradient(145deg, #2A5494, #1E3D6B)
    boxShadow: 0 6px 20px rgba(26,47,79,0.6), inset 0 1px 0 rgba(255,255,255,0.15)

  Ghost button:
    border: 1px solid rgba(99,157,255,0.15)
    color: #7A9CC4
    background: transparent
    hover: border rgba(99,157,255,0.25), color #E8EFF8, bg rgba(99,157,255,0.05)

  Danger button (block):
    background: linear-gradient(145deg, #6B1E1E, #451212)
    border: 1px solid rgba(255,59,48,0.2)
    boxShadow: 0 4px 16px rgba(192,57,43,0.3)
  Danger hover:
    background: linear-gradient(145deg, #8A2A2A, #6B1E1E)

  Success button (unblock):
    background: linear-gradient(145deg, #1A4A2A, #0F2E1A)
    border: 1px solid rgba(52,199,89,0.2)
    boxShadow: 0 4px 16px rgba(52,199,89,0.2)

STATUS BADGES (dark mode):
  Actif:
    background: rgba(52,199,89,0.12)
    color: #4ADE80
    border: 1px solid rgba(52,199,89,0.2)
    box-shadow: 0 0 8px rgba(52,199,89,0.1)

  À risque:
    background: rgba(255,159,10,0.12)
    color: #FBB042
    border: 1px solid rgba(255,159,10,0.2)
    box-shadow: 0 0 8px rgba(255,159,10,0.1)

  Bloqué:
    background: rgba(192,57,43,0.15)
    color: #FF6B6B
    border: 1px solid rgba(255,59,48,0.2)
    box-shadow: 0 0 8px rgba(255,59,48,0.1)

STAT PILLS (home page tabs):
  Default:
    background: rgba(17,30,53,0.8)
    border: 1px solid rgba(99,157,255,0.08)
    boxShadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 1px 3px rgba(0,0,0,0.4)
    color: #7A9CC4
  Hover:
    background: rgba(22,37,64,0.9)
    border: 1px solid rgba(99,157,255,0.15)
    color: #E8EFF8
  Active (selected):
    background: rgba(30,61,107,0.6)
    border: 1px solid rgba(99,157,255,0.25)
    boxShadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 4px 12px rgba(0,0,0,0.5)
    color: #E8EFF8

AVATAR CIRCLES:
  background: rgba(99,157,255,0.12)
  color: #639DFF
  border: 1px solid rgba(99,157,255,0.2)

PILL TAGS (department, meta):
  background: rgba(99,157,255,0.08)
  color: #7A9CC4
  border: 1px solid rgba(99,157,255,0.12)

LOGO / BRAND:
  "DayOff" text: #E8EFF8
  "NAFTAL" text: #4A6A8A

CALENDAR CELLS (dark mode):
  Normal day:
    background: rgba(255,255,255,0.03)
    color: #7A9CC4
    border: 1px solid rgba(99,157,255,0.06)
  Normal hover:
    background: rgba(99,157,255,0.08)
    color: #E8EFF8
  Weekend:
    background: rgba(255,255,255,0.02)
    color: #2A4A6A
    cursor: not-allowed
  Past day:
    color: #2A4A6A
    opacity: 0.5
  Day-off (existing):
    background: rgba(192,57,43,0.18)
    boxShadow: inset 0 1px 0 rgba(255,255,255,0.04), inset 0 0 0 1px rgba(255,59,48,0.2)
    color: #FF6B6B
  Selected start/end:
    background: linear-gradient(145deg, #007AFF, #0055D4)  (same — looks great on dark)
    boxShadow: inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 8px rgba(0,122,255,0.5)
    color: white
  Range middle:
    background: rgba(0,122,255,0.12)
    boxShadow: inset 0 0 0 1px rgba(0,122,255,0.2)
    color: #639DFF
  Today:
    background: rgba(0,122,255,0.08)
    boxShadow: 0 0 0 1.5px #007AFF
    color: #639DFF
  Calendar container:
    background: #111E35
    boxShadow: 0 0 0 1px rgba(99,157,255,0.08), 0 4px 16px rgba(0,0,0,0.5)
  Calendar separator:
    background: rgba(99,157,255,0.08)

PIN BOXES (dark mode):
  Default (empty):
    background: rgba(255,255,255,0.05)
    boxShadow: inset 0 1px 3px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(99,157,255,0.1)
    color: #E8EFF8
  Focused:
    background: rgba(99,157,255,0.08)
    boxShadow: 0 0 0 2px rgba(99,157,255,0.4), inset 0 1px 3px rgba(0,0,0,0.3)
    color: #E8EFF8
  Filled:
    background: rgba(99,157,255,0.06)
    boxShadow: inset 0 1px 3px rgba(0,0,0,0.3), 0 0 0 1.5px rgba(99,157,255,0.25)
  Verified:
    background: rgba(52,199,89,0.1)
    boxShadow: 0 0 0 1.5px rgba(52,199,89,0.4)
    color: #4ADE80
  Error:
    background: rgba(192,57,43,0.12)
    boxShadow: 0 0 0 1.5px rgba(255,59,48,0.4)
    color: #FF6B6B

NOTIFICATION PANEL:
  background: #0F1A2E
  border: 1px solid rgba(99,157,255,0.12)
  boxShadow: 0 0 0 1px rgba(99,157,255,0.08), 0 16px 48px rgba(0,0,0,0.6)
  Row hover: rgba(99,157,255,0.04)

SEARCH BAR (employees page):
  background: rgba(255,255,255,0.04)
  border: 1px solid rgba(99,157,255,0.1)
  boxShadow: inset 0 1px 3px rgba(0,0,0,0.3)
  color: #E8EFF8
  placeholder: #2A4A6A

PROGRESS BARS (congé column):
  Track: rgba(255,255,255,0.06)
  Fill (normal): linear-gradient(90deg, #1E3D6B, #2A5494)
  Fill (at risk): linear-gradient(90deg, #6B4A00, #FBB042)
  Fill (blocked): linear-gradient(90deg, #6B1E1E, #FF6B6B)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2 — FIX DARK MODE INSTANT APPLY (NO RELOAD)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The dark mode toggle requires a reload to apply.
This must be fixed so ALL components update instantly on click.

─── STEP A: Fix tailwind.config.js ───
Make sure it has: darkMode: 'class'
Make sure content includes: './src/**/*.{js,ts,jsx,tsx}'

─── STEP B: Replace useDarkMode hook ───
Replace client/src/hooks/useDarkMode.js with:

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

─── STEP C: Create ThemeContext ───
Create client/src/context/ThemeContext.jsx:

  import { createContext, useContext } from 'react'
  import { useDarkMode } from '../hooks/useDarkMode'

  const ThemeContext = createContext({ isDark: false, toggle: () => {} })

  export function ThemeProvider({ children }) {
    const { isDark, toggle } = useDarkMode()
    return (
      <ThemeContext.Provider value={{ isDark, toggle }}>
        {children}
      </ThemeContext.Provider>
    )
  }

  export function useTheme() {
    return useContext(ThemeContext)
  }

─── STEP D: Wrap app in ThemeProvider ───
In client/src/main.jsx:

Add as first executable code (before any ReactDOM call):
  ;(function() {
    try {
      const theme = localStorage.getItem('theme')
      if (theme === 'dark') document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    } catch(e) {}
  })()

Then wrap with ThemeProvider (outside Router):
  import { ThemeProvider } from './context/ThemeContext'

  ReactDOM.createRoot(document.getElementById('root')).render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )

─── STEP E: Fix the toggle button ───
Find the dark mode toggle button.
Change it to use useTheme() — NOT useDarkMode() directly:

  import { useTheme } from '../context/ThemeContext'
  const { isDark, toggle } = useTheme()
  <button onClick={toggle}>
    {isDark ? <Sun size={16} /> : <Moon size={16} />}
  </button>

─── STEP F: Fix every inline style in every component ───
Every component with style={{ background: '...' }} or
style={{ color: '...' }} or style={{ boxShadow: '...' }}
must use isDark conditionals.

In EVERY component file that has hardcoded color values:
1. Add: import { useTheme } from '../context/ThemeContext'
   (adjust relative path based on file location)
2. Add inside component: const { isDark } = useTheme()
3. Replace every hardcoded color with the dark mode palette above

Components that MUST be updated (check all of them):
  - Sidebar.jsx
  - TopBar.jsx or Header.jsx
  - HomePage.jsx
  - EmployeeDetailPanel.jsx
  - AddDayOffModal.jsx
  - HomeAddDayOffModal.jsx
  - BlockEmployeeModal.jsx
  - UnblockModal.jsx
  - AddEmployeeModal.jsx
  - EmployeesPage.jsx
  - BlockedPage.jsx
  - CalendarPage.jsx
  - LoginPage.jsx
  - SplitCalendar.jsx
  - CalendarGrid.jsx
  - CustomSelect.jsx
  - AutorisationStep.jsx
  - Any other component with hardcoded color values

For each component, the replacement pattern is:
  style={{ background: 'white' }}
  → style={{ background: isDark ? '#111E35' : 'white' }}

  style={{ background: '#FAFAFA' }}
  → style={{ background: isDark ? '#0B1120' : '#FAFAFA' }}

  style={{ background: '#F2F2F7' }}
  → style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#F2F2F7' }}

  style={{ color: '#111827' }}
  → style={{ color: isDark ? '#E8EFF8' : '#111827' }}

  style={{ color: '#374151' }}
  → style={{ color: isDark ? '#E8EFF8' : '#374151' }}

  style={{ color: '#6B7280' }}
  → style={{ color: isDark ? '#7A9CC4' : '#6B7280' }}

  style={{ color: '#9CA3AF' }}
  → style={{ color: isDark ? '#4A6A8A' : '#9CA3AF' }}

  style={{ borderColor: 'rgba(0,0,0,0.06)' }}
  → style={{ borderColor: isDark ? 'rgba(99,157,255,0.08)' : 'rgba(0,0,0,0.06)' }}

  Card shadow:
  → style={{ boxShadow: isDark
      ? '0 0 0 1px rgba(99,157,255,0.08), 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)'
      : '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.06)' }}

  Modal shadow:
  → style={{ boxShadow: isDark
      ? '0 0 0 1px rgba(99,157,255,0.12), 0 24px 64px rgba(0,0,0,0.7), 0 0 80px rgba(26,47,79,0.3)'
      : '0 0 0 1px rgba(0,0,0,0.08), 0 16px 48px rgba(0,0,0,0.16)' }}

  Input shadow:
  → style={{ boxShadow: isDark
      ? 'inset 0 1px 3px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(99,157,255,0.08)'
      : 'inset 0 1px 2px rgba(0,0,0,0.06)' }}

  Input focused:
  → style={{ boxShadow: isDark
      ? '0 0 0 2px rgba(99,157,255,0.4), inset 0 1px 3px rgba(0,0,0,0.3)'
      : '0 0 0 2px #1A2F4F, inset 0 1px 3px rgba(0,0,0,0.08)' }}

─── STEP G: Fix Tailwind dark: classes ───
For every Tailwind class that controls color, add dark: variant:

  bg-white             → bg-white dark:bg-[#111E35]
  bg-gray-50           → bg-gray-50 dark:bg-[#162540]
  bg-[#FAFAFA]         → bg-[#FAFAFA] dark:bg-[#0B1120]
  bg-[#F2F2F7]         → bg-[#F2F2F7] dark:bg-[#111E35]
  text-gray-900        → text-gray-900 dark:text-[#E8EFF8]
  text-gray-700        → text-gray-700 dark:text-[#E8EFF8]
  text-gray-600        → text-gray-600 dark:text-[#7A9CC4]
  text-gray-500        → text-gray-500 dark:text-[#7A9CC4]
  text-gray-400        → text-gray-400 dark:text-[#4A6A8A]
  border-gray-100      → border-gray-100 dark:border-[rgba(99,157,255,0.08)]
  border-gray-200      → border-gray-200 dark:border-[rgba(99,157,255,0.12)]
  bg-gray-100          → bg-gray-100 dark:bg-[rgba(255,255,255,0.04)]
  hover:bg-gray-50     → hover:bg-gray-50 dark:hover:bg-[rgba(99,157,255,0.06)]
  hover:bg-gray-100    → hover:bg-gray-100 dark:hover:bg-[rgba(99,157,255,0.08)]
  divide-gray-100      → divide-gray-100 dark:divide-[rgba(99,157,255,0.06)]
  bg-[#1A2F4F]         → keep as-is (navy primary button — works in both modes)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3 — VERIFY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Run: cd client && npm run dev
Fix any console errors.

Test sequence (NO reload allowed between steps):

1. Start in light mode
2. Click toggle → entire UI instantly dark blue night style
   - Page background: very deep navy (#080C14 / #0B1120)
   - Sidebar: dark navy glass (#0D1526)
   - Cards: dark navy (#111E35) with blue-tinted borders
   - Text: soft blue-white (#E8EFF8)
   - Secondary text: muted blue (#7A9CC4)
   - Accents: bright blue (#639DFF) on borders and nav
3. Click toggle again → entire UI back to light instantly
4. Open HomeAddDayOffModal in dark mode → fully dark navy
5. Open EmployeeDetailPanel in dark mode → fully dark navy
6. Open BlockEmployeeModal in dark mode → fully dark navy
7. Reload in dark mode → stays dark navy immediately (no flash)
8. Navigate all pages in dark mode → all pages are dark navy

The final visual result must look like:
  A premium dark navy dashboard — like a night sky or deep ocean.
  Deep blue-black backgrounds, bright blue accents, glass-like surfaces,
  soft blue-tinted borders that glow subtly,
  text in soft white with blue undertones.
  NOT gray-black. NOT neutral dark. Deep BLUE dark.

Commit: "feat: dark blue night mode palette + instant apply via ThemeContext"