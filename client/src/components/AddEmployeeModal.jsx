import { useState, useEffect } from 'react'
import { X, UserPlus, RefreshCw, ChevronLeft, Check } from 'lucide-react'
import { useEmployees } from '../hooks/useEmployees'
import CustomSelect from './CustomSelect'

const DEPARTMENTS = [
  'Production',
  'Logistique',
  'Administration',
  'Maintenance',
  'Qualité',
  'Sécurité',
]

export default function AddEmployeeModal({ isOpen, onClose, onSubmit }) {
  const { employees } = useEmployees()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    matricule: '',
    department: '',
    position: '',
    email: '',
    phone: '',
    startDate: '',
  })
  const [errors, setErrors] = useState({})
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [pin, setPin] = useState(['', '', '', ''])
  const [pinStatus, setPinStatus] = useState('idle')

  // Generate unique matricule on mount and when user refreshes
  useEffect(() => {
    if (isOpen && !formData.matricule) {
      generateMatricule()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Auto-suggest email when prenom and nom change
  useEffect(() => {
    if (formData.prenom && formData.nom) {
      const suggested = `${formData.prenom.toLowerCase()}.${formData.nom.toLowerCase()}@naftal.dz`
      if (!formData.email || formData.email === '') {
        setFormData(prev => ({ ...prev, email: suggested }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.prenom, formData.nom])

  const generateMatricule = () => {
    let unique = false
    let newMatricule = ''

    while (!unique) {
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      newMatricule = `NAF-${randomNum}`
      unique = !employees.some(emp => emp.matricule === newMatricule)
    }

    setFormData(prev => ({ ...prev, matricule: newMatricule }))
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Prénom requis'
    }

    if (!formData.nom.trim()) {
      newErrors.nom = 'Nom requis'
    }

    if (!formData.matricule.trim()) {
      newErrors.matricule = 'Matricule requis'
    }

    if (!formData.department) {
      newErrors.department = 'Département requis'
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Poste requis'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email requis'
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Email doit contenir @'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Date d\'embauche requise'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const admins = [
    { id: 1, name: 'Ahmed Benali', role: 'Responsable RH', initials: 'AB' },
    { id: 2, name: 'Fatima Meziane', role: 'Directeur Admin', initials: 'FM' },
  ]

  const handlePinChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1]
    if (value && !/^[0-9]$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)

    if (value && index < 3) {
      document.getElementById(`emp-pin-${index + 1}`)?.focus()
    }

    if (newPin.every(d => d !== '')) {
      handlePinValidate(newPin.join(''))
    }
  }

  const handlePinValidate = async (pinValue) => {
    setPinStatus('verifying')
    await new Promise(resolve => setTimeout(resolve, 800))

    if (pinValue === '1234') {
      setPinStatus('verified')
    } else {
      setPinStatus('error')
      setTimeout(() => {
        setPin(['', '', '', ''])
        setPinStatus('idle')
        document.getElementById('emp-pin-0')?.focus()
      }, 1500)
    }
  }

  const handleStep1Submit = () => {
    if (validateForm()) {
      setStep(2)
    }
  }

  const handleFinalSubmit = () => {
    const names = `${formData.prenom} ${formData.nom}`
    const avatar = `${formData.prenom[0]}${formData.nom[0]}`.toUpperCase()

    onSubmit?.({
      name: names,
      matricule: formData.matricule,
      department: formData.department,
      position: formData.position,
      email: formData.email,
      phone: formData.phone || null,
      startDate: formData.startDate,
      avatar,
      daysTotal: 30,
      daysUsed: 0,
      status: 'actif',
    })
    handleClose()
  }

  const handleClose = () => {
    setStep(1)
    setFormData({
      prenom: '',
      nom: '',
      matricule: '',
      department: '',
      position: '',
      email: '',
      phone: '',
      startDate: '',
    })
    setErrors({})
    setSelectedAdmin(null)
    setPin(['', '', '', ''])
    setPinStatus('idle')
    onClose?.()
  }

  if (!isOpen) return null

  const isStep1Valid = formData.prenom && formData.nom && formData.department &&
                       formData.position && formData.email && formData.email.includes('@') &&
                       formData.startDate
  const isStep2Valid = pinStatus === 'verified'

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-modal w-[560px] max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-navy/10 border-b border-navy/20 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="p-1 hover:bg-black/5 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#6B7280]" />
              </button>
            )}
            <div className="w-10 h-10 rounded-full bg-navy/20 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-navy" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#111827]">
                {step === 1 ? 'Nouvel Employé' : 'Autorisation requise'}
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Étape {step} sur 2
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg hover:bg-black/5 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 pb-8">
          {step === 1 ? (
            <>
              {/* Prénom */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  Prénom
                  <span className="text-status-red ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => handleChange('prenom', e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-navy/20 ${
                    errors.prenom ? 'border-status-red' : 'border-warm-gray-400'
                  }`}
                />
                {errors.prenom && (
                  <p className="text-xs text-status-red mt-1">{errors.prenom}</p>
                )}
              </div>

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  Nom
                  <span className="text-status-red ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-navy/20 ${
                    errors.nom ? 'border-status-red' : 'border-warm-gray-400'
                  }`}
                />
                {errors.nom && (
                  <p className="text-xs text-status-red mt-1">{errors.nom}</p>
                )}
              </div>

              {/* Matricule (auto-generated) */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  Matricule
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.matricule}
                    readOnly
                    className="flex-1 px-4 py-3 bg-warm-gray-200 border border-warm-gray-400 rounded-xl font-mono text-navy cursor-not-allowed"
                  />
                  <button
                    onClick={generateMatricule}
                    className="px-4 py-3 bg-navy/10 hover:bg-navy/20 rounded-xl transition-colors"
                    title="Générer nouveau matricule"
                  >
                    <RefreshCw className="w-5 h-5 text-navy" />
                  </button>
                </div>
                <p className="text-xs text-[#6B7280] mt-1">généré automatiquement</p>
              </div>

              {/* Département */}
              <div>
                <CustomSelect
                  label="Département"
                  required
                  value={formData.department}
                  onChange={(value) => handleChange('department', value)}
                  placeholder="Sélectionnez un département"
                  options={DEPARTMENTS.map(dept => ({ value: dept, label: dept }))}
                />
                {errors.department && (
                  <p className="text-xs text-status-red mt-1">{errors.department}</p>
                )}
              </div>

              {/* Poste */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  Poste
                  <span className="text-status-red ml-1">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Technicien, Chef d'équipe..."
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-navy/20 ${
                    errors.position ? 'border-status-red' : 'border-warm-gray-400'
                  }`}
                />
                {errors.position && (
                  <p className="text-xs text-status-red mt-1">{errors.position}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  Email
                  <span className="text-status-red ml-1">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-navy/20 ${
                    errors.email ? 'border-status-red' : 'border-warm-gray-400'
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-status-red mt-1">{errors.email}</p>
                )}
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  Téléphone
                  <span className="text-[#6B7280] font-normal ml-1">(optionnel)</span>
                </label>
                <input
                  type="tel"
                  placeholder="+213 XX XX XX XX"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-warm-gray-400 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-navy/20"
                />
              </div>

              {/* Date d'embauche */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  Date d'embauche
                  <span className="text-status-red ml-1">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-navy/20 ${
                    errors.startDate ? 'border-status-red' : 'border-warm-gray-400'
                  }`}
                />
                {errors.startDate && (
                  <p className="text-xs text-status-red mt-1">{errors.startDate}</p>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Admin Selector */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-3">
                  Administrateur
                </label>
                <div className="space-y-2">
                  {admins.map(admin => (
                    <button
                      key={admin.id}
                      onClick={() => setSelectedAdmin(admin)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        selectedAdmin?.id === admin.id
                          ? 'border-navy bg-navy/5'
                          : 'border-warm-gray-400 hover:border-navy/40'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center text-sm font-semibold text-navy">
                        {admin.initials}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-[#111827]">{admin.name}</div>
                        <div className="text-xs text-[#6B7280]">{admin.role}</div>
                      </div>
                      {selectedAdmin?.id === admin.id && (
                        <Check className="w-5 h-5 text-navy" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* PIN Input */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-3">
                  Code PIN
                </label>
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map(index => (
                    <input
                      key={index}
                      id={`emp-pin-${index}`}
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={pin[index]}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      disabled={pinStatus === 'verifying' || pinStatus === 'verified'}
                      className={`w-14 h-14 text-center text-xl font-semibold rounded-xl border-2 transition-all shadow-inner focus:outline-none ${
                        pinStatus === 'error'
                          ? 'border-status-red bg-status-red/5'
                          : pinStatus === 'verified'
                          ? 'border-status-green bg-status-green/5'
                          : pin[index]
                          ? 'border-navy bg-warm-gray-200'
                          : 'border-transparent bg-warm-gray-200 focus:border-navy'
                      }`}
                    />
                  ))}
                </div>
                {pinStatus === 'verifying' && (
                  <p className="text-xs text-navy text-center mt-2">Vérification...</p>
                )}
                {pinStatus === 'error' && (
                  <p className="text-xs text-status-red text-center mt-2">Code incorrect</p>
                )}
                {pinStatus === 'verified' && (
                  <p className="text-xs text-status-green text-center mt-2">✓ Code correct</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-black/6 px-6 py-4 flex gap-3 rounded-b-3xl">
          <button
            onClick={step === 1 ? handleClose : () => setStep(1)}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-sm text-[#6B7280] hover:bg-black/5 transition-all"
          >
            {step === 1 ? 'Annuler' : '← Retour'}
          </button>
          <button
            onClick={step === 1 ? handleStep1Submit : handleFinalSubmit}
            disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
            className="flex-1 bg-navy text-white px-4 py-3 rounded-xl font-medium text-sm shadow-ambient hover:shadow-modal transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 1 ? 'Suivant →' : 'Créer l\'employé'}
          </button>
        </div>
      </div>
    </div>
  )
}
