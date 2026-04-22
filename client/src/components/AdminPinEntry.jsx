import { useState, useEffect, useRef } from 'react'
import { Lock, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

/**
 * AdminPinEntry Component
 * 5 states: idle, entering, validating, success, error
 */
export default function AdminPinEntry({ isOpen, onClose, onSuccess, actionLabel }) {
  const [pin, setPin] = useState('')
  const [status, setStatus] = useState('idle') // idle | entering | validating | success | error
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (pin.length === 4) {
      // Auto-validate when 4 digits entered
      handleValidate()
    }
  }, [pin])

  const handleValidate = async () => {
    setStatus('validating')

    // Simulate API call to validate PIN
    await new Promise((resolve) => setTimeout(resolve, 800))

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
        setPin('')
        setStatus('idle')
      }, 1500)
    }
  }

  const handleClose = () => {
    setPin('')
    setStatus('idle')
    onClose?.()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      handleClose()
    } else if (e.key === 'Backspace') {
      setPin((prev) => prev.slice(0, -1))
      if (status === 'error') setStatus('idle')
    } else if (e.key >= '0' && e.key <= '9' && pin.length < 4) {
      setPin((prev) => prev + e.key)
      if (status === 'idle') setStatus('entering')
      if (status === 'error') setStatus('entering')
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

          {/* PIN dots */}
          <div className="flex justify-center gap-3 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  i < pin.length ? config.dotColor : 'bg-warm-gray-300'
                } ${
                  status === 'error' && i < pin.length
                    ? 'animate-pulse'
                    : ''
                }`}
              />
            ))}
          </div>

          {/* Hidden input for keyboard capture */}
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '')
              if (value.length <= 4) {
                setPin(value)
                if (value.length > 0 && status === 'idle') {
                  setStatus('entering')
                }
              }
            }}
            onKeyDown={handleKeyPress}
            className="sr-only"
            autoFocus
          />

          {/* Number pad */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => {
                  if (pin.length < 4 && status !== 'validating') {
                    setPin((prev) => prev + num)
                    if (status === 'idle') setStatus('entering')
                  }
                }}
                disabled={status === 'validating' || status === 'success'}
                className="h-14 rounded-xl bg-warm-gray-200 hover:bg-warm-gray-300 active:bg-warm-gray-400 text-gray-900 font-semibold text-lg transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {num}
              </button>
            ))}
          </div>

          {/* Bottom row: empty, 0, delete */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div />
            <button
              onClick={() => {
                if (pin.length < 4 && status !== 'validating') {
                  setPin((prev) => prev + '0')
                  if (status === 'idle') setStatus('entering')
                }
              }}
              disabled={status === 'validating' || status === 'success'}
              className="h-14 rounded-xl bg-warm-gray-200 hover:bg-warm-gray-300 active:bg-warm-gray-400 text-gray-900 font-semibold text-lg transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              0
            </button>
            <button
              onClick={() => {
                setPin((prev) => prev.slice(0, -1))
                if (status === 'error') setStatus('idle')
              }}
              disabled={status === 'validating' || status === 'success'}
              className="h-14 rounded-xl bg-warm-gray-200 hover:bg-warm-gray-300 active:bg-warm-gray-400 text-gray-600 font-medium text-sm transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ⌫
            </button>
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
