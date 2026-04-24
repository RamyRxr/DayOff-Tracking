Read CLAUDE.md in this project.
You are fixing 3 specific problems in the frontend only.
Do NOT touch any backend files.
Only modify files inside client/src/
Work through each fix in order. Commit after each one.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 1 — LANGUAGE SELECTOR: Make it actually change the UI language
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The language selector button exists but clicking EN / FR / AR does nothing.

STEP A — Diagnose the problem:
Open the language selector component.
Check:
1. Is i18next installed? Run: cat client/package.json | grep i18next
   If NOT installed: run npm install i18next react-i18next inside client/
2. Is client/src/i18n/index.js initialized and imported in main.jsx or App.jsx?
   If NOT: create and import it
3. Does the language selector call i18n.changeLanguage(code) on click?
   If NOT: fix it

STEP B — Create the i18n setup if missing:

Create client/src/i18n/index.js:
```js
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './fr.json'
import en from './en.json'
import ar from './ar.json'

i18n.use(initReactI18next).init({
  resources: { fr: { translation: fr }, en: { translation: en }, ar: { translation: ar } },
  lng: localStorage.getItem('lang') || 'fr',
  fallbackLng: 'fr',
  interpolation: { escapeValue: false }
})

export default i18n
```

Import it at the very top of client/src/main.jsx:
```js
import './i18n/index.js'
```

STEP C — Create translation files if missing:

Create client/src/i18n/fr.json with ALL current French strings in the app.
At minimum include these keys:
```json
{
  "accueil": "Accueil",
  "employes": "Employés",
  "bloques": "Bloqués",
  "calendrier": "Calendrier",
  "totalEmployes": "Total employés",
  "actifs": "Actifs",
  "aRisque": "À risque",
  "bloques_": "Bloqués",
  "activiteRecente": "Activité récente",
  "details": "Détails",
  "ajouterConge": "Ajouter un congé",
  "nouvelEmploye": "Nouvel employé",
  "bloquer": "Bloquer",
  "debloquer": "Débloquer",
  "confirmer": "Confirmer",
  "annuler": "Annuler",
  "suivant": "Suivant",
  "retour": "Retour",
  "etape": "Étape",
  "sur": "sur",
  "joursConge": "Jours de congé",
  "joursTravailles": "Jours travaillés",
  "joursDisponibles": "Jours disponibles",
  "motifBlocage": "Motif du blocage",
  "description": "Description",
  "autorisation": "Autorisation requise",
  "codePIN": "Code PIN à 4 chiffres",
  "verificationEnCours": "Vérification en cours...",
  "adminVerifie": "Administrateur vérifié",
  "pinIncorrect": "PIN incorrect",
  "tentativesRestantes": "tentatives restantes",
  "selectionnerAdmin": "Sélectionner un administrateur",
  "typeConge": "Type de congé",
  "congeAnnuel": "Congé annuel",
  "congeMaladie": "Congé maladie",
  "congeSansSolde": "Congé sans solde",
  "autre": "Autre",
  "pieceJustificative": "Pièce justificative",
  "glisserCliquer": "Glisser ou cliquer · PDF, JPG, PNG · max 5 Mo",
  "dateDebut": "Date de début",
  "dateFin": "Date de fin",
  "joursOuvrables": "jours ouvrables",
  "joursCalendaires": "jours calendaires",
  "sandwichDetection": "Détection sandwich",
  "notifications": "Notifications",
  "toutMarquerLu": "Tout marquer lu",
  "aucuneNotification": "Aucune notification",
  "exporterDonnees": "Exporter les données",
  "departement": "Département",
  "poste": "Poste",
  "statut": "Statut",
  "actions": "Actions",
  "matricule": "Matricule",
  "nom": "Nom",
  "prenom": "Prénom",
  "email": "Email",
  "telephone": "Téléphone",
  "dateEmbauche": "Date d'embauche",
  "actif": "Actif",
  "bloque": "Bloqué"
}
```

Create client/src/i18n/en.json with English equivalents:
```json
{
  "accueil": "Home",
  "employes": "Employees",
  "bloques": "Blocked",
  "calendrier": "Calendar",
  "totalEmployes": "Total employees",
  "actifs": "Active",
  "aRisque": "At risk",
  "bloques_": "Blocked",
  "activiteRecente": "Recent activity",
  "details": "Details",
  "ajouterConge": "Add day off",
  "nouvelEmploye": "New employee",
  "bloquer": "Block",
  "debloquer": "Unblock",
  "confirmer": "Confirm",
  "annuler": "Cancel",
  "suivant": "Next",
  "retour": "Back",
  "etape": "Step",
  "sur": "of",
  "joursConge": "Days off",
  "joursTravailles": "Working days",
  "joursDisponibles": "Available days",
  "motifBlocage": "Block reason",
  "description": "Description",
  "autorisation": "Authorization required",
  "codePIN": "4-digit PIN code",
  "verificationEnCours": "Verifying...",
  "adminVerifie": "Administrator verified",
  "pinIncorrect": "Incorrect PIN",
  "tentativesRestantes": "attempts remaining",
  "selectionnerAdmin": "Select an administrator",
  "typeConge": "Leave type",
  "congeAnnuel": "Annual leave",
  "congeMaladie": "Sick leave",
  "congeSansSolde": "Unpaid leave",
  "autre": "Other",
  "pieceJustificative": "Supporting document",
  "glisserCliquer": "Drag or click · PDF, JPG, PNG · max 5 MB",
  "dateDebut": "Start date",
  "dateFin": "End date",
  "joursOuvrables": "working days",
  "joursCalendaires": "calendar days",
  "sandwichDetection": "Sandwich detection",
  "notifications": "Notifications",
  "toutMarquerLu": "Mark all read",
  "aucuneNotification": "No notifications",
  "exporterDonnees": "Export data",
  "departement": "Department",
  "poste": "Position",
  "statut": "Status",
  "actions": "Actions",
  "matricule": "ID",
  "nom": "Last name",
  "prenom": "First name",
  "email": "Email",
  "telephone": "Phone",
  "dateEmbauche": "Hire date",
  "actif": "Active",
  "bloque": "Blocked"
}
```

Create client/src/i18n/ar.json with Arabic equivalents:
```json
{
  "accueil": "الرئيسية",
  "employes": "الموظفون",
  "bloques": "المحجوبون",
  "calendrier": "التقويم",
  "totalEmployes": "إجمالي الموظفين",
  "actifs": "نشطون",
  "aRisque": "في خطر",
  "bloques_": "محجوبون",
  "activiteRecente": "النشاط الأخير",
  "details": "التفاصيل",
  "ajouterConge": "إضافة إجازة",
  "nouvelEmploye": "موظف جديد",
  "bloquer": "حجب",
  "debloquer": "رفع الحجب",
  "confirmer": "تأكيد",
  "annuler": "إلغاء",
  "suivant": "التالي",
  "retour": "رجوع",
  "etape": "خطوة",
  "sur": "من",
  "joursConge": "أيام الإجازة",
  "joursTravailles": "أيام العمل",
  "joursDisponibles": "الأيام المتاحة",
  "motifBlocage": "سبب الحجب",
  "description": "الوصف",
  "autorisation": "التفويض مطلوب",
  "codePIN": "رمز PIN المكون من 4 أرقام",
  "verificationEnCours": "جارٍ التحقق...",
  "adminVerifie": "تم التحقق من المدير",
  "pinIncorrect": "رمز PIN غير صحيح",
  "tentativesRestantes": "محاولات متبقية",
  "selectionnerAdmin": "اختر مديرًا",
  "typeConge": "نوع الإجازة",
  "congeAnnuel": "إجازة سنوية",
  "congeMaladie": "إجازة مرضية",
  "congeSansSolde": "إجازة بدون أجر",
  "autre": "أخرى",
  "pieceJustificative": "وثيقة مؤيدة",
  "glisserCliquer": "اسحب أو انقر · PDF, JPG, PNG · الحد الأقصى 5 ميغابايت",
  "dateDebut": "تاريخ البداية",
  "dateFin": "تاريخ النهاية",
  "joursOuvrables": "أيام عمل",
  "joursCalendaires": "أيام تقويمية",
  "sandwichDetection": "كشف الساندويتش",
  "notifications": "الإشعارات",
  "toutMarquerLu": "تحديد الكل كمقروء",
  "aucuneNotification": "لا توجد إشعارات",
  "exporterDonnees": "تصدير البيانات",
  "departement": "القسم",
  "poste": "المنصب",
  "statut": "الحالة",
  "actions": "الإجراءات",
  "matricule": "الرقم الوظيفي",
  "nom": "الاسم",
  "prenom": "اللقب",
  "email": "البريد الإلكتروني",
  "telephone": "الهاتف",
  "dateEmbauche": "تاريخ التوظيف",
  "actif": "نشط",
  "bloque": "محجوب"
}
```

STEP D — Fix the language selector component:
Find the language selector component (in the top bar near the notification bell).
Make sure each option click does ALL of the following:
```js
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
```

STEP E — Apply t() to all visible strings:
In EVERY component file, replace hardcoded French strings with t('key') calls.
Import useTranslation at the top: import { useTranslation } from 'react-i18next'
Inside component: const { t } = useTranslation()
Replace every hardcoded label with the matching t('key') from the translation files.

Commit: "feat: fix language selector — EN/FR/AR now actually changes UI language"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 2 — CALENDAR: Medium cells, 3 colors only
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Find every calendar component in the project
(the split calendar in EmployeeDetailPanel AND the picker in AddDayOffModal).

CELL SIZE:
- Change day cells to exactly 36px × 36px
- That is medium — not too small, not too large
- Use: width: 36px, height: 36px, display: flex, alignItems: center, justifyContent: center
- Border radius: rounded-lg (8px)
- Font size: 13px

USE ONLY THESE 3 COLORS for day cells — remove all other background colors:

COLOR 1 — Day off (taken):
- Background: a rich shiny red
  style={{ background: 'linear-gradient(135deg, #FF3B30, #C0392B)' }}
- Inner shadow: box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.15)
- Text: white, font-semibold
- Applies to: dates that already have a congé record

COLOR 2 — Normal working day:
- Background: white or very light warm gray (#FAFAFA)
- Border: 1px solid rgba(0,0,0,0.05)
- Inner shadow: inset 0 1px 2px rgba(0,0,0,0.03)
- Text: #1C1C1E (near black)
- Hover (selectable days): background shifts to #F2F2F7, shadow deepens slightly
- Applies to: all regular selectable weekdays

COLOR 3 — Weekend (Friday + Saturday):
- Background: #E5E5EA (medium gray, clearly distinct)
- Inner shadow: inset 0 1px 2px rgba(0,0,0,0.05)
- Text: #8E8E93 (gray text, not selectable)
- cursor-not-allowed
- Applies to: all Friday (day 5) and Saturday (day 6) cells

Additional states (use the same 3 base colors, just modified):
- Past days (before today): same color as normal day but opacity: 0.35, cursor-not-allowed
- Today: normal day color + ring-2 ring-blue-400 ring-offset-1
- Selected start/end: same red as day-off but slightly brighter, white text
- Selected range middle: very light red tint rgba(255,59,48,0.08), no border

Remove ALL other colors — no amber, no blue range fill, no green.
The calendar must use only these 3 visual states.

Commit: "fix: calendar cells 36px, 3 colors only — red/white-gray/weekend-gray"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIX 3 — AJOUTER CONGÉ: Debug and fix the broken button
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The "Ajouter un congé" button inside EmployeeDetailPanel opens a white screen.
This must be fully fixed. Follow these steps exactly:

STEP A — Find the root cause:
1. Open client/src/components/EmployeeDetailPanel.jsx (or wherever it lives)
2. Find the "Ajouter un congé" button
3. Check what happens on click — look for:
   - A state variable like showAddDayOff, isAddDayOffOpen, addDayOffOpen
   - Whether it is defined with useState
   - Whether the button onClick sets it to true
4. Find where AddDayOffModal is used in this file
5. Check if AddDayOffModal is imported at the top

Common causes of white screen — check all of these:
- AddDayOffModal has a crash on render (missing prop, undefined variable)
- The modal renders outside a valid React tree
- A required prop like employee or employeeId is undefined
- An import is missing or path is wrong
- The modal uses a hook (like useTranslation) before i18n is initialized

STEP B — Fix the modal crash:
Open client/src/components/AddDayOffModal.jsx
Add a safety guard at the very top of the component:
```js
if (!employee && !employeeId) return null
```

Make sure every prop used inside the component has a fallback:
```js
const { employee, employeeId, onClose, onSuccess } = props
const id = employeeId || employee?.id
const name = employee?.name || 'Employé'
const matricule = employee?.matricule || ''
```

Wrap the entire modal JSX in a try/catch error boundary or add this at top level:
```jsx
// Add this component in the same file or a separate ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 text-center">
          <p className="text-red-500">Erreur lors du chargement du formulaire</p>
          <button onClick={this.props.onClose} className="mt-4 px-4 py-2 bg-gray-100 rounded-lg">
            Fermer
          </button>
        </div>
      </div>
    )
    return this.props.children
  }
}
```

Wrap AddDayOffModal usage with the ErrorBoundary:
```jsx
{showAddDayOff && (
  <ErrorBoundary onClose={() => setShowAddDayOff(false)}>
    <AddDayOffModal
      employee={selectedEmployee}
      employeeId={selectedEmployee?.id}
      onClose={() => setShowAddDayOff(false)}
      onSuccess={() => {
        setShowAddDayOff(false)
        refetch()
      }}
    />
  </ErrorBoundary>
)}
```

STEP C — Rebuild AddDayOffModal safely if it still crashes:
If the error persists after Step B, replace the entire AddDayOffModal.jsx
with a clean minimal working version:

```jsx
import React, { useState, useRef, useEffect } from 'react'
import { X, Upload, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isBefore, isAfter, isSameDay, startOfDay, getDay,
  addMonths, subMonths
} from 'date-fns'
import { fr } from 'date-fns/locale'

export default function AddDayOffModal({ employee, employeeId, onClose, onSuccess, existingDaysOff = [] }) {
  const [step, setStep] = useState(1)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [reason, setReason] = useState('')
  const [file, setFile] = useState(null)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [pin, setPin] = useState(['', '', '', ''])
  const [pinStatus, setPinStatus] = useState('idle')
  const pinRefs = [useRef(), useRef(), useRef(), useRef()]
  const today = startOfDay(new Date())
  const id = employeeId || employee?.id
  const name = employee?.name || 'Employé'
  const matricule = employee?.matricule || ''

  // Build set of already-used congé dates
  const usedDates = new Set()
  existingDaysOff.forEach(d => {
    if (d.startDate && d.endDate) {
      eachDayOfInterval({
        start: startOfDay(new Date(d.startDate)),
        end: startOfDay(new Date(d.endDate))
      }).forEach(day => usedDates.add(format(day, 'yyyy-MM-dd')))
    }
  })

  const getDayType = (day) => {
    const dow = getDay(day) // 0=Sun,1=Mon,...,5=Fri,6=Sat
    if (dow === 5 || dow === 6) return 'weekend'
    if (isBefore(day, today)) return 'past'
    if (usedDates.has(format(day, 'yyyy-MM-dd'))) return 'used'
    return 'normal'
  }

  const handleDayClick = (day) => {
    const type = getDayType(day)
    if (type === 'weekend' || type === 'past' || type === 'used') return
    if (!startDate || (startDate && endDate)) {
      setStartDate(day)
      setEndDate(null)
    } else {
      if (isBefore(day, startDate)) {
        setStartDate(day)
      } else {
        setEndDate(day)
      }
    }
  }

  const getCellStyle = (day) => {
    const type = getDayType(day)
    const isStart = startDate && isSameDay(day, startDate)
    const isEnd = endDate && isSameDay(day, endDate)
    const inRange = startDate && endDate && isAfter(day, startDate) && isBefore(day, endDate)

    if (type === 'used' || isStart || isEnd) return {
      background: 'linear-gradient(135deg, #FF3B30, #C0392B)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.15)',
      color: 'white',
      fontWeight: 600,
      cursor: type === 'used' ? 'not-allowed' : 'pointer'
    }
    if (type === 'weekend') return {
      background: '#E5E5EA',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
      color: '#8E8E93',
      cursor: 'not-allowed'
    }
    if (type === 'past') return {
      background: '#FAFAFA',
      color: '#C7C7CC',
      opacity: 0.5,
      cursor: 'not-allowed'
    }
    if (inRange) return {
      background: 'rgba(255,59,48,0.08)',
      color: '#FF3B30',
      cursor: 'pointer'
    }
    return {
      background: '#FAFAFA',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
      border: '1px solid rgba(0,0,0,0.05)',
      color: '#1C1C1E',
      cursor: 'pointer'
    }
  }

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }

  const firstDayOffset = () => {
    let d = getDay(startOfMonth(currentMonth))
    return d === 0 ? 6 : d - 1
  }

  const handlePinChange = (index, value) => {
    if (!/^[0-9]$/.test(value) && value !== '') return
    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)
    if (value && index < 3) {
      pinRefs[index + 1].current?.focus()
    }
    if (newPin.every(d => d !== '') && value) {
      // auto verify
      setTimeout(() => verifyPin(newPin.join('')), 100)
    }
  }

  const handlePinKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs[index - 1].current?.focus()
    }
  }

  const verifyPin = async (pinCode) => {
    if (!selectedAdmin) return
    setPinStatus('verifying')
    try {
      const res = await fetch('/api/admins/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: selectedAdmin.id, pin: pinCode })
      })
      const data = await res.json()
      if (data.data?.valid || data.valid) {
        setPinStatus('verified')
      } else {
        setPinStatus('error')
        setPin(['', '', '', ''])
        setTimeout(() => { pinRefs[0].current?.focus() }, 100)
      }
    } catch {
      setPinStatus('error')
    }
  }

  const handleSubmit = async () => {
    if (!id || !startDate || !endDate || !reason || pinStatus !== 'verified') return
    try {
      await fetch('/api/daysoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: id,
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          type: reason,
          reason
        })
      })
      onSuccess?.()
    } catch (err) {
      console.error(err)
    }
  }

  const days = getDaysInMonth()
  const offset = firstDayOffset()

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md flex flex-col max-h-[90vh]"
        style={{ boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 16px 48px rgba(0,0,0,0.16)' }}>

        {/* HEADER - sticky */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-[17px] font-semibold text-gray-900">Ajouter un Congé</h2>
            <p className="text-[12px] text-gray-400 mt-0.5">{name} · {matricule}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2.5 py-0.5">
              Étape {step} / 2
            </span>
            <button onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
              <X size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* BODY - scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {step === 1 && (
            <>
              {/* Calendar */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100">
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-[13px] font-semibold text-gray-800 uppercase tracking-wide">
                    {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                  </span>
                  <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100">
                    <ChevronRight size={14} />
                  </button>
                </div>
                {/* Day headers */}
                <div className="grid grid-cols-7 mb-1">
                  {['Lu','Ma','Me','Je','Ve','Sa','Di'].map((d,i) => (
                    <div key={d} className="flex items-center justify-center text-[10px] font-medium py-1"
                      style={{ color: i >= 4 ? '#C7C7CC' : '#8E8E93' }}>{d}</div>
                  ))}
                </div>
                {/* Day grid */}
                <div className="grid grid-cols-7 gap-0.5">
                  {Array(offset).fill(null).map((_, i) => <div key={`e${i}`} />)}
                  {days.map(day => {
                    const isToday = isSameDay(day, today)
                    return (
                      <div key={day.toISOString()}
                        onClick={() => handleDayClick(day)}
                        className={`flex items-center justify-center text-[13px] rounded-lg transition-all duration-100
                          ${isToday ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
                        style={{ width: 36, height: 36, ...getCellStyle(day) }}>
                        {format(day, 'd')}
                      </div>
                    )
                  })}
                </div>
                {/* Selection summary */}
                {startDate && endDate && (
                  <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2 text-[12px] text-gray-600 text-center">
                    {format(startDate,'dd MMM',{locale:fr})} – {format(endDate,'dd MMM yyyy',{locale:fr})}
                  </div>
                )}
              </div>

              {/* File upload */}
              <div>
                <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                  Pièce justificative <span className="normal-case text-gray-300">(optionnel)</span>
                </label>
                <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-gray-200 rounded-xl py-5 cursor-pointer hover:border-gray-300 transition-colors">
                  <Upload size={18} className="text-gray-400" />
                  <span className="text-[12px] text-gray-400">Glisser ou cliquer · PDF, JPG, PNG · max 5 Mo</span>
                  <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setFile(e.target.files[0])} />
                </label>
                {file && (
                  <div className="mt-2 flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-[12px] text-gray-600 truncate">{file.name}</span>
                    <button onClick={() => setFile(null)} className="text-gray-400 hover:text-gray-600">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                  Type de congé <span className="text-red-400">*</span>
                </label>
                <select value={reason} onChange={e => setReason(e.target.value)}
                  className="w-full h-11 rounded-xl px-3 text-[13px] text-gray-800 appearance-none outline-none"
                  style={{
                    background: 'rgba(118,118,128,0.08)',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)'
                  }}>
                  <option value="">Sélectionner...</option>
                  <option value="Congé annuel">Congé annuel</option>
                  <option value="Congé maladie">Congé maladie</option>
                  <option value="Congé sans solde">Congé sans solde</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="bg-gray-50 rounded-xl px-4 py-3 text-[12px] text-gray-500 text-center">
                {startDate && endDate
                  ? `${format(startDate,'dd MMM',{locale:fr})} – ${format(endDate,'dd MMM yyyy',{locale:fr})} · ${reason}`
                  : 'Aucune date sélectionnée'}
              </div>

              {/* Admin selector — simple for now */}
              <div>
                <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
                  Administrateur
                </label>
                <AdminSelector onSelect={setSelectedAdmin} selected={selectedAdmin} />
              </div>

              {/* PIN */}
              <div>
                <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">
                  Code PIN à 4 chiffres
                </label>
                <div className="flex gap-2 justify-center">
                  {pin.map((digit, i) => (
                    <input
                      key={i}
                      ref={pinRefs[i]}
                      type="password"
                      maxLength={1}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={digit}
                      onChange={e => handlePinChange(i, e.target.value)}
                      onKeyDown={e => handlePinKeyDown(i, e)}
                      className="w-12 h-14 text-center text-[20px] font-bold rounded-xl outline-none transition-all"
                      style={{
                        background: pinStatus === 'verified' ? 'rgba(52,199,89,0.1)'
                          : pinStatus === 'error' ? 'rgba(255,59,48,0.1)'
                          : 'rgba(118,118,128,0.08)',
                        boxShadow: pinStatus === 'verified'
                          ? 'inset 0 1px 2px rgba(0,0,0,0.06), 0 0 0 1.5px #34C759'
                          : pinStatus === 'error'
                          ? 'inset 0 1px 2px rgba(0,0,0,0.06), 0 0 0 1.5px #FF3B30'
                          : 'inset 0 1px 2px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.06)'
                      }}
                      disabled={pinStatus === 'verifying' || pinStatus === 'verified'}
                    />
                  ))}
                </div>
                {pinStatus === 'verifying' && (
                  <p className="text-center text-[12px] text-gray-400 mt-2">Vérification en cours...</p>
                )}
                {pinStatus === 'verified' && (
                  <p className="text-center text-[12px] text-green-600 mt-2">✓ Administrateur vérifié</p>
                )}
                {pinStatus === 'error' && (
                  <p className="text-center text-[12px] text-red-500 mt-2">PIN incorrect</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* FOOTER - sticky */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-t border-gray-100">
          {step === 1 ? (
            <>
              <button onClick={onClose}
                className="px-4 py-2 text-[13px] text-gray-500 hover:text-gray-700 transition-colors">
                Annuler
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!startDate || !endDate || !reason}
                className="px-5 py-2.5 text-[13px] font-medium text-white rounded-xl transition-all"
                style={{
                  background: (!startDate || !endDate || !reason) ? '#C7C7CC' : '#1B3A6B',
                  cursor: (!startDate || !endDate || !reason) ? 'not-allowed' : 'pointer'
                }}>
                Suivant →
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)}
                className="px-4 py-2 text-[13px] text-gray-500 hover:text-gray-700 transition-colors">
                ← Retour
              </button>
              <button
                onClick={handleSubmit}
                disabled={pinStatus !== 'verified'}
                className="px-5 py-2.5 text-[13px] font-medium text-white rounded-xl transition-all"
                style={{
                  background: pinStatus !== 'verified' ? '#C7C7CC' : '#1B3A6B',
                  cursor: pinStatus !== 'verified' ? 'not-allowed' : 'pointer'
                }}>
                Confirmer le congé
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
```

For the AdminSelector used in Step 2 above, create a simple inline version or
reuse the existing one from the login page — import and pass onSelect + selected props.

STEP D — Fix the button that opens this modal:
In EmployeeDetailPanel, make sure:
1. There is: const [showAddDayOff, setShowAddDayOff] = useState(false)
2. The "Ajouter un congé" button has: onClick={() => setShowAddDayOff(true)}
3. At the bottom of the JSX: 
   {showAddDayOff && (
     <AddDayOffModal
       employee={employee}
       employeeId={employee?.id}
       existingDaysOff={daysOff || []}
       onClose={() => setShowAddDayOff(false)}
       onSuccess={() => { setShowAddDayOff(false); refetch && refetch() }}
     />
   )}
4. AddDayOffModal is imported at the top of the file

Commit: "fix: ajouter congé button opens working 2-step modal"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After all 3 fixes:
1. Run: cd client && npm run dev
2. Check browser console — fix any red errors before finishing
3. Verify:
   - Language selector: clicking EN changes all labels to English,
     clicking AR changes to Arabic + RTL layout, FR goes back to French
   - Calendar: cells are 36px, only 3 colors visible (red/white-gray/medium-gray)
   - Ajouter congé: button opens modal, no white screen, calendar shows,
     can pick dates, step 2 shows PIN input, confirm submits
4. Final commit: "fix: language selector working, calendar 3 colors, ajouter congé fixed"