// Utility to translate department names from database values
export const translateDepartment = (department, t) => {
  const departmentMap = {
    'Production': t('production'),
    'Logistique': t('logistique'),
    'Administration': t('administration'),
    'Maintenance': t('maintenance'),
    'Qualité': t('qualite'),
    'Sécurité': t('securite'),
  }

  return departmentMap[department] || department
}
