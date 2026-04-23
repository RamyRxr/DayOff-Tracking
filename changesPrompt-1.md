Read CLAUDE.md in this project. You are fixing and improving the frontend UI.
Do NOT touch any backend files. Do NOT touch any API or hook files.
Only modify files in client/src/.

Work through each fix below completely before moving to the next.
Commit after each section with a descriptive message.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 1 — LOGIN PAGE: Admin selector style
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the login page component and the admin selector (the dropdown/list where admin is chosen).

Replace the current select element style with a custom dropdown:
- Each admin option displayed as a card row, not a plain <select>
- Card row contains: avatar circle (initials, warm gray bg) + admin name bold + role in small gray below
- Selected admin: white bg, navy border 0.5px, soft ambient shadow, checkmark icon on right
- Unselected admin: warm gray bg (#F2F2F7), no border, subtle hover (bg lightens, shadow appears)
- Dropdown opens downward, frosted glass container (bg white/90, backdrop-blur-xl)
- Smooth open/close animation: opacity 0→1 + translateY(-4px)→(0) over 150ms ease-out
- Close on outside click
- Rounded-xl container, 1px border rgba(0,0,0,0.06), ambient shadow

Commit: "fix: improve admin selector style on login page"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 2 — HOME PAGE: Hover animation delay on Détails & + Congé buttons
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the employee card component and the "Détails" and "+ Congé" buttons.

Current behavior: buttons appear immediately on hover.
New behavior:
- Buttons are hidden by default (opacity-0, pointer-events-none)
- On card hover: buttons appear with a 100ms delay before starting to fade in
- Fade in duration: 150ms ease-out (opacity 0→1)
- On card mouse-leave: buttons disappear immediately with no delay (150ms fade out, 0ms delay)
- Use Tailwind: group, group-hover:opacity-100, transition-opacity, duration-150, delay-100
- Do NOT use inline styles — Tailwind only

Commit: "fix: add hover delay to employee card action buttons"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 3 — HOME PAGE: Stat cards as interactive filters
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the 4 stat cards at the top of the home page (Total, Actifs, À risque, Bloqués).

Make them interactive filters:
- Add a useState activeFilter with values: null | 'actif' | 'a_risque' | 'bloque'
- "Total employés" card: clicking it clears the filter (sets to null) — shows all employees
- "Actifs" card: clicking sets filter to 'actif'
- "À risque" card: clicking sets filter to 'a_risque'
- "Bloqués" card: clicking sets filter to 'bloque'

Active card visual state:
- Add cursor-pointer to all cards
- Active card: shadow deepens, scale-[1.02] transform, navy bottom border 2px
- Inactive cards: reduced opacity (opacity-70) when a filter is active
- Smooth transition-all duration-200 on all cards

Employee list filtering:
- When filter is active, show only employees matching that status
- Derive filtered list from existing employees array — no new API calls
- Show count label below cards: "Affichage: 4 employés à risque" when filtered
- Show all employees when filter is null

Commit: "feat: make stat cards interactive filters on home page"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 4 — FAB BUTTON: Hide when not on Accueil page
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the floating "+" FAB button (add employee button).

Current behavior: visible everywhere.
New behavior:
- Only show FAB when the current route is the Accueil/Home page
- Use useLocation() from react-router-dom to get current path
- If path is NOT the home route: FAB is hidden (do not render it at all)
- If a modal (Add Day Off, Employee Detail panel, Block modal) is open:
  hide the FAB with opacity-0 pointer-events-none
- Pass isAnyModalOpen boolean prop down to wherever FAB is rendered
  or use a context/state that tracks whether any overlay is currently open

Commit: "fix: hide FAB button when not on home page or modal is open"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 5 — NOTIFICATIONS: Active bell with real alerts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the notification bell icon in the top bar.

Build a working notification system:

1. Generate notifications from existing employee data:
   - For each employee with status 'a_risque': create a notification
     "⚠ [Name] est à risque — [X] jours restants"
   - For each employee with status 'bloque': create a notification
     "🚫 [Name] a été bloqué ce mois"
   - Derive these from the employees array already loaded — no new API calls

2. Bell icon:
   - If notifications exist: show red dot badge with count (max "9+")
   - Badge: absolute positioned, top-right of bell, 18px circle, red bg, white text 10px
   - Bell icon has a subtle pulse animation when unread notifications exist (animate-pulse on the dot only, not the bell)

3. Notification dropdown:
   - Opens on bell click, closes on outside click or second bell click
   - Frosted glass panel: bg white/90, backdrop-blur-xl, rounded-2xl, ambient shadow
   - Width: 320px, positioned below bell aligned to right edge
   - Smooth open animation: opacity 0→1 + translateY(-8px)→(0) 200ms ease-out
   - Header: "Notifications" label left + "Tout marquer lu" text button right
   - Each notification row:
     • Left: status icon (⚠ amber circle for à risque, 🚫 red circle for bloqué)
     • Center: notification message in 13px + employee matricule in 11px gray below
     • Right: small gray timestamp or "Aujourd'hui"
     • 0.5px bottom border between rows
     • Hover: row bg shifts to rgba(0,0,0,0.02)
   - Empty state: centered "Aucune notification" in gray
   - "Tout marquer lu" clears the red dot badge (marks all as read in local state)

Commit: "feat: implement notification bell with at-risk and blocked alerts"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 6 — EMPLOYEE DETAIL PANEL: Show email, phone, start date
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the EmployeeDetailPanel component.

Add these fields to the employee info header section:
- Email: shown with a mail icon (Lucide Mail icon), format: "prenom.nom@naftal.dz"
  If employee.email exists in data use it, otherwise generate it from name
- Phone: shown with a phone icon (Lucide Phone icon), format: "+213 XX XX XX XX"
  If employee.phone exists use it, otherwise show "—"  
- Date de début: shown with a calendar icon (Lucide Calendar icon)
  Use employee.createdAt or employee.startDate formatted as "DD MMM YYYY" using date-fns format()
  Example: "12 Mars 2021"

Layout: add these as a row of 3 info pills below the existing meta pills row
Each pill: icon (14px, gray) + text (12px, gray), warm gray bg, rounded-lg, px-3 py-1.5
Row has gap-2, flex-wrap

Commit: "feat: add email, phone, start date to employee detail panel"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 7 — ADD DAY OFF MODAL: Calendar date picker improvements
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the AddDayOffModal and its date range picker / calendar component.

Apply these fixes:

A. AUTO-SELECT CURRENT YEAR:
   - The year in the date picker must default to the current year (new Date().getFullYear())
   - Admin can still change it manually
   - Never show a blank or wrong year on open

B. DISABLE PAST DAYS IN CALENDAR:
   - Any day before today must be visually disabled:
     • Lighter text (text-gray-300)
     • No hover effect
     • cursor-not-allowed
     • Cannot be selected (onClick does nothing)
   - "Today" is selectable (not disabled)
   - Use: const today = startOfDay(new Date()) and compare with isBefore(day, today)

C. DISABLE ALREADY-USED CONGÉ DAYS:
   - Fetch the employee's existing day-off dates (from useDaysOff hook already loaded)
   - Build a Set of all dates that already belong to an existing day-off range
   - In the calendar, any date in that Set:
     • Show with soft amber/20 bg tint
     • cursor-not-allowed
     • Cannot be selected as start or end of new range
     • Tooltip on hover: "Congé déjà enregistré"

Commit: "fix: improve date picker — auto year, disable past days, disable existing congé days"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 8 — ADMIN PIN: Use keyboard input instead of on-screen number buttons
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the AdminPinEntry component.

Current behavior: has clickable number buttons (0-9) on screen.
New behavior: keyboard-only input.

- Remove all on-screen number buttons entirely
- The 4 PIN boxes are now real <input type="password"> or <input type="text"> elements
  but styled to look like the existing box design
- Auto-focus the first box when component mounts or admin is selected
- On digit typed: fill current box + auto-advance focus to next box
- On Backspace: clear current box + move focus back to previous box
- Only accept digits 0-9 — ignore all other keys
- On 4th digit entered: auto-submit (trigger verification)
- Paste support: if admin pastes 4 digits, fill all boxes and auto-submit
- Each box:
  • type="password" to mask input as •
  • maxLength={1}
  • inputMode="numeric"
  • pattern="[0-9]*"
  • textAlign center, fontSize 20px
  • Same visual style as before (warm gray fill, inner shadow, rounded-xl)
  • Active box gets navy border

Commit: "fix: replace PIN number buttons with keyboard input in AdminPinEntry"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 9 — UNBLOCK: Add Débloquer modal/window
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the blocked employees page and employee detail panel.

Build a proper UnblockModal component (separate file: UnblockModal.jsx):

Modal structure (centered, same glass style as other modals):
- Header:
  • Green unlock icon (Lucide Unlock) in muted green
  • Title: "Débloquer l'Employé"
  • Subtitle: "L'employé pourra reprendre normalement ses activités"
  • Employee name + matricule row

- Employee summary card (inset, inner shadow):
  • Motif du blocage: [reason]
  • Date de blocage: [formatted date]
  • Bloqué par: [admin name]

- Form:
  1. Motif du déblocage (required dropdown):
     • Erreur administrative
     • Justification acceptée
     • Décision hiérarchique
     • Autre
  2. Description (optional textarea): "Remarques sur le déblocage..."
  3. AdminPinEntry component (same as other modals)

- Footer:
  • "Annuler" ghost button left
  • "Confirmer le déblocage" green filled button right (#2D8653)
  • Disabled until PIN verified
  • Micro text: "Le statut de l'employé sera mis à jour immédiatement"

Wire it up:
- In BlockedPage: "Débloquer" button opens this modal (replace the inline popover)
- In EmployeeDetailPanel: "Débloquer" button opens this modal
- On confirm: call unblock from useBlocks hook
- On success: close modal + show success toast + refetch data

Commit: "feat: build UnblockModal component and wire up to blocked page and detail panel"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 10 — BLOCK MODAL: Scroll animation (slides up from bottom)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the BlockEmployeeModal component.

Change the open/close animation:
- On open: modal slides UP from bottom + fades in
  translateY(40px)→translateY(0) + opacity(0)→opacity(1)
  Duration: 250ms, easing: cubic-bezier(0.16, 1, 0.3, 1) (spring-like)
- On close: modal slides DOWN + fades out
  translateY(0)→translateY(40px) + opacity(1)→opacity(0)
  Duration: 200ms, easing: ease-in
- Backdrop: fades in/out separately over 200ms
- Use CSS transitions or Headless UI Transition component
- Same animation applies to UnblockModal built in FIX 9

Commit: "fix: add slide-up animation to Block and Unblock modals"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 11 — CONGÉ BUTTON: Fix broken submit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the AddDayOffModal and the "+ Congé" button on employee cards.

Debug and fix the full flow:

1. Check the "+ Congé" button on employee cards:
   - Verify it opens AddDayOffModal and passes the correct employeeId
   - If employeeId is undefined or null, fix the prop passing

2. Check the AddDayOffModal submit handler:
   - Verify it calls addDayOff() from useDaysOff hook
   - Verify it passes: { employeeId, startDate, endDate, type, reason }
   - startDate and endDate must be ISO strings (use format(date, 'yyyy-MM-dd'))
   - Log the payload to console before sending to verify it's correct

3. Check the useDaysOff hook addDayOff function:
   - Verify it calls POST /api/daysoff with the correct body
   - Verify it handles the response and updates state
   - Verify error handling shows a French error message

4. After successful submit:
   - Close the modal
   - Refetch the employee data to update the day count and calendar
   - Show success toast: "Congé ajouté avec succès"

5. The confirm button must be:
   - Disabled when: no dates selected, or PIN not verified
   - Enabled and clickable when: dates selected AND PIN verified
   - Fix any condition that keeps it permanently disabled

Commit: "fix: repair congé button submit flow end to end"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AFTER ALL FIXES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Run the dev server and verify each fix visually works
- Make sure no TypeScript/ESLint errors remain
- Do a final commit: "fix: ui improvements — login, home filters, notifications, modals, congé flow"