Read CLAUDE.md in this project.
You are fixing and improving the frontend UI only.
Do NOT touch any backend files, routes, controllers, or prisma files.
Only modify files inside client/src/
Work through each fix in order. Commit after each section.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 1 — ACCUEIL: Stat pills inner shadow and shine
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the 4 stat tab pills on the home page (Employés / Actifs / À risque / Bloqués).

Apply this exact styling to each pill:

Default (inactive) state:
- Background: rgba(255,255,255,0.6)
- Inner shadow: box-shadow: inset 0 1px 3px rgba(0,0,0,0.08), inset 0 0 0 1px rgba(255,255,255,0.9)
- Outer shadow: 0 1px 2px rgba(0,0,0,0.04)
- Backdrop blur: backdrop-filter: blur(8px)
- Border: 1px solid rgba(0,0,0,0.06)
- Text: gray-500
- Transition: all 200ms ease

Hover state:
- Background: rgba(255,255,255,0.85)
- Inner shadow deepens: inset 0 2px 4px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(255,255,255,1)
- Outer glow: 0 4px 12px rgba(0,0,0,0.08)
- Text: gray-700
- Scale: scale-[1.02]

Active (selected) state:
- Background: white
- Inner shadow: inset 0 1px 4px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(255,255,255,1)
- Outer shadow: 0 4px 16px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.06)
- Border: 1px solid rgba(0,0,0,0.08)
- Text: gray-900, font-semibold
- Scale: scale-[1.03]

The number value inside each pill:
- font-size: 22px, font-weight: 700
- À risque number: text-amber-600 when active
- Bloqués number: text-red-600 when active

Use Tailwind utility classes where possible, use style={{}} only for the shadow values
since Tailwind doesn't support complex inner shadows natively.
Wrap each pill in a div with transition-all duration-200.

Commit: "fix: stat pills with inner shadow and shine effect on home page"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 2 — ACCUEIL: Rebuild the calendar to look great
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the calendar component used on the home page or in the employee detail panel.
(If it is the split calendar in the detail panel, fix that one.)

Current problem: calendar looks ugly, poor sizing.

Rebuild the calendar styling completely:

Container card:
- White bg, rounded-2xl
- Box shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)
- Padding: 16px
- Inner shadow on the calendar grid area:
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05)

Month header row:
- Month name: 13px font-semibold text-gray-800, uppercase tracking-wide
- Prev/next arrows: 28px × 28px rounded-lg, hover bg-gray-100, Lucide ChevronLeft/ChevronRight icons
- Flex row, space-between

Day-of-week header row:
- 7 columns (or 2 × 7 for split calendar)
- Labels: 10px, uppercase, text-gray-400, font-medium, centered
- Mo Tu We Th Fr Sa Su (Fr and Sa in lighter gray since they are weekend)
- Bottom border 0.5px rgba(0,0,0,0.06) separating headers from day grid

Day cells:
- Size: 32px × 32px
- Border radius: rounded-lg
- Font: 12px, text-gray-700
- Hover (selectable days): bg-gray-50, text-gray-900, transition-colors duration-100
- Today: bg-blue-50, text-blue-700, font-semibold, ring-1 ring-blue-200
- Weekend cells (Fr + Sa): text-gray-400, bg-transparent, no hover
- Past days: text-gray-300, cursor-not-allowed
- Day-off cells: bg-amber-50, text-amber-700, font-medium, ring-1 ring-amber-200/50
- Blocked cells: bg-red-50, text-red-600, ring-1 ring-red-200/50
- Selected range start/end: bg-navy-600 (#1B3A6B), text-white, shadow-sm
- Selected range middle: bg-blue-50, text-blue-600

For the split calendar (two side-by-side months):
- Both calendars in one card
- 0.5px vertical divider rgba(0,0,0,0.06) between them
- Each side has its own month header

Legend row below calendar:
- Flex row, gap-3, centered
- Each legend item: 8px colored circle + 10px gray label
- Items: Congé (amber) · Week-end (gray) · Bloqué (red) · Aujourd'hui (blue)

Commit: "fix: rebuild calendar with clean premium styling"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 3 — AJOUTER CONGÉ: Fix broken button and rebuild modal
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The "Ajouter un congé" button is broken — clicking it shows a white screen.
Find the button and the modal component. Debug and fix the full flow.

STEP A — Fix the button:
Find every place "Ajouter un congé" or "Ajouter congé" button exists.
Check:
  1. Is there a state variable like showAddDayOffModal or isAddDayOffOpen?
  2. Does the button onClick set that state to true?
  3. Is the modal component imported at the top of the file?
  4. Is the modal rendered conditionally: {showModal && <AddDayOffModal ... />}
  5. Is employeeId being passed correctly to the modal?
Fix all of the above if any are missing or broken.

STEP B — Rebuild AddDayOffModal as a clean 2-step modal:
Create or fully replace: client/src/components/AddDayOffModal.jsx

Modal wrapper:
- Fixed overlay: fixed inset-0, bg-black/30, backdrop-blur-sm, z-50
- Flex items-center justify-center
- Modal card: bg-white, rounded-2xl, w-full max-w-lg, max-h-[90vh], overflow-y-auto
- Box shadow: 0 0 0 1px rgba(0,0,0,0.08), 0 16px 48px rgba(0,0,0,0.16)
- Slide-up animation on open: translateY(24px)→(0) + opacity 0→1, 250ms cubic-bezier(0.16,1,0.3,1)

─── STEP 1: Date selection + details ───

Header:
- "Ajouter un Congé" 17px font-semibold
- Employee name + matricule in 12px text-gray-500 below
- "Étape 1 / 2" pill badge right side: bg-gray-100, text-gray-500, text-xs, rounded-full, px-2 py-0.5
- × close button top-right: hover bg-gray-100, rounded-lg

Calendar picker (inline, not a popup):
- Show current month, prev/next month navigation
- Same cell styling as Fix 2 above
- Past days disabled: text-gray-300, cursor-not-allowed
- Weekend days (Fri+Sat): text-gray-400, not selectable
- Already-used congé dates: bg-amber-50 tint, cursor-not-allowed, title="Congé existant"
  Build a Set of all dates from the employee's existing daysOff records
  Use date-fns eachDayOfInterval to expand each [startDate, endDate] range into individual dates
- Click behavior:
  First click → sets startDate (shows navy filled circle)
  Second click after startDate → sets endDate
  Days between: range highlight (bg-blue-50)
  Clicking same day twice → clears

Below calendar:
- Auto-calculated chip: "X jours ouvrables · Y jours calendaires"
  Working days = calendar days minus Fri+Sat in selected range
- Sandwich warning (if range spans Fri or Sat):
  Amber strip: bg-amber-50, border border-amber-200, rounded-lg, px-3 py-2, text-sm
  "⚠ Détection sandwich — Jours réels: Y · Déclarés: X"

File upload zone:
- Label: "Pièce justificative" + "(optionnel)" in gray
- Dashed zone: border-dashed border-2 border-gray-200, rounded-xl, py-6, text-center
- Icon: Lucide Upload, text-gray-400
- Text: "Glisser ou cliquer · PDF, JPG, PNG · max 5 Mo"
- On file selected: show filename chip with × remove button
- Reject files over 5MB: show inline red error text

Reason dropdown:
- Label: "Type de congé" (required)
- Use the SAME custom dropdown style as the login page admin selector
- Options: Congé annuel · Congé maladie · Congé sans solde · Autre
- Shows selected option with checkmark

Step 1 footer:
- "Annuler" ghost button left
- "Suivant →" navy button right
  Disabled if no dates selected OR no reason selected
  Enabled state: bg-[#1B3A6B] text-white rounded-xl px-5 py-2.5

─── STEP 2: Admin authorization ───

Header:
- "Autorisation" 17px font-semibold
- Summary chip: "12–16 Avr · 3 jours · Congé annuel" in gray below
- "Étape 2 / 2" badge
- × close button

Admin selector:
- Same custom dropdown style as login page

PIN input:
- Label: "Code PIN à 4 chiffres"
- 4 separate <input> boxes:
  type="password", maxLength={1}, inputMode="numeric", pattern="[0-9]*"
  Size: 48px × 56px each, rounded-xl
  Style: bg-gray-50, inner shadow: inset 0 1px 2px rgba(0,0,0,0.06)
  Active box: ring-2 ring-[#1B3A6B]/40, bg-white
  Verified: bg-green-50, ring-green-400, show ✓
  Error: bg-red-50, ring-red-400, shake animation
  Auto-focus first box on mount
  Auto-advance on digit typed
  Backspace moves to previous box
  Auto-submit on 4th digit entered
  NO on-screen number buttons anywhere

Step 2 footer:
- "← Retour" ghost button left (goes back to Step 1, keeps all selections)
- "Confirmer le congé" navy button right
  Only active after PIN verified
  On click: POST to API → close modal → toast success → refetch employee data

Commit: "feat: fix ajouter congé button and rebuild 2-step modal"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 4 — BLOCK & UNBLOCK MODALS: Fix sticky header overflow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find BlockEmployeeModal and UnblockModal.

Current problem: when scrolling inside the modal, content scrolls under the
header bar ("Débloquer l'Employé / Étape 1 sur 2") making it look broken.

Fix:
- The modal card must use a flex-col layout:
  <div class="flex flex-col max-h-[88vh]">
    <div class="flex-shrink-0 ..."> ← STICKY HEADER (never scrolls)
      title + step indicator + close button
    </div>
    <div class="flex-1 overflow-y-auto px-6 py-4"> ← SCROLLABLE BODY
      all form content goes here
    </div>
    <div class="flex-shrink-0 ..."> ← STICKY FOOTER (never scrolls)
      back + confirm buttons
    </div>
  </div>

The header and footer must NEVER scroll.
Only the body content between them scrolls.
Add a subtle 0.5px border-b rgba(0,0,0,0.06) below the header.
Add a subtle 0.5px border-t rgba(0,0,0,0.06) above the footer.
Add 24px padding-bottom inside the scrollable body so content is not cut off.

Apply this same fix to BOTH BlockEmployeeModal and UnblockModal.

Commit: "fix: sticky header and footer in block/unblock modals, body scrolls"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 5 — EMPLOYEE DETAIL: Fix the 3 info cards size and style
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the 3 info cards in EmployeeDetailPanel
(Jours de congé / Jours travaillés / Jours disponibles).

Current problem: too large, too much empty space, looks ugly.

Fix the layout and style:

Replace the 3 large cards with 3 compact inline stat chips in a single row:

Each chip:
- Width: flex-1 (equal thirds)
- Height: auto — padding px-4 py-3 only (no fixed height)
- Background: white
- Border: 1px solid rgba(0,0,0,0.06)
- Border radius: rounded-xl
- Inner shadow: box-shadow: inset 0 1px 2px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.04)
- Layout: flex-col, gap-0.5

Inside each chip:
- Value (number): 20px, font-bold, text-gray-900
  • "Jours disponibles" value: amber-600 if ≤ 4, red-600 if ≤ 0
- Label: 10px, uppercase, tracking-wider, text-gray-400, font-medium

The 3 chips sit in a flex row with gap-2.
Total row height should be around 64px — compact, not dominant.

Remove any usage percentage bar or "Utilisation" label if present.

Commit: "fix: employee detail info cards compact and styled correctly"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 6 — EMPLOYÉS TAB: Fix "Nouvel employé" button
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the Employés page and the "Nouvel employé" or "+ Nouvel Employé" button.

Current problem: clicking the button does nothing.

Debug and fix:
1. Find or create state: const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false)
2. Button onClick must call: setShowAddEmployeeModal(true)
3. AddEmployeeModal must be imported at top of file
4. Modal must be rendered: {showAddEmployeeModal && <AddEmployeeModal onClose={() => setShowAddEmployeeModal(false)} onSuccess={refetch} />}
5. If AddEmployeeModal component does not exist, create it at client/src/components/AddEmployeeModal.jsx

AddEmployeeModal content (2-step flow):

─── STEP 1: Employee information ───

Fields (all required unless noted):
- Prénom: text input
- Nom: text input
- Matricule: READ-ONLY display field, auto-generated format NAF-XXXX
  Generate a random 4-digit number, check against existing employees to ensure unique
  Show a 🔄 refresh icon button next to it to regenerate
  Label below: "généré automatiquement" in 10px gray
- Département: custom dropdown (same style as login page selector)
  Options: Production · Logistique · Administration · Maintenance · Qualité · Sécurité
- Poste: text input (job title)
- Email: text input, auto-suggest "prenom.nom@naftal.dz" based on name fields, editable
- Téléphone: text input, optional, placeholder "+213 XX XX XX XX"
- Date d'embauche: date input

All inputs use the same Apple-style:
- bg: rgba(118,118,128,0.08)
- border: none by default
- inner shadow: inset 0 1px 2px rgba(0,0,0,0.06)
- On focus: ring-1 ring-[#1B3A6B]/40, bg-white
- rounded-xl, h-11, px-3

Validation before Step 2:
- All required fields filled
- Email contains @
- Matricule is unique
- Show red text under each invalid field in French

Footer: "Annuler" ghost + "Suivant →" navy button (disabled if invalid)

─── STEP 2: Admin PIN authorization ───
Same admin selector + 4-box PIN keyboard input as AddDayOffModal Step 2.
Confirm button: "Créer l'employé" navy

On success:
- Close modal
- Toast: "Employé créé avec succès"
- Refetch employee list

Commit: "feat: fix nouvel employé button and build AddEmployeeModal"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 7 — EMPLOYÉS TAB: Remove congé button from action column
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the employee table in the Employés page.

In the Actions column: remove the "+ Congé" button entirely.
Keep only the "Détails" button.
"Détails" button: always visible, ghost style, rounded-lg, small.

Commit: "fix: remove congé button from employees table, keep only détails"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 8 — ALL DROPDOWNS: Match the login page selector style
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the login page admin selector component. Study its exact styling.
Then find EVERY other dropdown/select in the project:
- Reason dropdown in AddDayOffModal
- Type de congé dropdown in AddDayOffModal
- Département dropdown in AddEmployeeModal
- Motif dropdown in BlockEmployeeModal
- Motif dropdown in UnblockModal
- Any other <select> or custom dropdown in the project

Replace all of them with the exact same component style as the login page selector:
- Custom dropdown (not native <select>)
- Options rendered as card rows with hover state
- Selected option shows checkmark
- Opens with smooth fade+slide animation
- Frosted glass container, ambient shadow
- Closes on outside click

Create a reusable component: client/src/components/CustomSelect.jsx
Props: options (array of {value, label}), value, onChange, placeholder
Use this component everywhere instead of repeating code.

Commit: "feat: create reusable CustomSelect matching login page style, apply everywhere"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 9 — DARK MODE: Add toggle button with Apple-style dark theme
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Add a dark mode system to the entire app.

STEP A — Setup:
- In tailwind.config.js: set darkMode: 'class'
- Create a useDarkMode hook in client/src/hooks/useDarkMode.js:
  - Uses localStorage to persist preference
  - Toggles 'dark' class on document.documentElement
  - Returns: { isDark, toggle }

STEP B — Toggle button:
Place the toggle button immediately to the right of the "DayOff / NAFTAL" logo in the sidebar.
Button: 32px × 32px, rounded-lg
Light mode: shows Moon icon (Lucide Moon), bg-gray-100 hover:bg-gray-200
Dark mode: shows Sun icon (Lucide Sun), bg-gray-700 hover:bg-gray-600
Smooth icon swap animation: rotate + opacity transition 300ms

STEP C — Dark mode colors (Apple-style, shiny, inner shadows):
Add dark: variants to all major components.

Dark mode palette:
- Page background: dark:#0F0F10 (near black, warm tint)
- Sidebar: dark:bg-[#1C1C1E]/90 + backdrop-blur (Apple dark sidebar)
- Top bar: dark:bg-[#1C1C1E]/80 + backdrop-blur
- Cards: dark:bg-[#2C2C2E] with inner shadow: inset 0 1px 0 rgba(255,255,255,0.06)
- Card borders: dark:border-white/[0.06]
- Card glow: dark:shadow — 0 4px 16px rgba(0,0,0,0.4)
- Inputs: dark:bg-white/[0.06] + inner shadow inset 0 1px 2px rgba(0,0,0,0.3)
- Input focus: dark:ring-blue-400/40
- Text primary: dark:text-white
- Text secondary: dark:text-gray-400
- Text tertiary: dark:text-gray-500
- Dividers: dark:border-white/[0.06]
- Active nav item: dark:bg-white/10 + inner glow inset 0 0 0 1px rgba(255,255,255,0.08)
- Buttons primary (navy): same color works in dark, add slight glow: dark:shadow-blue-900/50
- Ghost buttons: dark:border-white/20 dark:text-gray-300 dark:hover:bg-white/[0.06]
- Status badges: dark:bg-opacity-20 (keep the color, reduce bg opacity)
- Stat pills: dark:bg-[#2C2C2E] + inner shadow inset 0 1px 0 rgba(255,255,255,0.06)
- Modals: dark:bg-[#1C1C1E], dark:border-white/[0.08]
- Table header: dark:bg-[#2C2C2E]
- Table rows: dark:bg-transparent, dark:border-white/[0.04]
- Table row hover: dark:hover:bg-white/[0.03]
- Notification panel: dark:bg-[#2C2C2E]
- Dropdown options: dark:bg-[#3A3A3C] dark:hover:bg-[#48484A] dark:text-white

Apply dark: variants to every component file.
Wrap the whole app in the dark class provider using the useDarkMode hook in App.jsx or main.jsx.

Commit: "feat: add Apple-style dark mode with toggle button in sidebar"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 10 — LANGUAGE SELECTOR: EN / FR / AR switcher
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Add a language selector to the right of the notification bell in the top bar.

STEP A — i18n setup:
Install: npm install i18next react-i18next
Create: client/src/i18n/index.js — initialize i18next with resources
Create translation files:
  client/src/i18n/fr.json — French (current default, all existing labels)
  client/src/i18n/en.json — English translations of all labels
  client/src/i18n/ar.json — Arabic translations of all labels
    Arabic uses RTL — when AR is active: set document.dir = 'rtl'
    When FR or EN: set document.dir = 'ltr'

STEP B — Language selector component:
Position: right of the notification bell in the top bar
Component: a compact pill showing current language flag+code
  Examples: 🇫🇷 FR · 🇬🇧 EN · 🇩🇿 AR

On click: dropdown opens below with 3 options
Each option row: flag emoji + full language name
  🇫🇷 Français · 🇬🇧 English · 🇩🇿 العربية
Dropdown style: same white opaque panel, rounded-2xl, ambient shadow, 180px wide
Active language: checkmark on right

On language select:
- Call i18next.changeLanguage(code)
- Save to localStorage: localStorage.setItem('lang', code)
- For Arabic: document.documentElement.dir = 'rtl', document.documentElement.lang = 'ar'
- For others: document.documentElement.dir = 'ltr'

STEP C — Apply translations:
Replace ALL hardcoded French strings in every component with t('key') calls.
Add all keys to all 3 translation files.

Key translation strings to include at minimum:
  Common: save, cancel, confirm, back, next, close, search, filter, loading, error
  Nav: accueil, employes, bloques, calendrier
  Home: activiteRecente, totalEmployes, actifs, aRisque, bloques
  Employee: details, ajouterConge, nomPrenom, matricule, departement, poste, email, telephone, dateEmbauche
  DayOff: ajouterConge, dateDebut, dateFin, typeConge, justificatif, joursOuvrables, joursCalendaires, sandwichDetection
  Block: bloquerEmploye, debloquerEmploye, motifBlocage, descriptionOptionnelle, confirmerBlocage, confirmerDeblocage
  DayOff types: congeAnnuel, congeMaladie, congeSansSolde, autre
  Block reasons: absencesNonJustifiees, depassementQuota, nonRespectProcedures, autre
  Status: actif, aRisque, bloque
  Auth: selectionnerAdmin, codePIN, verificationEnCours, adminVerifie, pinIncorrect, tentativesRestantes, accesVerrouille

Commit: "feat: add EN/FR/AR language switcher with i18n translations"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After all fixes:
1. Run: cd client && npm run dev
2. Open browser, check console for errors — fix any red errors
3. Verify each fix visually:
   - Stat pills: inner shadow + shine visible
   - Calendar: looks clean, correct sizes
   - Ajouter congé: button opens 2-step modal, calendar works
   - Block/Unblock: header stays fixed when scrolling
   - Employee detail cards: compact, correct values
   - Nouvel employé: opens modal, all fields work
   - Employés tab: only Détails button in actions
   - All dropdowns: match login page style
   - Dark mode: toggle works, Apple colors apply everywhere
   - Language selector: switches EN/FR/AR correctly
4. Final commit: "fix: complete UI pass — dark mode, i18n, modals, cards, dropdowns"