import { NavLink } from 'react-router-dom'
import { Home, Users, ShieldAlert, Calendar, LogOut, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDarkMode } from '../hooks/useDarkMode'

const navItems = [
  { to: '/', labelKey: 'accueil', icon: Home },
  { to: '/employees', labelKey: 'employes', icon: Users },
  { to: '/blocked', labelKey: 'bloques', icon: ShieldAlert },
  { to: '/calendar', labelKey: 'calendrier', icon: Calendar },
]

export default function Sidebar({ currentAdmin, onLogout }) {
  const { t } = useTranslation()
  const { isDark, toggle } = useDarkMode()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white/60 dark:bg-[#1C1C1E]/90 backdrop-blur-2xl border-r-0.5 border-black/6 dark:border-white/[0.06] flex flex-col z-40">
      {/* Logo + Dark Mode Toggle */}
      <div className="px-6 py-6 flex items-center justify-between">
        <div>
          <div className="font-display text-xl font-bold tracking-tight text-[#111827] dark:text-white">
            DayOff
          </div>
          <div className="text-[10px] text-[#6B7280] dark:text-gray-400 mt-0.5 tracking-widest uppercase font-medium">
            NAFTAL
          </div>
        </div>
        <button
          onClick={toggle}
          className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-all duration-300"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-gray-700 dark:text-gray-200 transition-all duration-300" style={{ transform: 'rotate(0deg)' }} />
          ) : (
            <Moon className="w-4 h-4 text-gray-600 transition-all duration-300" style={{ transform: 'rotate(0deg)' }} />
          )}
        </button>
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
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white dark:bg-white/10 text-[#1E3A5F] dark:text-white shadow-ambient dark:shadow-none'
                    : 'text-[#6B7280] dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/[0.06] hover:text-[#111827] dark:hover:text-white'
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
          <div className="w-8 h-8 rounded-full bg-warm-gray-200 dark:bg-[#2C2C2E] flex items-center justify-center text-xs font-semibold text-[#374151] dark:text-gray-300">
            {currentAdmin?.name
              ?.split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .substring(0, 2) || 'MS'}
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-[#111827] dark:text-white truncate">
              {currentAdmin?.name || 'Admin'}
            </div>
            <div className="text-xs text-[#6B7280] dark:text-gray-400">
              {currentAdmin?.role || t('adminRH')}
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={onLogout}
            className="p-1.5 hover:bg-[#C0392B]/10 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
            title={t('seDeconnecter')}
          >
            <LogOut className="w-4 h-4 text-[#6B7280] dark:text-gray-400 group-hover:text-[#C0392B] dark:group-hover:text-red-400" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  )
}
