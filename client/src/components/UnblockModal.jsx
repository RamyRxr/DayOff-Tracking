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
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      style={isDark ? { backgroundColor: 'rgba(0,0,0,0.75)' } : {}}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg flex flex-col h-[92vh] sm:max-h-[88vh] overflow-hidden"
        style={isDark ? {
          backgroundColor: '#0B1120',
          border: '1px solid rgba(99,157,255,0.15)',
          boxShadow: '0 0 0 1px rgba(99,157,255,0.1), 0 32px 80px rgba(0,0,0,0.7)'
        } : {
          boxShadow: '0 0 0 1px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.2)'
        }}
      >
        {/* STICKY HEADER */}
        <div
          className="flex-shrink-0 bg-status-green/10 px-5 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between"
          style={isDark ? {
            backgroundColor: 'rgba(52,199,89,0.12)',
            borderColor: 'rgba(99,157,255,0.12)'
          } : {}}
        >
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="p-1 hover:bg-black/5 rounded-lg transition-colors"
                onMouseEnter={(e) => {
                  if (isDark) e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
                }}
                onMouseLeave={(e) => {
                  if (isDark) e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <ChevronLeft className="w-5 h-5 text-[#6B7280] dark:text-[#7A9CC4]" />
              </button>
            )}
            <div
              className="w-10 h-10 rounded-full bg-status-green/20 flex items-center justify-center"
              style={isDark ? { backgroundColor: 'rgba(52,199,89,0.15)' } : {}}
            >
              <Unlock className="w-5 h-5 text-status-green dark:text-[#34C759]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#111827] dark:text-[#E8EFF8]">
                {step === 1 ? t('debloquerEmploye') : t('autorisationRequise')}
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-[#7A9CC4] mt-0.5">
                {t('etape')} {step} {t('sur')} 2
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg hover:bg-black/5 flex items-center justify-center transition-colors"
            onMouseEnter={(e) => {
              if (isDark) e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
            }}
            onMouseLeave={(e) => {
              if (isDark) e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <X className="w-5 h-5 text-[#6B7280] dark:text-[#7A9CC4]" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-5 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {/* Employee info */}
          <div
            className="bg-warm-gray-200 rounded-xl p-4"
            style={isDark ? {
              backgroundColor: 'rgba(99,157,255,0.06)',
              border: '1px solid rgba(99,157,255,0.12)'
            } : {}}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full bg-warm-gray-200 flex items-center justify-center text-sm font-semibold text-[#374151]"
                style={isDark ? {
                  backgroundColor: 'rgba(99,157,255,0.12)',
                  color: '#7A9CC4'
                } : {}}
              >
                {employee.avatar}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[#111827] dark:text-[#E8EFF8] text-base">
                  {employee.name}
                </div>
                <div className="text-xs font-mono text-[#6B7280] dark:text-[#7A9CC4]">
                  {employee.matricule}
                </div>
              </div>
            </div>
          </div>

          {step === 1 ? (
            <>
              {/* Block summary card */}
              <div
                className="bg-warm-gray-200 rounded-xl p-4 shadow-inner"
                style={isDark ? {
                  backgroundColor: 'rgba(99,157,255,0.06)',
                  border: '1px solid rgba(99,157,255,0.12)'
                } : {}}
              >
                <h4 className="text-sm font-semibold text-[#111827] dark:text-[#E8EFF8] mb-3">
                  Informations du blocage
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#6B7280] dark:text-[#7A9CC4]">Motif du blocage</span>
                    <span className="text-[#111827] dark:text-[#E8EFF8] font-medium">
                      {activeBlock?.reason || 'Non spécifié'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280] dark:text-[#7A9CC4]">Date de blocage</span>
                    <span className="text-[#111827] dark:text-[#E8EFF8] font-medium">
                      {getBlockDate()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280] dark:text-[#7A9CC4]">{t('bloquePar')}</span>
                    <span className="text-[#111827] dark:text-[#E8EFF8] font-medium">
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
                <label className="block text-sm font-medium text-[#111827] dark:text-[#E8EFF8] mb-2">
                  {t('description')}
                  <span className="text-[#6B7280] dark:text-[#7A9CC4] font-normal ml-1">({t('optionnel')})</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('remarquesDeblocage')}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-warm-gray-400 rounded-xl text-[#111827] placeholder:text-[#6B7280] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-status-green/20 focus:border-status-green transition-all"
                  style={isDark ? {
                    backgroundColor: 'rgba(13,21,38,0.75)',
                    borderColor: 'rgba(99,157,255,0.12)',
                    color: '#E8EFF8'
                  } : {}}
                />
              </div>

              {/* Success notice */}
              <div
                className="flex gap-3 p-4 bg-status-green/10 border border-status-green/20 rounded-xl"
                style={isDark ? {
                  backgroundColor: 'rgba(52,199,89,0.12)',
                  borderColor: 'rgba(52,199,89,0.2)'
                } : {}}
              >
                <CheckCircle2 className="w-5 h-5 text-status-green dark:text-[#34C759] flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-status-green dark:text-[#34C759] text-sm">
                    Déblocage immédiat
                  </div>
                  <p className="text-xs text-[#374151] dark:text-[#7A9CC4] mt-1">
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
                <label className="block text-sm font-medium text-[#111827] dark:text-[#E8EFF8] mb-3">
                  {t('administrateur')}
                </label>
                {loadingAdmins ? (
                  <div className="text-center py-4 text-sm text-[#6B7280] dark:text-[#7A9CC4]">
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
                            ? 'border-navy bg-navy/5'
                            : 'border-warm-gray-400 hover:border-navy/40'
                        }`}
                        style={isDark ? (
                          selectedAdmin?.id === admin.id
                            ? {
                                borderColor: 'rgba(99,157,255,0.3)',
                                backgroundColor: 'rgba(99,157,255,0.08)'
                              }
                            : {
                                borderColor: 'rgba(99,157,255,0.12)'
                              }
                        ) : {}}
                      >
                        <div
                          className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center text-sm font-semibold text-navy"
                          style={isDark ? {
                            backgroundColor: 'rgba(99,157,255,0.15)',
                            color: '#639DFF'
                          } : {}}
                        >
                          {getInitials(admin.name)}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-[#111827] dark:text-[#E8EFF8]">{admin.name}</div>
                          <div className="text-xs text-[#6B7280] dark:text-[#7A9CC4]">{admin.role}</div>
                        </div>
                        {selectedAdmin?.id === admin.id && (
                          <Check className="w-5 h-5 text-navy dark:text-[#639DFF]" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* PIN Input */}
              <div>
                <label className="block text-sm font-medium text-[#111827] dark:text-[#E8EFF8] mb-3">
                  {t('codePIN')}
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
                      className={`w-14 h-14 text-center text-xl font-semibold text-[#111827] rounded-xl border-2 transition-all shadow-inner focus:outline-none ${
                        pinStatus === 'error'
                          ? 'border-status-red bg-status-red/5'
                          : pinStatus === 'verified'
                          ? 'border-status-green bg-status-green/5'
                          : pin[index]
                          ? 'border-navy bg-warm-gray-200'
                          : 'border-transparent bg-warm-gray-200 focus:border-navy'
                      }`}
                      style={isDark ? (
                        pinStatus === 'error'
                          ? { borderColor: '#C0392B', backgroundColor: 'rgba(192,57,43,0.08)', color: '#E8EFF8' }
                          : pinStatus === 'verified'
                          ? { borderColor: '#34C759', backgroundColor: 'rgba(52,199,89,0.08)', color: '#E8EFF8' }
                          : pin[index]
                          ? { borderColor: 'rgba(99,157,255,0.3)', backgroundColor: 'rgba(99,157,255,0.08)', color: '#E8EFF8' }
                          : { borderColor: 'transparent', backgroundColor: 'rgba(99,157,255,0.06)', color: '#E8EFF8' }
                      ) : {}}
                    />
                  ))}
                </div>
                {pinStatus === 'verifying' && (
                  <p className="text-xs text-navy dark:text-[#639DFF] text-center mt-2">{t('verification')}</p>
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
        <div
          className="flex-shrink-0 bg-white border-t border-gray-100 px-5 py-4 flex gap-3"
          style={isDark ? {
            backgroundColor: '#0B1120',
            borderColor: 'rgba(99,157,255,0.12)'
          } : {}}
        >
          <button
            onClick={step === 1 ? handleClose : () => setStep(1)}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-sm text-[#6B7280] dark:text-[#7A9CC4] hover:bg-black/5 transition-all duration-200"
            onMouseEnter={(e) => {
              if (isDark) e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
            }}
            onMouseLeave={(e) => {
              if (isDark) e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            {step === 1 ? t('annuler') : t('retourFleche')}
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
            {step === 1 ? t('suivantFleche') : t('confirmerDeblocage')}
          </button>
        </div>
      </div>
    </div>
  )
}
