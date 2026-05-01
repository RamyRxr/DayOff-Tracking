import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { X, UserPlus, RefreshCw } from "lucide-react";
import { useEmployees } from "../hooks/useEmployees";
import { useTheme } from "../contexts/ThemeContext";
import CustomSelect from "./CustomSelect";

export default function AddEmployeeModal({
  isOpen,
  onClose,
  onSubmit,
  onSuccess,
}) {
  const { t } = useTranslation();

  const DEPARTMENTS = [
    t('production'),
    t('logistique'),
    t('administration'),
    t('maintenance'),
    t('qualite'),
    t('securite'),
  ];
  const { isDark } = useTheme();
  const isVisible = typeof isOpen === "boolean" ? isOpen : true;
  const { employees, addEmployee } = useEmployees();

  function buildMatricule() {
    let unique = false;
    let newMatricule = "";

    while (!unique) {
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      newMatricule = `${randomNum}U`;
      unique = !employees.some((emp) => emp.matricule === newMatricule);
    }

    return newMatricule;
  }

  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    matricule: "",
    department: "",
    position: "",
    email: "",
    phone: "",
    ssn: "",
    startDate: "",
  });
  const [errors, setErrors] = useState({});
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

  const handleSubmit = async () => {
    const nextData = formData.matricule
      ? formData
      : { ...formData, matricule: buildMatricule() };

    if (!formData.matricule) {
      setFormData(nextData);
    }

    if (!validateForm(nextData)) {
      return;
    }

    await handleFinalSubmit();
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
      ssn: formData.ssn || null,
      startDate: formData.startDate,
      avatar,
      daysTotal: 30,
      daysUsed: 0,
      status: "actif",
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
    setFormData({
      prenom: "",
      nom: "",
      matricule: "",
      department: "",
      position: "",
      email: "",
      phone: "",
      ssn: "",
      startDate: "",
    });
    setErrors({});
    setIsEmailDirty(false);
    setSubmissionError("");
    onClose?.();
  };

  if (!isVisible) return null;

  const isFormValid =
    formData.prenom &&
    formData.nom &&
    formData.department &&
    formData.position &&
    formData.email &&
    formData.email.includes("@") &&
    formData.startDate;

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
          className="flex-shrink-0 bg-navy/10 border-b border-gray-100 px-5 pt-5 pb-4 flex items-center justify-between"
          style={isDark ? {
            backgroundColor: 'rgba(42,84,148,0.12)',
            borderColor: 'rgba(99,157,255,0.12)'
          } : {}}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full bg-navy/20 flex items-center justify-center"
              style={isDark ? { backgroundColor: 'rgba(99,157,255,0.15)' } : {}}
            >
              <UserPlus className="w-5 h-5 text-navy dark:text-[#639DFF]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-[#111827] dark:text-[#E8EFF8]">
                {t('nouvelEmploye')}
              </h2>
              <p className="text-xs text-[#6B7280] dark:text-[#7A9CC4] mt-0.5">
                {t('gerezEmployes')}
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
              {/* Prénom */}
              <div>
                <label className="block text-sm font-medium text-[#111827] dark:text-[#E8EFF8] mb-2">
                  {t('prenom')}
                  <span className="text-status-red ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => handleChange("prenom", e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-xl text-[#111827] placeholder:text-[#6B7280] transition-all focus:outline-none focus:ring-2 focus:ring-navy/20 ${
                    errors.prenom ? "border-status-red" : "border-warm-gray-400"
                  }`}
                  style={isDark ? {
                    backgroundColor: 'rgba(13,21,38,0.75)',
                    borderColor: errors.prenom ? '#C0392B' : 'rgba(99,157,255,0.12)',
                    color: '#E8EFF8'
                  } : {}}
                />
                {errors.prenom && (
                  <p className="text-xs text-status-red dark:text-[#FF6B6B] mt-1">
                    {errors.prenom}
                  </p>
                )}
              </div>

              {/* Nom */}
              <div>
                <label className="block text-sm font-medium text-[#111827] dark:text-[#E8EFF8] mb-2">
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
                  style={isDark ? {
                    backgroundColor: 'rgba(13,21,38,0.75)',
                    borderColor: errors.nom ? '#C0392B' : 'rgba(99,157,255,0.12)',
                    color: '#E8EFF8'
                  } : {}}
                />
                {errors.nom && (
                  <p className="text-xs text-status-red dark:text-[#FF6B6B] mt-1">{errors.nom}</p>
                )}
              </div>

              {/* Matricule (auto-generated) */}
              <div>
                <label className="block text-sm font-medium text-[#111827] dark:text-[#E8EFF8] mb-2">
                  {t('matricule')}
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={formData.matricule}
                    readOnly
                    placeholder="00000U"
                    className="w-32 px-4 py-3 bg-warm-gray-200 border border-warm-gray-400 rounded-xl font-mono text-navy cursor-not-allowed text-center"
                    style={isDark ? {
                      backgroundColor: 'rgba(13,21,38,0.75)',
                      borderColor: 'rgba(99,157,255,0.12)',
                      color: '#639DFF'
                    } : {}}
                  />
                  <button
                    onClick={generateMatricule}
                    className="px-3 py-3 bg-navy/10 hover:bg-navy/20 rounded-xl transition-colors flex-shrink-0"
                    style={isDark ? {
                      backgroundColor: 'rgba(99,157,255,0.12)'
                    } : {}}
                    onMouseEnter={(e) => {
                      if (isDark) e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.18)'
                    }}
                    onMouseLeave={(e) => {
                      if (isDark) e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.12)'
                    }}
                    title={t('genererMatricule')}
                  >
                    <RefreshCw className="w-5 h-5 text-navy dark:text-[#639DFF]" />
                  </button>
                  <p className="text-xs text-[#6B7280] dark:text-[#7A9CC4] flex-1">
                    {t('genereAutomatiquement')}
                  </p>
                </div>
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
                  <p className="text-xs text-status-red dark:text-[#FF6B6B] mt-1">
                    {errors.department}
                  </p>
                )}
              </div>

              {/* Poste */}
              <div>
                <label className="block text-sm font-medium text-[#111827] dark:text-[#E8EFF8] mb-2">
                  {t('poste')}
                  <span className="text-status-red ml-1">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t('exPoste')}
                  value={formData.position}
                  onChange={(e) => handleChange("position", e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-navy/20 ${
                    errors.position ? "border-status-red" : "border-warm-gray-400"
                  }`}
                  style={isDark ? {
                    backgroundColor: 'rgba(13,21,38,0.75)',
                    borderColor: errors.position ? '#C0392B' : 'rgba(99,157,255,0.12)',
                    color: '#E8EFF8'
                  } : {}}
                />
                {errors.position && (
                  <p className="text-xs text-status-red dark:text-[#FF6B6B] mt-1">
                    {errors.position}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-[#111827] dark:text-[#E8EFF8] mb-2">
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
                  style={isDark ? {
                    backgroundColor: 'rgba(13,21,38,0.75)',
                    borderColor: errors.email ? '#C0392B' : 'rgba(99,157,255,0.12)',
                    color: '#E8EFF8'
                  } : {}}
                />
                {errors.email && (
                  <p className="text-xs text-status-red dark:text-[#FF6B6B] mt-1">{errors.email}</p>
                )}
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-[#111827] dark:text-[#E8EFF8] mb-2">
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
                  style={isDark ? {
                    backgroundColor: 'rgba(13,21,38,0.75)',
                    borderColor: 'rgba(99,157,255,0.12)',
                    color: '#E8EFF8'
                  } : {}}
                />
              </div>

              {/* Numéro de sécurité sociale (NSS) */}
              <div>
                <label className="block text-sm font-medium text-[#111827] dark:text-[#E8EFF8] mb-2">
                  NSS
                  <span className="text-[#6B7280] font-normal ml-1">
                    ({t('optionnel')})
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="15 chiffres"
                  value={formData.ssn}
                  onChange={(e) => handleChange("ssn", e.target.value)}
                  maxLength={15}
                  className="w-full px-4 py-3 bg-white border border-warm-gray-400 rounded-xl font-mono transition-all focus:outline-none focus:ring-2 focus:ring-navy/20"
                  style={isDark ? {
                    backgroundColor: 'rgba(13,21,38,0.75)',
                    borderColor: 'rgba(99,157,255,0.12)',
                    color: '#E8EFF8'
                  } : {}}
                />
              </div>

              {/* Date d'embauche */}
              <div>
                <label className="block text-sm font-medium text-[#111827] dark:text-[#E8EFF8] mb-2">
                  {t('dateEmbauche')}
                  <span className="text-status-red ml-1">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className={`w-full px-4 py-3 bg-white border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-navy/20 ${
                    errors.startDate ? "border-status-red" : "border-warm-gray-400"
                  }`}
                  style={isDark ? {
                    backgroundColor: 'rgba(13,21,38,0.75)',
                    borderColor: errors.startDate ? '#C0392B' : 'rgba(99,157,255,0.12)',
                    color: '#E8EFF8'
                  } : {}}
                />
                {errors.startDate && (
                  <p className="text-xs text-status-red dark:text-[#FF6B6B] mt-1">
                    {errors.startDate}
                  </p>
                )}
              </div>

          {submissionError && (
            <p className="text-xs text-status-red text-center">
              {submissionError}
            </p>
          )}

          {/* Extra padding at bottom so last field not hidden */}
          <div className="h-6" />
        </div>

        {/* STICKY FOOTER */}
        <div
          className="flex-shrink-0 bg-white border-t border-gray-100 px-5 py-4 flex gap-3"
          style={isDark ? {
            backgroundColor: '#0B1120',
            borderColor: 'rgba(99,157,255,0.12)'
          } : {}}
        >
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-sm text-[#6B7280] dark:text-[#7A9CC4] hover:bg-black/5 transition-all duration-200"
            onMouseEnter={(e) => {
              if (isDark) e.currentTarget.style.backgroundColor = 'rgba(99,157,255,0.08)'
            }}
            onMouseLeave={(e) => {
              if (isDark) e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            {t('annuler')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-sm shadow-ambient transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
            style={{
              backgroundColor: isFormValid ? '#1A2F4F' : '#9CA3AF',
              color: 'white',
              ...(isDark && isFormValid ? {
                background: 'linear-gradient(145deg, #2A5494, #1E3D6B)',
                border: '1px solid rgba(99,157,255,0.2)',
                boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 8px 24px rgba(0,0,0,0.5)'
              } : {})
            }}
            onMouseEnter={(e) => {
              if (isFormValid) {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(26,47,79,0.3)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = isDark && isFormValid
                ? '0 1px 0 rgba(255,255,255,0.1) inset, 0 8px 24px rgba(0,0,0,0.5)'
                : '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)'
            }}
          >
            {t('creerEmploye')}
          </button>
        </div>
      </div>
    </div>
  );
}
