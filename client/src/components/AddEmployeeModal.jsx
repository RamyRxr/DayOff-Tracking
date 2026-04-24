import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { X, UserPlus, RefreshCw, ChevronLeft, Check } from "lucide-react";
import { useEmployees } from "../hooks/useEmployees";
import { useAdmins, useAdminPin } from "../hooks/useAdmins";
import CustomSelect from "./CustomSelect";

const DEPARTMENTS = [
  "Production",
  "Logistique",
  "Administration",
  "Maintenance",
  "Qualité",
  "Sécurité",
];

export default function AddEmployeeModal({
  isOpen,
  onClose,
  onSubmit,
  onSuccess,
}) {
  const { t } = useTranslation();
  const isVisible = typeof isOpen === "boolean" ? isOpen : true;
  const { employees, addEmployee } = useEmployees();
  const { admins } = useAdmins();
  const { verify, verifying } = useAdminPin();

  function buildMatricule() {
    let unique = false;
    let newMatricule = "";

    while (!unique) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      newMatricule = `NAF-${randomNum}`;
      unique = !employees.some((emp) => emp.matricule === newMatricule);
    }

    return newMatricule;
  }

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    matricule: "",
    department: "",
    position: "",
    email: "",
    phone: "",
    startDate: "",
  });
  const [errors, setErrors] = useState({});
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [pinStatus, setPinStatus] = useState("idle");
  const [submissionError, setSubmissionError] = useState("");
  const [isEmailDirty, setIsEmailDirty] = useState(false);

  function generateMatricule() {
    setFormData((prev) => ({ ...prev, matricule: buildMatricule() }));
  }

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };

      if ((field === "prenom" || field === "nom") && !isEmailDirty) {
        const prenom = field === "prenom" ? value : next.prenom;
        const nom = field === "nom" ? value : next.nom;
        if (prenom && nom) {
          next.email = `${prenom.toLowerCase()}.${nom.toLowerCase()}@naftal.dz`;
        }
      }

      return next;
    });

    if (field === "email") {
      setIsEmailDirty(value.trim().length > 0);
    }

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = (data = formData) => {
    const newErrors = {};

    if (!data.prenom.trim()) {
      newErrors.prenom = t('prenomRequis');
    }

    if (!data.nom.trim()) {
      newErrors.nom = t('nomRequis');
    }

    if (!data.matricule.trim()) {
      newErrors.matricule = t('matriculeRequis');
    }

    if (!data.department) {
      newErrors.department = t('departementRequis');
    }

    if (!data.position.trim()) {
      newErrors.position = t('posteRequis');
    }

    if (!data.email.trim()) {
      newErrors.email = t('emailRequis');
    } else if (!data.email.includes("@")) {
      newErrors.email = t('emailInvalide');
    }

    if (!data.startDate) {
      newErrors.startDate = t('dateEmbaucheRequise');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePinChange = (index, value) => {
    if (!selectedAdmin || pinStatus === "verified" || verifying) return;

    if (value.length > 1) value = value[value.length - 1];
    if (value && !/^[0-9]$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      document.getElementById(`emp-pin-${index + 1}`)?.focus();
    }

    if (newPin.every((d) => d !== "")) {
      handlePinValidate(newPin.join(""));
    }
  };

  const handlePinValidate = async (pinValue) => {
    if (!selectedAdmin) {
      setPinStatus("error");
      return;
    }

    setPinStatus("verifying");

    try {
      await verify(selectedAdmin.id, pinValue);
      setPinStatus("verified");
    } catch {
      setPinStatus("error");
      setTimeout(() => {
        setPin(["", "", "", ""]);
        setPinStatus("idle");
        document.getElementById("emp-pin-0")?.focus();
      }, 1500);
    }
  };

  const handleStep1Submit = () => {
    const nextData = formData.matricule
      ? formData
      : { ...formData, matricule: buildMatricule() };

    if (!formData.matricule) {
      setFormData(nextData);
    }

    if (validateForm(nextData)) {
      setStep(2);
    }
  };

  const handleFinalSubmit = async () => {
    setSubmissionError("");

    const names = `${formData.prenom} ${formData.nom}`;
    const avatar = `${formData.prenom[0]}${formData.nom[0]}`.toUpperCase();

    const payload = {
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
      status: "actif",
      authorizedBy: selectedAdmin?.id || null,
    };

    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        await addEmployee(payload);
      }
      onSuccess?.(payload);
      handleClose();
    } catch (error) {
      setSubmissionError(error?.message || "Échec de la création de l'employé");
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      prenom: "",
      nom: "",
      matricule: "",
      department: "",
      position: "",
      email: "",
      phone: "",
      startDate: "",
    });
    setErrors({});
    setSelectedAdmin(null);
    setPin(["", "", "", ""]);
    setPinStatus("idle");
    setIsEmailDirty(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const isStep1Valid =
    formData.prenom &&
    formData.nom &&
    formData.department &&
    formData.position &&
    formData.email &&
    formData.email.includes("@") &&
    formData.startDate;
  const isStep2Valid = !!selectedAdmin && pinStatus === "verified";

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
                {step === 1 ? t('nouvelEmploye') : t('autorisationRequise')}
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {t('etape')} {step} {t('sur')} 2
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
                  {t('prenom')}
                  <span className="text-status-red ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => handleChange("prenom", e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-navy/20 ${
                    errors.prenom ? "border-status-red" : "border-warm-gray-400"
                  }`}
                />
                {errors.prenom && (
                  <p className="text-xs text-status-red mt-1">
                    {errors.prenom}
                  </p>
                )}
              </div>

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  {t('nom')}
                  <span className="text-status-red ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => handleChange("nom", e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-navy/20 ${
                    errors.nom ? "border-status-red" : "border-warm-gray-400"
                  }`}
                />
                {errors.nom && (
                  <p className="text-xs text-status-red mt-1">{errors.nom}</p>
                )}
              </div>

              {/* Matricule (auto-generated) */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  {t('matricule')}
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
                    title={t('genererMatricule')}
                  >
                    <RefreshCw className="w-5 h-5 text-navy" />
                  </button>
                </div>
                <p className="text-xs text-[#6B7280] mt-1">
                  {t('genereAutomatiquement')}
                </p>
              </div>

              {/* Département */}
              <div>
                <CustomSelect
                  label={t('departement')}
                  required
                  value={formData.department}
                  onChange={(value) => handleChange("department", value)}
                  placeholder={t('selectionnezDepartement')}
                  options={DEPARTMENTS.map((dept) => ({
                    value: dept,
                    label: dept,
                  }))}
                />
                {errors.department && (
                  <p className="text-xs text-status-red mt-1">
                    {errors.department}
                  </p>
                )}
              </div>

              {/* Poste */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  {t('poste')}
                  <span className="text-status-red ml-1">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t('exPoste')}
                  value={formData.position}
                  onChange={(e) => handleChange("position", e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-navy/20 ${
                    errors.position
                      ? "border-status-red"
                      : "border-warm-gray-400"
                  }`}
                />
                {errors.position && (
                  <p className="text-xs text-status-red mt-1">
                    {errors.position}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  {t('email')}
                  <span className="text-status-red ml-1">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-navy/20 ${
                    errors.email ? "border-status-red" : "border-warm-gray-400"
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-status-red mt-1">{errors.email}</p>
                )}
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  {t('telephone')}
                  <span className="text-[#6B7280] font-normal ml-1">
                    ({t('optionnel')})
                  </span>
                </label>
                <input
                  type="tel"
                  placeholder="+213 XX XX XX XX"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-warm-gray-400 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-navy/20"
                />
              </div>

              {/* Date d'embauche */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-2">
                  {t('dateEmbauche')}
                  <span className="text-status-red ml-1">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-navy/20 ${
                    errors.startDate
                      ? "border-status-red"
                      : "border-warm-gray-400"
                  }`}
                />
                {errors.startDate && (
                  <p className="text-xs text-status-red mt-1">
                    {errors.startDate}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Admin Selector */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-3">
                  {t('administrateur')}
                </label>
                <div className="space-y-2">
                  {admins.map((admin) => (
                    <button
                      key={admin.id}
                      onClick={() => {
                        if (selectedAdmin?.id === admin.id) return;
                        setSelectedAdmin(admin);
                        setPin(["", "", "", ""]);
                        setPinStatus("idle");
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                        selectedAdmin?.id === admin.id
                          ? "border-navy bg-navy/5"
                          : "border-warm-gray-400 hover:border-navy/40"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center text-sm font-semibold text-navy">
                        {admin.name
                          .split(" ")
                          .filter(Boolean)
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-[#111827]">
                          {admin.name}
                        </div>
                        <div className="text-xs text-[#6B7280]">
                          {admin.role}
                        </div>
                      </div>
                      {selectedAdmin?.id === admin.id && (
                        <Check className="w-5 h-5 text-navy" />
                      )}
                    </button>
                  ))}
                  {admins.length === 0 && (
                    <p className="text-xs text-[#6B7280]">
                      {t('aucunAdministrateur')}
                    </p>
                  )}
                </div>
              </div>

              {/* PIN Input */}
              <div>
                <label className="block text-sm font-medium text-[#111827] mb-3">
                  {t('codePIN')}
                </label>
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={index}
                      id={`emp-pin-${index}`}
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={pin[index]}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      disabled={
                        !selectedAdmin ||
                        pinStatus === "verifying" ||
                        pinStatus === "verified" ||
                        verifying
                      }
                      className={`w-14 h-14 text-center text-xl font-semibold rounded-xl border-2 transition-all shadow-inner focus:outline-none ${
                        pinStatus === "error"
                          ? "border-status-red bg-status-red/5"
                          : pinStatus === "verified"
                            ? "border-status-green bg-status-green/5"
                            : pin[index]
                              ? "border-navy bg-warm-gray-200"
                              : "border-transparent bg-warm-gray-200 focus:border-navy"
                      }`}
                    />
                  ))}
                </div>
                {!selectedAdmin && (
                  <p className="text-xs text-[#6B7280] text-center mt-2">
                    {t('selectionnerAdminDabord')}
                  </p>
                )}
                {pinStatus === "verifying" && (
                  <p className="text-xs text-navy text-center mt-2">
                    {t('verification')}
                  </p>
                )}
                {pinStatus === "error" && (
                  <p className="text-xs text-status-red text-center mt-2">
                    {t('codeIncorrect')}
                  </p>
                )}
                {pinStatus === "verified" && (
                  <p className="text-xs text-status-green text-center mt-2">
                    {t('codeCorrect')}
                  </p>
                )}
              </div>

              {submissionError && (
                <p className="text-xs text-status-red text-center">
                  {submissionError}
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-black/6 px-6 py-4 flex gap-3 rounded-b-3xl">
          <button
            onClick={step === 1 ? handleClose : () => setStep(1)}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-sm text-[#6B7280] hover:bg-black/5 transition-all"
          >
            {step === 1 ? t('annuler') : t('retourFleche')}
          </button>
          <button
            onClick={step === 1 ? handleStep1Submit : handleFinalSubmit}
            disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
            className="flex-1 bg-navy text-white px-4 py-3 rounded-xl font-medium text-sm shadow-ambient hover:shadow-modal transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 1 ? t('suivantFleche') : t('creerEmploye')}
          </button>
        </div>
      </div>
    </div>
  );
}
