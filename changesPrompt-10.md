Read CLAUDE.md in this project.
You are fixing 3 specific problems in the frontend only.
Do NOT touch any backend files.
Only modify files inside client/src/
Work through each fix in order. Commit after each one.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 1 — DARK MODE: Apply instantly, no flash,
        no reload needed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current problem: clicking the toggle shows a broken half-dark state,
only a full reload makes it work correctly.
Looking at the 3 screenshots: Image1 = half-applied, Image2 = correct
dark after reload, Image3 = half-applied light after click.

Root cause: dark: classes are applied to some components via Tailwind
but NOT all components — specifically many components use inline
style={{}} objects that never react to the 'dark' class on the html element.
Also the app is not re-rendering when the class changes.

─── STEP A: Fix the useDarkMode hook ───

Replace client/src/hooks/useDarkMode.js entirely with:

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

─── STEP B: Prevent flash on page load ───

In client/src/main.jsx add this as the VERY FIRST lines,
before any import or ReactDOM call:

  // Must run before React renders — prevents theme flash
  ;(function() {
    const theme = localStorage.getItem('theme')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  })()

─── STEP C: Make App re-render on theme change ───

The core problem is that inline style={{}} objects do NOT react
to Tailwind dark: classes — they are hardcoded values.

Create a React Context so ALL components can read isDark and
use it in their style={{}} objects:

Create client/src/context/ThemeContext.jsx:

  import { createContext, useContext } from 'react'
  import { useDarkMode } from '../hooks/useDarkMode'

  export const ThemeContext = createContext({ isDark: false, toggle: () => {} })

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

In client/src/main.jsx, wrap the app with ThemeProvider:

  import { ThemeProvider } from './context/ThemeContext'
  // ...
  root.render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )

─── STEP D: Fix every component that uses inline styles ───

Find EVERY component file that has style={{ background: '...' }}
or style={{ color: '...' }} or style={{ boxShadow: '...' }}
with hardcoded light-mode color values.

In each of these files:
1. Import useTheme: import { useTheme } from '../context/ThemeContext'
2. Get isDark: const { isDark } = useTheme()
3. Replace every hardcoded color with a conditional:

   BEFORE: style={{ background: '#FAFAFA' }}
   AFTER:  style={{ background: isDark ? '#16161E' : '#FAFAFA' }}

   BEFORE: style={{ background: 'white' }}
   AFTER:  style={{ background: isDark ? '#1C1C28' : 'white' }}

   BEFORE: style={{ color: '#374151' }}
   AFTER:  style={{ color: isDark ? '#F2F2F7' : '#374151' }}

   BEFORE: style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.05)...' }}
   AFTER:  style={{ boxShadow: isDark
             ? '0 0 0 1px rgba(255,255,255,0.07), 0 4px 16px rgba(0,0,0,0.4)'
             : '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.06)' }}

The components that MUST be fixed (check all of them):
- Sidebar.jsx
- TopBar.jsx (or Header.jsx)
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
- Any calendar component files
- AutorisationStep.jsx (if exists)
- CustomSelect.jsx (if exists)
- Any other component with hardcoded color values

Dark mode color reference for inline styles:
  white bg card:          isDark ? '#16161E'           : 'white'
  page background:        isDark ? '#0A0A0F'           : '#FAFAFA'
  card/surface:           isDark ? '#1C1C28'           : '#F2F2F7'
  input fill:             isDark ? 'rgba(255,255,255,0.06)' : 'rgba(118,118,128,0.08)'
  text primary:           isDark ? '#F2F2F7'           : '#111827'
  text secondary:         isDark ? '#8E8E93'           : '#6B7280'
  border:                 isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'
  card shadow:            isDark
    ? '0 0 0 1px rgba(255,255,255,0.07), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)'
    : '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.06)'
  modal shadow:           isDark
    ? '0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.6)'
    : '0 0 0 1px rgba(0,0,0,0.08), 0 16px 48px rgba(0,0,0,0.16)'
  input inner shadow:     isDark
    ? 'inset 0 1px 3px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.06)'
    : 'inset 0 1px 2px rgba(0,0,0,0.06)'
  PIN box focused:        isDark
    ? '0 0 0 2px #2C4A6F, inset 0 1px 3px rgba(0,0,0,0.3)'
    : '0 0 0 2px #1A2F4F, inset 0 1px 3px rgba(0,0,0,0.08)'

Calendar cell colors in dark mode:
  normal cell:     { background: isDark ? 'rgba(255,255,255,0.04)' : '#FAFAFA',
                     color: isDark ? '#C7C7CC' : '#374151' }
  weekend cell:    { background: isDark ? 'rgba(255,255,255,0.02)' : '#F2F2F7',
                     color: isDark ? '#48484A' : '#C7C7CC' }
  day-off cell:    { background: isDark
                       ? 'rgba(192,57,43,0.2)'
                       : 'rgba(255,59,48,0.1)',
                     color: isDark ? '#FF6B6B' : '#C0392B' }
  selected cell:   same blue gradient works in both modes
  today cell:      same blue ring works in both modes
  past day:        { color: isDark ? '#3A3A3C' : '#C7C7CC', opacity: 0.6 }

─── STEP E: Fix the toggle button ───

Find the dark mode toggle button component (in top bar).
Make sure it imports useTheme (not useDarkMode directly):

  import { useTheme } from '../context/ThemeContext'
  const { isDark, toggle } = useTheme()
  <button onClick={toggle}>
    {isDark ? <Sun size={16} /> : <Moon size={16} />}
  </button>

The Sun/Moon icon must also switch immediately when isDark changes.

─── STEP F: Verify Tailwind config ───

Open client/tailwind.config.js
Confirm it has: darkMode: 'class'
If not, add it. This is required for dark: prefix classes to work.

Commit: "fix: dark mode applies instantly using ThemeContext, no reload needed"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 2 — DETAIL PANEL CALENDAR: Make it identical
        to the AddDayOffModal calendar
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current problem: the detail panel calendar has small boxes.
The AddDayOffModal calendar has the correct large cells.

The goal: make them share the exact same component code.

─── STEP A: Find the AddDayOffModal calendar ───

Open AddDayOffModal.jsx.
Find the calendar JSX — the part that renders day cells,
day-name headers, month navigation, cell colors.

Copy the EXACT cell rendering logic, cell size (w-10 h-10 = 40px),
and cell color style objects.

─── STEP B: Create a shared CalendarGrid component ───

Create client/src/components/CalendarGrid.jsx

This component renders a single month section of a calendar.
Props:
  days        — array of Date objects to render
  monthLabel  — string like "AVRIL" or "MAI"
  startDate   — currently selected start date (or null)
  endDate     — currently selected end date (or null)
  onDayClick  — function(date) — called when a selectable day is clicked
  disabledDates — Set of 'yyyy-MM-dd' strings (existing congé dates)
  readOnly    — boolean (true = detail panel, false = picker modal)
  isDark      — boolean from useTheme()

Day cell size: w-10 h-10 (40px × 40px) — this is what the AddDayOffModal uses
Cell border radius: rounded-lg
Font: text-[13px] font-medium

Day-name header row (Monday first):
  ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  V (index 4) and S (index 5): color #C7C7CC (lighter)
  Others: color #8E8E93

Cell colors — use EXACTLY the same values as AddDayOffModal:
(copy from there, do not invent new values)

  getDayStyle(day, isDark):
    if isWeekend(day):
      { background: '#F2F2F7', color: '#C7C7CC', cursor: 'not-allowed' }
    if isBefore(day, today):
      { background: 'transparent', color: isDark ? '#3A3A3C' : '#C7C7CC',
        opacity: 0.6, cursor: 'not-allowed' }
    if disabledDates.has(format(day, 'yyyy-MM-dd')):
      { background: isDark ? 'rgba(192,57,43,0.2)' : 'rgba(255,59,48,0.1)',
        boxShadow: isDark
          ? 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 0 1px rgba(255,59,48,0.2)'
          : 'inset 0 1px 0 rgba(255,255,255,0.8), inset 0 0 0 1px rgba(255,59,48,0.15)',
        color: isDark ? '#FF6B6B' : '#C0392B',
        fontWeight: 600,
        cursor: readOnly ? 'default' : 'not-allowed' }
    if isStart(day) or isEnd(day):
      { background: 'linear-gradient(145deg, #007AFF, #0055D4)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 8px rgba(0,122,255,0.35)',
        color: 'white', fontWeight: 700 }
    if inRange(day):
      { background: 'rgba(0,122,255,0.1)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 0 1px rgba(0,122,255,0.15)',
        color: '#0055D4', fontWeight: 500 }
    if isToday(day):
      { background: 'rgba(0,122,255,0.06)',
        boxShadow: '0 0 0 1.5px #007AFF, inset 0 1px 0 rgba(255,255,255,0.9)',
        color: '#007AFF', fontWeight: 600 }
    default:
      { background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)',
        boxShadow: isDark
          ? 'inset 0 1px 0 rgba(255,255,255,0.04)'
          : 'inset 0 1px 1px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)',
        color: isDark ? '#C7C7CC' : '#374151',
        cursor: readOnly ? 'default' : 'pointer' }

For readOnly mode (detail panel):
  onDayClick only fires if the day has a congé record
  (to show the day-off details popup)
  Otherwise clicking does nothing

─── STEP C: Build the split calendar using CalendarGrid ───

Create client/src/components/SplitCalendar.jsx

This renders TWO CalendarGrid sections with a separator between them.
Props:
  employeeDaysOff  — array of {startDate, endDate} objects
  startDate        — selected range start (for picker mode)
  endDate          — selected range end (for picker mode)
  onDayClick       — function(date) called on click
  readOnly         — boolean
  onDayOffClick    — function(dayOffRecord) for popup in detail panel

Internal logic:
  const today = new Date()  // April 25, 2026
  const currentMonth = today.getMonth()   // 3 = April
  const currentYear = today.getFullYear() // 2026
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Section 1: days 20 to end of current month
  const section1Days = []
  for (let d = 20; d <= daysInCurrentMonth; d++) {
    section1Days.push(new Date(currentYear, currentMonth, d))
  }

  // Section 2: days 1 to 19 of next month
  const nextMonth = (currentMonth + 1) % 12
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear
  const section2Days = []
  for (let d = 1; d <= 19; d++) {
    section2Days.push(new Date(nextYear, nextMonth, d))
  }

  // Build disabled dates set from employeeDaysOff
  const disabledDates = new Set()
  employeeDaysOff.forEach(record => {
    const start = startOfDay(new Date(record.startDate))
    const end = startOfDay(new Date(record.endDate))
    let current = new Date(start)
    while (current <= end) {
      disabledDates.add(format(current, 'yyyy-MM-dd'))
      current.setDate(current.getDate() + 1)
    }
  })

Render:
  <div>
    <CalendarGrid
      days={section1Days}
      monthLabel={format(new Date(currentYear, currentMonth, 1), 'MMMM yyyy', { locale: fr }).toUpperCase()}
      startDate={startDate}
      endDate={endDate}
      onDayClick={onDayClick}
      disabledDates={disabledDates}
      readOnly={readOnly}
      isDark={isDark}
    />

    {/* Separator */}
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#E5E5EA' }} />
      <span className="text-[10px] uppercase tracking-wider" style={{ color: '#8E8E93' }}>
        {format(new Date(nextYear, nextMonth, 1), 'MMMM yyyy', { locale: fr }).toUpperCase()}
      </span>
      <div className="flex-1 h-px" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#E5E5EA' }} />
    </div>

    <CalendarGrid
      days={section2Days}
      monthLabel=""
      startDate={startDate}
      endDate={endDate}
      onDayClick={onDayClick}
      disabledDates={disabledDates}
      readOnly={readOnly}
      isDark={isDark}
    />
  </div>

─── STEP D: Use SplitCalendar in EmployeeDetailPanel ───

In EmployeeDetailPanel.jsx:
Remove whatever calendar JSX exists there now.
Import and use SplitCalendar:

  <SplitCalendar
    employeeDaysOff={daysOff || []}
    readOnly={true}
    onDayOffClick={(record) => {
      setSelectedDayOff(record)
      setShowDayOffPopup(true)
    }}
  />

─── STEP E: Use SplitCalendar in AddDayOffModal ───

In AddDayOffModal.jsx Step 1:
Remove the existing calendar JSX.
Import and use SplitCalendar:

  <SplitCalendar
    employeeDaysOff={existingDaysOff || []}
    startDate={startDate}
    endDate={endDate}
    onDayClick={handleDayClick}
    readOnly={false}
  />

Where handleDayClick(day) implements range selection:
  if (!startDate || (startDate && endDate)) {
    setStartDate(day); setEndDate(null)
  } else {
    if (isBefore(day, startDate)) { setStartDate(day) }
    else { setEndDate(day) }
  }

─── STEP F: Use SplitCalendar in HomeAddDayOffModal ───

In HomeAddDayOffModal.jsx Step 2:
Same as AddDayOffModal — remove existing calendar, use SplitCalendar.

After this fix, ALL 3 calendars (detail panel, AddDayOffModal,
HomeAddDayOffModal) use the exact same component with identical
cell sizes, colors, and split structure.

Commit: "fix: all calendars use shared SplitCalendar + CalendarGrid components, identical style"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 3 — LANGUAGE: Make translations apply to
        EVERY hardcoded string in the entire app
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current problem: switching to English changes SOME text but not all.
Many components have hardcoded French strings that ignore i18n.

─── STEP A: Verify i18n is initialized correctly ───

Check that client/src/i18n/index.js exists and is imported
in client/src/main.jsx as the FIRST import.

If it exists but translations don't apply, the issue is that
components are not using the t() function.

─── STEP B: Audit every component for hardcoded strings ───

Open EVERY component file one by one.
Find EVERY string visible to the user that is hardcoded in French.
Replace EACH one with t('key').

The complete list of components to audit and fix:

1. Sidebar.jsx:
   "Accueil" → t('accueil')
   "Employés" → t('employes')
   "Bloqués" → t('bloques')
   "Calendrier" → t('calendrier')
   "HR Admin" or any role text → keep as-is (it's data, not UI)
   "DayOff" → do NOT translate (it's the brand name)
   "NAFTAL" → do NOT translate (it's the company name)

2. TopBar.jsx:
   "Période" or "Period" → t('periode')
   "Notifications" → t('notifications')
   "Tout marquer lu" → t('toutMarquerLu')
   "Aucune notification" → t('aucuneNotification')
   Any "À risque" labels → t('aRisque')
   Any "Bloqué" labels → t('bloque')

3. HomePage.jsx:
   "Activité récente" → t('activiteRecente')
   "Total" → t('totalEmployes')
   "Actifs" → t('actifs')
   "À risque" → t('aRisque')
   "Bloqués" / "Bloqué" → t('bloques_')
   "Détails" → t('details')
   "employés" (count label) → t('employes').toLowerCase()

4. EmployeesPage.jsx:
   "Employés" (page title) → t('employes')
   "Gérez tous les employés..." → t('gererEmployes')
   "Nouvel employé" → t('nouvelEmploye')
   "Rechercher par nom..." → t('rechercherEmploye')
   "Tous les statuts" → t('tousStatuts')
   "EMPLOYÉ" (column header) → t('employe').toUpperCase()
   "DÉPARTEMENT" → t('departement').toUpperCase()
   "CONGÉS" → t('conges').toUpperCase()
   "STATUT" → t('statut').toUpperCase()
   "ACTIONS" → t('actions').toUpperCase()
   "jours" → t('jours')
   "Actif" → t('actif')
   "À risque" → t('aRisque')
   "Bloqué" → t('bloque')
   "Détails" → t('details')
   "Bloquer" → t('bloquer')
   "employés" (count) → t('employes').toLowerCase()

5. BlockedPage.jsx:
   "Bloqués" (page title) → t('bloques')
   "Exporter les données" → t('exporterDonnees')
   "Débloquer" → t('debloquer')
   "Télécharger" → t('telecharger')
   All column headers → use t() keys
   "Aucun employé bloqué" → t('aucunBloque')

6. EmployeeDetailPanel.jsx:
   "Jours de congé" → t('joursConge')
   "Jours travaillés" → t('joursTravailles')
   "Jours disponibles" → t('joursDisponibles')
   "Ajouter un congé" → t('ajouterConge')
   "Bloquer l'employé" → t('bloquerEmploye')
   "Débloquer" → t('debloquer')
   "Historique" → t('historique')
   "Congé" (legend) → t('congeLabel')
   "Week-end" → t('weekend')
   "Bloqué" (legend) → t('bloque')
   "Aujourd'hui" → t('aujourdhui')

7. AddDayOffModal.jsx:
   "Ajouter un Congé" → t('ajouterConge')
   "Étape X / 2" → t('etape') + ' X / 2'
   "Pièce justificative" → t('pieceJustificative')
   "optionnel" → t('optionnel')
   "Glisser ou cliquer..." → t('glisserCliquer')
   "Type de congé" → t('typeConge')
   "Congé annuel" → t('congeAnnuel')
   "Congé maladie" → t('congeMaladie')
   "Congé sans solde" → t('congeSansSolde')
   "Autre" → t('autre')
   "jours ouvrables" → t('joursOuvrables')
   "jours calendaires" → t('joursCalendaires')
   "Annuler" → t('annuler')
   "Suivant →" → t('suivant')
   "Autorisation requise" → t('autorisationRequise')
   "Code PIN à 4 chiffres" → t('codePIN')
   "Vérification en cours..." → t('verificationEnCours')
   "Administrateur vérifié" → t('adminVerifie')
   "PIN incorrect" → t('pinIncorrect')
   "← Retour" → t('retour')
   "Confirmer le congé" → t('confirmerConge')

8. HomeAddDayOffModal.jsx:
   Same as AddDayOffModal plus:
   "Choisir un employé" → t('choisirEmploye')
   "Rechercher un employé..." → t('rechercherEmploye')
   "Étape X / 3" → t('etape') + ' X / 3'
   "Aucun employé trouvé" → t('aucunEmployeTrouve')

9. BlockEmployeeModal.jsx:
   "Bloquer l'Employé" → t('bloquerEmploye')
   "Le versement du salaire..." → t('avertissementBlocage')
   "Jours de congé pris" → t('joursCongePris')
   "Jours travaillés" → t('joursTravailles')
   "Motif du blocage" → t('motifBlocage')
   "Absences non justifiées" → t('absencesNonJustifiees')
   "Dépassement du quota de congés" → t('depassementQuota')
   "Non-respect des procédures" → t('nonRespectProcedures')
   "Autre" → t('autre')
   "Description" → t('description')
   "Décrivez la raison..." → t('decrireBlocage')
   "Confirmer le blocage" → t('confirmerBlocage')
   "Un document officiel..." → t('documentOfficiel')
   "Blocage impossible..." tooltip → t('blocageImpossible')

10. UnblockModal.jsx:
    "Débloquer l'Employé" → t('debloquerEmploye')
    "Bloqué par" → t('bloquePar')
    "Date de blocage" → t('dateBlocage')
    "Motif du blocage" → t('motifBlocage')
    "Motif du déblocage" → t('motifDeblocage')
    "Erreur administrative" → t('erreurAdmin')
    "Justification acceptée" → t('justificationAcceptee')
    "Décision hiérarchique" → t('decisionHierarchique')
    "Confirmer le déblocage" → t('confirmerDeblocage')

11. AddEmployeeModal.jsx:
    "Nouvel Employé" → t('nouvelEmploye')
    All field labels → t() keys
    "généré automatiquement" → t('genereAuto')
    "Créer l'employé" → t('creerEmploye')

12. CalendarPage.jsx:
    "Calendrier des Congés" → t('calendrierConges')
    All labels on this page

13. LoginPage.jsx:
    "Connexion" or "Login" → t('connexion')
    "Sélectionner un administrateur" → t('selectionnerAdmin')
    Any other visible text

─── STEP C: Add missing keys to translation files ───

After auditing all components, add ANY missing keys to all 3 files:
client/src/i18n/index.js (the inline resources object)

Add these keys that were likely missing:

In fr translation:
  "periode": "Période",
  "gererEmployes": "Gérez tous les employés et leurs congés",
  "tousStatuts": "Tous les statuts",
  "employe": "Employé",
  "conges": "Congés",
  "jours": "jours",
  "bloquerEmploye": "Bloquer l'employé",
  "debloquerEmploye": "Débloquer l'employé",
  "historique": "Historique",
  "congeLabel": "Congé",
  "weekend": "Week-end",
  "aujourdhui": "Aujourd'hui",
  "autorisationRequise": "Autorisation requise",
  "confirmerConge": "Confirmer le congé",
  "optionnel": "optionnel",
  "choisirEmploye": "Choisir un employé",
  "aucunEmployeTrouve": "Aucun employé trouvé",
  "avertissementBlocage": "Le versement du salaire sera suspendu pour cette période",
  "joursCongePris": "Jours de congé pris",
  "decrireBlocage": "Décrivez la raison du blocage...",
  "confirmerBlocage": "Confirmer le blocage",
  "documentOfficiel": "Un document officiel sera généré automatiquement",
  "blocageImpossible": "Blocage impossible — l'employé n'a pas atteint 15 jours de congé",
  "bloquePar": "Bloqué par",
  "dateBlocage": "Date de blocage",
  "motifDeblocage": "Motif du déblocage",
  "erreurAdmin": "Erreur administrative",
  "justificationAcceptee": "Justification acceptée",
  "decisionHierarchique": "Décision hiérarchique",
  "confirmerDeblocage": "Confirmer le déblocage",
  "genereAuto": "généré automatiquement",
  "creerEmploye": "Créer l'employé",
  "calendrierConges": "Calendrier des Congés",
  "connexion": "Connexion",
  "aucunBloque": "Aucun employé bloqué",
  "telecharger": "Télécharger",
  "absencesNonJustifiees": "Absences non justifiées",
  "depassementQuota": "Dépassement du quota de congés",
  "nonRespectProcedures": "Non-respect des procédures"

Add equivalent translations in en and ar translation objects.

─── STEP D: Add useTranslation to every component ───

For every component file that uses t() but doesn't have it yet:
Add at the top of the component function:
  const { t } = useTranslation()
Add the import at the top of the file:
  import { useTranslation } from 'react-i18next'

─── STEP E: Verify language switching ───

After all changes, test:
1. App loads in French by default — all text is French
2. Click EN — EVERY visible string on EVERY page switches to English
3. Click AR — EVERY visible string switches to Arabic, layout flips RTL
4. Click FR — back to French

If any string does not switch, find it and wrap it with t().

Commit: "fix: complete i18n coverage — every hardcoded French string now uses t() translation"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After all 3 fixes:

1. Run: cd client && npm run dev
2. Fix any console errors before finishing

3. Verify DARK MODE (most important):
   - Click toggle → UI switches to dark INSTANTLY (no reload)
   - EVERY component is dark: sidebar, top bar, ALL modals,
     detail panel, calendar cells, table rows, inputs, buttons
   - Reload → dark mode stays (no flash of light mode)
   - Click toggle again → switches back to light INSTANTLY
   - EVERY component is light again

4. Verify CALENDAR:
   - Open employee detail panel
   - Calendar shows AVRIL section with days 20–30 (large 40px cells)
   - Separator line with MAI label
   - MAI section with days 1–19 (same large cells)
   - Day-name row above each section: L M M J V S D
   - Same cell colors as AddDayOffModal
   - Open AddDayOffModal → calendar looks identical
   - Open HomeAddDayOffModal → calendar looks identical

5. Verify LANGUAGE:
   - Switch to EN → check: sidebar nav, page titles, table headers,
     modal titles, button labels, status badges, form labels,
     placeholder text — ALL in English
   - Switch to AR → same check in Arabic + RTL layout
   - Switch to FR → all back to French

6. Final commit: "fix: dark mode instant via ThemeContext, unified SplitCalendar, complete i18n"