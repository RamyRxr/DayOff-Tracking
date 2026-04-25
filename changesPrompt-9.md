Read CLAUDE.md in this project.
You are fixing specific UI problems in the frontend only.
Do NOT touch any backend files.
Only modify files inside client/src/
Work through each fix in order. Commit after each one.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 1 — DARK MODE: Apply instantly without reload
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current problem: clicking the dark mode toggle does nothing visually
until the page is reloaded.

Root cause: the 'dark' class is being added to the DOM but Tailwind
is not reacting because either:
A. The component is not re-rendering after the toggle
B. The dark class is being added to the wrong element
C. The state change does not trigger a re-render of styled components

STEP A — Fix the useDarkMode hook:
Open client/src/hooks/useDarkMode.js (or wherever it is defined).
Replace the entire hook with this correct implementation:

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

STEP B — Apply dark class on initial page load (prevent flash):
In client/src/main.jsx, add this BEFORE the ReactDOM.createRoot call:

  // Apply saved theme before React renders to prevent flash
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark')
  }

STEP C — Make sure tailwind.config.js has darkMode set correctly:
Open client/tailwind.config.js
Make sure it contains:
  darkMode: 'class'
If it says 'media' or is missing, change it to 'class'.

STEP D — Verify the toggle button calls the hook correctly:
Find the dark mode toggle button in the top bar.
Make sure it uses:
  const { isDark, toggle } = useDarkMode()
  <button onClick={toggle}>...</button>

The toggle function from the hook must be called directly on click.
Do NOT wrap it in another function unless necessary.
Do NOT use any local state in the button component for dark mode —
only use the hook.

STEP E — Force re-render on theme change:
In App.jsx or the root layout component, consume the useDarkMode hook:
  const { isDark } = useDarkMode()
This ensures the root component re-renders when theme changes,
which causes all child components to re-render with new dark: classes.

Commit: "fix: dark mode applies instantly on click without reload"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 2 — DARK MODE: Apply to ALL components that
        are currently stuck in light mode
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After Fix 1, dark mode will apply instantly.
But several components are missing dark: classes entirely.

Go through EVERY component listed below and add the missing dark: variants.
Use these exact dark mode color values:

  Page background:    dark:bg-[#0A0A0F]
  Sidebar:            dark:bg-[#12121A]/95
  Top bar:            dark:bg-[#12121A]/90
  Card / modal bg:    dark:bg-[#16161E]
  Card hover:         dark:hover:bg-[#1C1C28]
  Input fill:         dark:bg-white/[0.06]
  Table header:       dark:bg-white/[0.04]
  Table row hover:    dark:hover:bg-white/[0.03]
  Text primary:       dark:text-[#F2F2F7]
  Text secondary:     dark:text-[#8E8E93]
  Text tertiary:      dark:text-[#636366]
  Border default:     dark:border-white/[0.07]
  Border strong:      dark:border-white/[0.12]
  Divider:            dark:border-white/[0.06]

COMPONENTS THAT MUST BE FIXED:

A. HomeAddDayOffModal (opened by the FAB "+" button):
   - Modal overlay: add dark:bg-black/50
   - Modal card: add dark:bg-[#16161E] dark:border-white/[0.08]
   - All labels: add dark:text-[#8E8E93]
   - All input fields: add dark:bg-white/[0.06] dark:text-[#F2F2F7]
   - Calendar container: add dark:bg-[#1C1C28]
   - Calendar day cells normal: dark text-[#C7C7CC], dark bg rgba(255,255,255,0.04)
   - File upload zone: dark:border-white/[0.12] dark:text-[#636366]
   - CustomSelect dropdown panel: dark:bg-[#1C1C28] dark:border-white/[0.08]
   - CustomSelect options: dark:hover:bg-white/[0.04] dark:text-[#F2F2F7]
   - Footer: dark:bg-[#16161E] dark:border-white/[0.06]
   - Step indicator pill: dark:bg-white/[0.06] dark:text-[#8E8E93]

B. EmployeeDetailPanel (the right-side sliding panel):
   - Panel background: dark:bg-[#16161E]
   - Header section: dark:border-white/[0.06]
   - Avatar circle: dark:bg-white/[0.08] dark:text-[#F2F2F7]
   - Name text: dark:text-[#F2F2F7]
   - Matricule text: dark:text-[#8E8E93]
   - Meta pills: dark:bg-white/[0.06] dark:text-[#8E8E93]
   - Status badge: keep existing color but add dark:bg-opacity-20
   - Stat chip cards: dark:bg-[#1C1C28] dark:border-white/[0.07]
   - Stat values: dark:text-[#F2F2F7]
   - Stat labels: dark:text-[#636366]
   - Calendar container card: dark:bg-[#1C1C28]
   - Month labels: dark:text-[#636366]
   - Calendar separator line: dark:bg-white/[0.06]
   - Action bar at bottom: dark:bg-[#16161E] dark:border-white/[0.06]
   - "Ajouter un congé" button: already navy — add dark glow:
     dark:shadow-[0_4px_12px_rgba(26,47,79,0.4)]
   - "Bloquer" ghost button: dark:border-white/[0.12] dark:text-[#FF6B6B]

C. AddDayOffModal (opened from "Ajouter un congé" in detail panel):
   - Same dark classes as HomeAddDayOffModal (section A above)
   - Apply identically

D. Bottom action bar in EmployeeDetailPanel:
   This is the sticky bar at the bottom with "Ajouter un congé" and "Bloquer" buttons.
   It must have: dark:bg-[#16161E] dark:border-t dark:border-white/[0.06]
   Both buttons must have their dark variants as described above.

For EACH component file:
1. Open the file
2. Find every className string that has a light-mode color
3. Add the corresponding dark: variant right after it
   Example: "bg-white" → "bg-white dark:bg-[#16161E]"
   Example: "text-gray-900" → "text-gray-900 dark:text-[#F2F2F7]"
   Example: "border-gray-100" → "border-gray-100 dark:border-white/[0.06]"
4. For inline style={{ }} objects that use light colors, convert to
   conditional styles using isDark:
   Import useDarkMode in the component:
     import { useDarkMode } from '../hooks/useDarkMode'
     const { isDark } = useDarkMode()
   Then use:
     style={{ background: isDark ? '#1C1C28' : '#FAFAFA' }}

Commit: "fix: dark mode applied to HomeAddDayOffModal, detail panel, and action bar"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 3 — DETAIL PANEL CALENDAR: Correct split
        structure — 20 to 30 then 1 to 19
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Look at Image 1 (the reference from the user):
- It shows AVRIL section with only days 20–30 (11 days)
- Then a separator
- Then MAI section with days 1–19 (19 days)
- Day cells are large (like a real calendar)
- Day-name row (D L M M J V S) above each section
- Clean, spacious cells

This is EXACTLY what the detail panel calendar must look like.

Current problem: the calendar either shows entire months (31 days)
or gets the split wrong.

Fix the split calendar component in EmployeeDetailPanel:

SECTION 1 — "AVRIL" (current month, days 20 to end of month):
  const today = new Date()  // April 25, 2026
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()  // 3 = April

  // Get days 20 to end of current month
  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth)
  const firstHalfDays = []
  for (let d = 20; d <= daysInCurrentMonth; d++) {
    firstHalfDays.push(new Date(currentYear, currentMonth, d))
  }

SECTION 2 — "MAI" (next month, days 1 to 19):
  const nextMonth = currentMonth + 1
  const nextYear = nextMonth > 11 ? currentYear + 1 : currentYear
  const normalizedNextMonth = nextMonth % 12

  const secondHalfDays = []
  for (let d = 1; d <= 19; d++) {
    secondHalfDays.push(new Date(nextYear, normalizedNextMonth, d))
  }

RENDERING:
Render firstHalfDays in a 7-column grid starting at the correct day-of-week offset.
Each day's position in the grid = its day of week (0=Sun placed in last col, or use Mon-first).

Use Monday-first week:
  const getMondayFirstDayOfWeek = (date) => {
    const d = date.getDay()  // 0=Sun, 1=Mon, ..., 6=Sat
    return d === 0 ? 6 : d - 1  // Mon=0, Tue=1, ..., Sun=6
  }

For the first day of each section, add empty cells for the offset:
  const firstDayOffset = getMondayFirstDayOfWeek(sectionDays[0])
  // Render firstDayOffset empty <div /> cells before the first day

Day-name header row above EACH section:
  ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  V (index 4) and S (index 5): color #C7C7CC
  Others: color #8E8E93

CELL SIZE: 40px × 40px (w-10 h-10) — large like a real calendar
CELL STYLE: same as previously defined in Fix 3 of the previous prompt
  (light red tint for day-off, gray for weekend, etc.)

SEPARATOR between sections:
  <div className="my-4 flex items-center gap-3">
    <div className="flex-1 h-px bg-gray-100 dark:bg-white/[0.06]" />
    <span className="text-[10px] uppercase tracking-wider text-gray-400">
      {nextMonthName}
    </span>
    <div className="flex-1 h-px bg-gray-100 dark:bg-white/[0.06]" />
  </div>

Month label for first section:
  <div className="text-[11px] uppercase tracking-wider text-gray-400 mb-2">
    {currentMonthName} — jours {20} à {daysInCurrentMonth}
  </div>

This produces the EXACT layout shown in Image 1:
large cells, correct 20–30 split, day names, separator, 1–19 below.

Commit: "fix: detail panel calendar correct split 20-30 and 1-19 with large cells"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 4 — ADD CONGÉ CALENDAR: Same split structure
        as Fix 3 (20–30 then 1–19)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find AddDayOffModal and HomeAddDayOffModal calendars.

Current problem: these calendars show two full months
(all of April + all of May) instead of the work period split.

Apply the EXACT SAME split logic from Fix 3:
- Section 1: days 20 to end of current month
- Section 2: days 1 to 19 of next month
- Same separator between sections
- Same month labels
- Same day-name header rows
- Same 40px × 40px cell size

The ONLY difference from the detail panel calendar:
these calendars support RANGE SELECTION (click start + click end).

Keep the range selection logic exactly as it was —
just change the days being rendered to use the 20–30 / 1–19 split.

Range selection must work ACROSS both sections:
- User can click day 27 in section 1 as startDate
- Then click day 5 in section 2 as endDate
- Days between them (28, 29, 30, 1, 2, 3, 4, 5) show range highlight

Apply this same split to HomeAddDayOffModal Step 2 calendar.

The day-off color scheme from the previous prompt stays the same:
- Selected start/end: blue gradient #007AFF → #0055D4
- Range middle: light blue tint
- Existing congé: light red tint with red text
- Weekend: #F2F2F7 gray, not clickable
- Past days: opacity 0.6, not clickable
- Normal: white/gray-50

Commit: "fix: add congé calendars use 20-30 and 1-19 split matching detail panel"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After all 4 fixes:

1. Run: cd client && npm run dev
2. Fix any console errors before finishing

3. Verify DARK MODE:
   - Click the dark mode toggle button
   - The entire UI switches to dark IMMEDIATELY — no reload needed
   - Refresh the page — dark mode is still active (remembered)
   - Click toggle again — switches back to light immediately
   - HomeAddDayOffModal (FAB button): dark bg, dark inputs, dark calendar
   - EmployeeDetailPanel: dark background, dark calendar, dark action bar
   - AddDayOffModal: dark bg, dark inputs, dark calendar cells
   - ALL other components already dark from previous work stay dark

4. Verify DETAIL PANEL CALENDAR (compare with Image 1):
   - Shows "AVRIL" label then days 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30
   - Day-name row: L M M J V S D above the grid
   - Cells are large: 40px × 40px
   - Vendredi and Samedi cells are gray and not clickable
   - Then separator line with "MAI" label
   - Then days 1 through 19 of May in the same grid style
   - Day-off dates show light red tint with red number
   - Today shows blue ring

5. Verify ADD CONGÉ CALENDARS:
   - Same split: 20–30 then 1–19
   - Same large cells
   - Same day-name rows
   - Range selection works across both sections
   - Clicking day in April then day in May creates a valid range

6. Final commit: "fix: dark mode instant, missing dark classes added, calendars use correct 20-30 split"