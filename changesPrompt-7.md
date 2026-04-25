Read CLAUDE.md in this project.
You are fixing specific UI problems in the frontend only.
Do NOT touch any backend files.
Only modify files inside client/src/
Work through each fix in order. Commit after each one.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 1 — TOP BAR: Reduce gap between dark mode
        toggle, language selector, and notification bell
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the top bar component and the right section that contains:
dark/light toggle → language selector → notification bell

Current problem: too much space between these 3 elements.

Fix:
- The container holding these 3 elements must use:
  flex items-center gap-1
  (gap-1 = 4px between elements, NOT gap-2, gap-3, or gap-4)
- Each button (dark toggle, language selector trigger, bell) must have
  no extra margin: remove any mx-*, ml-*, mr-* classes from individual buttons
- The 3 elements must feel like a tight compact group on the right side of the top bar
- Do NOT change the size or style of any button — only remove the excess spacing

Commit: "fix: reduce gap between top bar icon buttons to gap-1"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 2 — DETAIL PANEL CALENDAR: Add day-name row,
        make cells larger like a real calendar
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the split calendar component inside EmployeeDetailPanel
(the two mini-calendars showing the work period: days 20–30 and 1–19).

A. ADD DAY-NAME HEADER ROW:
Above the day number grid for EACH of the two calendar sections,
add a row showing the day-name abbreviations:
  D   L   M   M   J   V   S
  (Dimanche, Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi)

Style for the day-name row:
- grid grid-cols-7, same width as the day grid below it
- Each cell: text-[10px] font-medium text-gray-400 text-center py-1
- V (Vendredi) and S (Samedi) cells: text-gray-300 (lighter, they are weekend)
- A subtle 0.5px border-b border-gray-100 separates the header row from the day grid

B. MAKE DAY CELLS LARGER:
Change day cell size from current (probably 28px or 32px) to 36px × 36px.
- Each cell: w-9 h-9 (36px × 36px), rounded-lg
- Font: text-[13px] font-medium
- The colored background fills the entire cell (not just a small dot inside)
- grid gap-0.5 between cells

The calendar must feel like a real compact calendar, not tiny boxes.

C. KEEP the gap and month labels between the two sections from the previous fix:
- "Avril" and "Mai" labels in 11px uppercase gray above each section
- Horizontal divider line between the two sections
These were already added — make sure they still exist after this fix.

Commit: "fix: detail panel calendar — day name row, larger 36px cells"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 3 — ALL CALENDARS: Make every calendar in the
        app use the same style as the add congé calendar
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The calendar inside the "Ajouter un congé" modal (AddDayOffModal)
looks great. Every other calendar in the app must match it exactly.

First, identify ALL calendar components in the project:
1. The split calendar in EmployeeDetailPanel (days 20–30 + days 1–19)
2. The calendar picker in HomeAddDayOffModal (the 3-step modal from FAB button)
3. Any other calendar component found in the codebase

For EACH of these calendars, apply the EXACT same visual style as AddDayOffModal:

CELL COLORS (copy exactly from AddDayOffModal):

Selected start / end day:
  style={{
    background: 'linear-gradient(145deg, #007AFF, #0055D4)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 8px rgba(0,122,255,0.4)',
    color: 'white',
    fontWeight: 600
  }}

Selected range middle:
  style={{
    background: 'linear-gradient(145deg, rgba(0,122,255,0.12), rgba(0,122,255,0.08))',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
    color: '#0055D4',
    fontWeight: 500
  }}

Already used / existing congé days (red, disabled):
  style={{
    background: 'linear-gradient(135deg, #FF3B30, #C0392B)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.15)',
    color: 'white',
    fontWeight: 600,
    cursor: 'not-allowed',
    opacity: 0.85
  }}

Today (not selected):
  style={{
    background: 'linear-gradient(145deg, rgba(0,122,255,0.08), rgba(0,122,255,0.04))',
    boxShadow: '0 0 0 1.5px #007AFF',
    color: '#007AFF',
    fontWeight: 600
  }}

Weekend (Friday + Saturday — disabled):
  style={{
    background: '#F2F2F7',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
    color: '#C7C7CC',
    cursor: 'not-allowed'
  }}

Normal day (default):
  Default: { background: '#FAFAFA', color: '#1C1C1E' }
  Hover:   { background: '#F2F2F7',
             boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)' }

CELL SIZE for all calendars: 36px × 36px, rounded-lg
FONT: 13px

REFACTORING RECOMMENDATION:
If there are 3+ calendars using the same logic, extract a shared component:
  client/src/components/CalendarPicker.jsx
Props:
  - currentMonth (Date)
  - onMonthChange (fn)
  - startDate, endDate (for range selection)
  - onDayClick (fn)
  - disabledDates (Set of 'yyyy-MM-dd' strings — already used congé days)
  - mode: 'range' | 'readonly' (readonly = detail panel, range = picker)
  - markedDates (for detail panel — dates to show as red/taken)

Use CalendarPicker everywhere to avoid duplicating logic.
If refactoring is too risky, at minimum copy the exact cell styles to all calendars.

Commit: "fix: all calendars now use same Apple-style colors as add congé modal"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 4 — HOME ADD CONGÉ MODAL (3-step FAB modal):
        Replace Step 2 calendar with CalendarPicker
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find HomeAddDayOffModal.jsx (the 3-step modal opened by the FAB "+" button).
In Step 2 of this modal, there is a calendar for picking dates.

Current problem: the calendar in this modal does not match the AddDayOffModal calendar.

Fix:
Replace whatever calendar is currently in Step 2 of HomeAddDayOffModal
with the EXACT SAME calendar component used in AddDayOffModal.

Either:
A. If CalendarPicker.jsx was created in Fix 3: import and use it here with the same props
B. If not refactored: copy the entire calendar JSX and logic from AddDayOffModal Step 1
   directly into HomeAddDayOffModal Step 2

The calendar in HomeAddDayOffModal Step 2 must:
- Show the same Apple-style gradient colors
- Have the same 36px cells
- Have the same day-name header row (D L M M J V S)
- Disable past days (before today)
- Disable weekend days (Fri + Sat)
- Disable already-used congé dates for the selected employee
  (these come from the employee's existing daysOff records — pass them to the calendar)
- Support range selection (click start → click end)
- Show the auto-calculated summary below: "X jours ouvrables · Y jours calendaires"
- Show sandwich warning if the range spans a weekend

The calendar must be identical to the one in AddDayOffModal — same look, same behavior.

Commit: "fix: HomeAddDayOffModal step 2 uses same calendar as AddDayOffModal"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 5 — BLOCK MODAL: Always show footer buttons,
        but disable "Suivant" with tooltip when
        employee cannot be blocked yet
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find BlockEmployeeModal.jsx.

Current problem: the "Annuler" and "Suivant" footer buttons are hidden
because of the IntersectionObserver scroll-to-bottom requirement.

Fix: REMOVE the IntersectionObserver / scroll-to-bottom logic from BlockEmployeeModal.
The footer must ALWAYS be visible in this modal — never hidden.

Replace the IntersectionObserver pattern with this:
- Footer is always visible (flex-shrink-0, always rendered, full opacity)
- "Annuler" button: always clickable, closes modal
- "Suivant →" button behavior depends on whether employee CAN be blocked:

  Check: canBlock = employee.daysUsed >= 15

  IF canBlock is TRUE (employee has 15+ days off):
  - Button is enabled when a reason is selected
  - Normal navy style: bg-[#1B3A6B] text-white, cursor-pointer
  - Disabled state (no reason selected yet): opacity-40, cursor-not-allowed

  IF canBlock is FALSE (employee has fewer than 15 days off):
  - Button is ALWAYS disabled: opacity-40, cursor-not-allowed
  - The button still renders and is visible — it just cannot be clicked
  - On hover: show a tooltip message
    Tooltip: small floating label above the button
    Text: "Blocage impossible — l'employé n'a pas atteint 15 jours de congé"
    Style:
      absolute, bottom-full mb-2, left-1/2 -translate-x-1/2
      bg-gray-900 text-white text-[11px] rounded-lg px-3 py-1.5
      whitespace-nowrap pointer-events-none
      opacity-0 group-hover:opacity-100 transition-opacity duration-150
    Wrap the button in: <div className="relative group">

Make the button wrapper and tooltip:
  <div className="relative group">
    <button
      disabled={!canBlock || !selectedReason}
      onClick={canBlock && selectedReason ? () => setStep(2) : undefined}
      className={`px-5 py-2.5 text-[13px] font-medium text-white rounded-xl transition-all
        ${canBlock && selectedReason
          ? 'bg-[#1B3A6B] cursor-pointer hover:bg-[#152d5a]'
          : 'bg-[#1B3A6B] opacity-40 cursor-not-allowed'}`}>
      Suivant →
    </button>
    {!canBlock && (
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2
                      bg-gray-900 text-white text-[11px] rounded-lg px-3 py-1.5
                      whitespace-nowrap pointer-events-none z-10
                      opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        Blocage impossible — l'employé n'a pas atteint 15 jours de congé
      </div>
    )}
  </div>

ALSO apply the same fix to UnblockModal:
- Remove IntersectionObserver from UnblockModal too
- Footer always visible
- "Suivant →" is enabled when a reason is selected
- "Confirmer le déblocage" in Step 2 is enabled only after PIN verified
- No tooltip needed for UnblockModal (unblocking is always allowed)

Commit: "fix: block/unblock modal footer always visible, suivant disabled with tooltip when cannot block"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After all fixes:
1. Run: cd client && npm run dev
2. Fix any console errors before finishing
3. Verify each fix:

   TOP BAR SPACING:
   - The 3 buttons (dark toggle, language, bell) are tight together with only 4px gap
   - No extra spacing between them

   DETAIL CALENDAR:
   - Day-name row appears above each month section: D L M M J V S
   - V and S in the header are lighter gray
   - Day cells are 36px × 36px, clearly larger than before
   - Month labels "Avril" and "Mai" visible above each section
   - Gap/divider between the two sections

   ALL CALENDARS MATCH:
   - Detail panel calendar cells use same gradient colors
   - HomeAddDayOffModal Step 2 calendar looks identical to AddDayOffModal calendar
   - Apple-style blue gradient on selected days
   - Shiny red gradient on existing congé days
   - Gray weekend cells
   - 36px cells everywhere

   BLOCK MODAL:
   - "Annuler" and "Suivant" buttons are ALWAYS visible without scrolling
   - If employee has < 15 days off: "Suivant" is gray/disabled
   - Hovering over disabled "Suivant": tooltip appears above button
     "Blocage impossible — l'employé n'a pas atteint 15 jours de congé"
   - If employee has 15+ days off: "Suivant" activates when reason is selected

   UNBLOCK MODAL:
   - Footer always visible, no scrolling required to see buttons
   - "Suivant" enables when reason is selected

4. Final commit: "fix: top bar spacing, calendars unified, block footer always visible with tooltip"