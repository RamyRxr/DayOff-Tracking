Read CLAUDE.md in this project.
You are fixing specific UI problems in the frontend only.
Do NOT touch any backend files.
Only modify files inside client/src/
Work through each fix in order. Commit after each one.

These are the official brand colors for this project — use them everywhere:
  Navy (primary):      #1A2F4F
  Navy Dark (hover):   #0F1F35
  Navy Light:          #2C4A6F
  Background:          #FAFAFA
  Card bg / inputs:    #F2F2F7
  Borders light:       #E5E5EA
  Borders strong:      #D1D1D6
  Text dark:           #111827
  Text default:        #374151
  Text light:          #6B7280
  Green (active):      #34C759
  Amber (at risk):     #FF9F0A
  Red (blocked):       #C0392B
  Blue selected:       gradient #007AFF → #0055D4
  Red existing congé:  gradient #FF3B30 → #C0392B
  Weekend gray:        #F2F2F7

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 1 — DETAIL PANEL CALENDAR: Match the style of
        AddDayOffModal calendar exactly, keep the
        split months, add day-name row
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the split calendar inside EmployeeDetailPanel
(shows days 20–30 of current month + days 1–19 of next month).

This calendar must look EXACTLY like the calendar in AddDayOffModal.
Copy the visual style from AddDayOffModal and apply it here.
The only difference: this calendar is SPLIT into two month sections
(which it already is) — keep that split.

Apply ALL of the following:

A. CELL SIZE AND SHAPE:
- Every day cell: 36px × 36px, rounded-lg
- Font: 13px font-medium
- Cell fills the full square — no inner circle

B. DAY-NAME HEADER ROW:
Add above EACH of the two calendar sections:
  D   L   M   M   J   V   S
Style: grid grid-cols-7, text-[10px] font-medium text-center py-1
V (col 6) and S (col 7): color #C7C7CC (lighter — weekend)
Others: color #8E8E93
Bottom border: 0.5px solid #E5E5EA separating it from the day grid

C. CELL COLORS — use exact same values as AddDayOffModal:

Day-off cell (date belongs to an existing congé record):
  style={{
    background: 'linear-gradient(135deg, rgba(255,59,48,0.15), rgba(192,57,43,0.1))',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 0 0 1px rgba(255,59,48,0.2)',
    color: '#C0392B',
    fontWeight: 600
  }}
  (NOT solid red — use a light tinted red with inner glow.
   The day number is red text, background is very light red.
   This is "fancy and shiny but not heavy")

Today cell (not a day-off):
  style={{
    background: 'linear-gradient(145deg, rgba(0,122,255,0.08), rgba(0,122,255,0.04))',
    boxShadow: '0 0 0 1.5px #007AFF',
    color: '#007AFF',
    fontWeight: 600
  }}

Weekend cell (Fri + Sat):
  style={{
    background: '#F2F2F7',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
    color: '#C7C7CC'
  }}

Normal cell:
  Default: { background: '#FAFAFA', color: '#374151' }
  border: '1px solid rgba(0,0,0,0.04)'
  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.9)'

D. MONTH LABELS AND SEPARATOR:
Keep the existing gap between the two calendar sections.
Each section must have its month name above it:
  "Avril" / "Mai" in 11px uppercase tracking-wider color #6B7280

E. CONTAINER CARD:
White bg, rounded-2xl
boxShadow: '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04)'
Padding: 16px
Inner area background: #FAFAFA with inner shadow:
  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)'

Commit: "fix: detail panel calendar matches AddDayOffModal style, split kept, day-names added"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 2 — ADD CONGÉ CALENDAR: Split into two months
        (same as detail panel)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find AddDayOffModal and the calendar picker inside it.

Current problem: shows only one month at a time.

Change it to show TWO months at once — same split as the detail panel:
- LEFT section: current month (all days from today onward in this month)
- RIGHT section: next month (days 1 to end of next month)
- Both sections visible at the same time, no need for prev/next navigation arrows
  (remove the prev/next arrows since both months are always shown)
- A thin horizontal separator between the two sections:
  <div className="w-full h-px my-4" style={{ background: '#E5E5EA' }} />
- Month labels above each section: "Avril" / "Mai" same style as Fix 1

The split must still support range selection across both months:
- User can click a start date in month 1 and end date in month 2
- Range highlight spans across both sections correctly
- Past days still disabled (gray, not clickable)
- Weekend days still disabled

Apply the same change to HomeAddDayOffModal Step 2 calendar as well.

Keep ALL existing cell colors from AddDayOffModal — do not change them.

Commit: "fix: add congé calendar shows two months split, same as detail panel"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 3 — ADD CONGÉ CALENDAR: Change day-off and
        selection colors to fancy light shiny style
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find AddDayOffModal calendar (and HomeAddDayOffModal calendar).

Change the cell colors to the following refined style.
These are the FINAL colors — do not use heavy/solid fills.
Use light tinted backgrounds with inner glow for a shiny premium feel.

SELECTED START / END DAY (new day-off being created):
  style={{
    background: 'linear-gradient(145deg, #007AFF, #0055D4)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 8px rgba(0,122,255,0.35)',
    color: 'white',
    fontWeight: 700
  }}

SELECTED RANGE MIDDLE (between start and end):
  style={{
    background: 'linear-gradient(145deg, rgba(0,122,255,0.1), rgba(0,122,255,0.06))',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 0 1px rgba(0,122,255,0.15)',
    color: '#0055D4',
    fontWeight: 500
  }}

EXISTING CONGÉ DAYS (disabled, already taken):
  style={{
    background: 'linear-gradient(145deg, rgba(255,59,48,0.12), rgba(192,57,43,0.08))',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.85), inset 0 0 0 1px rgba(255,59,48,0.18)',
    color: '#C0392B',
    fontWeight: 600,
    cursor: 'not-allowed'
  }}

TODAY (not selected):
  style={{
    background: 'linear-gradient(145deg, rgba(0,122,255,0.08), rgba(0,122,255,0.04))',
    boxShadow: '0 0 0 1.5px #007AFF, inset 0 1px 0 rgba(255,255,255,0.9)',
    color: '#007AFF',
    fontWeight: 600
  }}

PAST DAYS (before today, disabled):
  style={{
    background: 'transparent',
    color: '#C7C7CC',
    cursor: 'not-allowed',
    opacity: 0.6
  }}
  (opacity 0.6 — visible enough to read but clearly inactive.
   Do NOT use opacity 0.2 or 0.3 — that was too low)

WEEKEND (Fri + Sat):
  style={{
    background: '#F2F2F7',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
    color: '#C7C7CC',
    cursor: 'not-allowed'
  }}

NORMAL HOVERABLE DAY:
  Default:
    background: 'rgba(255,255,255,0.8)'
    boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)'
    color: '#374151'
  Hover:
    background: '#F2F2F7'
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)'
    cursor: pointer

Apply SAME colors to HomeAddDayOffModal calendar.

Commit: "fix: calendar cells use light shiny tinted colors, past days opacity 0.6"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 4 — TYPE DE CONGÉ SELECTOR: Add scroll-down
        animation when opened
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the "Type de congé" CustomSelect dropdown in AddDayOffModal.

When the dropdown opens (user clicks it):
After a 150ms delay, smoothly scroll the modal body down so the
dropdown options are fully visible.

Implementation:
1. Give the dropdown container a ref: const typeSelectRef = useRef(null)
2. When the dropdown opens (onOpen callback or open state becomes true):
   setTimeout(() => {
     typeSelectRef.current?.scrollIntoView({
       behavior: 'smooth',
       block: 'nearest'
     })
   }, 150)
3. Wrap the type selector section in:
   <div ref={typeSelectRef}>
     <CustomSelect ... />
   </div>

Also add a smooth open animation to the dropdown panel itself:
When options list appears:
  Initial: opacity 0, translateY(-6px), scale(0.98)
  Final:   opacity 1, translateY(0), scale(1)
  Duration: 150ms, easing: cubic-bezier(0.16, 1, 0.3, 1)

Use Tailwind transition classes or inline style animation.

Apply same scroll behavior to HomeAddDayOffModal type selector.

Commit: "feat: type de congé selector scrolls into view and animates on open"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 5 — MODAL FOOTER BUTTONS: Make Annuler and
        Suivant closer to each other
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the footer of ALL modals:
AddDayOffModal, HomeAddDayOffModal, BlockEmployeeModal,
UnblockModal, AddEmployeeModal.

Current problem: "Annuler" is on the far left, "Suivant" on the far right.
They feel too far apart.

Fix:
Change footer from justify-between to justify-end with a gap:
  <div className="flex-shrink-0 flex items-center justify-end gap-3
                  px-5 py-4 border-t border-gray-100 bg-white">

This places both buttons on the RIGHT side of the footer, close together.
"Annuler" comes first (left), "Suivant" comes second (right).
Gap between them: gap-3 (12px).

Do NOT apply this to UnblockModal — the user said its button placement
is already perfect. Only apply to the other 4 modals.

Commit: "fix: modal footer buttons moved to right side, gap-3 between them"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 6 — AUTORISATION WINDOW: Reduce empty space,
        improve PIN box focus style, unify across
        all modals
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find ALL "Autorisation requise" / PIN entry sections across:
- AddDayOffModal Step 2
- HomeAddDayOffModal Step 3
- BlockEmployeeModal Step 2
- UnblockModal Step 2 (this one is already good — use it as the reference)
- AddEmployeeModal Step 2

PART A — Reduce empty white space:
The space below the PIN boxes is too large. Fix:
- After the 4 PIN boxes, only show:
  • Status message (verifying / verified / error) — small, 12px
  • Nothing else below
- Remove any extra padding-bottom, spacer divs, or margin below PIN section
- Total height of the authorization section should be compact:
  Admin selector (44px) + gap (12px) + label (16px) + PIN boxes (56px) + status (20px)
  = roughly 148px total, no more

PART B — PIN box focus style (fixes the "too white, invisible" problem):
When a PIN box is focused (active, user is typing in it):
  style={{
    background: 'white',
    boxShadow: '0 0 0 2px #1A2F4F, inset 0 1px 3px rgba(0,0,0,0.08)',
    color: '#111827',
    transform: 'scale(1.05)',
    transition: 'all 150ms ease'
  }}

When empty and unfocused:
  style={{
    background: '#F2F2F7',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px #E5E5EA',
    color: '#111827'
  }}

When filled (has a digit, not focused):
  style={{
    background: 'white',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06), 0 0 0 1.5px #1A2F4F',
    color: '#111827'
  }}

Verified state:
  style={{
    background: 'rgba(52,199,89,0.08)',
    boxShadow: '0 0 0 1.5px #34C759, inset 0 1px 0 rgba(255,255,255,0.8)',
    color: '#1D6B34'
  }}

Error state:
  style={{
    background: 'rgba(192,57,43,0.08)',
    boxShadow: '0 0 0 1.5px #C0392B, inset 0 1px 0 rgba(255,255,255,0.8)',
    color: '#C0392B'
  }}

The navy ring (0 0 0 2px #1A2F4F) on focus makes the active box
clearly visible and distinct from the white background.

PART C — Unify the authorization section:
Create a reusable component: client/src/components/AutorisationStep.jsx
Props: { admins, selectedAdmin, onAdminSelect, pin, onPinChange, pinRefs,
         pinStatus, onKeyDown }

This component renders:
1. Admin selector (using CustomSelect or existing styled dropdown)
2. PIN label + 4 boxes
3. Status message

Use AutorisationStep in ALL modals that have a PIN step.
This ensures they all look identical.
The UnblockModal's authorization is the reference — match that exact look.

Commit: "fix: autorisation step compact, PIN focus navy ring, unified AutorisationStep component"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 7 — BLOCKED TAB DETAIL WINDOW: Fix calendar,
        show all employee info, add download button
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the detail window/panel opened when clicking "Détails"
on a blocked employee card in the Bloqués tab.

A. FIX THE CALENDAR:
Apply the exact same Fix 1 calendar style to this panel's calendar too.
The blocked employee detail panel uses the same EmployeeDetailPanel component.
If Fix 1 was applied to EmployeeDetailPanel, this should already be fixed.
If it's a separate component, apply the same calendar styles.

B. SHOW ALL EMPLOYEE INFO:
The employee info section must display ALL of these fields:
- Full name (large, bold)
- Matricule (monospace, gray)
- Department pill
- Position pill
- Email (with Mail icon)
- Phone (with Phone icon)
- Hire date (with Calendar icon)
- Current status badge: "Bloqué" in red pill

If any of these fields are missing, add them.
Check that the data is actually being passed to the panel:
  the employee object from the blocks API includes all these fields
  (the blocks endpoint returns employee with email, phone, etc.)

C. ADD DOWNLOAD BLOCK DETAILS BUTTON:
For each blocked employee card in the Bloqués tab table:
Add a "📄 Télécharger" button in the Actions column.

On click: generate and immediately download a PDF or text file
named "decision-blocage-{matricule}-{date}.txt"

File content (plain text format):
  ════════════════════════════════════════
  DÉCISION DE BLOCAGE — NAFTAL SPA
  ════════════════════════════════════════
  Matricule:        {employee.matricule}
  Nom complet:      {employee.firstName} {employee.lastName}
  Département:      {employee.department}
  Poste:            {employee.position}
  Email:            {employee.email}
  Téléphone:        {employee.phone || '—'}
  ────────────────────────────────────────
  Date de blocage:  {formatted date}
  Motif:            {block.reason}
  Description:      {block.description || '—'}
  Bloqué par:       {block.admin.name} — {block.admin.role}
  ────────────────────────────────────────
  Période:          {period start} → {period end}
  Jours de congé:   {daysUsed} / 15
  ════════════════════════════════════════

Implement download using Blob + URL.createObjectURL:
  const content = `...`  // text content above
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `decision-blocage-${matricule}-${date}.txt`
  a.click()
  URL.revokeObjectURL(url)

Button style: ghost, small, navy border + navy text, rounded-lg, px-3 py-1.5
Icon: Lucide Download (14px) + "Télécharger" text

Commit: "fix: blocked tab — calendar fixed, all info shown, download button"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 8 — UNBLOCK MODAL: Show correct "Bloqué par"
        value, fix admin list, fix "admin not found" error
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find UnblockModal.jsx and the Bloqués page that opens it.

PROBLEM A — "Bloqué par" shows wrong value ("Admin RH"):
The information section shows "Bloqué par: Admin RH" instead of
the actual admin name who blocked the employee.

Fix:
The block record passed to UnblockModal must include the admin who blocked.
Check the blocks API response: GET /api/blocks should return:
  block.admin = { id, name, role }

If the API is not including admin data, update the blocks controller:
  In server/src/controllers/blocksController.js
  In the GET /api/blocks query, add:
    include: {
      employee: { select: { id, firstName, lastName, matricule,
                            department, position, email, phone } },
      admin: { select: { id, name, role } },
      unblockedBy: { select: { id, name, role } }
    }

In UnblockModal, display:
  "Bloqué par: {block.admin?.name} — {block.admin?.role}"

If block.admin is null/undefined, show "—" not "Admin RH".

PROBLEM B — Not all admins shown in selector:
The admin selector in UnblockModal Step 2 does not show all admins.

Fix:
In UnblockModal, fetch admins using the existing useAdmins() hook or
call GET /api/admins directly inside the component:

  const [admins, setAdmins] = useState([])
  useEffect(() => {
    fetch('/api/admins')
      .then(r => r.json())
      .then(data => setAdmins(data?.data || []))
  }, [])

Make sure this fetch is NOT conditional — it runs every time the modal opens.
Check that GET /api/admins returns ALL 3 admins from the database.
If it returns an empty array, check the admins controller and route.

PROBLEM C — "admin not found" error on confirm:
When admin is selected and PIN entered, the unblock API call fails with
"admin not found".

This happens because the adminId being sent does not match any admin in the DB.
Debug:
1. Console.log the selectedAdmin object before sending the unblock request
2. Console.log the body being sent to PATCH /api/blocks/:id/unblock
3. The body must be: { adminId: selectedAdmin.id, unblockReason, unblockDescription }
4. Make sure selectedAdmin.id is a valid UUID matching an admin in the database
5. In the blocks controller unblock handler:
   const admin = await prisma.admin.findUnique({ where: { id: adminId } })
   if (!admin) return res.status(404).json({ error: 'Admin not found' })
   — make sure adminId is being read from req.body correctly

Fix whatever is causing the mismatch.

Commit: "fix: unblock modal shows correct admin name, all admins load, unblock API works"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 9 — BLOCK & UNBLOCK MODAL BUTTONS: Make all
        modal footer buttons match UnblockModal style
        + add hover animation on active Suivant
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The user confirmed that the UnblockModal footer buttons (Annuler + Suivant)
look perfect. Apply that exact same style to ALL other modals.

STEP A — Study UnblockModal footer buttons:
Open UnblockModal.jsx and copy the exact className and style of:
  - "Annuler" button
  - "Suivant →" button (active state)
  - "Suivant →" button (disabled state)

STEP B — Apply that same style to:
  - AddDayOffModal footer (both steps)
  - HomeAddDayOffModal footer (all 3 steps)
  - BlockEmployeeModal footer (both steps)
  - AddEmployeeModal footer (both steps)

Every modal must have the exact same button appearance.

STEP C — Add hover animation on active Suivant button:
When "Suivant →" is in its ACTIVE (enabled) state, on hover:
  transform: translateY(-1px)
  boxShadow: '0 4px 12px rgba(26,47,79,0.3)'
  transition: all 150ms ease

On mouse down (click):
  transform: translateY(0px) scale(0.98)
  transition: all 100ms ease

Implement with Tailwind group or inline onMouseEnter/onMouseLeave handlers.

Also apply this hover animation to the final confirm button
("Confirmer le congé", "Confirmer le blocage", "Confirmer le déblocage",
"Créer l'employé") in Step 2 of each modal.

Commit: "fix: all modal footer buttons match UnblockModal style, hover animation on suivant"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 10 — DARK MODE: Complete redesign with proper
         Apple-inspired dark colors
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The current dark mode colors are bad. Replace them completely.

These are the CORRECT dark mode colors to use — Apple macOS dark style:

BACKGROUNDS:
  Page bg:          #0A0A0F  (very deep warm near-black)
  Sidebar:          rgba(18,18,26,0.95) + backdrop-blur-xl
  Top bar:          rgba(18,18,26,0.90) + backdrop-blur-xl
  Card surface:     #16161E  (elevated surface, slightly lighter)
  Card hover:       #1C1C28
  Modal bg:         #16161E
  Input fill:       rgba(255,255,255,0.06)
  Table row:        transparent
  Table row hover:  rgba(255,255,255,0.03)
  Table header:     rgba(255,255,255,0.04)

BORDERS AND DIVIDERS:
  Default border:   rgba(255,255,255,0.07)
  Strong border:    rgba(255,255,255,0.12)
  Divider:          rgba(255,255,255,0.06)

SHADOWS (dark mode cards glow differently):
  Card shadow:
    0 0 0 1px rgba(255,255,255,0.06),
    0 4px 16px rgba(0,0,0,0.4),
    0 1px 0 rgba(255,255,255,0.04) inset
  (the inset top border gives the "glass edge" Apple effect)

  Modal shadow:
    0 0 0 1px rgba(255,255,255,0.08),
    0 24px 64px rgba(0,0,0,0.6)

TEXT COLORS:
  Primary text:     #F2F2F7  (Apple's light gray — not pure white)
  Secondary text:   #8E8E93  (Apple gray 400)
  Tertiary text:    #636366  (Apple gray 500)
  Placeholder:      #48484A  (Apple gray 600)

NAV AND INTERACTIVE:
  Active nav item:
    background: rgba(255,255,255,0.08)
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 0 rgba(0,0,0,0.2)'
    color: #F2F2F7

  Inactive nav item hover:
    background: rgba(255,255,255,0.04)

BUTTONS:
  Primary (navy):
    background: linear-gradient(145deg, #2C4A6F, #1A2F4F)
    boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 12px rgba(0,0,0,0.4)'
    color: white
  Primary hover:
    background: linear-gradient(145deg, #3A5F8F, #2C4A6F)

  Ghost button:
    border: 1px solid rgba(255,255,255,0.12)
    color: #8E8E93
    hover: border rgba(255,255,255,0.2), color #F2F2F7

STATUS BADGES (dark mode):
  Actif:    bg rgba(52,199,89,0.15),   color #34C759,  border rgba(52,199,89,0.2)
  À risque: bg rgba(255,159,10,0.15),  color #FF9F0A,  border rgba(255,159,10,0.2)
  Bloqué:   bg rgba(192,57,43,0.2),    color #FF6B6B,  border rgba(255,59,48,0.2)

STAT PILLS (dark mode):
  Default:
    background: rgba(255,255,255,0.04)
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 3px rgba(0,0,0,0.3)'
    border: 1px solid rgba(255,255,255,0.07)
  Active:
    background: rgba(255,255,255,0.08)
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.4)'

INPUTS (dark mode):
  background: rgba(255,255,255,0.06)
  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.06)'
  color: #F2F2F7
  placeholder color: #48484A
  Focus:
    boxShadow: '0 0 0 2px #2C4A6F, inset 0 1px 3px rgba(0,0,0,0.2)'
    background: rgba(255,255,255,0.08)

CALENDAR (dark mode):
  Container bg:     #1C1C28
  Normal cell:      background rgba(255,255,255,0.04), color #C7C7CC
  Weekend cell:     background rgba(255,255,255,0.02), color #48484A
  Day-off cell (existing):
    background: rgba(192,57,43,0.2)
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 0 1px rgba(255,59,48,0.25)'
    color: #FF6B6B
  Selected start/end:
    Same blue gradient as light mode (looks great in dark too)
  Today:
    Same blue ring as light mode

LOGO / BRAND TEXT:
  "DayOff" wordmark: #F2F2F7
  "NAFTAL" subtext:  #636366

IMPLEMENTATION:
Go through EVERY component file and add dark: variants for all these values.
Use Tailwind dark: prefix for background, text, border colors where possible.
Use conditional style objects for complex shadow values:
  const isDark = document.documentElement.classList.contains('dark')
  style={{ boxShadow: isDark ? darkShadow : lightShadow }}
  Or use the useDarkMode hook to get isDark boolean.

Make sure the useDarkMode hook in client/src/hooks/useDarkMode.js:
1. Reads from localStorage on init
2. Applies 'dark' class to document.documentElement on init
   (so page doesn't flash light mode before dark mode loads)
3. toggles 'dark' class correctly

In client/src/main.jsx or App.jsx, add this before rendering:
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark')
  }

This prevents the flash of wrong theme on page load.

Commit: "feat: complete dark mode redesign with Apple macOS dark colors"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After all fixes:
1. Run: cd client && npm run dev
2. Fix any console errors before finishing
3. Verify in LIGHT MODE:

   DETAIL CALENDAR:
   - Day-name row visible: D L M M J V S, V and S lighter
   - Cells 36px, fill the full square
   - Day-off cells: light red tint + red text + inner glow (not solid red)
   - Two months clearly split with label and separator

   ADD CONGÉ CALENDAR:
   - Two months shown at once, no prev/next arrows needed
   - Same Apple colors as detail calendar
   - Past days opacity 0.6 (readable but clearly inactive)
   - Range selection works across both months

   TYPE SELECTOR: smooth scroll + fade animation on open

   MODAL BUTTONS: both on right side, gap-3, same style as UnblockModal

   AUTORISATION STEP:
   - Compact, no empty space below PIN
   - Focused PIN box has navy 2px ring — clearly visible
   - All modals use same AutorisationStep component

   BLOCKED TAB:
   - Calendar matches Fix 1 style
   - All employee fields visible (email, phone, hire date)
   - Download button works, generates correct text file

   UNBLOCK MODAL:
   - Shows real admin name in "Bloqué par" field
   - All 3 admins show in selector
   - Confirm unblock works without "admin not found" error

   SUIVANT BUTTON: lifts on hover, pressed effect on click

4. Verify in DARK MODE:
   - Deep near-black backgrounds (not gray)
   - Cards visible with subtle border glow
   - Text readable: primary #F2F2F7, secondary #8E8E93
   - Nav active item has inner glow
   - Inputs: dark fill with inner shadow, navy ring on focus
   - Status badges: tinted bg with correct colors
   - No flash of light mode on page load
   - Calendar cells dark with correct tints

5. Final commit: "fix: calendars unified, dark mode Apple colors, autorisation compact, unblock working"