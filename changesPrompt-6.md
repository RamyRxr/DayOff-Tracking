Read CLAUDE.md in this project.
You are fixing specific problems in the frontend only.
Do NOT touch any backend files.
Only modify files inside client/src/
Work through each fix in order. Commit after each one.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 1 — ACCUEIL: Add more space between stat pills
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the 4 stat pills row on the home page
(Total employés / Actifs / À risque / Bloqués).

Change the gap between pills from whatever it currently is to gap-4 (16px).
Each pill must have a minimum width of 120px so they never feel cramped.
The container holding the pills must have px-2 padding on each side.
Add a subtle 1px divider between each pill:
  after each pill except the last, add a vertical line:
  <div className="w-px h-8 bg-gray-100 self-center" />

Commit: "fix: more spacing between stat pills on home page"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 2 — DETAIL PANEL CALENDAR: Day number fills
        the square + gap between month halves
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the split calendar inside EmployeeDetailPanel
(the two mini-calendars showing days 20–30 and 1–19).

A. DAY NUMBER FILLS THE SQUARE:
Each day cell must be a full square where the number is centered
and the background/hover/color fills the entire square — not just a circle.
- Cell: w-8 h-8 (32px × 32px), rounded-lg, flex items-center justify-center
- Font: text-[13px] font-medium
- The colored background (day-off red, weekend gray, today blue ring)
  must fill the full rounded-lg square, not just a small circle inside it
- Remove any inner circle or dot styling — the cell itself IS the indicator

B. GAP BETWEEN THE TWO MONTH SECTIONS:
Between the April section (days 20–30) and the May section (days 1–19),
add a visible gap and a subtle month separator:
- Add mb-4 to the bottom of the first calendar grid
- Add a horizontal line: <div className="w-full h-px bg-gray-100 my-3" />
- Add mt-2 to the top of the second calendar grid
- Each calendar section must show its month name as a label above the grid:
  "Avril" and "Mai" in 11px uppercase tracking-wider text-gray-400
  so the two months are clearly identified

Commit: "fix: calendar day cells fill full square, gap and labels between month halves"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 3 — ADD CONGÉ CALENDAR: Fancy Apple-style
        colors for day-off cells
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the calendar picker inside AddDayOffModal (the one where admin picks dates).

Change the color of selected / day-off cells to use Apple-style shiny gradients:

SELECTED START / END DAY:
  style={{
    background: 'linear-gradient(145deg, #007AFF, #0055D4)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 8px rgba(0,122,255,0.4)',
    color: 'white',
    fontWeight: 600
  }}

SELECTED RANGE (days between start and end):
  style={{
    background: 'linear-gradient(145deg, rgba(0,122,255,0.12), rgba(0,122,255,0.08))',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
    color: '#0055D4',
    fontWeight: 500
  }}

ALREADY USED CONGÉ DAYS (from existing records — disabled):
  style={{
    background: 'linear-gradient(145deg, #FF3B30, #C0392B)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.15)',
    color: 'white',
    fontWeight: 600,
    cursor: 'not-allowed',
    opacity: 0.85
  }}

TODAY (if not selected):
  style={{
    background: 'linear-gradient(145deg, rgba(0,122,255,0.08), rgba(0,122,255,0.04))',
    boxShadow: '0 0 0 1.5px #007AFF',
    color: '#007AFF',
    fontWeight: 600
  }}

WEEKEND (Friday + Saturday — disabled):
  style={{
    background: '#F2F2F7',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
    color: '#C7C7CC',
    cursor: 'not-allowed'
  }}

NORMAL HOVERABLE DAY:
  Default: background white/gray-50, text gray-800
  Hover: { background: '#F2F2F7', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)' }

Commit: "fix: Apple-style shiny gradient colors on add congé calendar"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 4 — ACCUEIL: Update in real time after adding
        congé, latest changed employee on top
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the home page component and the employees list.

After a congé is successfully added (from ANY modal — FAB modal or detail panel):
1. Call refetch() from useEmployees() to reload the list from the API
2. The API already returns employees sorted by updatedAt DESC
   so the most recently modified employee will appear at the top automatically
3. Make sure the onSuccess callback from AddDayOffModal and HomeAddDayOffModal
   calls the parent's refetch function:
   - In EmployeeDetailPanel: pass onUpdate prop down, call it after success
   - In HomePage: pass refetch as onUpdate to EmployeeDetailPanel
   - In HomeAddDayOffModal: call onSuccess which calls refetch in HomePage

Make sure useEmployees hook has a refetch function:
  const [employees, setEmployees] = useState([])
  const refetch = async () => {
    const data = await getEmployees()
    setEmployees(data?.data || [])
  }
  // call refetch() after any mutation

If useEmployees already has refetch, just make sure it is wired correctly
through all the component props to the modal success callbacks.

Commit: "fix: home page refetches and re-sorts after congé is added"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 5 — DETAIL PANEL CALENDAR: Click on a day-off
        cell to see day-off details in a popup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the split calendar in EmployeeDetailPanel.

When admin clicks on a day cell that is a day-off (red cell), open a small
details popup showing that day-off record's information.

POPUP COMPONENT (DayOffDetailsPopup.jsx):
Create client/src/components/DayOffDetailsPopup.jsx

The popup is a small floating card that appears near where the user clicked:
- Position: fixed, positioned near the clicked cell using click coordinates
  Adjust so it never goes off-screen (check window width/height)
- Size: 280px wide, auto height
- Style:
  bg-white rounded-2xl p-4
  boxShadow: '0 0 0 1px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.16)'
  backdrop-filter: none (fully opaque)
- Close: clicking outside the popup closes it
  (add a transparent fixed overlay behind it: fixed inset-0 z-40)
- The popup itself has z-50

Popup content:
- Header row:
  • Small red circle (8px) + "Congé" label in 11px uppercase gray
  • × button top-right (closes popup)
- Duration row:
  • Calendar icon (Lucide CalendarDays, 14px, gray)
  • "{startDate} → {endDate}" formatted as "12 Avr – 16 Avr 2026"
  • Below: "{X} jours ouvrables · {Y} jours calendaires"
    Calculate from the dayOff record's startDate and endDate
- Type row:
  • Tag icon (Lucide Tag, 14px, gray)
  • dayOff.type (ex: "Congé annuel")
- Reason row (only if dayOff.reason exists):
  • MessageSquare icon (14px, gray)
  • dayOff.reason text in 13px
- File row (only if dayOff.justification exists):
  • Paperclip icon (14px, gray)
  • Filename truncated to 24 chars
  • "Voir le fichier" link button → opens the file URL in a new tab
    href={`http://localhost:3001${dayOff.justification}`}
- If no file: show "Aucun justificatif" in 12px gray

HOW TO WIRE IT:
In the split calendar component:
1. Get the employee's daysOff array (already available in EmployeeDetailPanel)
2. For each day cell being rendered, check if that date falls within any daysOff record:
   const dayOffRecord = daysOff.find(d =>
     !isBefore(day, startOfDay(new Date(d.startDate))) &&
     !isAfter(day, startOfDay(new Date(d.endDate)))
   )
3. If dayOffRecord exists: cell is clickable, on click:
   setSelectedDayOff(dayOffRecord)
   setPopupPosition({ x: event.clientX, y: event.clientY })
4. Render the popup when selectedDayOff is not null:
   {selectedDayOff && (
     <DayOffDetailsPopup
       dayOff={selectedDayOff}
       position={popupPosition}
       onClose={() => setSelectedDayOff(null)}
     />
   )}

Commit: "feat: click day-off cell in detail calendar to see day-off details popup"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 6 — ADD CONGÉ MODAL: After PIN confirm,
        redirect to home and refresh
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find AddDayOffModal (the one opened from EmployeeDetailPanel).

After the PIN is verified and admin clicks "Confirmer le congé":
1. Submit the congé to the API
2. Wait for the API to respond with success
3. Close the modal
4. Show a success toast: "Congé ajouté avec succès"
5. Navigate to home page: use useNavigate() from react-router-dom
   const navigate = useNavigate()
   navigate('/')
6. The home page must refetch when it mounts or when it receives focus:
   In HomePage, add:
   useEffect(() => {
     refetch()
   }, []) // refetch on mount
   This ensures the home page is always fresh when navigated to

Make sure navigate('/') is called AFTER the API call succeeds, not before.
If the API call fails, stay on the current page and show an error toast.

Commit: "fix: after adding congé, navigate to home page and refresh employee list"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 7 — SIDEBAR: Move dark/light mode button
        to left of language selector
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the top bar component.
Currently the dark/light mode button is somewhere in the sidebar.
Move it to the top bar, placed immediately to the LEFT of the language selector.

The order in the top bar right section must be:
  [period label] ......... [dark/light toggle] [language selector] [notification bell]

Dark/light toggle button:
- 32px × 32px, rounded-lg
- Light mode: Moon icon (Lucide Moon, 16px), bg-gray-100 hover:bg-gray-200
- Dark mode: Sun icon (Lucide Sun, 16px), dark:bg-gray-700 dark:hover:bg-gray-600
- Transition: all 200ms
- Tooltip on hover: "Mode sombre" / "Mode clair"

Remove the dark mode toggle from the sidebar entirely.
If it was next to the logo in the sidebar, remove it from there.

Commit: "fix: move dark/light button to top bar, left of language selector"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 8 — BLOCK MODAL: Fix React Hooks order error
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The error is:
"React has detected a change in the order of Hooks called by BlockEmployeeModal.
Previous render: 8 hooks. Next render: 9 hooks (useEffect added)."

This means there is a conditional hook call or a hook inside an if statement.

Open client/src/components/BlockEmployeeModal.jsx

FIND AND FIX the hooks order violation:

Rule: ALL hooks must be called at the top of the component, unconditionally,
before any return statement or if/else block.

Common mistakes to look for and fix:

WRONG:
  if (!employee) return null   // ← early return BEFORE hooks
  const [state, setState] = useState(...)  // ← hook AFTER early return

RIGHT:
  const [state, setState] = useState(...)  // ← hooks FIRST
  const [step, setStep] = useState(1)
  // ... ALL hooks here ...
  if (!employee) return null  // ← early return AFTER all hooks

WRONG:
  const [step, setStep] = useState(1)
  if (step === 2) {
    useEffect(() => { ... }, [])  // ← hook inside condition
  }

RIGHT:
  const [step, setStep] = useState(1)
  useEffect(() => {
    if (step === 2) { ... }  // ← condition INSIDE hook
  }, [step])

Fix BlockEmployeeModal.jsx by:
1. Moving ALL useState calls to the very top of the component function
2. Moving ALL useRef calls right after useState calls
3. Moving ALL useEffect calls after useRef calls
4. Making sure NO hook is inside any if/else, loop, or nested function
5. The early return (if !employee return null) must come AFTER all hooks

After fixing, also check UnblockModal.jsx for the same pattern and fix it too.

Commit: "fix: resolve React hooks order violation in BlockEmployeeModal and UnblockModal"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 9 — EMPLOYEES TAB: Fix filter selectors style,
        update congé column, fix block threshold
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the Employés page (the full employee table).

A. FILTER SELECTOR STYLE:
Find the filter dropdowns (Département filter, Statut filter).
They are currently plain <select> boxes.
Replace them with the same CustomSelect component used for type de congé
in the AddDayOffModal — the styled dropdown with card-row options,
checkmark on selected, smooth open/close animation.

If CustomSelect.jsx does not exist as a reusable component, create it:
client/src/components/CustomSelect.jsx

Props: { options, value, onChange, placeholder }
options: array of { value: string, label: string }
Style matches the login page admin selector exactly:
- Trigger button: Apple-style warm gray fill, inner shadow, rounded-xl
- Dropdown panel: white bg (fully opaque), rounded-2xl, ambient shadow
- Each option row: hover bg-gray-50, selected shows checkmark right
- Opens with fade + translateY animation 150ms

Use CustomSelect for:
- Département filter on Employés page
- Statut filter on Employés page
- Type de congé in AddDayOffModal (replace if not already using it)
- Motif in BlockEmployeeModal
- Motif in UnblockModal

B. CONGÉ COLUMN — UPDATE VALUES AND FORMAT:
The congé column in the employees table must show: "X / 15"
NOT "X / 30" — the max days off before block is 15, not 30.

Calculate X from the employee's daysUsed value returned by the API.
Display as: "{daysUsed} / 15 jours"
Color logic:
- 0 to 10: text-gray-700 (normal)
- 11 to 13: text-amber-600 (getting close)
- 14+: text-red-600 (at risk or over)

C. LIVE UPDATES:
The employees list must refetch when:
- A congé is added (useEmployees refetch is called)
- An employee is blocked or unblocked
Make sure all mutation callbacks in the table call refetch()
so the congé column values stay current.

D. BLOCK BUTTON THRESHOLD:
The "Bloquer" button on each employee row (in the Actions column)
and the block button in EmployeeDetailPanel must:
- ONLY be enabled (clickable) when employee.daysUsed >= 15
  (meaning the employee has taken 15 or more days off)
- When daysUsed < 15: button is visible but disabled with opacity-40 and cursor-not-allowed
- Tooltip on disabled button: "Le blocage est possible après 15 jours de congé"
- When employee is already blocked: show "Débloqué" button instead

Commit: "fix: employees tab — custom filter selectors, congé X/15, block threshold at 15"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 10 — BLOCKED TAB: Fix unblock button white
          screen and hook error
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the Bloqués page (blocked employees tab).
The "Débloquer" button opens a white screen with a hooks error.

Apply the SAME fix as Fix 8 to UnblockModal.jsx:
1. Move ALL hooks to the very top — no conditional hooks
2. Early return (if !block) comes AFTER all hooks
3. Check for any useEffect inside conditions and move the condition inside

Also check the button wiring in the Bloqués page:
- Find the "Débloquer" button in each table row
- Make sure it calls: setSelectedBlock(blockRecord); setShowUnblock(true)
- Make sure UnblockModal is rendered:
  {showUnblock && selectedBlock && (
    <UnblockModal
      block={selectedBlock}
      onClose={() => { setShowUnblock(false); setSelectedBlock(null) }}
      onSuccess={() => { setShowUnblock(false); setSelectedBlock(null); refetch() }}
    />
  )}
- Make sure selectedBlock contains the full block object with:
  id, employeeId, employee (with name, matricule), reason, createdAt, admin (with name)

Commit: "fix: unblock button in blocked tab — fix hooks error, wire modal correctly"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 11 — LOGIN PAGE: Add dark/light mode button
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the login page component.

Add the dark/light mode toggle button to the login page.
Best position: top-right corner of the page, fixed position.

  <div className="fixed top-4 right-4 z-50">
    <button
      onClick={toggleDarkMode}
      className="w-9 h-9 flex items-center justify-center
                 rounded-xl bg-white/80 dark:bg-gray-800/80
                 backdrop-blur-sm border border-gray-200
                 dark:border-gray-700 shadow-sm
                 hover:shadow-md transition-all duration-200"
      title={isDark ? 'Mode clair' : 'Mode sombre'}>
      {isDark
        ? <Sun size={16} className="text-amber-500" />
        : <Moon size={16} className="text-gray-600" />}
    </button>
  </div>

Import useDarkMode hook (already exists from previous work):
  import { useDarkMode } from '../hooks/useDarkMode'
  const { isDark, toggle: toggleDarkMode } = useDarkMode()

Import icons: import { Sun, Moon } from 'lucide-react'

The login card itself must also respect dark mode:
- Card: dark:bg-gray-900 dark:border-gray-800
- Input fields: dark:bg-gray-800 dark:text-white dark:border-gray-700
- Labels: dark:text-gray-300
- Background: dark:bg-gray-950

Commit: "feat: add dark/light mode button to login page"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After all fixes:
1. Run: cd client && npm run dev
2. Fix any console errors before finishing
3. Verify each fix:

   STAT PILLS: visible gap and dividers between each pill
   DETAIL CALENDAR: day cells fill the full square,
     clear gap and month labels between the two halves
   ADD CONGÉ CALENDAR: blue gradient on selected, red on existing, shiny
   HOME REFRESH: after adding congé, home page updates, changed employee on top
   DAYOFF POPUP: clicking red cell in detail calendar shows popup
     with duration, type, reason, file link
   CONGÉ REDIRECT: after PIN confirm, navigate to home, list is fresh
   DARK MODE BUTTON: appears in top bar left of language selector
     AND on login page top-right corner
   BLOCK MODAL: no more hooks error, opens correctly
   EMPLOYEES TAB: filter dropdowns use CustomSelect style,
     congé column shows X/15, block button disabled until 15 days
   UNBLOCK BUTTON: works, no white screen, modal opens correctly

4. Final commit: "fix: stat spacing, calendar UX, congé flow, hooks errors, block threshold"