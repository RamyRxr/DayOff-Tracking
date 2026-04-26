import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Unlock, CheckCircle2, ChevronLeft, Check } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useTheme } from '../contexts/ThemeContext'
import CustomSelect from './CustomSelect'
import { useAdmins } from '../hooks/useAdmins'

export default function UnblockModal({ employee, activeBlock, isOpen, onClose, onSubmit }) {
  // ALL HOOKS MUST BE AT THE TOP - Rules of Hooks
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const [step, setStep] = useState(1)
  const [unblockReason, setUnblockReason] = useState('')
  const [description, setDescription] = useState('')
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [pin, setPin] = useState(['', '', '', ''])
  const [pinStatus, setPinStatus] = useState('idle')

  // Fetch all admins from API
  const { admins, loading: loadingAdmins } = useAdmins()

  // Early return AFTER all hooks
  if (!isOpen || !employee) return null

  const handleClose = () => {
    setStep(1)
    setUnblockReason('')
    setDescription('')
    setSelectedAdmin(null)
    setPin(['', '', '', ''])
    setPinStatus('idle')
    onClose?.()
  }

  // Generate initials for admin cards
  const getInitials = (name) => {
    if (!name) return 'NA'
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  const handlePinChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1]
    if (value && !/^[0-9]$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)

    if (value && index < 3) {
      document.getElementById(`unblock-pin-${index + 1}`)?.focus()
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
        document.getElementById('unblock-pin-0')?.focus()
      }, 1500)
    }
  }

  const handleSubmit = () => {
    onSubmit?.({
      blockId: activeBlock?.id,
      employeeId: employee.id,
      adminId: selectedAdmin?.id,
      reason: unblockReason,
      description: description.trim(),
    })
    handleClose()
  }

  const isStep1Valid = unblockReason !== ''
  const isStep2Valid = pinStatus === 'verified'

  const getBlockDate = () => {
    if (!activeBlock?.createdAt) return '—'
    try {
      return format(new Date(activeBlock.createdAt), 'dd MMM yyyy', { locale: fr })
    } catch {
      return '—'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div
        className="bg-white dark:bg-[#16161E] rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg flex flex-col h-[92vh] sm:max-h-[88vh] overflow-hidden"
        style={isDark ? {
          boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.6)'
        } : {
          boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.2)'
        }}
      >
        {/* STICKY HEADER */}
        <div className="flex-shrink-0 bg-status-green/10 dark:bg-[rgba(52,199,89,0.15)] px-5 pt-5 pb-4 border-b border-gray-100 dark:border-white/[0.07] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/[0.06] rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#6B7280] dark:text-[#8E8E93]" />
              </button>
            )}
            <div className="w-10 h-10 rounded-full bg-status-green/20 dark:bg-[rgba(52,199,89,0.2)] flex items-center justify-center">
              <Unlock className="w-5 h-5 text-status-green dark:text-[#34C759]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#111827] dark:text-[#F2F2F7]">
                {step === 1 ? t('debloquerEmploye') : t('autorisationRequise')}
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-[#8E8E93] mt-0.5">
                Étape {step} sur 2
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg hover:bg-black/5 dark:hover:bg-white/[0.06] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-[#6B7280] dark:text-[#8E8E93]" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {/* Employee info */}
          <div className="bg-warm-gray-200 dark:bg-white/[0.06] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-warm-gray-200 dark:bg-white/[0.08] flex items-center justify-center text-sm font-semibold text-[#374151] dark:text-[#8E8E93]">
                {employee.avatar}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[#111827] dark:text-[#F2F2F7] text-base">
                  {employee.name}
                </div>
                <div className="text-xs font-mono text-[#6B7280] dark:text-[#8E8E93]">
                  {employee.matricule}
                </div>
              </div>
            </div>
          </div>

          {step === 1 ? (
            <>
              {/* Block summary card */}
              <div className="bg-warm-gray-200 dark:bg-white/[0.06] rounded-xl p-4 shadow-inner">
                <h4 className="text-sm font-semibold text-[#111827] dark:text-[#F2F2F7] mb-3">
                  Informations du blocage
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280] dark:text-[#8E8E93]">Motif du blocage</span>
                    <span className="text-[#111827] dark:text-[#F2F2F7] font-medium">
                      {activeBlock?.reason || 'Non spécifié'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280] dark:text-[#8E8E93]">Date de blocage</span>
                    <span className="text-[#111827] dark:text-[#F2F2F7] font-medium">
                      {getBlockDate()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280] dark:text-[#8E8E93]">{t('bloquePar')}</span>
                    <span className="text-[#111827] dark:text-[#F2F2F7] font-medium">
                      {activeBlock?.blockedBy?.name || '—'}
                      {activeBlock?.blockedBy?.role && ` — ${activeBlock.blockedBy.role}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Unblock reason dropdown */}
              <CustomSelect
                label={t('motifDeblocage')}
                required
                value={unblockReason}
                onChange={(value) => setUnblockReason(value)}
                placeholder={t('selectionnezMotif')}
                options={[
                  { value: t('erreurAdministrative'), label: t('erreurAdministrative') },
                  { value: t('justificationAcceptee'), label: t('justificationAcceptee') },
                  { value: t('decisionHierarchique'), label: t('decisionHierarchique') },
                  { value: t('autre'), label: t('autre') },
                ]}
              />

              {/* Description field */}
              <div>
                <label className="block text-sm font-medium text-[#111827] dark:text-[#F2F2F7] mb-2">
                  Description
                  <span className="text-[#6B7280] dark:text-[#8E8E93] font-normal ml-1">(optionnel)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('remarquesDeblocage')}
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-white/[0.06] border border-warm-gray-400 dark:border-white/[0.07] rounded-xl text-[#111827] dark:text-[#F2F2F7] placeholder:text-[#6B7280] dark:placeholder:text-[#48484A] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-status-green/20 dark:focus:ring-[#34C759]/20 focus:border-status-green dark:focus:border-[#34C759] transition-all"
                />
              </div>

              {/* Success notice */}
              <div className="flex gap-3 p-4 bg-status-green/10 dark:bg-[rgba(52,199,89,0.15)] border border-status-green/20 dark:border-[rgba(52,199,89,0.2)] rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-status-green dark:text-[#34C759] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-status-green dark:text-[#34C759] text-sm">
                    Déblocage immédiat
                  </div>
                  <p className="text-xs text-[#374151] dark:text-[#8E8E93] mt-1">
                    Après confirmation, l'employé pourra immédiatement demander de
                    nouveaux congés et son statut sera mis à jour.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Admin Selector */}
              <div>
                <label className="block text-sm font-medium text-[#111827] dark:text-[#F2F2F7] mb-3">
                  Administrateur
                </label>
                {loadingAdmins ? (
                  <div className="text-center py-4 text-sm text-[#6B7280] dark:text-[#8E8E93]">
                    Chargement des administrateurs...
                  </div>
                ) : admins.length === 0 ? (
                  <div className="text-center py-4 text-sm text-status-red dark:text-[#FF6B6B]">
                    Aucun administrateur disponible
                  </div>
                ) : (
                  <div className="space-y-2">
                    {admins.map(admin => (
                      <button
                        key={admin.id}
                        onClick={() => setSelectedAdmin(admin)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                          selectedAdmin?.id === admin.id
                            ? 'border-navy dark:border-[#2C4A6F] bg-navy/5 dark:bg-[rgba(44,74,111,0.15)]'
                            : 'border-warm-gray-400 dark:border-white/[0.12] hover:border-navy/40 dark:hover:border-white/[0.2]'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-navy/10 dark:bg-[rgba(44,74,111,0.2)] flex items-center justify-center text-sm font-semibold text-navy dark:text-[#5E9FFF]">
                          {getInitials(admin.name)}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-[#111827] dark:text-[#F2F2F7]">{admin.name}</div>
                          <div className="text-xs text-[#6B7280] dark:text-[#8E8E93]">{admin.role}</div>
                        </div>
                        {selectedAdmin?.id === admin.id && (
                          <Check className="w-5 h-5 text-navy dark:text-[#5E9FFF]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* PIN Input */}
              <div>
                <label className="block text-sm font-medium text-[#111827] dark:text-[#F2F2F7] mb-3">
                  Code PIN
                </label>
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map(index => (
                    <input
                      key={index}
                      id={`unblock-pin-${index}`}
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={pin[index]}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      disabled={pinStatus === 'verifying' || pinStatus === 'verified'}
                      className={`w-14 h-14 text-center text-xl font-semibold text-[#111827] dark:text-[#F2F2F7] rounded-xl border-2 transition-all shadow-inner focus:outline-none ${
                        pinStatus === 'error'
                          ? 'border-status-red dark:border-[#C0392B] bg-status-red/5 dark:bg-[rgba(192,57,43,0.08)]'
                          : pinStatus === 'verified'
                          ? 'border-status-green dark:border-[#34C759] bg-status-green/5 dark:bg-[rgba(52,199,89,0.08)]'
                          : pin[index]
                          ? 'border-navy dark:border-[#2C4A6F] bg-warm-gray-200 dark:bg-white/[0.08]'
                          : 'border-transparent bg-warm-gray-200 dark:bg-white/[0.06] focus:border-navy dark:focus:border-[#2C4A6F]'
                      }`}
                    />
                  ))}
                </div>
                {pinStatus === 'verifying' && (
                  <p className="text-xs text-navy dark:text-[#5E9FFF] text-center mt-2">Vérification...</p>
                )}
                {pinStatus === 'error' && (
                  <p className="text-xs text-status-red dark:text-[#FF6B6B] text-center mt-2">Code incorrect</p>
                )}
                {pinStatus === 'verified' && (
                  <p className="text-xs text-status-green dark:text-[#34C759] text-center mt-2">✓ Code correct</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* STICKY FOOTER - always visible */}
        <div className="flex-shrink-0 bg-white dark:bg-[#16161E] border-t border-gray-100 dark:border-white/[0.07] px-5 py-4 flex gap-3">
          <button
            onClick={step === 1 ? handleClose : () => setStep(1)}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-sm text-[#6B7280] dark:text-[#8E8E93] hover:bg-black/5 dark:hover:bg-white/[0.06] transition-all duration-200"
          >
            {step === 1 ? 'Annuler' : '← Retour'}
          </button>
          <button
            onClick={step === 1 ? () => setStep(2) : handleSubmit}
            disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-sm shadow-ambient hover:shadow-modal transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: (step === 1 ? isStep1Valid : isStep2Valid) ? '#2D8653' : '#9CA3AF',
              color: 'white',
              ...(isDark && (step === 1 ? isStep1Valid : isStep2Valid) ? {
                background: 'linear-gradient(145deg, #2D8653, #1F5F39)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 12px rgba(0,0,0,0.4)'
              } : {})
            }}
          >
            {step === 1 ? 'Suivant →' : 'Confirmer le déblocage'}
          </button>
        </div>
      </div>
    </div>
  )
}
