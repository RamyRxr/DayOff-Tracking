import { NavLink } from 'react-router-dom'
import { Home, Users, ShieldAlert, Calendar, LogOut, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const navItems = [
  { to: '/', labelKey: 'accueil', icon: Home },
  { to: '/employees', labelKey: 'employes', icon: Users },
  { to: '/blocked', labelKey: 'bloques', icon: ShieldAlert },
  { to: '/calendar', labelKey: 'calendrier', icon: Calendar },
]

export default function Sidebar({ currentAdmin, onLogout }) {
  const { t } = useTranslation()

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-60 bg-white/60 backdrop-blur-2xl border-r-0.5 border-black/6 flex flex-col z-40 dark:border-white/[0.07]"
      style={document.documentElement.classList.contains('dark') ? {
        backgroundColor: 'rgba(18,18,26,0.95)',
        backdropFilter: 'blur(40px)'
      } : {}}
    >
      {/* Logo */}
      <div className="px-6 py-6">
        <div className="font-display text-xl font-bold tracking-tight text-[#111827] dark:text-[#F2F2F7]">
          DayOff
        </div>
        <div className="text-[10px] text-[#6B7280] dark:text-[#8E8E93] mt-0.5 tracking-widest uppercase font-medium">
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
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 0 rgba(0,0,0,0.2)'
                  }
                }
                return {}
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-[#1E3A5F] shadow-ambient dark:text-[#F2F2F7]'
                    : 'text-[#6B7280] dark:text-[#8E8E93] hover:bg-black/5 dark:hover:bg-white/[0.04] hover:text-[#111827] dark:hover:text-[#F2F2F7]'
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
      <div className="px-4 py-4 border-t-0.5 border-black/6 dark:border-white/[0.06]">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
          {/* Avatar circle - warm gray bg */}
          <div className="w-8 h-8 rounded-full bg-warm-gray-200 dark:bg-white/[0.06] flex items-center justify-center text-xs font-semibold text-[#374151] dark:text-[#8E8E93]">
            {currentAdmin?.name
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2) || 'MS'}
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[#111827] dark:text-[#F2F2F7] truncate">
              {currentAdmin?.name || 'Admin'}
            </div>
            <div className="text-xs text-[#6B7280] dark:text-[#8E8E93]">
              {currentAdmin?.role || t('adminRH')}
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={onLogout}
            className="p-1.5 hover:bg-[#C0392B]/10 dark:hover:bg-[rgba(192,57,43,0.2)] rounded-lg transition-colors group"
            title={t('seDeconnecter')}
          >
            <LogOut className="w-4 h-4 text-[#6B7280] dark:text-[#8E8E93] group-hover:text-[#C0392B] dark:group-hover:text-[#FF6B6B]" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  )
}
