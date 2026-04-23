import { useState } from 'react'
import { X, UserPlus, AlertTriangle } from 'lucide-react'
import AdminPinEntry from './AdminPinEntry'

const DEPARTMENTS = [
  'Production',
  'Logistique',
  'Administration',
  'Maintenance',
  'Qualité',
  'Sécurité',
]

export default function AddEmployeeModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    matricule: '',
    name: '',
    department: '',
    position: '',
  })
  const [showPinEntry, setShowPinEntry] = useState(false)
  const [errors, setErrors] = useState({})

  if (!isOpen) return null

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.matricule.trim()) {
      newErrors.matricule = 'Matricule requis'
    } else if (!formData.matricule.match(/^NAF-\d{4}$/)) {
      newErrors.matricule = 'Format: NAF-XXXX (ex: NAF-4567)'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Nom requis'
    } else if (formData.name.trim().split(' ').length < 2) {
      newErrors.name = 'Prénom et nom requis'
    }

    if (!formData.department) {
      newErrors.department = 'Département requis'
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Poste requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return
    setShowPinEntry(true)
  }

  const handlePinSuccess = () => {
    // Generate avatar from name initials
    const names = formData.name.trim().split(' ')
    const avatar = names.map(n => n[0]).join('').toUpperCase().substring(0, 2)

    onSubmit?.({
      ...formData,
      avatar,
      daysTotal: 30,
      status: 'actif',
    })
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      matricule: '',
      name: '',
      department: '',
      position: '',
    })
    setErrors({})
    setShowPinEntry(false)
    onClose?.()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 flex items-center justify-center animate-fade-in"
        onClick={handleClose}
      >
        {/* Modal */}
        <div
          className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-modal w-[520px] animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-navy/10 border-b border-navy/20 px-6 py-4 flex items-center justify-between rounded-t-3xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-navy/20 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-navy" strokeWidth={2} />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-[#111827]">
                  Ajouter un employé
                </h2>
                <p className="text-xs text-[#6B7280] mt-1 font-medium">
                  Créer un nouveau profil employé
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
          <div className="p-6 space-y-4">
            {/* Matricule */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Matricule <span className="text-status-red">*</span>
              </label>
              <input
                type="text"
                placeholder="NAF-4567"
                value={formData.matricule}
                onChange={(e) => handleChange('matricule', e.target.value.toUpperCase())}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.matricule
                    ? 'border-status-red bg-status-red/5'
                    : 'border-warm-gray-400 bg-warm-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all font-mono`}
              />
              {errors.matricule && (
                <p className="text-xs text-status-red mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.matricule}
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Nom complet <span className="text-status-red">*</span>
              </label>
              <input
                type="text"
                placeholder="Prénom Nom"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.name
                    ? 'border-status-red bg-status-red/5'
                    : 'border-warm-gray-400 bg-warm-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all`}
              />
              {errors.name && (
                <p className="text-xs text-status-red mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Département <span className="text-status-red">*</span>
              </label>
              <select
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.department
                    ? 'border-status-red bg-status-red/5'
                    : 'border-warm-gray-400 bg-warm-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all`}
              >
                <option value="">Sélectionner un département</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="text-xs text-status-red mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.department}
                </p>
              )}
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-2">
                Poste <span className="text-status-red">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Opérateur, Technicien, Chef d'équipe..."
                value={formData.position}
                onChange={(e) => handleChange('position', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.position
                    ? 'border-status-red bg-status-red/5'
                    : 'border-warm-gray-400 bg-warm-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all`}
              />
              {errors.position && (
                <p className="text-xs text-status-red mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {errors.position}
                </p>
              )}
            </div>

            {/* Info */}
            <div className="bg-navy/5 border border-navy/10 rounded-xl p-4">
              <p className="text-xs text-[#374151]">
                <span className="font-semibold">Par défaut:</span> 30 jours de congé, statut actif
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-warm-gray-400 flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#374151] hover:bg-black/5 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl text-sm font-medium bg-navy text-white shadow-ambient hover:shadow-modal transition-all duration-200"
            >
              Confirmer avec PIN
            </button>
          </div>
        </div>
      </div>

      {/* PIN Entry */}
      {showPinEntry && (
        <AdminPinEntry
          isOpen={showPinEntry}
          onClose={() => setShowPinEntry(false)}
          onSuccess={handlePinSuccess}
          actionLabel="Ajouter l'employé"
        />
      )}
    </>
  )
}
