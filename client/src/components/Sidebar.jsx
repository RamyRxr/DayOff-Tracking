import { NavLink } from 'react-router-dom'
import { Home, Users, ShieldAlert, Calendar, LogOut, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/ThemeContext'

const navItems = [
  { to: '/', labelKey: 'accueil', icon: Home },
  { to: '/employees', labelKey: 'employes', icon: Users },
  { to: '/blocked', labelKey: 'bloques', icon: ShieldAlert },
  { to: '/calendar', labelKey: 'calendrier', icon: Calendar },
]

export default function Sidebar({ currentAdmin, onLogout }) {
  const { t } = useTranslation()
  const { isDark } = useTheme()

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-60 bg-white/60 backdrop-blur-2xl border-r-0.5 border-black/6 flex flex-col z-40"
      style={isDark ? {
        backgroundColor: 'rgba(13,21,38,0.95)',
        backdropFilter: 'blur(24px)',
        borderColor: 'rgba(99,157,255,0.08)',
        boxShadow: '2px 0 24px rgba(0,0,0,0.4)'
      } : {}}
    >
      {/* Logo */}
      <div className="px-6 py-6">
        <div className="font-display text-xl font-bold tracking-tight text-[#111827] dark:text-[#E8EFF8]">
          DayOff
        </div>
        <div className="text-[10px] text-[#6B7280] dark:text-[#4A6A8A] mt-0.5 tracking-widest uppercase font-medium">
          NAFTAL
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={({ isActive }) => {
                const isDark = document.documentElement.classList.contains('dark')
                if (isActive && isDark) {
                  return {
                    backgroundColor: 'rgba(99,157,255,0.12)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                    borderLeft: '2px solid #639DFF'
                  }
                }
                return {}
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-[#1E3A5F] shadow-ambient dark:text-[#E8EFF8]'
                    : 'text-[#6B7280] dark:text-[#4A6A8A] hover:bg-black/5 dark:hover:bg-[rgba(99,157,255,0.06)] hover:text-[#111827] dark:hover:text-[#7A9CC4]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                  <span>{t(item.labelKey)}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Admin footer - subtle and small */}
      <div className="px-4 py-4 border-t-0.5 border-black/6 dark:border-[rgba(99,157,255,0.08)]">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          {/* Avatar circle */}
          <div
            className="w-8 h-8 rounded-full bg-warm-gray-200 flex items-center justify-center text-xs font-semibold text-[#374151]"
            style={isDark ? {
              background: 'rgba(99,157,255,0.12)',
              color: '#639DFF',
              border: '1px solid rgba(99,157,255,0.2)'
            } : {}}
          >
            {currentAdmin?.name
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2) || 'MS'}
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[#111827] dark:text-[#E8EFF8] truncate">
              {currentAdmin?.name || 'Admin'}
            </div>
            <div className="text-xs text-[#6B7280] dark:text-[#7A9CC4]">
              {currentAdmin?.role || t('adminRH')}
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={onLogout}
            className="p-1.5 hover:bg-[#C0392B]/10 dark:hover:bg-[rgba(192,57,43,0.2)] rounded-lg transition-colors group"
            title={t('seDeconnecter')}
          >
            <LogOut className="w-4 h-4 text-[#6B7280] dark:text-[#7A9CC4] group-hover:text-[#C0392B] dark:group-hover:text-[#FF6B6B]" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  )
}
