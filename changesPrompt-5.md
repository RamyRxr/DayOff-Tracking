Read CLAUDE.md in this project.
You are fixing 5 specific problems in the frontend only.
Do NOT touch any backend files.
Only modify files inside client/src/
Work through each fix in order. Commit after each one.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 1 — LANGUAGE SELECTOR: Make it actually work
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The language button exists but clicking EN / FR / AR changes nothing.
Follow these steps exactly.

STEP A — Check if i18next is installed:
Run: cat client/package.json | grep i18next
If i18next and react-i18next are NOT in dependencies, run:
  cd client && npm install i18next react-i18next

STEP B — Check if i18n is initialized:
Look for client/src/i18n/index.js or client/src/i18n.js
If it does NOT exist, create client/src/i18n/index.js:

  import i18n from 'i18next'
  import { initReactI18next } from 'react-i18next'

  const resources = {
    fr: {
      translation: {
        accueil: 'Accueil', employes: 'Employés', bloques: 'Bloqués',
        calendrier: 'Calendrier', details: 'Détails',
        ajouterConge: 'Ajouter un congé', nouvelEmploye: 'Nouvel employé',
        bloquer: 'Bloquer', debloquer: 'Débloquer',
        confirmer: 'Confirmer', annuler: 'Annuler',
        suivant: 'Suivant →', retour: '← Retour',
        activiteRecente: 'Activité récente',
        totalEmployes: 'Total', actifs: 'Actifs',
        aRisque: 'À risque', bloques_: 'Bloqués',
        joursConge: 'Jours de congé', joursTravailles: 'Jours travaillés',
        joursDisponibles: 'Jours disponibles',
        typeConge: 'Type de congé', congeAnnuel: 'Congé annuel',
        congeMaladie: 'Congé maladie', congeSansSolde: 'Congé sans solde',
        autre: 'Autre', pieceJustificative: 'Pièce justificative',
        motifBlocage: 'Motif du blocage', description: 'Description',
        selectionnerAdmin: 'Sélectionner un administrateur',
        codePIN: 'Code PIN à 4 chiffres',
        verificationEnCours: 'Vérification en cours...',
        adminVerifie: 'Administrateur vérifié', pinIncorrect: 'PIN incorrect',
        notifications: 'Notifications', toutMarquerLu: 'Tout marquer lu',
        aucuneNotification: 'Aucune notification',
        departement: 'Département', poste: 'Poste',
        statut: 'Statut', actions: 'Actions', matricule: 'Matricule',
        nom: 'Nom', prenom: 'Prénom', email: 'Email',
        telephone: 'Téléphone', dateEmbauche: "Date d'embauche",
        actif: 'Actif', bloque: 'Bloqué', aRisqueStatus: 'À risque',
        exporterDonnees: 'Exporter les données',
        choisirEmploye: 'Choisir un employé',
        rechercherEmploye: 'Rechercher un employé...',
      }
    },
    en: {
      translation: {
        accueil: 'Home', employes: 'Employees', bloques: 'Blocked',
        calendrier: 'Calendar', details: 'Details',
        ajouterConge: 'Add day off', nouvelEmploye: 'New employee',
        bloquer: 'Block', debloquer: 'Unblock',
        confirmer: 'Confirm', annuler: 'Cancel',
        suivant: 'Next →', retour: '← Back',
        activiteRecente: 'Recent activity',
        totalEmployes: 'Total', actifs: 'Active',
        aRisque: 'At risk', bloques_: 'Blocked',
        joursConge: 'Days off', joursTravailles: 'Working days',
        joursDisponibles: 'Available days',
        typeConge: 'Leave type', congeAnnuel: 'Annual leave',
        congeMaladie: 'Sick leave', congeSansSolde: 'Unpaid leave',
        autre: 'Other', pieceJustificative: 'Supporting document',
        motifBlocage: 'Block reason', description: 'Description',
        selectionnerAdmin: 'Select an administrator',
        codePIN: '4-digit PIN code',
        verificationEnCours: 'Verifying...',
        adminVerifie: 'Administrator verified', pinIncorrect: 'Incorrect PIN',
        notifications: 'Notifications', toutMarquerLu: 'Mark all read',
        aucuneNotification: 'No notifications',
        departement: 'Department', poste: 'Position',
        statut: 'Status', actions: 'Actions', matricule: 'ID',
        nom: 'Last name', prenom: 'First name', email: 'Email',
        telephone: 'Phone', dateEmbauche: 'Hire date',
        actif: 'Active', bloque: 'Blocked', aRisqueStatus: 'At risk',
        exporterDonnees: 'Export data',
        choisirEmploye: 'Choose an employee',
        rechercherEmploye: 'Search employee...',
      }
    },
    ar: {
      translation: {
        accueil: 'الرئيسية', employes: 'الموظفون', bloques: 'المحجوبون',
        calendrier: 'التقويم', details: 'التفاصيل',
        ajouterConge: 'إضافة إجازة', nouvelEmploye: 'موظف جديد',
        bloquer: 'حجب', debloquer: 'رفع الحجب',
        confirmer: 'تأكيد', annuler: 'إلغاء',
        suivant: 'التالي ←', retour: '→ رجوع',
        activiteRecente: 'النشاط الأخير',
        totalEmployes: 'الإجمالي', actifs: 'نشطون',
        aRisque: 'في خطر', bloques_: 'محجوبون',
        joursConge: 'أيام الإجازة', joursTravailles: 'أيام العمل',
        joursDisponibles: 'الأيام المتاحة',
        typeConge: 'نوع الإجازة', congeAnnuel: 'إجازة سنوية',
        congeMaladie: 'إجازة مرضية', congeSansSolde: 'إجازة بدون أجر',
        autre: 'أخرى', pieceJustificative: 'وثيقة مؤيدة',
        motifBlocage: 'سبب الحجب', description: 'الوصف',
        selectionnerAdmin: 'اختر مديراً',
        codePIN: 'رمز PIN المكون من 4 أرقام',
        verificationEnCours: 'جارٍ التحقق...',
        adminVerifie: 'تم التحقق من المدير', pinIncorrect: 'رمز PIN غير صحيح',
        notifications: 'الإشعارات', toutMarquerLu: 'تحديد الكل كمقروء',
        aucuneNotification: 'لا توجد إشعارات',
        departement: 'القسم', poste: 'المنصب',
        statut: 'الحالة', actions: 'الإجراءات', matricule: 'الرقم الوظيفي',
        nom: 'الاسم', prenom: 'اللقب', email: 'البريد الإلكتروني',
        telephone: 'الهاتف', dateEmbauche: 'تاريخ التوظيف',
        actif: 'نشط', bloque: 'محجوب', aRisqueStatus: 'في خطر',
        exporterDonnees: 'تصدير البيانات',
        choisirEmploye: 'اختر موظفاً',
        rechercherEmploye: 'بحث عن موظف...',
      }
    }
  }

  i18n.use(initReactI18next).init({
    resources,
    lng: localStorage.getItem('lang') || 'fr',
    fallbackLng: 'fr',
    interpolation: { escapeValue: false }
  })

  export default i18n

STEP C — Import i18n in main.jsx:
Open client/src/main.jsx
Add this import at the very top (before React imports):
  import './i18n/index.js'
This must be the FIRST import so i18n is ready before any component renders.

STEP D — Fix the language selector component:
Find the language selector component (near the notification bell in the top bar).
Find the click handler for each language option.
Replace the entire click handler with this exact pattern:

  import i18n from '../i18n/index.js'  // adjust path as needed

  const changeLanguage = (code) => {
    i18n.changeLanguage(code)
    localStorage.setItem('lang', code)
    if (code === 'ar') {
      document.documentElement.dir = 'rtl'
      document.documentElement.lang = 'ar'
    } else {
      document.documentElement.dir = 'ltr'
      document.documentElement.lang = code
    }
    setIsOpen(false)
  }

Make sure each option button calls changeLanguage with the correct code:
  FR option → changeLanguage('fr')
  EN option → changeLanguage('en')
  AR option → changeLanguage('ar')

STEP E — Apply t() translations to every component:
In EVERY component file that has hardcoded French text, do the following:

1. Add at top of file:
   import { useTranslation } from 'react-i18next'

2. Inside the component function:
   const { t } = useTranslation()

3. Replace every hardcoded French string with t('key'):
   Examples:
   "Accueil"              → {t('accueil')}
   "Employés"             → {t('employes')}
   "Ajouter un congé"     → {t('ajouterConge')}
   "Détails"              → {t('details')}
   "Annuler"              → {t('annuler')}
   "Suivant"              → {t('suivant')}
   "Jours de congé"       → {t('joursConge')}
   "Jours travaillés"     → {t('joursTravailles')}
   "Jours disponibles"    → {t('joursDisponibles')}
   etc.

Do this for ALL components — sidebar, top bar, home page, employee card,
detail panel, all modals, tables, buttons, labels, placeholders.
Do NOT leave any hardcoded French strings in any component.

STEP F — Verify it works:
After all changes, the app must:
- Default to French on first load
- Switch all text to English when EN is clicked
- Switch all text to Arabic + flip layout to RTL when AR is clicked
- Remember the choice on page refresh (localStorage)

Commit: "fix: language selector now actually changes UI language EN/FR/AR"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 2 — ACCUEIL FAB BUTTON: Change from "Add Employee"
        to "Add Day Off with Employee Search"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The "+" FAB button on the Accueil page currently opens "Add Employee".
Change it to open "Add Day Off" with an employee search step first.

Find the FAB button on the home page and what modal it opens.
Replace that modal with a new component: HomeAddDayOffModal.jsx

This modal has THREE STEPS:

─── STEP 1: Choose an employee ───

Modal structure:
- Fixed overlay: fixed inset-0 bg-black/30 backdrop-blur-sm z-50
- Centered card: bg-white rounded-2xl w-full max-w-lg
- Use flex flex-col with fixed header + scrollable body + fixed footer
  (same sticky header/footer pattern as Fix 3 below)

Header (flex-shrink-0, never scrolls):
- Title: "Ajouter un Congé" (or t('ajouterConge'))
- Subtitle: "Étape 1 / 3 — Choisir un employé"
- × close button top-right

Scrollable body (flex-1 overflow-y-auto):
- Search input at top:
  - Placeholder: "Rechercher par nom ou matricule..."
  - Apple-style: warm gray fill rgba(118,118,128,0.08), inner shadow,
    rounded-xl, h-11, search icon inside left
  - Filters results in real time as user types
  - Input autofocuses when modal opens

- Employee list below search:
  - Renders employees fetched from useEmployees() hook
  - Filter: show only employees whose name or matricule contains the search text
  - Each employee row:
    • Avatar circle (32px, initials, warm gray bg)
    • Name bold 14px + matricule 11px gray below
    • Department pill (small, warm gray bg)
    • Status badge (Actif/À risque/Bloqué)
    • Entire row is clickable
    • Hover: row bg rgba(0,0,0,0.02), smooth transition
    • Selected row: bg-blue-50, left border 2px solid #1B3A6B
  - Loading state: show 3 skeleton rows while fetching
  - Empty search state: "Aucun employé trouvé" centered gray text

- Selected employee preview (appears below list when an employee is chosen):
  Inset card (warm gray bg, inner shadow, rounded-xl, p-4):
  • Avatar (40px) + name + matricule + department
  • 3 compact stat chips in a row:
    - "Jours de congé" : X
    - "Jours travaillés" : X
    - "Jours disponibles" : X
  • Status badge
  • This is the same info shown in the detail panel — reuse the same
    stat calculation logic

Footer (flex-shrink-0, never scrolls, border-t):
- "Annuler" ghost button left
- "Suivant →" navy button right
  Disabled until an employee is selected

─── STEP 2: Pick dates + upload + reason ───
Exactly the same as the existing AddDayOffModal Step 1.
Header shows: "Étape 2 / 3 — Dates et motif"
Show selected employee name in subtitle.
Calendar, file upload, reason selector — identical to existing modal.
Footer: "← Retour" ghost left + "Suivant →" navy right
  Disabled until dates and reason are selected.

─── STEP 3: Admin authorization ───
Exactly the same as existing AddDayOffModal Step 2.
Header shows: "Étape 3 / 3 — Autorisation"
Show summary: "Ahmed B. · 12–16 Avr · 3 jours · Congé annuel"
Admin selector + 4-box PIN keyboard input.
Footer: "← Retour" ghost left + "Confirmer le congé" navy right
  Only active after PIN verified.

On submit:
- Call POST /api/daysoff with correct employeeId and dates
- Close modal
- Show success toast
- Refetch employees list so updated employee appears at top

Wire it up:
- FAB button onClick → setShowHomeAddDayOff(true)
- Render: {showHomeAddDayOff && <HomeAddDayOffModal onClose={...} onSuccess={...} />}
- Pass employees list from useEmployees() as prop or let modal fetch its own

Commit: "feat: FAB opens add day off with employee search, 3-step flow"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 3 — ALL MODALS: Fix overflow, scrollbar, sticky
        header/footer — apply to ALL 5 modals
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This fix applies to ALL of these modals:
1. AddDayOffModal (opened from detail panel "Ajouter un congé" button)
2. HomeAddDayOffModal (new modal from Fix 2)
3. BlockEmployeeModal
4. UnblockModal
5. AddEmployeeModal

Problem: when scrolling, content bleeds under the header.
The scrollbar appears outside the card causing ugly margins.
The footer buttons are visible even when content hasn't been scrolled.

Apply this EXACT structure to ALL 5 modals:

OUTER WRAPPER (overlay):
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm
                  flex items-end sm:items-center justify-center
                  z-50 p-0 sm:p-4">

MODAL CARD:
  <div className="bg-white rounded-t-2xl sm:rounded-2xl
                  w-full sm:max-w-lg
                  flex flex-col
                  h-[92vh] sm:max-h-[88vh]
                  overflow-hidden"
       style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.2)' }}>

  STICKY HEADER (never scrolls):
    <div className="flex-shrink-0 flex items-center justify-between
                    px-5 pt-5 pb-4
                    border-b border-gray-100">
      [title + step indicator + close button]
    </div>

  SCROLLABLE BODY (only this part scrolls):
    <div className="flex-1 min-h-0 overflow-y-auto
                    px-5 py-4 space-y-5
                    scrollbar-thin scrollbar-thumb-gray-200
                    scrollbar-track-transparent">
      [all form content]

      /* IMPORTANT: Add extra padding at the bottom so last field
         is not hidden behind the footer */
      <div className="h-6" />
    </div>

  STICKY FOOTER (never scrolls):
    <div className="flex-shrink-0 flex items-center justify-between
                    px-5 py-4
                    border-t border-gray-100 bg-white">
      [cancel/back button] [next/confirm button]
    </div>

  </div>
</div>

KEY RULES for this structure:
- overflow-hidden on the card prevents any bleed outside
- min-h-0 on the scrollable body is REQUIRED for flex children to scroll
- The scrollbar appears INSIDE the card, never outside
- Header and footer have bg-white so they cover content scrolling behind them
- No content ever appears on top of or behind the header/footer

SCROLLBAR STYLE:
Install scrollbar styling if not present:
  npm install tailwind-scrollbar
Add to tailwind.config.js plugins: require('tailwind-scrollbar')
Use on scrollable divs:
  scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent

If tailwind-scrollbar cannot be installed, use this CSS instead in index.css:
  .modal-scroll::-webkit-scrollbar { width: 4px; }
  .modal-scroll::-webkit-scrollbar-track { background: transparent; }
  .modal-scroll::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 9999px; }
Then add class "modal-scroll" to all scrollable body divs.

FOOTER VISIBILITY:
For BlockEmployeeModal and UnblockModal ONLY:
The "Annuler / Suivant" footer buttons must be hidden until the user
has scrolled to the bottom of the content.

Implement this with an IntersectionObserver:
1. Add a sentinel div at the very bottom of the scrollable body:
   <div ref={sentinelRef} className="h-px" />

2. Add state: const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)

3. Add useEffect:
   useEffect(() => {
     const observer = new IntersectionObserver(
       ([entry]) => { if (entry.isIntersecting) setHasScrolledToBottom(true) },
       { threshold: 0.1 }
     )
     if (sentinelRef.current) observer.observe(sentinelRef.current)
     return () => observer.disconnect()
   }, [])

4. If content is short enough to not need scrolling, sentinel will be
   visible immediately so hasScrolledToBottom becomes true right away.

5. Apply to footer:
   <div className={`flex-shrink-0 flex items-center justify-between px-5 py-4
                    border-t border-gray-100 bg-white transition-all duration-300
                    ${hasScrolledToBottom
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-4 pointer-events-none'}`}>

Apply the IntersectionObserver footer pattern to:
- BlockEmployeeModal
- UnblockModal

Do NOT apply it to AddDayOffModal, HomeAddDayOffModal, AddEmployeeModal
(those should always show the footer).

ALSO apply the same sticky structure fix to the RIGHT SIDE PANEL
(EmployeeDetailPanel that slides in from the right):
- Panel itself: flex flex-col h-full overflow-hidden
- Header section: flex-shrink-0 (avatar, name, stats, chips)
- Middle scrollable section: flex-1 min-h-0 overflow-y-auto with same scrollbar style
- Bottom action bar: flex-shrink-0 border-t

Commit: "fix: all modals and detail panel — sticky header/footer, internal scrollbar, no overflow bleed"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 4 — ADD CONGÉ MODAL: Remove the child scrollbar
         (the one inside the file upload section)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Inside AddDayOffModal (and HomeAddDayOffModal) Step 1:

The file upload section or one of the child containers
has its own overflow-y-auto or overflow-scroll that creates
a nested scrollbar inside the modal body. Remove it.

Find every div inside the modal body that has:
  overflow-y-auto, overflow-scroll, overflow-y-scroll, max-h-*, or h-*
  that causes a scrollbar to appear inside a section

Remove ALL overflow settings from child sections inside the modal body.
The ONLY scrollable container is the modal body itself.
All child elements should be height: auto with no scroll.

Also fix horizontal overflow:
- Add overflow-x-hidden to the modal card
- Add px-1 to the scrollable body to prevent content from touching the scrollbar

Commit: "fix: remove nested scrollbar inside add congé modal body sections"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 5 — ALL MODALS: Add horizontal padding so
         content never touches the edges
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
In ALL 5 modals and in EmployeeDetailPanel:

The scrollable body div must have:
  px-5 (horizontal padding 20px on each side)
  Not px-4 — use px-5 minimum

All form inputs, cards, and sections inside the body must have:
  max-w-full (never overflow their container)
  No fixed widths wider than the container

The calendar grid inside AddDayOffModal:
  Must be: w-full, grid grid-cols-7
  Each cell: w-full aspect-square (not fixed pixel width)
  This prevents horizontal scroll on the calendar

Commit: "fix: add consistent horizontal padding to all modals, prevent side scroll"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After all 5 fixes:

1. Run: cd client && npm run dev
2. Fix any console errors before finishing
3. Verify each fix:

   LANGUAGE:
   - Click EN → all labels switch to English immediately
   - Click AR → all labels switch to Arabic, layout flips RTL
   - Click FR → back to French
   - Refresh page → language is remembered

   FAB BUTTON (Accueil):
   - Click "+" → modal opens with employee search (not add employee)
   - Type in search → list filters live
   - Click an employee → their stats appear below in a preview card
   - Click Suivant → Step 2 shows calendar
   - Complete Step 2 → Step 3 shows PIN
   - Confirm → congé is added, modal closes, toast appears

   ALL MODALS SCROLL:
   - Open any modal → header stays fixed when scrolling
   - Scroll down → footer stays fixed, content scrolls behind it
   - No content bleeds under or over the header
   - Scrollbar appears inside the card, not outside in the page margin
   - No horizontal scrollbar appears anywhere

   BLOCK / UNBLOCK MODALS:
   - Open Block modal → footer buttons are hidden
   - Scroll to bottom → footer buttons fade in
   - Same for Unblock modal

   DETAIL PANEL:
   - Open employee detail → panel header stays fixed
   - Scroll content → header stays, action bar at bottom stays
   - Scrollbar is thin and inside the panel

4. Final commit: "fix: language working, FAB opens day off search, all modals scroll correctly"