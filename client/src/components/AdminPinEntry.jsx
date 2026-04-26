import { useState, useEffect, useRef } from "react";
import { Lock, CheckCircle2, XCircle, Loader2, Check } from "lucide-react";
import { useAdmins, useAdminPin } from "../hooks/useAdmins";
import { useTranslation } from 'react-i18next';

/**
 * AdminPinEntry Component
 * 5 states: idle, entering, validating, success, error
 */
export default function AdminPinEntry({
  isOpen,
  onClose,
  onSuccess,
  actionLabel,
}) {
  const { t } = useTranslation();
  const { admins, loading: adminsLoading, error: adminsError } = useAdmins();
  const { verify, verifying, reset } = useAdminPin();

  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [pinDigits, setPinDigits] = useState(["", "", "", ""]);
  const [status, setStatus] = useState("idle"); // idle | entering | validating | success | error
  const [localError, setLocalError] = useState("");
  const inputRefs = useRef([null, null, null, null]);

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isOpen]);

  function handleClose() {
    setSelectedAdminId(null);
    setPinDigits(["", "", "", ""]);
    setStatus("idle");
    setLocalError("");
    reset();
    onClose?.();
  }

  async function handleValidate(pinValue = pinDigits.join("")) {
    if (!selectedAdminId) {
      setLocalError(t('selectionnerAdminDabord'));
      return;
    }

    setStatus("validating");
    setLocalError("");

    try {
      const verifiedAdmin = await verify(selectedAdminId, pinValue);
      setStatus("success");
      setTimeout(() => {
        onSuccess?.(verifiedAdmin);
        handleClose();
      }, 1000);
    } catch {
      setStatus("error");
      setTimeout(() => {
        setPinDigits(["", "", "", ""]);
        setStatus("idle");
        inputRefs.current[0]?.focus();
      }, 1500);
    }
  }

  const handleAdminSelect = (adminId) => {
    console.log('🔍 Admin clicked:', adminId);
    console.log('🔍 Current selected:', selectedAdminId);

    if (status === "validating" || status === "success") {
      console.log('⚠️ Selection blocked by status:', status);
      return;
    }

    setSelectedAdminId(adminId);
    setPinDigits(["", "", "", ""]);
    setStatus("idle");
    setLocalError("");
    reset();

    console.log('✅ Admin selected:', adminId);

    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 0);
  };

  const handleDigitChange = (index, value) => {
    if (
      !selectedAdminId ||
      status === "validating" ||
      status === "success" ||
      verifying
    ) {
      return;
    }

    // Only allow single digit
    if (value.length > 1) {
      value = value[value.length - 1];
    }

    // Only allow digits
    if (value && !/^[0-9]$/.test(value)) {
      return;
    }

    const newDigits = [...pinDigits];
    newDigits[index] = value;

    setPinDigits(newDigits);

    if (status === "idle" && value) setStatus("entering");
    if (status === "error") setStatus("idle");

    // Auto-advance to next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newDigits.every((digit) => digit !== "")) {
      handleValidate(newDigits.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !pinDigits[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "Escape") {
      handleClose();
    }
  };

  const handlePaste = (e) => {
    if (!selectedAdminId) return;

    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);

    if (pastedData.length === 4) {
      const newDigits = pastedData.split("");
      setPinDigits(newDigits);
      setStatus("entering");
      inputRefs.current[3]?.focus();
      handleValidate(pastedData);
    }
  };

  if (!isOpen) return null;

  const statusConfig = {
    idle: {
      icon: Lock,
      iconColor: "text-gray-400",
      message: selectedAdminId
        ? t('entrezCodePIN')
        : t('selectionnerAdminDabord'),
      dotColor: "bg-warm-gray-300",
    },
    entering: {
      icon: Lock,
      iconColor: "text-navy",
      message: t('entrezCodePIN'),
      dotColor: "bg-navy",
    },
    validating: {
      icon: Loader2,
      iconColor: "text-navy",
      message: t('verification'),
      dotColor: "bg-navy",
      spin: true,
    },
    success: {
      icon: CheckCircle2,
      iconColor: "text-apple-green",
      message: t('codeCorrect'),
      dotColor: "bg-apple-green",
    },
    error: {
      icon: XCircle,
      iconColor: "text-apple-red",
      message: t('codeIncorrect'),
      dotColor: "bg-apple-red",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

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
                status === "success"
                  ? "bg-apple-green/10"
                  : status === "error"
                    ? "bg-apple-red/10"
                    : "bg-warm-gray-300"
              } flex items-center justify-center`}
            >
              <Icon
                className={`w-8 h-8 ${config.iconColor} ${
                  config.spin ? "animate-spin" : ""
                }`}
                strokeWidth={2}
              />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-center text-xl font-semibold text-gray-900 mb-2">
            {actionLabel || t('confirmationRequise')}
          </h3>

          {/* Message */}
          <p className="text-center text-sm text-gray-600 mb-8">
            {config.message}
          </p>

          {/* Admin selector */}
          <div className="mb-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
              Administrateur
            </p>

            {adminsLoading && (
              <div className="text-xs text-[#6B7280]">
                Chargement des administrateurs...
              </div>
            )}

            {adminsError && !adminsLoading && (
              <div className="text-xs text-status-red">{adminsError}</div>
            )}

            {!adminsLoading && !adminsError && admins.length === 0 && (
              <div className="text-xs text-[#6B7280]">
                Aucun administrateur disponible
              </div>
            )}

            {!adminsLoading &&
              admins.map((admin) => {
                const isSelected = selectedAdminId === admin.id;
                console.log(`🎨 Rendering admin ${admin.name} (${admin.id}): selected=${isSelected}`);

                return (
                  <button
                    key={admin.id}
                    type="button"
                    onClick={() => handleAdminSelect(admin.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all relative ${
                      isSelected
                        ? "border-navy bg-navy/10 shadow-sm"
                        : "border-warm-gray-400 hover:border-navy/40"
                    }`}
                  >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    isSelected ? "bg-navy text-white" : "bg-navy/10 text-navy"
                  }`}>
                    {admin.name
                      .split(" ")
                      .filter(Boolean)
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-sm text-[#111827]">
                      {admin.name}
                    </div>
                    <div className="text-xs text-[#6B7280]">{admin.role}</div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-navy flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
                );
              })}
          </div>

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
                disabled={
                  !selectedAdminId ||
                  status === "validating" ||
                  status === "success" ||
                  verifying
                }
                className={`w-14 h-14 text-center text-xl font-semibold bg-warm-gray-200 rounded-xl border-2 transition-all duration-200 shadow-inner focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                  status === "error"
                    ? "border-status-red"
                    : pinDigits[index]
                      ? "border-navy"
                      : "border-transparent focus:border-navy"
                }`}
              />
            ))}
          </div>

          {localError && (
            <p className="text-xs text-status-red text-center mb-4">
              {localError}
            </p>
          )}

          {/* Cancel button */}
          <button
            onClick={handleClose}
            disabled={status === "validating"}
            className="w-full py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-black/5 transition-all duration-200 disabled:opacity-50"
          >
            Annuler
          </button>
        </div>
      </div>
    </>
  );
}
