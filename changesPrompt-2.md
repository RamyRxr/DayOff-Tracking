Read CLAUDE.md in this project.
You are fixing and improving the frontend UI only.
Do NOT touch any backend files, routes, controllers, or prisma files.
Only modify files inside client/src/
Work through each fix in order. Commit after each section.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 1 — NOTIFICATIONS: Decrease badge count on hover
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the notification bell and notification dropdown component.

Current problem: the red badge count never decreases.

Fix:
- Keep a local state: unreadCount initialized from notifications.length
- When the dropdown opens (bell clicked): start marking as read
- When user hovers over a notification row: mark that notification as read
  → decrement unreadCount by 1
  → visually mark the row as read (remove any unread indicator, row bg slightly fades)
- When unreadCount reaches 0: remove the red badge entirely (do not show "0")
- "Tout marquer lu" button: sets unreadCount to 0 instantly, hides badge
- unreadCount and read state live in local component state only — no API call needed

Commit: "fix: notification badge decreases on hover, disappears at zero"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 2 — NOTIFICATIONS: Make dropdown less transparent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the notification dropdown panel.

Current problem: too transparent, content behind it is visible through it.

Fix:
- Change background from any white/opacity class to bg-white (fully opaque white)
- Keep the rounded-2xl, shadow, border as they are
- Remove any backdrop-blur or bg-white/XX transparency on this specific panel
- The panel must be fully readable with no see-through effect

Commit: "fix: notification dropdown is now fully opaque"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 3 — STAT CARDS: Replace with fancy animated tabs/pills
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the 4 stat cards at the top of the home page (Total, Actifs, À risque, Bloqués).

Replace the card design entirely with a horizontal tab/pill bar:

Layout:
- Single row of 4 pill-shaped tabs, contained in one rounded-2xl white card
- Full width of the content area, equal spacing between tabs
- Each tab: rounded-xl, px-5 py-3, centered content

Each tab content:
- Large bold number (24px, font-bold)
- Small label below (11px, uppercase tracking-wider, gray)

Default (inactive) state:
- bg transparent, text gray-500
- On hover: bg gray-100 transition-all duration-200

Active (selected/filtered) state:
- bg white, text gray-900
- Soft ambient shadow: shadow-md
- Scale slightly: scale-[1.03] transform
- Smooth transition: transition-all duration-200 ease-out

Animation on tab switch:
- The active pill has a smooth sliding background effect
  Use a relative container with an absolutely positioned bg element
  that transitions its left position when active tab changes
  (like a sliding indicator behind the active tab)
- transition: left/transform over 250ms cubic-bezier(0.16, 1, 0.3, 1)

Filter behavior (keep from previous fix):
- Clicking "Total" → clears filter, shows all
- Clicking "Actifs" → filter to actif
- Clicking "À risque" → filter to a_risque
- Clicking "Bloqués" → filter to bloque
- Show filter result count below: "4 employés à risque" when filtered

Commit: "feat: replace stat cards with animated tab pills on home page"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 4 — HOME PAGE EMPLOYEE CARDS: Always show Détails button only
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the employee card component used on the home (Accueil) page.

Changes:
- Remove the "+ Congé" button completely from the home page card
- Keep only the "Détails" button
- Make "Détails" always visible — remove any opacity-0 or hover-only logic
- Button style: small, ghost, rounded-lg, gray border, "Détails" text
  Hover: bg gray-50, border darkens slightly, transition-all duration-150

Commit: "fix: home page employee card shows only always-visible Détails button"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 5 — HOME PAGE: Make employee cards look like Employés tab table rows
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the home page employee list and the Employés page table.

The home page list must use the same visual style as the Employés tab table.
Replace the current card-based list with a table layout:

Columns (same as Employés tab):
  Employé | Département | Congé | Statut | Actions

Column details:
- Employé: avatar circle (32px, initials, warm gray bg) + name bold 14px + matricule 11px gray below
- Département: small warm gray pill tag
- Congé: just the number of days off taken this period (e.g. "8 jours")
- Statut: small pill badge — dot + label (Actif/À risque/Bloqué), muted tinted bg
- Actions: "Détails" button only (ghost, always visible)

Table container: white bg, rounded-2xl, ambient shadow, same as Employés page
Header row: light gray bg, 11px uppercase tracking labels, 0.5px bottom border
Rows: 52px height, 0.5px separator, hover: rgba(0,0,0,0.02) bg
Blocked rows: no red background — the Bloqué badge is enough

Section title above the table: "Activité récente" — small uppercase gray label

Commit: "feat: home page employee list now matches Employés tab table style"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 6 — EMPLOYEE DETAIL PANEL: Fix the 3 value cards
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the 3 stat cards inside the employee detail panel
(currently showing Jours pris / Jours restants / Total annuel).

Replace their labels and values:

Card 1: 
- Label: "Jours de congé"
- Value: total day-off days taken this period (from daysOff records)

Card 2:
- Label: "Jours travaillés"
- Value: number of working days elapsed since period start (20th of month)
  Calculate: count days from period start to today, excluding Friday + Saturday
  Use the existing period utility or calculate inline with date-fns

Card 3:
- Label: "Jours disponibles"
- Value: (30 - daysOff taken) — remaining days before block threshold
  If this value is ≤ 4: show number in amber text
  If this value is ≤ 0: show "0" in red text

Remove the "Utilisation des congés" progress section entirely if it exists separately.

Commit: "fix: employee detail panel value cards show correct labels and data"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 7 — EMPLOYEE DETAIL PANEL: Make the calendar smaller
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the split calendar component inside the employee detail panel.

Current problem: calendar is too large, takes too much space.

Fix:
- Reduce day cell size from whatever it is now to 28px × 28px
- Reduce font size of day numbers to 11px
- Reduce padding inside the calendar card
- Reduce the gap between the two mini-calendars (left/right)
- Calendar month header ("Avril" / "Mai"): 11px uppercase tracking-wider
- Day-of-week headers (Mo Tu We Th Fr Sa Su): 10px, gray
- Overall calendar card: max-height should feel compact, not dominant
- The calendar should take roughly 35% of the panel height, not 50%+

Commit: "fix: make split calendar smaller and more compact in detail panel"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 8 — AJOUTER CONGÉ: Complete rebuild of the modal flow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The current AddDayOffModal is broken (shows white screen). Rebuild it cleanly.

Find or create: client/src/components/AddDayOffModal.jsx

This modal has TWO STEPS:

─── STEP 1: Pick dates + upload + reason ───

Header:
- Title: "Ajouter un Congé"
- Subtitle: employee name + matricule
- Step indicator: "Étape 1 sur 2"
- × close button

Content:

A. MINI CALENDAR (date range picker):
   - Show current month by default with prev/next month navigation arrows
   - Day cells: 34px × 34px, rounded-lg
   - Weekend cells (Fri + Sat): light gray bg, not selectable
   - Past days (before today): gray text, cursor-not-allowed, not selectable
   - Already used congé days: soft amber/20 bg, not selectable, tooltip "Congé existant"
   - Selectable days: hover shows navy/10 bg
   - Click first day: sets startDate (navy filled circle)
   - Click second day after startDate: sets endDate (navy filled circle)
     Days between start and end: navy/10 bg fill (range highlight)
   - Click a selected day again: clears selection
   - Below calendar: auto-calculated chip:
     "X jours ouvrables · Y jours calendaires"
     (working days = total days minus Fri+Sat in range)
   - If sandwich detected (range spans a Fri or Sat):
     Show amber warning strip: "⚠ Détection sandwich — Jours réels: Y · Déclarés: X"

B. FILE UPLOAD:
   - Label: "Pièce justificative (optionnel)"
   - Dashed border zone: rounded-xl, "Glisser ou cliquer · PDF, JPG, PNG · max 5 Mo"
   - On file selected: show filename + size + remove button (×)
   - Validate: reject files over 5MB with inline error message

C. REASON SELECTOR:
   - Label: "Type de congé"
   - Custom styled dropdown (not native select):
     Options: Congé annuel · Congé maladie · Congé sans solde · Autre
   - Required — cannot proceed without selecting

Footer:
- "Annuler" ghost button left
- "Suivant →" navy button right
  Disabled if: no dates selected OR no reason selected
  When clicked: go to Step 2

─── STEP 2: Admin authorization ───

Header:
- Title: "Autorisation requise"
- Subtitle: summary of selection — "12 – 16 Avr 2026 · 3 jours · Congé annuel"
- Step indicator: "Étape 2 sur 2"
- ← back button (returns to Step 1, keeps all selections)

Content:

A. ADMIN SELECTOR:
   - Custom dropdown showing admin cards (avatar + name + role)
   - Same style as login page admin selector

B. PIN INPUT:
   - Label: "Code PIN"
   - 4 separate input boxes (type="password", maxLength=1)
   - inputMode="numeric", pattern="[0-9]*"
   - Auto-focus first box on mount
   - Auto-advance on each digit
   - Backspace goes back to previous box
   - Auto-submit on 4th digit
   - No on-screen number buttons
   - States: idle / verifying (spinner) / verified (green) / error (red shake)

Footer:
- "← Retour" ghost button left
- "Confirmer le congé" navy button right
  Only enabled after PIN verified
  On click: submit to API → close modal → show success toast → refetch employee data

IMPORTANT WIRING:
- The "+ Congé" or "Ajouter un congé" button in EmployeeDetailPanel must:
  1. Set the current employeeId in state
  2. Open this modal
  3. Pass the employee's existing daysOff dates to the modal (to disable them)
- On success: refetch employee + update home page list (most recently modified employee goes to top)

Commit: "feat: rebuild AddDayOffModal as 2-step flow with working calendar and PIN"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 9 — BLOCK MODAL: Fix scrolling + fix content + add admin PIN step
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find BlockEmployeeModal component.

Problems to fix:

A. SCROLLING:
   - Modal must be scrollable when content overflows
   - Set modal container: max-h-[90vh] overflow-y-auto
   - Modal should be centered vertically, never taller than 90% viewport
   - Add padding-bottom inside modal so last element is not cut off

B. REPLACE THE 3 CARDS (Jours pris / Restants / Minimum):
   Remove those 3 cards entirely.
   Replace with a simple 2-column info row inside the inset summary card:
   - "Jours de congé pris: X"
   - "Jours travaillés: X" (same calculation as Fix 6 Card 2)

C. ADD REASON SELECTOR:
   Below the summary card, add:
   - Label: "Motif du blocage" (required)
   - Dropdown options:
     Absences non justifiées · Dépassement du quota de congés ·
     Non-respect des procédures · Autre

D. KEEP the optional description textarea as-is

E. TWO-STEP FLOW (same pattern as AddDayOffModal):
   Step 1: reason dropdown + description textarea → "Suivant →" button
   Step 2: admin selector + 4-box PIN keyboard input → "Confirmer le blocage" red button
   Back button on Step 2 returns to Step 1

F. SLIDE-UP ANIMATION:
   - On open: translateY(40px)→(0) + opacity 0→1, 250ms cubic-bezier(0.16,1,0.3,1)
   - On close: translateY(0)→(40px) + opacity 1→0, 200ms ease-in

Commit: "fix: block modal — scrollable, new content, reason selector, 2-step PIN flow"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 10 — UNBLOCK MODAL: Fix positioning + scrolling + PIN step
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the UnblockModal or unblock popover component.

Current problems: takes full screen height, not centered, not scrollable.

Fix:
- Modal must be centered on screen (fixed inset-0, flex items-center justify-center)
- Max width: max-w-md (448px)
- Max height: max-h-[80vh] overflow-y-auto
- Same glass style as other modals: white bg, rounded-2xl, ambient shadow
- Same slide-up animation as Block modal

Content (keep structure, fix layout):
- Header: green Unlock icon + "Débloquer l'Employé" + employee name row
- Summary inset card: show block reason + date blocked + who blocked
- Reason dropdown (required): Erreur administrative · Justification acceptée · Décision hiérarchique · Autre
- Optional description textarea
- Two-step flow same as Block modal:
  Step 1: reason + description → "Suivant →"
  Step 2: admin selector + 4-box PIN → "Confirmer le déblocage" green button

On success: close modal → toast "Employé débloqué" → refetch data

Commit: "fix: unblock modal centered, scrollable, 2-step PIN flow"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 11 — NOUVEL EMPLOYÉ: Fix the Add Employee modal
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the AddEmployeeModal component and the "Nouvel employé" button.

Current problem: button does nothing or modal is broken.

Fix the full flow:

A. BUTTON: make sure the "Nouvel employé" (or "+ Nouvel Employé") button in the
   Employés page header opens the modal and passes no employee data (it's for creation)

B. MODAL CONTENT — all required fields:
   - Prénom (text input, required)
   - Nom (text input, required)
   - Matricule: AUTO-GENERATED, format NAF-XXXX where XXXX is a random unique 4-digit number
     Show it as a read-only display: "NAF-3847" with a small "généré automatiquement" label
     Add a refresh icon (🔄) next to it to generate a new random code
     Must be unique — check against existing employees matricules from the loaded list
   - Département (dropdown, required):
     Production · Logistique · Administration · Maintenance · Qualité · Sécurité
   - Poste (text input, required): job title
   - Email (text input, required): suggest "prenom.nom@naftal.dz" auto-filled but editable
   - Téléphone (text input, optional): format +213 XX XX XX XX
   - Date d'embauche (date input, required)

C. VALIDATION before submit:
   - All required fields must be filled
   - Email must contain @
   - Matricule must be unique
   - Show inline error messages in French under each invalid field

D. TWO-STEP FLOW:
   Step 1: all employee fields → "Suivant →"
   Step 2: admin selector + PIN → "Créer l'employé" navy button

E. On success:
   - Close modal
   - Show toast: "Employé créé avec succès"
   - Refetch employees list
   - New employee appears in the list

Commit: "feat: fix Add Employee modal with all fields, auto matricule, 2-step PIN"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 12 — BLOQUÉS TAB: Export button + fix unblock + remove cards
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find the BlockedPage / Bloqués tab component.

A. REMOVE the 3 cards (Jours pris / Restants / Minimum) — delete them entirely

B. ADD EXPORT BUTTON in the page header (top right):
   Button label: "↓ Exporter les données"
   Style: ghost button, navy border + navy text
   On click: generate and download a CSV file named "employes-bloques-[date].csv"
   CSV columns: Nom · Matricule · Email · Téléphone · Département · Motif · Date de blocage
   Use the existing blocked employees data already loaded — no new API call
   For email: use employee.email or generate as "prenom.nom@naftal.dz"
   For phone: use employee.phone or "—"

C. FIX THE UNBLOCK BUTTON:
   Current problem: button is empty and broken
   Fix:
   - Button label: "Débloquer" (with Unlock icon from Lucide)
   - Style: ghost, red border + red text
   - On click: open the UnblockModal (fixed in Fix 10), passing the block record data
   - Make sure the block record (with blockId, employeeName, blockReason, blockedAt, blockedByAdmin)
     is passed correctly as props to UnblockModal

Commit: "fix: bloqués tab — export button, fix unblock button, remove cards"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After all fixes:
1. Run the dev server: cd client && npm run dev
2. Check browser console for errors — fix any that appear
3. Verify each fix works:
   - Notifications: badge decreases on hover, panel is opaque
   - Home: tab pills animate, table matches Employés tab, Détails always visible
   - Detail panel: correct 3 cards, smaller calendar
   - Add Congé: 2-step modal opens, calendar works, PIN keyboard input
   - Block: scrollable, 2-step, slides up
   - Unblock: centered, scrollable, 2-step
   - Add Employee: all fields, auto matricule, works end to end
   - Bloqués tab: export works, unblock button opens modal
4. Final commit: "fix: complete UI pass — notifications, cards, modals, export"