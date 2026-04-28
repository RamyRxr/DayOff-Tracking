/**
 * Translates blocking reason from database (French) to the current language
 * @param {string} reason - The blocking reason in French from the database
 * @param {Function} t - The i18n translation function
 * @returns {string} - The translated blocking reason
 */
export const translateBlockingReason = (reason, t) => {
  if (!reason) return '—'

  const reasonMap = {
    'Dépassement du quota de congés': t('depassementQuota'),
    'Absences non justifiées': t('absencesNonJustifiees'),
    'Congés sans autorisation': t('congesSansAutorisation'),
    'Non-respect du règlement': t('nonRespectReglement'),
    'Autre': t('autre'),
  }

  return reasonMap[reason] || reason
}
