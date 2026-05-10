/**
 * Employee status configuration
 * Provides consistent status colors and labels across the application
 */
export const getStatusConfig = (status, t) => {
  const configs = {
    actif: {
      label: t('actif'),
      color: 'text-status-green',
      bg: 'bg-status-green/10',
      dotColor: 'bg-status-green'
    },
    a_risque: {
      label: t('aRisque'),
      color: 'text-status-amber',
      bg: 'bg-status-amber/10',
      dotColor: 'bg-status-amber'
    },
    doit_bloquer: {
      label: t('doitBloquer'),
      color: 'text-[#FF6B6B]',
      bg: 'bg-[rgba(255,107,107,0.15)]',
      dotColor: 'bg-[#FF6B6B]'
    },
    bloque: {
      label: t('bloque'),
      color: 'text-status-red',
      bg: 'bg-status-red/10',
      dotColor: 'bg-status-red'
    }
  }

  return configs[status] || configs.actif
}
