import { useState, useEffect, useRef } from 'react'
import { Lock, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

/**
 * AdminPinEntry Component
 * 5 states: idle, entering, validating, success, error
 */
export default function AdminPinEntry({ isOpen, onClose, onSuccess, actionLabel }) {
  const [pinDigits, setPinDigits] = useState(['', '', '', ''])
  const [status, setStatus] = useState('idle') // idle | entering | validating | success | error
  const inputRefs = useRef([null, null, null, null])

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [isOpen])

  useEffect(() => {
    const pin = pinDigits.join('')
    if (pin.length === 4 && pinDigits.every(d => d !== '')) {
      // Auto-validate when all 4 digits entered
      handleValidate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinDigits])

  const handleValidate = async () => {
    setStatus('validating')

    // Simulate API call to validate PIN
    await new Promise((resolve) => setTimeout(resolve, 800))

    const pin = pinDigits.join('')
    // Mock validation: accept "1234" as correct PIN
    if (pin === '1234') {
      setStatus('success')
      setTimeout(() => {
        onSuccess?.()
        handleClose()
      }, 1000)
    } else {
      setStatus('error')
      setTimeout(() => {
        setPinDigits(['', '', '', ''])
        setStatus('idle')
        inputRefs.current[0]?.focus()
      }, 1500)
    }
  }

  const handleClose = () => {
    setPinDigits(['', '', '', ''])
    setStatus('idle')
    onClose?.()
  }

  const handleDigitChange = (index, value) => {
    // Only allow single digit
    if (value.length > 1) {
      value = value[value.length - 1]
    }

    // Only allow digits
    if (value && !/^[0-9]$/.test(value)) {
      return
    }

    const newDigits = [...pinDigits]
    newDigits[index] = value

    setPinDigits(newDigits)

    if (status === 'idle' && value) setStatus('entering')
    if (status === 'error') setStatus('idle')

    // Auto-advance to next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'Escape') {
      handleClose()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4)

    if (pastedData.length === 4) {
      const newDigits = pastedData.split('')
      setPinDigits(newDigits)
      setStatus('entering')
      inputRefs.current[3]?.focus()
    }
  }

  if (!isOpen) return null

  const statusConfig = {
    idle: {
      icon: Lock,
      iconColor: 'text-gray-400',
      message: 'Entrez votre code PIN',
      dotColor: 'bg-warm-gray-300',
    },
    entering: {
      icon: Lock,
      iconColor: 'text-navy',
      message: 'Entrez votre code PIN',
      dotColor: 'bg-navy',
    },
    validating: {
      icon: Loader2,
      iconColor: 'text-navy',
      message: 'Vérification...',
      dotColor: 'bg-navy',
      spin: true,
    },
    success: {
      icon: CheckCircle2,
      iconColor: 'text-apple-green',
      message: 'Code correct',
      dotColor: 'bg-apple-green',
    },
    error: {
      icon: XCircle,
      iconColor: 'text-apple-red',
      message: 'Code incorrect',
      dotColor: 'bg-apple-red',
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center"
        onClick={handleClose}
      >
        {/* Modal */}
        <div
          className="bg-white/95 backdrop-blur-2xl rounded-3xl p-8 shadow-modal w-[360px]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className={`w-16 h-16 rounded-full ${
                status === 'success'
                  ? 'bg-apple-green/10'
                  : status === 'error'
                  ? 'bg-apple-red/10'
                  : 'bg-warm-gray-300'
              } flex items-center justify-center`}
            >
              <Icon
                className={`w-8 h-8 ${config.iconColor} ${
                  config.spin ? 'animate-spin' : ''
                }`}
                strokeWidth={2}
              />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-center text-xl font-semibold text-gray-900 mb-2">
            {actionLabel || 'Confirmation requise'}
          </h3>

          {/* Message */}
          <p className="text-center text-sm text-gray-600 mb-8">
            {config.message}
          </p>

          {/* PIN input boxes */}
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={pinDigits[index]}
                onChange={(e) => handleDigitChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={status === 'validating' || status === 'success'}
                className={`w-14 h-14 text-center text-xl font-semibold bg-warm-gray-200 rounded-xl border-2 transition-all duration-200 shadow-inner focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                  status === 'error'
                    ? 'border-status-red'
                    : pinDigits[index]
                    ? 'border-navy'
                    : 'border-transparent focus:border-navy'
                }`}
              />
            ))}
          </div>

          {/* Cancel button */}
          <button
            onClick={handleClose}
            disabled={status === 'validating'}
            className="w-full py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-black/5 transition-all duration-200 disabled:opacity-50"
          >
            Annuler
          </button>
        </div>
      </div>
    </>
  )
}
